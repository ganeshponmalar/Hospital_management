import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LedgerTab = () => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = {
                    headers: { Authorization: `Bearer ${token}` } };
                const res = await axios.get('http://localhost:5000/api/pharmacy/stock-history', config);
                setHistory(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchHistory();
    }, []);

    return (
        <div className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ marginBottom: '15px' }}>Inventory Audit Ledger</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '15px' }}>Tracks every piece of medicine entering or leaving the physical inventory vault natively from the API logs.</p>
            
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Date & Time</th>
                        <th>Medicine</th>
                        <th>Batch No</th>
                        <th>Action</th>
                        <th>Qty Delta</th>
                        <th>Context Reason</th>
                        <th>Logged By</th>
                    </tr>
                </thead>
                <tbody>
                    {history.map(h => (
                        <tr key={h.id}>
                            <td>{new Date(h.created_at).toLocaleString()}</td>
                            <td style={{ fontWeight: '500' }}>{h.medicine_name}</td>
                            <td>{h.batch_no}</td>
                            <td>
                                <span style={{
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    fontSize: '0.8rem',
                                    fontWeight: 'bold',
                                    backgroundColor: h.action === 'Purchase' ? '#dcfce7' : h.action === 'Sale' ? '#fee2e2' : '#fef3c7',
                                    color: h.action === 'Purchase' ? '#15803d' : h.action === 'Sale' ? '#b91c1c' : '#d97706'
                                }}>
                                    {h.action}
                                </span>
                            </td>
                            <td style={{ fontWeight: 'bold', color: h.quantity_change > 0 ? '#15803d' : '#b91c1c' }}>
                                {h.quantity_change > 0 ? `+${h.quantity_change}` : h.quantity_change}
                            </td>
                            <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{h.reason}</td>
                            <td>{h.modified_by || 'System'}</td>
                        </tr>
                    ))}
                    {history.length === 0 && (
                        <tr><td colSpan="7" style={{ textAlign: 'center' }}>No ledger history available.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default LedgerTab;
