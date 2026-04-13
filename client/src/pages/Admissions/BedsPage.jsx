import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { Plus, Layout, Grid, Activity, Layers } from 'lucide-react';

const BedsPage = () => {
    const { user } = useAuth();
    const [wards, setWards] = useState([]);
    const [stats, setStats] = useState({ total: 0, occupied: 0, available: 0 });
    const [loading, setLoading] = useState(true);
    const [showWardModal, setShowWardModal] = useState(false);
    const [showBedModal, setShowBedModal] = useState(false);

    const [wardForm, setWardForm] = useState({
        ward_name: '',
        ward_type: 'General',
        capacity: ''
    });

    const [bedForm, setBedForm] = useState({
        ward_id: '',
        bed_number: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [wardsRes, statsRes] = await Promise.all([
                api.get('/wards'),
                api.get('/dashboard/beds')
            ]);
            setWards(wardsRes.data);
            setStats(statsRes.data);
        } catch (err) {
            console.error('Failed to fetch bed data', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateWard = async (e) => {
        e.preventDefault();
        try {
            await api.post('/wards', wardForm);
            setShowWardModal(false);
            fetchData();
            alert('Ward created successfully');
        } catch (err) {
            alert('Failed to create ward');
        }
    };

    const handleCreateBed = async (e) => {
        e.preventDefault();
        try {
            await api.post('/beds', bedForm);
            setShowBedModal(false);
            fetchData();
            alert('Bed created successfully');
        } catch (err) {
            alert('Failed to create bed');
        }
    };

    return (
        <DashboardLayout>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>Bed Management</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage hospital wards and monitor bed availability</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        className="btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        onClick={() => setShowWardModal(true)}
                    >
                        <Plus size={18} /> New Ward
                    </button>
                    <button
                        className="btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        onClick={() => setShowBedModal(true)}
                    >
                        <Plus size={18} /> New Bed
                    </button>
                </div>
            </div>

            {/* Stats Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem' }}>
                    <div style={{ backgroundColor: 'var(--primary-light)', padding: '12px', borderRadius: '12px', color: 'var(--primary)' }}>
                        <Layers size={24} />
                    </div>
                    <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Beds</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.total}</div>
                    </div>
                </div>
                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem' }}>
                    <div style={{ backgroundColor: '#fff3e0', padding: '12px', borderRadius: '12px', color: '#ef6c00' }}>
                        <Activity size={24} />
                    </div>
                    <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Occupied</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.occupied}</div>
                    </div>
                </div>
                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem' }}>
                    <div style={{ backgroundColor: '#e8f5e9', padding: '12px', borderRadius: '12px', color: '#2e7d32' }}>
                        <Grid size={24} />
                    </div>
                    <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Available</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.available}</div>
                    </div>
                </div>
            </div>

            <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                    <h2 style={{ fontSize: '1.25rem' }}>Wards Overview</h2>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f1f5f9' }}>
                        <tr>
                            <th style={{ textAlign: 'left', padding: '15px 20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>WARD NAME</th>
                            <th style={{ textAlign: 'left', padding: '15px 20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>TYPE</th>
                            <th style={{ textAlign: 'left', padding: '15px 20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>CAPACITY</th>
                            <th style={{ textAlign: 'right', padding: '15px 20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading wards...</td></tr>
                        ) : wards.length === 0 ? (
                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No wards found</td></tr>
                        ) : (
                            wards.map(ward => (
                                <tr key={ward.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '15px 20px', fontWeight: '500' }}>{ward.ward_name}</td>
                                    <td style={{ padding: '15px 20px' }}>{ward.ward_type}</td>
                                    <td style={{ padding: '15px 20px' }}>{ward.capacity} Beds</td>
                                    <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                                        <button style={{ background: 'none', color: 'var(--primary)', marginRight: '15px' }}>View Beds</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Ward Modal */}
            {showWardModal && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="glass-card" style={{ width: '400px', padding: '2rem', backgroundColor: 'white' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Create New Ward</h2>
                        <form onSubmit={handleCreateWard}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Ward Name</label>
                                <input required placeholder="e.g. ICU, General Ward A" value={wardForm.ward_name} onChange={e => setWardForm({ ...wardForm, ward_name: e.target.value })} />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Ward Type</label>
                                <select value={wardForm.ward_type} onChange={e => setWardForm({ ...wardForm, ward_type: e.target.value })}>
                                    <option>General</option>
                                    <option>ICU</option>
                                    <option>Semi-Private</option>
                                    <option>Private</option>
                                </select>
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Capacity</label>
                                <input type="number" required value={wardForm.capacity} onChange={e => setWardForm({ ...wardForm, capacity: e.target.value })} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button type="button" className="btn-secondary" onClick={() => setShowWardModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Create Ward</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Bed Modal */}
            {showBedModal && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="glass-card" style={{ width: '400px', padding: '2rem', backgroundColor: 'white' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Add New Bed</h2>
                        <form onSubmit={handleCreateBed}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Select Ward</label>
                                <select required value={bedForm.ward_id} onChange={e => setBedForm({ ...bedForm, ward_id: e.target.value })}>
                                    <option value="">Select Ward</option>
                                    {wards.map(w => <option key={w.id} value={w.id}>{w.ward_name}</option>)}
                                </select>
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Bed Number</label>
                                <input required placeholder="e.g. B-101" value={bedForm.bed_number} onChange={e => setBedForm({ ...bedForm, bed_number: e.target.value })} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button type="button" className="btn-secondary" onClick={() => setShowBedModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Add Bed</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default BedsPage;
