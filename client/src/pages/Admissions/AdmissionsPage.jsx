import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { Plus, Search, UserMinus, UserCheck, Eye, ClipboardList } from 'lucide-react';

const AdmissionsPage = () => {
    const { user } = useAuth();
    const [admissions, setAdmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAdmitModal, setShowAdmitModal] = useState(false);
    const [showDischargeModal, setShowDischargeModal] = useState(false);
    const [selectedAdmission, setSelectedAdmission] = useState(null);
    const [patients, setPatients] = useState([]);
    const [beds, setBeds] = useState([]);
    const [doctors, setDoctors] = useState([]);

    const [admitForm, setAdmitForm] = useState({
        patient_id: '',
        doctor_id: '',
        bed_id: '',
        reason: '',
        admission_type: 'Planned'
    });

    const [dischargeForm, setDischargeForm] = useState({
        final_diagnosis: '',
        treatment_given: '',
        medications: '',
        doctor_notes: '',
        follow_up_date: ''
    });

    useEffect(() => {
        fetchAdmissions();
        fetchInitialData();
    }, []);

    const fetchAdmissions = async () => {
        try {
            // We need an endpoint for all admissions or active ones.
            // I'll assume /api/admissions returns all.
            // Wait, I didn't create a GET /api/admissions for ALL. 
            // I should have. I'll add a quick one or just use patient history for now?
            // Actually, I'll update the controller to have getAllAdmissions.
            const response = await api.get('/admissions');
            setAdmissions(response.data);
        } catch (err) {
            console.error('Failed to fetch admissions', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchInitialData = async () => {
        try {
            const [patientsRes, bedsRes, doctorsRes] = await Promise.all([
                api.get('/patients'),
                api.get('/beds/available'),
                api.get('/doctors')
            ]);
            setPatients(patientsRes.data);
            setBeds(bedsRes.data);
            setDoctors(doctorsRes.data);
        } catch (err) {
            console.error('Failed to fetch modal data', err);
        }
    };

    const handleAdmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admissions/admit', admitForm);
            setShowAdmitModal(false);
            fetchAdmissions();
            fetchInitialData(); // Refresh beds
            alert('Patient admitted successfully');
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to admit patient');
        }
    };

    const handleDischarge = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admissions/discharge', {
                ...dischargeForm,
                admission_id: selectedAdmission.id
            });
            setShowDischargeModal(false);
            fetchAdmissions();
            fetchInitialData(); // Refresh beds
            alert('Patient discharged successfully');
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to discharge patient');
        }
    };

    return (
        <DashboardLayout>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>Inpatient Admissions</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage patient hospital stays and bed assignments</p>
                </div>
                <button
                    className="btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    onClick={() => setShowAdmitModal(true)}
                >
                    <Plus size={18} /> New Admission
                </button>
            </div>

            <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f1f5f9' }}>
                        <tr>
                            <th style={{ textAlign: 'left', padding: '15px 20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>PATIENT</th>
                            <th style={{ textAlign: 'left', padding: '15px 20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>BED / WARD</th>
                            <th style={{ textAlign: 'left', padding: '15px 20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>ADMISSION DATE</th>
                            <th style={{ textAlign: 'left', padding: '15px 20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>STATUS</th>
                            <th style={{ textAlign: 'right', padding: '15px 20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading admissions...</td></tr>
                        ) : admissions.length === 0 ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No active admissions found</td></tr>
                        ) : (
                            admissions.map(adm => (
                                <tr key={adm.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '15px 20px' }}>
                                        <div style={{ fontWeight: '500' }}>{adm.patient_name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{adm.admission_type}</div>
                                    </td>
                                    <td style={{ padding: '15px 20px' }}>
                                        <span className="badge" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                                            {adm.bed_number} ({adm.ward_name})
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px 20px' }}>{new Date(adm.admission_date).toLocaleString()}</td>
                                    <td style={{ padding: '15px 20px' }}>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            backgroundColor: adm.status === 'admitted' ? '#e1f5fe' : '#e8f5e9',
                                            color: adm.status === 'admitted' ? '#0288d1' : '#2e7d32'
                                        }}>
                                            {adm.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                                        {adm.status === 'admitted' && (
                                            <button
                                                className="btn-accent"
                                                style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                                onClick={() => {
                                                    setSelectedAdmission(adm);
                                                    setShowDischargeModal(true);
                                                }}
                                            >
                                                <UserMinus size={14} /> Discharge
                                            </button>
                                        )}
                                        <button style={{ background: 'none', color: 'var(--primary)', marginLeft: '10px' }} title="View Details"><Eye size={18} /></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Admit Modal */}
            {showAdmitModal && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="glass-card" style={{ width: '500px', padding: '2rem', backgroundColor: 'white' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Admit Patient</h2>
                        <form onSubmit={handleAdmit}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Patient</label>
                                <select required value={admitForm.patient_id} onChange={e => setAdmitForm({ ...admitForm, patient_id: e.target.value })}>
                                    <option value="">Select Patient</option>
                                    {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px' }}>Assigned Doctor</label>
                                    <select required value={admitForm.doctor_id} onChange={e => setAdmitForm({ ...admitForm, doctor_id: e.target.value })}>
                                        <option value="">Select Doctor</option>
                                        {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px' }}>Available Bed</label>
                                    <select required value={admitForm.bed_id} onChange={e => setAdmitForm({ ...admitForm, bed_id: e.target.value })}>
                                        <option value="">Select Bed</option>
                                        {beds.map(b => <option key={b.id} value={b.id}>{b.bed_number} ({b.ward_name})</option>)}
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px' }}>Admission Type</label>
                                    <select value={admitForm.admission_type} onChange={e => setAdmitForm({ ...admitForm, admission_type: e.target.value })}>
                                        <option>Planned</option>
                                        <option>Emergency</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Reason for Admission</label>
                                <textarea required rows="3" value={admitForm.reason} onChange={e => setAdmitForm({ ...admitForm, reason: e.target.value })}></textarea>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button type="button" className="btn-secondary" onClick={() => setShowAdmitModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Admit Patient</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Discharge Modal */}
            {showDischargeModal && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="glass-card" style={{ width: '600px', padding: '2rem', backgroundColor: 'white' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Discharge Summary</h2>
                        <form onSubmit={handleDischarge}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Final Diagnosis</label>
                                <textarea required rows="2" value={dischargeForm.final_diagnosis} onChange={e => setDischargeForm({ ...dischargeForm, final_diagnosis: e.target.value })}></textarea>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Treatment Given</label>
                                <textarea required rows="2" value={dischargeForm.treatment_given} onChange={e => setDischargeForm({ ...dischargeForm, treatment_given: e.target.value })}></textarea>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Medications</label>
                                <textarea required rows="2" value={dischargeForm.medications} onChange={e => setDischargeForm({ ...dischargeForm, medications: e.target.value })}></textarea>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px' }}>Follow-up Date</label>
                                    <input type="date" value={dischargeForm.follow_up_date} onChange={e => setDischargeForm({ ...dischargeForm, follow_up_date: e.target.value })} />
                                </div>
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Doctor Notes</label>
                                <textarea rows="2" value={dischargeForm.doctor_notes} onChange={e => setDischargeForm({ ...dischargeForm, doctor_notes: e.target.value })}></textarea>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button type="button" className="btn-secondary" onClick={() => setShowDischargeModal(false)}>Cancel</button>
                                <button type="submit" className="btn-accent">Complete Discharge</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default AdmissionsPage;
