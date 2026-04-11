import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../utils/api';
import { Calendar, Clock, CheckCircle, XCircle, Plus } from 'lucide-react';

const AppointmentsPage = () => {
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [newAppointment, setNewAppointment] = useState({
        patient_id: '',
        doctor_id: '',
        appointment_date: '',
        reason: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [appRes, docRes, patRes] = await Promise.all([
                api.get('/appointments'),
                api.get('/doctors'),
                api.get('/patients')
            ]);
            setAppointments(appRes.data);
            setDoctors(docRes.data);
            setPatients(patRes.data);
        } catch (err) {
            console.error('Failed to fetch data', err);
        } finally {
            setLoading(false);
        }
    };

    const handleBook = async (e) => {
        e.preventDefault();
        try {
            await api.post('/appointments', newAppointment);
            setShowModal(false);
            fetchData();
            setNewAppointment({ patient_id: '', doctor_id: '', appointment_date: '', reason: '' });
        } catch (err) {
            alert('Failed to book appointment');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Confirmed': return '#10b981';
            case 'Cancelled': return '#ef4444';
            case 'Completed': return '#3b82f6';
            default: return '#f59e0b';
        }
    };

    return (
        <DashboardLayout>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>Appointments</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Review and manage medical appointments</p>
                </div>
                <button
                    className="btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    onClick={() => setShowModal(true)}
                >
                    <Plus size={18} /> Book Appointment
                </button>
            </div>

            <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f1f5f9' }}>
                        <tr>
                            <th style={{ textAlign: 'left', padding: '15px 20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>PATIENT</th>
                            <th style={{ textAlign: 'left', padding: '15px 20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>DOCTOR</th>
                            <th style={{ textAlign: 'left', padding: '15px 20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>DATE & TIME</th>
                            <th style={{ textAlign: 'left', padding: '15px 20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>STATUS</th>
                            <th style={{ textAlign: 'right', padding: '15px 20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>Loading appointments...</td></tr>
                        ) : appointments.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                                    <Calendar size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                                    <p>No upcoming appointments found.</p>
                                </td>
                            </tr>
                        ) : (
                            appointments.map(app => (
                                <tr key={app.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '15px 20px', fontWeight: '500' }}>{app.patient_name}</td>
                                    <td style={{ padding: '15px 20px' }}>Dr. {app.doctor_name}</td>
                                    <td style={{ padding: '15px 20px' }}>{new Date(app.appointment_date).toLocaleString()}</td>
                                    <td style={{ padding: '15px 20px' }}>
                                        <span style={{
                                            padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600',
                                            backgroundColor: getStatusColor(app.status) + '20', color: getStatusColor(app.status)
                                        }}>
                                            {app.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                                        <button style={{ background: 'none', color: 'var(--primary)', marginRight: '10px' }}><CheckCircle size={18} /></button>
                                        <button style={{ background: 'none', color: 'var(--accent)' }}><XCircle size={18} /></button>
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
                        <h2 style={{ marginBottom: '1.5rem' }}>Book New Appointment</h2>
                        <form onSubmit={handleBook}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Select Patient</label>
                                <select required value={newAppointment.patient_id} onChange={e => setNewAppointment({ ...newAppointment, patient_id: e.target.value })}>
                                    <option value="">Choose a patient...</option>
                                    {patients.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Select Doctor</label>
                                <select required value={newAppointment.doctor_id} onChange={e => setNewAppointment({ ...newAppointment, doctor_id: e.target.value })}>
                                    <option value="">Choose a doctor...</option>
                                    {doctors.map(d => (
                                        <option key={d.id} value={d.id}>Dr. {d.name} ({d.specialization})</option>
                                    ))}
                                </select>
                                {doctors.length === 0 && (
                                    <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>
                                        ⚠️ No doctors found. Register a doctor in the Doctors page first.
                                    </p>
                                )}
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Appointment Date & Time</label>
                                <input type="datetime-local" required value={newAppointment.appointment_date} onChange={e => setNewAppointment({ ...newAppointment, appointment_date: e.target.value })} />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Reason for Visit</label>
                                <textarea required value={newAppointment.reason} onChange={e => setNewAppointment({ ...newAppointment, reason: e.target.value })}></textarea>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Book Appointment</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default AppointmentsPage;
