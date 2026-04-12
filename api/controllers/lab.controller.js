const pool = require('../db');

// ======================= MASTER TESTS LOGIC =======================
exports.getAllTests = async (req, res) => {
    try {
        const [tests] = await pool.query('SELECT * FROM lab_tests ORDER BY test_name');
        res.json(tests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addTest = async (req, res) => {
    const { test_name, category, reference_range, unit, price } = req.body;
    try {
        const [result] = await pool.execute(
            'INSERT INTO lab_tests (test_name, category, reference_range, unit, price) VALUES (?, ?, ?, ?, ?)',
            [test_name, category, reference_range, unit, price || 0]
        );
        res.status(201).json({ id: result.insertId, message: 'Lab test added manually' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ======================= LAB ORDERS (BOOKING) =======================
exports.createOrder = async (req, res) => {
    const { patient_id, doctor_id, test_ids } = req.body; // test_ids: array of IDs
    if (!test_ids || test_ids.length === 0) return res.status(400).json({ error: 'No tests selected' });

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Calculate total amount from test_ids
        let total_amount = 0;
        const testPrices = {};
        for (const tid of test_ids) {
            const [rows] = await connection.execute('SELECT price FROM lab_tests WHERE id = ?', [tid]);
            if (rows.length > 0) {
                testPrices[tid] = rows[0].price;
                total_amount += Number(rows[0].price);
            }
        }

        // Validate if doctor_id actually exists in doctors table to avoid FK constraint fails
        let valid_doctor_id = null;
        if (doctor_id) {
            const [docs] = await connection.execute('SELECT id FROM doctors WHERE id = ?', [doctor_id]);
            if (docs.length > 0) valid_doctor_id = doctor_id;
        }

        const [orderResult] = await connection.execute(
            'INSERT INTO lab_orders (patient_id, doctor_id, total_amount, status) VALUES (?, ?, ?, ?)',
            [patient_id, valid_doctor_id, total_amount, 'Pending']
        );
        const order_id = orderResult.insertId;

        for (const tid of test_ids) {
            await connection.execute(
                'INSERT INTO lab_order_items (order_id, test_id, price) VALUES (?, ?, ?)',
                [order_id, tid, testPrices[tid] || 0]
            );
        }

        await connection.commit();
        res.status(201).json({ message: 'Lab order generated successfully', order_id });
    } catch (err) {
        await connection.rollback();
        console.error("Create Order Transaction Failed:", err);
        res.status(500).json({ error: 'Transaction failed', details: err.message });
    } finally {
        connection.release();
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const [orders] = await pool.query(`
            SELECT lo.*, p.name AS patient_name, d.name AS doctor_name, u.username AS technician
            FROM lab_orders lo
            JOIN patients p ON lo.patient_id = p.id
            LEFT JOIN doctors d ON lo.doctor_id = d.id
            LEFT JOIN users u ON lo.technician_id = u.id
            ORDER BY lo.order_date DESC
        `);
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getOrderDetails = async (req, res) => {
    try {
        const orderId = req.params.id;
        const [orders] = await pool.query(`
            SELECT lo.*, p.name AS patient_name, d.name AS doctor_name, u.username AS technician_name,
                   v.username AS verified_by_name
            FROM lab_orders lo
            JOIN patients p ON lo.patient_id = p.id
            LEFT JOIN doctors d ON lo.doctor_id = d.id
            LEFT JOIN users u ON lo.technician_id = u.id
            LEFT JOIN users v ON lo.verified_by = v.id
            WHERE lo.id = ?
        `, [orderId]);

        if (orders.length === 0) return res.status(404).json({ error: 'Order not found' });
        const order = orders[0];

        const [items] = await pool.query(`
            SELECT loi.id as order_item_id, loi.price, lt.test_name, lt.category, lt.reference_range as default_range, lt.unit as default_unit,
                   lr.id as result_id, lr.result_value, lr.reference_range, lr.unit, lr.flag, lr.remarks, lr.report_file
            FROM lab_order_items loi
            JOIN lab_tests lt ON loi.test_id = lt.id
            LEFT JOIN lab_results lr ON loi.id = lr.order_item_id
            WHERE loi.order_id = ?
        `, [orderId]);

        res.json({ ...order, tests: items });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ======================= RESULTS & VERIFICATION =======================
exports.addTestResult = async (req, res) => {
    const order_item_id = req.params.itemId;
    const { result_value, remarks, report_file } = req.body;
    const user_id = req.user.id;

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Retrieve test info for auto-flag logic
        const [items] = await connection.execute(`
            SELECT loi.order_id, lt.reference_range, lt.unit 
            FROM lab_order_items loi
            JOIN lab_tests lt ON loi.test_id = lt.id
            WHERE loi.id = ?
        `, [order_item_id]);

        if (items.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Order item not found' });
        }

        const { order_id, reference_range, unit } = items[0];

        // Perform auto-flagging based on hyphenated ranges normally "13-17"
        let flag = 'Normal';
        if (reference_range && reference_range.includes('-')) {
            const parts = reference_range.split('-');
            const min = parseFloat(parts[0]);
            const max = parseFloat(parts[1]);
            const val = parseFloat(result_value);
            if (!isNaN(val) && !isNaN(min) && !isNaN(max)) {
                if (val < min) flag = 'Low';
                else if (val > max) flag = 'High';
            }
        }

        // Insert Results
        await connection.execute(
            'INSERT INTO lab_results (order_item_id, result_value, reference_range, unit, flag, remarks, report_file) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [order_item_id, result_value, reference_range, unit, flag, remarks || null, report_file || null]
        );

        // Update the master order to In Progress or Completed 
        // Strategy: if all items have results, set Completed. Else In Progress.
        const [totalItems] = await connection.execute('SELECT COUNT(*) as count FROM lab_order_items WHERE order_id = ?', [order_id]);
        const [finishedItems] = await connection.execute(
            'SELECT COUNT(*) as count FROM lab_results lr JOIN lab_order_items loi ON lr.order_item_id = loi.id WHERE loi.order_id = ?',
            [order_id]
        );

        const newStatus = (totalItems[0].count === finishedItems[0].count) ? 'Completed' : 'In Progress';

        // Check if user exists before attributing technician_id mapping manually to avoid strict FK errors on wiped DBs.
        const [userCheck] = await connection.execute('SELECT id FROM users WHERE id = ?', [user_id]);
        const final_user_id = userCheck.length > 0 ? user_id : null;

        await connection.execute('UPDATE lab_orders SET status = ?, technician_id = ? WHERE id = ?', [newStatus, final_user_id, order_id]);

        await connection.commit();
        res.json({ message: 'Result submitted successfully', flag });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
};

exports.verifyReport = async (req, res) => {
    const order_id = req.params.id;
    const user_id = req.user.id;

    try {
        const [userCheck] = await pool.execute('SELECT id FROM users WHERE id = ?', [user_id]);
        const final_user_id = userCheck.length > 0 ? user_id : null;

        await pool.execute('UPDATE lab_orders SET status = ?, verified_by = ? WHERE id = ?', ['Approved', final_user_id, order_id]);
        res.json({ message: 'Report verified and digitally signed by Doctor.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
