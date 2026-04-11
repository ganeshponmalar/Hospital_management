import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../utils/api';
import { CreditCard, Plus, Search, CheckCircle, Clock } from 'lucide-react';

const BillingPage = () => {
    const [bills, setBills] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newBill, setNewBill] = useState({
        patient_id: '',
        total_amount: '',
        description: ''
    });

    const fetchData = async () => {
        try {
            const [billsRes, patientsRes] = await Promise.all([
                api.get('/billing'),
                api.get('/patients')
            ]);
            setBills(billsRes.data);
            setPatients(patientsRes.data);
        } catch (err) {
            console.error('Failed to fetch data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateBill = async (e) => {
        e.preventDefault();
        try {
            await api.post('/billing', newBill);
            setShowModal(false);
            fetchData();
            setNewBill({ patient_id: '', total_amount: '', description: '' });
        } catch (err) {
            alert('Failed to create bill');
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await api.put(`/billing/${id}/status`, { status });
            fetchData();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const getStatusStyle = (status) => {
        if (status === 'Paid') return { backgroundColor: '#dcfce7', color: '#166534' };
        return { backgroundColor: '#fee2e2', color: '#991b1b' };
    };

    return (
        <DashboardLayout>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>Billing & Invoicing</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage patient invoices and payments</p>
                </div>
                <button
                    className="btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    onClick={() => setShowModal(true)}
                >
                    <Plus size={18} /> Create Bill
                </button>
            </div>

            <div className="glass-card" style={{ padding: '0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                            <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>Invoice ID</th>
                            <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>Patient</th>
                            <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>Amount</th>
                            <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>Date</th>
                            <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>Status</th>
                            <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center' }}>Loading bills...</td></tr>
                        ) : bills.length === 0 ? (
                            <tr><td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No invoices found.</td></tr>
                        ) : (
                            bills.map(bill => (
                                <tr key={bill.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem', fontWeight: '500' }}>#INV-{bill.id}</td>
                                    <td style={{ padding: '1rem' }}>{bill.patient_name}</td>
                                    <td style={{ padding: '1rem', fontWeight: '600' }}>${bill.total_amount}</td>
                                    <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{new Date(bill.billing_date).toLocaleDateString()}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            ...getStatusStyle(bill.status)
                                        }}>
                                            {bill.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {bill.status === 'Unpaid' && (
                                            <button
                                                className="btn-secondary"
                                                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                                onClick={() => handleUpdateStatus(bill.id, 'Paid')}
                                            >
                                                Mark as Paid
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
                }}>
                    <div className="glass-card" style={{ width: '500px', padding: '2rem', backgroundColor: 'white' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Create New Bill</h2>
                        <form onSubmit={handleCreateBill}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Select Patient</label>
                                <select required value={newBill.patient_id} onChange={e => setNewBill({ ...newBill, patient_id: e.target.value })}>
                                    <option value="">Choose a patient...</option>
                                    {patients.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Amount ($)</label>
                                <input type="number" step="0.01" required value={newBill.total_amount} onChange={e => setNewBill({ ...newBill, total_amount: e.target.value })} />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Description</label>
                                <textarea
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
                                    rows="3"
                                    value={newBill.description}
                                    onChange={e => setNewBill({ ...newBill, description: e.target.value })}
                                    placeholder="e.g. consultation fee, medicine, surgery..."
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Generate Invoice</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default BillingPage;
