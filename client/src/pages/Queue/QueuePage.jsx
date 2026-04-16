import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { Users, Clock, Play, CheckCircle, SkipForward, Search } from 'lucide-react';

const QueuePage = () => {
    const { user } = useAuth();
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctorId, setSelectedDoctorId] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [patients, setPatients] = useState([]);

    // New Queue Entry State
    const [newEntry, setNewEntry] = useState({
        patient_id: '',
        doctor_id: '',
        queue_date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchDoctors();
        fetchPatients();
    }, []);

    const fetchDoctors = async () => {
        try {
            const response = await api.get('/doctors');
            setDoctors(response.data);
            if (response.data.length > 0) {
                setSelectedDoctorId(response.data[0].id);
                setNewEntry(prev => ({ ...prev, doctor_id: response.data[0].id }));
            }
        } catch (err) {
            console.error('Failed to fetch doctors', err);
        }
    };

    const fetchPatients = async () => {
        try {
            const response = await api.get('/patients');
            setPatients(response.data);
        } catch (err) {
            console.error('Failed to fetch patients', err);
        }
    };

    const fetchQueue = async () => {
        if (!selectedDoctorId) return;
        setLoading(true);
        try {
            const response = await api.get(`/queue/status?doctorId=${selectedDoctorId}&date=${date}`);
            setQueue(response.data);
        } catch (err) {
            console.error('Failed to fetch queue', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQueue();
    }, [selectedDoctorId, date]);

    const handleAddToQueue = async (e) => {
        e.preventDefault();
        try {
            await api.post('/queue/add', newEntry);
            setShowAddModal(false);
            fetchQueue();
            alert('Patient added to queue successfully');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add to queue');
        }
    };

    const handleUpdateStatus = async (queueId, status) => {
        try {
            await api.put(`/queue/update/${queueId}`, { status });
            fetchQueue();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Waiting': return '#3b82f6';
            case 'In-Progress': return '#f59e0b';
            case 'Completed': return '#10b981';
            case 'Skipping': return '#ef4444';
            default: return 'var(--text-muted)';
        }
    };

    return (
        <DashboardLayout>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>Outpatient Queue</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Live token management for doctors</p>
                </div>
                <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setShowAddModal(true)}>
                    <Users size={18} /> New Token (Add Patient)
                </button>
            </div>

            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '300px 200px 1fr', gap: '1.5rem', alignItems: 'center' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Select Doctor</label>
                        <select value={selectedDoctorId} onChange={e => setSelectedDoctorId(e.target.value)}>
                            {doctors.map(d => (
                                <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Date</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
                    </div>
                    <div style={{ textAlign: 'right', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <div className="glass-card" style={{ padding: '0.5rem 1rem', display: 'inline-block' }}>
                            <small style={{ color: 'var(--text-muted)' }}>Waiting</small>
                            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#3b82f6' }}>{queue.filter(q => q.status === 'Waiting').length}</div>
                        </div>
                        <div className="glass-card" style={{ padding: '0.5rem 1rem', display: 'inline-block' }}>
                            <small style={{ color: 'var(--text-muted)' }}>Currently In</small>
                            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#f59e0b' }}>
                                {queue.find(q => q.status === 'In-Progress')?.token_number || '-'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f1f5f9' }}>
                        <tr>
                            <th style={{ textAlign: 'left', padding: '15px 20px', fontSize: '0.85rem' }}>TOKEN</th>
                            <th style={{ textAlign: 'left', padding: '15px 20px', fontSize: '0.85rem' }}>PATIENT</th>
                            <th style={{ textAlign: 'left', padding: '15px 20px', fontSize: '0.85rem' }}>STATUS</th>
                            <th style={{ textAlign: 'right', padding: '15px 20px', fontSize: '0.85rem' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: '3rem' }}>Loading queue...</td></tr>
                        ) : queue.length === 0 ? (
                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No patients in queue for this selection.</td></tr>
                        ) : (
                            queue.map(entry => (
                                <tr key={entry.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '15px 20px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--primary)' }}>
                                            {entry.token_number}
                                        </div>
                                    </td>
                                    <td style={{ padding: '15px 20px' }}>
                                        <div style={{ fontWeight: '500' }}>{entry.patient_name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: #{entry.patient_id}</div>
                                    </td>
                                    <td style={{ padding: '15px 20px' }}>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            fontSize: '0.8rem',
                                            fontWeight: '500',
                                            backgroundColor: `${getStatusColor(entry.status)}20`,
                                            color: getStatusColor(entry.status),
                                            border: `1px solid ${getStatusColor(entry.status)}40`
                                        }}>
                                            {entry.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                                        {entry.status === 'Waiting' && (
                                            <button
                                                onClick={() => handleUpdateStatus(entry.id, 'In-Progress')}
                                                style={{ background: 'none', color: '#f59e0b', marginRight: '15px' }} title="Call Patient">
                                                <Play size={18} />
                                            </button>
                                        )}
                                        {entry.status === 'In-Progress' && (
                                            <button
                                                onClick={() => handleUpdateStatus(entry.id, 'Completed')}
                                                style={{ background: 'none', color: '#10b981', marginRight: '15px' }} title="Complete Visit">
                                                <CheckCircle size={18} />
                                            </button>
                                        )}
                                        {['Waiting', 'In-Progress'].includes(entry.status) && (
                                            <button
                                                onClick={() => handleUpdateStatus(entry.id, 'Skipping')}
                                                style={{ background: 'none', color: '#ef4444' }} title="Skip">
                                                <SkipForward size={18} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add to Queue Modal */}
            {showAddModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
                }}>
                    <div className="glass-card" style={{ width: '500px', padding: '2rem', backgroundColor: 'white' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Add Patient to Queue</h2>
                        <form onSubmit={handleAddToQueue}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Select Patient</label>
                                <select required value={newEntry.patient_id} onChange={e => setNewEntry({ ...newEntry, patient_id: e.target.value })}>
                                    <option value="">Choose Patient</option>
                                    {patients.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Select Doctor</label>
                                <select required value={newEntry.doctor_id} onChange={e => setNewEntry({ ...newEntry, doctor_id: e.target.value })}>
                                    {doctors.map(d => (
                                        <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Date</label>
                                <input type="date" required value={newEntry.queue_date} onChange={e => setNewEntry({ ...newEntry, queue_date: e.target.value })} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Generate Token</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default QueuePage;
