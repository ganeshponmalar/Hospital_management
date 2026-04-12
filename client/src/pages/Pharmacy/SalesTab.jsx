import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';

const SalesTab = () => {
    const [sales, setSales] = useState([]);
    const [patients, setPatients] = useState([]);
    const [medicines, setMedicines] = useState([]);

    // Form state
    const [selectedPatient, setSelectedPatient] = useState('');
    const [items, setItems] = useState([]); // { medicine_id, selectedBatch: null, quantity }
    const [discount, setDiscount] = useState(0);
    const [tax, setTax] = useState(0);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` } };
            
            const [patRes, medRes, salesRes] = await Promise.all([
                axios.get('http://localhost:5000/api/patients', config),
                axios.get('http://localhost:5000/api/pharmacy/medicines', config),
                axios.get('http://localhost:5000/api/pharmacy/sales', config)
            ]);
            
            setPatients(patRes.data);
            setMedicines(medRes.data);
            setSales(salesRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const addItemRow = () => {
        setItems([...items, { medicine_id: '', batch_id: '', _batches: [], quantity: 1, unit_price: 0 }]);
    };

    const updateItemMedicine = async (index, medicineId) => {
        const newItems = [...items];
        newItems[index].medicine_id = medicineId;
        newItems[index].batch_id = '';
        newItems[index]._batches = [];
        setItems(newItems);

        if(!medicineId) return;

        // Fetch batches for this medicine
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/pharmacy/medicines/${medicineId}/batches`, { headers: { Authorization: `Bearer ${token}` }});
            newItems[index]._batches = res.data;
            setItems([...newItems]);
        } catch (err) { console.error(err); }
    };

    const updateItemBatch = (index, batchId) => {
        const newItems = [...items];
        newItems[index].batch_id = batchId;
        const selectedBatch = newItems[index]._batches.find(b => b.id == batchId);
        if (selectedBatch) newItems[index].unit_price = selectedBatch.selling_price;
        setItems(newItems);
    };

    const updateItemQty = (index, qty) => {
        const newItems = [...items];
        newItems[index].quantity = qty;
        setItems(newItems);
    };

    const removeItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleSale = async (e) => {
        e.preventDefault();
        
        // Validation sum
        let isValid = true;
        items.forEach(item => {
            const batch = item._batches.find(b => b.id == item.batch_id);
            if(batch && item.quantity > batch.quantity) {
                alert(`Insufficient stock for batch. Requested ${item.quantity}, have ${batch.quantity}`);
                isValid = false;
            }
        });
        if(!isValid) return;

        try {
            const token = localStorage.getItem('token');
            const payload = {
                patient_id: selectedPatient,
                discount, tax,
                items: items.map(i => ({ medicine_id: i.medicine_id, batch_id: i.batch_id, quantity: i.quantity }))
            };
            await axios.post('http://localhost:5000/api/pharmacy/sales', payload, { headers: { Authorization: `Bearer ${token}` }});
            
            setSelectedPatient('');
            setItems([]); setDiscount(0); setTax(0);
            fetchData();
            alert("Sale completed!");
        } catch (err) {
            console.error(err);
            alert("Failed to submit sale.");
        }
    };

    const calcTotal = () => {
        const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
        return subtotal - Number(discount) + Number(tax);
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(450px, 1fr) 2fr', gap: '20px' }}>
            <div className="glass-card" style={{ padding: '20px' }}>
                <h3 style={{ marginBottom: '15px' }}>Dispense Medicine (Sale)</h3>
                <form onSubmit={handleSale} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div className="form-group">
                        <label>Patient</label>
                        <select value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)} required>
                            <option value="">Select Patient</option>
                            {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ margin: 0 }}>Cart</h4>
                        <button type="button" onClick={addItemRow} className="btn" style={{ fontSize: '0.8rem', padding: '4px 8px', background: 'var(--primary-light)', color: 'var(--primary)' }}><Plus size={14}/> Add Medicine</button>
                    </div>

                    {items.map((item, idx) => (
                        <div key={idx} style={{ padding: '10px', background: 'var(--surface)', borderRadius: '8px', position: 'relative' }}>
                            <button type="button" onClick={() => removeItem(idx)} style={{ position: 'absolute', top: 5, right: 5, background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16}/></button>
                            
                            <select value={item.medicine_id} onChange={e => updateItemMedicine(idx, e.target.value)} required style={{ width: '100%', marginBottom: '5px' }}>
                                <option value="">Select Medicine</option>
                                {medicines.map(m => <option key={m.id} value={m.id}>{m.medicine_name} (Stk: {m.stock})</option>)}
                            </select>
                            
                            <div style={{ display: 'flex', gap: '5px' }}>
                                <select value={item.batch_id} onChange={e => updateItemBatch(idx, e.target.value)} required style={{ flex: 1 }} disabled={!item.medicine_id}>
                                    <option value="">Select Batch</option>
                                    {item._batches.map(b => (
                                        <option key={b.id} value={b.id}>{b.batch_no} (Avail: {b.quantity})</option>
                                    ))}
                                </select>
                                <input type="number" placeholder="Qty" value={item.quantity} min="1" onChange={e => updateItemQty(idx, e.target.value)} required style={{ width: '60px' }}/>
                            </div>
                            {item.unit_price > 0 && <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>Subtotal: ${(item.unit_price * item.quantity).toFixed(2)}</div>}
                        </div>
                    ))}

                    {items.length > 0 && (
                        <>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Discount</label>
                                    <input type="number" value={discount} onChange={e => setDiscount(e.target.value)} />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Tax</label>
                                    <input type="number" value={tax} onChange={e => setTax(e.target.value)} />
                                </div>
                            </div>
                            <div style={{ padding: '15px', background: '#22c55e20', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 'bold' }}>Total Bill:</span>
                                <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#15803d' }}>${calcTotal().toFixed(2)}</span>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}><CheckCircle2 size={18}/> Complete Sale</button>
                        </>
                    )}
                </form>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
                <h3 style={{ marginBottom: '15px' }}>Billing History</h3>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Inv #</th>
                            <th>Date</th>
                            <th>Patient</th>
                            <th>Total Amt</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sales.map(s => (
                            <tr key={s.id}>
                                <td>INV-{s.id}</td>
                                <td>{new Date(s.sale_date).toLocaleDateString()}</td>
                                <td>{s.patient_name}</td>
                                <td>${s.total_amount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SalesTab;
