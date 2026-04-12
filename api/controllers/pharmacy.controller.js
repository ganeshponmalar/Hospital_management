const pool = require('../db');

// ======================= DASHBOARD STATS =======================
exports.getDashboardStats = async (req, res) => {
    try {
        const [[{ totalMedicines }]] = await pool.query('SELECT COUNT(*) AS totalMedicines FROM medicines');

        const [[{ expiredMedicines }]] = await pool.query(`
            SELECT COUNT(*) AS expiredMedicines FROM medicine_batches 
            WHERE expiry_date <= CURDATE() AND quantity > 0
        `);

        const [[{ todaySales }]] = await pool.query(`
            SELECT COALESCE(SUM(total_amount), 0) AS todaySales FROM sales 
            WHERE DATE(sale_date) = CURDATE()
        `);

        const [[{ todayPurchases }]] = await pool.query(`
            SELECT COALESCE(SUM(total_amount), 0) AS todayPurchases FROM purchases 
            WHERE DATE(purchase_date) = CURDATE()
        `);

        const [lowStockResult] = await pool.query(`
            SELECT COUNT(*) AS lowStockMedicines
            FROM (
                SELECT m.id 
                FROM medicines m 
                LEFT JOIN medicine_batches mb ON m.id = mb.medicine_id 
                GROUP BY m.id, m.reorder_level
                HAVING COALESCE(SUM(mb.quantity), 0) <= m.reorder_level
            ) AS temp
        `);
        const lowStockMedicines = lowStockResult[0].lowStockMedicines;

        res.json({
            totalMedicines,
            lowStockMedicines,
            expiredMedicines,
            todaySales,
            todayPurchases
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ======================= DASHBOARD ALERTS =======================
exports.getAlerts = async (req, res) => {
    try {
        const [expired] = await pool.query(`
            SELECT mb.*, m.medicine_name 
            FROM medicine_batches mb 
            JOIN medicines m ON mb.medicine_id = m.id 
            WHERE mb.expiry_date <= CURDATE() AND mb.quantity > 0
        `);

        const [expiring30Days] = await pool.query(`
            SELECT mb.*, m.medicine_name 
            FROM medicine_batches mb 
            JOIN medicines m ON mb.medicine_id = m.id 
            WHERE mb.expiry_date BETWEEN DATE_ADD(CURDATE(), INTERVAL 1 DAY) AND DATE_ADD(CURDATE(), INTERVAL 30 DAY) 
            AND mb.quantity > 0
        `);

        const [lowStock] = await pool.query(`
            SELECT m.id, m.medicine_name, m.reorder_level, COALESCE(SUM(mb.quantity), 0) AS total_quantity 
            FROM medicines m 
            LEFT JOIN medicine_batches mb ON m.id = mb.medicine_id 
            GROUP BY m.id, m.medicine_name, m.reorder_level 
            HAVING total_quantity <= m.reorder_level
        `);

        res.json({
            expiredMedicines: expired,
            expiringSoon: expiring30Days,
            lowStockMedicines: lowStock
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ======================= MEDICINES =======================
exports.getAllMedicines = async (req, res) => {
    try {
        // Includes total quantity calculated from batches
        const [medicines] = await pool.query(`
            SELECT m.*, COALESCE(SUM(mb.quantity), 0) AS stock 
            FROM medicines m 
            LEFT JOIN medicine_batches mb ON m.id = mb.medicine_id 
            GROUP BY m.id
            ORDER BY m.medicine_name
        `);
        res.json(medicines);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addMedicine = async (req, res) => {
    const { name, category, reorder_level } = req.body;
    try {
        const [result] = await pool.execute(
            'INSERT INTO medicines (medicine_name, category, reorder_level) VALUES (?, ?, ?)',
            [name, category, reorder_level || 10]
        );
        res.status(201).json({ id: result.insertId, name, message: 'Medicine added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ======================= BATCHES =======================
exports.getBatchesByMedicine = async (req, res) => {
    try {
        const [batches] = await pool.query(
            'SELECT mb.*, s.supplier_name FROM medicine_batches mb LEFT JOIN suppliers s ON mb.supplier_id = s.id WHERE mb.medicine_id = ? AND mb.quantity > 0 ORDER BY mb.expiry_date ASC',
            [req.params.id]
        );
        res.json(batches);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ======================= SUPPLIERS =======================
exports.getAllSuppliers = async (req, res) => {
    try {
        const [suppliers] = await pool.query('SELECT * FROM suppliers ORDER BY supplier_name');
        res.json(suppliers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addSupplier = async (req, res) => {
    const { supplier_name, phone, email, address } = req.body;
    try {
        const [result] = await pool.execute(
            'INSERT INTO suppliers (supplier_name, phone, email, address) VALUES (?, ?, ?, ?)',
            [supplier_name, phone, email, address]
        );
        res.status(201).json({ id: result.insertId, message: 'Supplier added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ======================= PURCHASES (RESTOCKING) =======================
exports.addPurchase = async (req, res) => {
    const { supplier_id, purchase_date, items } = req.body; // items: [{ medicine_id, batch_no, quantity, price_per_unit, expiry_date, manufacture_date, selling_price }]
    const user_id = req.user.id;

    if (!items || items.length === 0) return res.status(400).json({ error: 'No items in purchase' });

    const connection = await pool.getConnection(); // Use transaction

    try {
        await connection.beginTransaction();

        // 1. Calculate total amount
        let total_amount = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.price_per_unit)), 0);

        // 2. Insert into purchases
        const [purchaseResult] = await connection.execute(
            'INSERT INTO purchases (supplier_id, purchase_date, total_amount) VALUES (?, ?, ?)',
            [supplier_id, purchase_date || new Date(), total_amount]
        );
        const purchase_id = purchaseResult.insertId;

        // 3. Process each item
        for (const item of items) {
            // Add to purchase_items
            await connection.execute(
                'INSERT INTO purchase_items (purchase_id, medicine_id, batch_no, quantity, price_per_unit) VALUES (?, ?, ?, ?, ?)',
                [purchase_id, item.medicine_id, item.batch_no, item.quantity, item.price_per_unit]
            );

            // Check if batch exists in medicine_batches
            const [existingBatches] = await connection.execute(
                'SELECT id, quantity FROM medicine_batches WHERE medicine_id = ? AND batch_no = ? AND supplier_id = ?',
                [item.medicine_id, item.batch_no, supplier_id]
            );

            let batch_id;
            if (existingBatches.length > 0) {
                // Update batch quantity
                batch_id = existingBatches[0].id;
                await connection.execute(
                    'UPDATE medicine_batches SET quantity = quantity + ? WHERE id = ?',
                    [item.quantity, batch_id]
                );
            } else {
                // Insert new batch
                const [batchResult] = await connection.execute(
                    'INSERT INTO medicine_batches (medicine_id, batch_no, supplier_id, expiry_date, manufacture_date, quantity, purchase_price, selling_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    [item.medicine_id, item.batch_no, supplier_id, item.expiry_date, item.manufacture_date || null, item.quantity, item.price_per_unit, item.selling_price || item.price_per_unit * 1.5]
                );
                batch_id = batchResult.insertId;
            }

            // Validate user exists to avoid FK constraint failures from persistent JWT tokens
            const [userCheck] = await connection.execute('SELECT id FROM users WHERE id = ?', [user_id]);
            const final_user_id = userCheck.length > 0 ? user_id : null;

            // Log securely to stock_history
            await connection.execute(
                'INSERT INTO stock_history (medicine_id, batch_id, action, quantity_change, reason, user_id) VALUES (?, ?, ?, ?, ?, ?)',
                [item.medicine_id, batch_id, 'Purchase', item.quantity, `Restocked via Purchase #${purchase_id}`, final_user_id]
            );
        }

        await connection.commit();
        res.status(201).json({ message: 'Purchase registered and stock updated successfully', purchase_id });

    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: 'Transaction failed', details: err.message });
    } finally {
        connection.release();
    }
};

// ======================= GET PURCHASES =======================
exports.getAllPurchases = async (req, res) => {
    try {
        const [purchases] = await pool.query(`
            SELECT p.*, s.supplier_name 
            FROM purchases p 
            LEFT JOIN suppliers s ON p.supplier_id = s.id 
            ORDER BY p.purchase_date DESC
                    `);
        res.json(purchases);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ======================= SALES (BILLING) =======================
exports.addSale = async (req, res) => {
    const { patient_id, sale_date, discount, tax, payment_method, payment_status, items } = req.body;
    // items: [{ medicine_id, batch_id, quantity }]
    const user_id = req.user.id;

    if (!items || items.length === 0) return res.status(400).json({ error: 'No items in sale' });

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        let subtotal = 0;

        // Look up prices and calculate subtotal
        for (const item of items) {
            const [batchResults] = await connection.execute('SELECT selling_price, quantity FROM medicine_batches WHERE id = ?', [item.batch_id]);
            if (batchResults.length === 0) throw new Error(`Batch ID ${item.batch_id} not found`);

            const batch = batchResults[0];
            if (batch.quantity < item.quantity) {
                throw new Error(`Insufficient stock for batch ${item.batch_id}. Requested: ${item.quantity}, Available: ${batch.quantity}`);
            }

            item.unit_price = batch.selling_price;
            item.total_price = item.unit_price * item.quantity;
            subtotal += item.total_price;
        }

        const numericDiscount = Number(discount) || 0;
        const numericTax = Number(tax) || 0;
        const total_amount = subtotal - numericDiscount + numericTax;

        // Insert into sales
        const [saleResult] = await connection.execute(
            'INSERT INTO sales (patient_id, sale_date, total_amount, discount, tax, payment_method, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [patient_id, sale_date || new Date(), total_amount, numericDiscount, numericTax, payment_method || 'Cash', payment_status || 'Paid']
        );
        const sale_id = saleResult.insertId;

        // Deduct from batches and write to sale_items
        for (const item of items) {
            await connection.execute(
                'INSERT INTO sale_items (sale_id, medicine_id, batch_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?, ?)',
                [sale_id, item.medicine_id, item.batch_id, item.quantity, item.unit_price, item.total_price]
            );

            await connection.execute(
                'UPDATE medicine_batches SET quantity = quantity - ? WHERE id = ?',
                [item.quantity, item.batch_id]
            );

            // Validate user exists
            const [saleUserCheck] = await connection.execute('SELECT id FROM users WHERE id = ?', [user_id]);
            const final_sale_user_id = saleUserCheck.length > 0 ? user_id : null;

            await connection.execute(
                'INSERT INTO stock_history (medicine_id, batch_id, action, quantity_change, reason, user_id) VALUES (?, ?, ?, ?, ?, ?)',
                [item.medicine_id, item.batch_id, 'Sale', -item.quantity, `Sold to Patient via Sale #${sale_id}`, final_sale_user_id]
            );
        }

        await connection.commit();
        res.status(201).json({ message: 'Sale registered and stock deducted successfully', sale_id, total_amount });

    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: 'Transaction failed', details: err.message });
    } finally {
        connection.release();
    }
};

// ======================= GET SALES =======================
exports.getAllSales = async (req, res) => {
    try {
        const [sales] = await pool.query(`
            SELECT s.*, p.name AS patient_name 
            FROM sales s 
            LEFT JOIN patients p ON s.patient_id = p.id 
            ORDER BY s.sale_date DESC
                    `);
        res.json(sales);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ======================= STOCK HISTORY =======================
exports.getStockHistory = async (req, res) => {
    try {
        const [history] = await pool.query(`
            SELECT sh.*, m.medicine_name, mb.batch_no, u.username as modified_by
            FROM stock_history sh
            LEFT JOIN medicines m ON sh.medicine_id = m.id
            LEFT JOIN medicine_batches mb ON sh.batch_id = mb.id
            LEFT JOIN users u ON sh.user_id = u.id
            ORDER BY sh.created_at DESC
            LIMIT 100
                    `);
        res.json(history);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
