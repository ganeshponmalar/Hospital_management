import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Plus } from 'lucide-react';

const MedicinesTab = () => {
    const [medicines, setMedicines] = useState([]);
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [reorderLevel, setReorderLevel] = useState(10);
    const [batches, setBatches] = useState([]);
    const [viewMedicineInfo, setViewMedicineInfo] = useState(null);

    const fetchMedicines = async () => {
        try {
            const res = await api.get('/pharmacy/medicines');
            setMedicines(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => { fetchMedicines(); }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await api.post('/pharmacy/medicines', { name, category, reorder_level: reorderLevel });
            setName(''); setCategory(''); setReorderLevel(10);
            fetchMedicines();
        } catch (err) {
            console.error(err);
        }
    };

    const viewBatches = async (med) => {
        setViewMedicineInfo(med);
        try {
            const res = await api.get(`/pharmacy/medicines/${med.id}/batches`);
            setBatches(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>

            <div className="glass-card" style={{ padding: '20px', height: 'fit-content' }}>
                <h3 style={{ marginBottom: '15px' }}>Add Medicine Master</h3>
                <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div className="form-group">
                        <label>Medicine Name</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Category</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                            <option value="">Select Category</option>
                            <option value="Tablet">Tablet</option>
                            <option value="Capsule">Capsule</option>
                            <option value="Syrup">Syrup</option>
                            <option value="Injection">Injection</option>
                            <option value="Ointment">Ointment</option>
                            <option value="Drops (Eye/Ear)">Drops (Eye/Ear)</option>
                            <option value="Inhaler">Inhaler</option>
                            <option value="Powder">Powder</option>
                            <option value="Gel">Gel</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Reorder Level</label>
                        <input type="number" value={reorderLevel} onChange={(e) => setReorderLevel(e.target.value)} />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                        <Plus size={18} /> Add Medicine
                    </button>
                </form>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
                {!viewMedicineInfo ? (
                    <>
                        <h3 style={{ marginBottom: '15px' }}>Medicines Directory</h3>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Category</th>
                                    <th>Total Stock</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {medicines.map(m => (
                                    <tr key={m.id}>
                                        <td>{m.medicine_name}</td>
                                        <td>{m.category || 'N/A'}</td>
                                        <td>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: '20px',
                                                backgroundColor: m.stock <= m.reorder_level ? '#fee2e2' : '#dcfce7',
                                                color: m.stock <= m.reorder_level ? '#b91c1c' : '#15803d',
                                                fontWeight: 'bold',
                                                fontSize: '0.85rem'
                                            }}>
                                                {m.stock} {m.stock <= m.reorder_level && '(Low)'}
                                            </span>
                                        </td>
                                        <td>
                                            <button onClick={() => viewBatches(m)} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                                                View Batches
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                ) : (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3>Batches for {viewMedicineInfo.medicine_name}</h3>
                            <button onClick={() => setViewMedicineInfo(null)} className="btn" style={{ background: 'var(--surface)', color: 'var(--text)' }}>Back</button>
                        </div>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Batch No</th>
                                    <th>Expiry Date</th>
                                    <th>Qty Available</th>
                                    <th>Selling Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {batches.length === 0 ? <tr><td colSpan="4">No active batches found.</td></tr> : batches.map(b => (
                                    <tr key={b.id}>
                                        <td>{b.batch_no}</td>
                                        <td style={{ color: new Date(b.expiry_date) <= new Date() ? 'red' : 'inherit' }}>
                                            {new Date(b.expiry_date).toLocaleDateString()}
                                        </td>
                                        <td>{b.quantity}</td>
                                        <td>${b.selling_price}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                )}
            </div>

        </div>
    );
};

export default MedicinesTab;
