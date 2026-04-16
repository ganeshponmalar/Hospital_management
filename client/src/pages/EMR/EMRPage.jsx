import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { Plus, Search, Clipboard, FileText, Pill, History } from 'lucide-react';

const EMRPage = () => {
    const { user } = useAuth();
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [history, setHistory] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);

    // New Record State
    const [newRecord, setNewRecord] = useState({
        diagnosis: '',
        notes: '',
        prescriptions: [{ medicine_name: '', dosage: '', duration: '' }]
    });

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const response = await api.get('/patients');
            setPatients(response.data);
        } catch (err) {
            console.error('Failed to fetch patients', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async (patientId) => {
        try {
            const response = await api.get(`/emr/patient/${patientId}`);
            setHistory(response.data);
        } catch (err) {
            console.error('Failed to fetch history', err);
        }
    };

    const handlePatientSelect = (patient) => {
        setSelectedPatient(patient);
        fetchHistory(patient.id);
    };

    const handleAddPrescription = () => {
        setNewRecord({
            ...newRecord,
            prescriptions: [...newRecord.prescriptions, { medicine_name: '', dosage: '', duration: '' }]
        });
    };

    const handlePrescriptionChange = (index, field, value) => {
        const updated = [...newRecord.prescriptions];
        updated[index][field] = value;
        setNewRecord({ ...newRecord, prescriptions: updated });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/emr/records', {
                ...newRecord,
                patient_id: selectedPatient.id,
                doctor_id: user.id
            });
            setShowModal(false);
            fetchHistory(selectedPatient.id);
            setNewRecord({
                diagnosis: '',
                notes: '',
                prescriptions: [{ medicine_name: '', dosage: '', duration: '' }]
            });
        } catch (err) {
            alert('Failed to save medical record');
        }
    };

    return (
        <DashboardLayout>
            <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '2rem', height: 'calc(100vh - 180px)' }}>
                {/* Patient List Sidebar */}
                <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Patients</h2>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
                            <input type="text" placeholder="Search..." style={{ paddingLeft: '35px', width: '100%', fontSize: '0.9rem' }} />
                        </div>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {loading ? (
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</p>
                        ) : (
                            patients.map(p => (
                                <div
                                    key={p.id}
                                    onClick={() => handlePatientSelect(p)}
                                    style={{
                                        padding: '1rem',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        marginBottom: '0.5rem',
                                        backgroundColor: selectedPatient?.id === p.id ? 'var(--primary-light)' : 'transparent',
                                        border: selectedPatient?.id === p.id ? '1px solid var(--primary)' : '1px solid transparent',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <h4 style={{ margin: 0 }}>{p.name}</h4>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Age: {p.age} | {p.gender}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Main Content Area */}
                <div style={{ overflowY: 'auto' }}>
                    {selectedPatient ? (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <div>
                                    <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>{selectedPatient.name}</h1>
                                    <p style={{ color: 'var(--text-muted)' }}>Patient ID: #{selectedPatient.id}</p>
                                </div>
                                <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setShowModal(true)}>
                                    <Plus size={18} /> New Clinical Visit
                                </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                                <div className="glass-card" style={{ padding: '1.5rem' }}>
                                    <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Clipboard size={18} color="var(--primary)" /> Vitals & Summary
                                    </h3>
                                    <p><strong>Blood Group:</strong> {selectedPatient.blood_group || 'N/A'}</p>
                                    <p><strong>Allergies:</strong> <span style={{ color: 'var(--accent)' }}>{selectedPatient.allergies || 'None'}</span></p>
                                </div>
                                <div className="glass-card" style={{ padding: '1.5rem' }}>
                                    <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <History size={18} color="var(--primary)" /> Medical History
                                    </h3>
                                    <p style={{ fontSize: '0.9rem' }}>{selectedPatient.medical_history || 'No prior history recorded.'}</p>
                                </div>
                            </div>

                            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Clinical Visits</h2>
                            {history.length === 0 ? (
                                <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No records found for this patient.
                                </div>
                            ) : (
                                history.map(record => (
                                    <div key={record.id} className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                            <span style={{ fontWeight: 'bold' }}>{new Date(record.created_at).toLocaleDateString()}</span>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Dr. {record.doctor_name}</span>
                                        </div>
                                        <div style={{ marginBottom: '1rem' }}>
                                            <h4 style={{ fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '5px' }}>DIAGNOSIS</h4>
                                            <p style={{ margin: 0 }}>{record.diagnosis}</p>
                                        </div>
                                        {record.prescriptions?.length > 0 && (
                                            <div>
                                                <h4 style={{ fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '5px' }}>PRESCRIPTIONS</h4>
                                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                                    <thead>
                                                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                                            <th style={{ textAlign: 'left', padding: '8px' }}>Medicine</th>
                                                            <th style={{ textAlign: 'left', padding: '8px' }}>Dosage</th>
                                                            <th style={{ textAlign: 'left', padding: '8px' }}>Duration</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {record.prescriptions.map((p, i) => (
                                                            <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                                                                <td style={{ padding: '8px' }}><Pill size={14} style={{ marginRight: '5px' }} /> {p.medicine_name}</td>
                                                                <td style={{ padding: '8px' }}>{p.dosage}</td>
                                                                <td style={{ padding: '8px' }}>{p.duration}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="glass-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <FileText size={64} strokeWidth={1} style={{ marginBottom: '1.5rem' }} />
                            <h2>Select a patient to view EMR</h2>
                            <p>Choose a patient from the sidebar to view their full medical history and records.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* New Visit Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
                }}>
                    <div className="glass-card" style={{ width: '700px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', backgroundColor: 'white' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>New Clinical Visit</h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Diagnosis</label>
                                <textarea required value={newRecord.diagnosis} onChange={e => setNewRecord({ ...newRecord, diagnosis: e.target.value })} rows="3"></textarea>
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Clinical Notes</label>
                                <textarea value={newRecord.notes} onChange={e => setNewRecord({ ...newRecord, notes: e.target.value })} rows="2"></textarea>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h3 style={{ fontSize: '1rem', margin: 0 }}>Prescriptions</h3>
                                    <button type="button" className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={handleAddPrescription}>
                                        + Add Medicine
                                    </button>
                                </div>
                                {newRecord.prescriptions.map((p, index) => (
                                    <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                                        <input placeholder="Medicine Name" required value={p.medicine_name} onChange={e => handlePrescriptionChange(index, 'medicine_name', e.target.value)} />
                                        <input placeholder="Dosage (e.g. 1-0-1)" required value={p.dosage} onChange={e => handlePrescriptionChange(index, 'dosage', e.target.value)} />
                                        <input placeholder="Duration (e.g. 5 days)" required value={p.duration} onChange={e => handlePrescriptionChange(index, 'duration', e.target.value)} />
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Save Visit Record</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default EMRPage;
