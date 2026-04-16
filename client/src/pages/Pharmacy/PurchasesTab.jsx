import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Plus, Trash2 } from 'lucide-react';

const PurchasesTab = () => {
    const [purchases, setPurchases] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [medicines, setMedicines] = useState([]);

    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
    const [items, setItems] = useState([]);

    const fetchSelectableData = async () => {
        try {
            const [supRes, medRes, purRes] = await Promise.all([
                api.get('/pharmacy/suppliers'),
                api.get('/pharmacy/medicines'),
                api.get('/pharmacy/purchases')
            ]);

            setSuppliers(supRes.data);
            setMedicines(medRes.data);
            setPurchases(purRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => { fetchSelectableData(); }, []);

    const addItemRow = () => {
        setItems([...items, { medicine_id: '', batch_no: '', quantity: 1, price_per_unit: 0, expiry_date: '' }]);
    };

    const updateItem = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const removeItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handlePurchase = async (e) => {
        e.preventDefault();
        try {
            await api.post('/pharmacy/purchases', { supplier_id: selectedSupplier, purchase_date: purchaseDate, items });
            setSelectedSupplier('');
            setItems([]);
            fetchSelectableData();
            alert("Restock logged successfully!");
        } catch (err) {
            console.error(err);
            alert("Failed to submit purchase.");
        }
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 2fr', gap: '20px' }}>
            <div className="glass-card" style={{ padding: '20px' }}>
                <h3 style={{ marginBottom: '15px' }}>Register Purchase (Restock)</h3>
                <form onSubmit={handlePurchase} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div className="form-group">
                        <label>Supplier</label>
                        <select value={selectedSupplier} onChange={e => setSelectedSupplier(e.target.value)} required>
                            <option value="">Select Supplier</option>
                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.supplier_name}</option>)}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Purchase Date</label>
                        <input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} required />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ margin: 0 }}>Items</h4>
                        <button type="button" onClick={addItemRow} className="btn" style={{ fontSize: '0.8rem', padding: '4px 8px', background: 'var(--primary-light)', color: 'var(--primary)' }}><Plus size={14} /> Add Item</button>
                    </div>

                    {items.map((item, idx) => (
                        <div key={idx} style={{ padding: '10px', background: 'var(--surface)', borderRadius: '8px', position: 'relative' }}>
                            <button type="button" onClick={() => removeItem(idx)} style={{ position: 'absolute', top: 5, right: 5, background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                            <select value={item.medicine_id} onChange={e => updateItem(idx, 'medicine_id', e.target.value)} required style={{ width: '100%', marginBottom: '5px' }}>
                                <option value="">Select Medicine</option>
                                {medicines.map(m => <option key={m.id} value={m.id}>{m.medicine_name}</option>)}
                            </select>
                            <div style={{ display: 'flex', gap: '5px' }}>
                                <input type="text" placeholder="Batch No" value={item.batch_no} onChange={e => updateItem(idx, 'batch_no', e.target.value)} required style={{ flex: 1 }} />
                                <input type="number" placeholder="Qty" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} required style={{ width: '60px' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                                <input type="number" placeholder="Unit Price" value={item.price_per_unit} onChange={e => updateItem(idx, 'price_per_unit', e.target.value)} required style={{ flex: 1 }} />
                                <input type="date" value={item.expiry_date} onChange={e => updateItem(idx, 'expiry_date', e.target.value)} required style={{ flex: 1 }} title="Expiry Date" />
                            </div>
                        </div>
                    ))}

                    {items.length > 0 && (
                        <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>Log Purchase</button>
                    )}
                </form>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
                <h3 style={{ marginBottom: '15px' }}>Recent Restocks</h3>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Date</th>
                            <th>Supplier</th>
                            <th>Total Amt</th>
                        </tr>
                    </thead>
                    <tbody>
                        {purchases.map(p => (
                            <tr key={p.id}>
                                <td>#{p.id}</td>
                                <td>{new Date(p.purchase_date).toLocaleDateString()}</td>
                                <td>{p.supplier_name}</td>
                                <td>${p.total_amount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PurchasesTab;
