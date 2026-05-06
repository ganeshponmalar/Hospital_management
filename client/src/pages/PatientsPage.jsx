import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Edit2, Trash2, UserPlus } from 'lucide-react';

const PatientsPage = () => {
    const { user } = useAuth();
    const [patients, setPatients] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [newPatient, setNewPatient] = useState({
        name: '',
        age: '',
        gender: 'Male',
        date_of_birth: '',
        phone: '',
        email: '',
        address: '',
        blood_group: '',
        allergies: '',
        medical_history: '', 
        emergency_contact_name: '',
        emergency_contact_phone: '' 
    });

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const response = await api.get('/patients');
            setPatients(response.data);
            console.log("Patients:", response.data);
        } catch (err) {
            console.error('Failed to fetch patients', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/patients', newPatient);
            setShowModal(false);
            fetchPatients();
            setNewPatient({
                name: '', age: '', gender: 'Male', date_of_birth: '', phone: '',
                email: '', address: '', blood_group: '', allergies: '',
                medical_history: '', emergency_contact_name: '', emergency_contact_phone: ''
            });
        } catch (err) {
            alert('Failed to register patient');
        }
    };

    return (
        <DashboardLayout>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>Patients Management</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage and track patient records</p>
                </div>
                <button
                    className="btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    onClick={() => setShowModal(true)}
                >
                    <UserPlus size={18} /> Register Patient
                </button>
            </div>

            <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
                        <input type="text" placeholder="Search patients..." style={{ paddingLeft: '40px', padding: '8px 40px' }} />
                    </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f1f5f9' }}>
                        <tr>
                            <th style={{ textAlign: 'left', padding: '15px 20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>NAME</th>
                            <th style={{ textAlign: 'left', padding: '15px 20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>AGE/GENDER</th>
                            <th style={{ textAlign: 'left', padding: '15px 20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>PHONE</th>
                            <th style={{ textAlign: 'left', padding: '15px 20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>BLOOD GROUP</th>
                            <th style={{ textAlign: 'right', padding: '15px 20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading patients...</td></tr>
                        ) : patients.length === 0 ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No patients found</td></tr>
                        ) : (
                            patients.map(patient => (
                                <tr key={patient.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '15px 20px', fontWeight: '500' }}>{patient.name}</td>
                                    <td style={{ padding: '15px 20px' }}>{patient.age} / {patient.gender}</td>
                                    <td style={{ padding: '15px 20px' }}>{patient.phone}</td>
                                    <td style={{ padding: '15px 20px' }}>{patient.blood_group || 'N/A'}</td>
                                    <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                                        <button style={{ background: 'none', color: 'var(--primary)', marginRight: '15px' }} title="Edit"><Edit2 size={16} /></button>
                                        <button style={{ background: 'none', color: 'var(--accent)' }} title="Delete"><Trash2 size={16} /></button>
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
                    <div className="glass-card" style={{ width: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', backgroundColor: 'white' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Register New Patient</h2>
                        <form onSubmit={handleCreate}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Full Name</label>
                                    <input required value={newPatient.name} onChange={e => setNewPatient({ ...newPatient, name: e.target.value })} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Age</label>
                                    <input type="number" required value={newPatient.age} onChange={e => setNewPatient({ ...newPatient, age: e.target.value })} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Date of Birth</label>
                                    <input type="date" required value={newPatient.date_of_birth} onChange={e => setNewPatient({ ...newPatient, date_of_birth: e.target.value })} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Gender</label>
                                    <select value={newPatient.gender} onChange={e => setNewPatient({ ...newPatient, gender: e.target.value })}>
                                        <option>Male</option>
                                        <option>Female</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Phone Number</label>
                                    <input required value={newPatient.phone} onChange={e => setNewPatient({ ...newPatient, phone: e.target.value })} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Email</label>
                                    <input type="email" value={newPatient.email} onChange={e => setNewPatient({ ...newPatient, email: e.target.value })} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Blood Group</label>
                                    <input placeholder="e.g. A+" value={newPatient.blood_group} onChange={e => setNewPatient({ ...newPatient, blood_group: e.target.value })} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Allergies</label>
                                    <input placeholder="Any allergies?" value={newPatient.allergies} onChange={e => setNewPatient({ ...newPatient, allergies: e.target.value })} />
                                </div>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Address</label>
                                <textarea rows="2" value={newPatient.address} onChange={e => setNewPatient({ ...newPatient, address: e.target.value })}></textarea>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Medical History</label>
                                <textarea rows="2" value={newPatient.medical_history} onChange={e => setNewPatient({ ...newPatient, medical_history: e.target.value })}></textarea>
                            </div>
                            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Emergency Contact</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Contact Name</label>
                                        <input value={newPatient.emergency_contact_name} onChange={e => setNewPatient({ ...newPatient, emergency_contact_name: e.target.value })} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Contact Phone</label>
                                        <input value={newPatient.emergency_contact_phone} onChange={e => setNewPatient({ ...newPatient, emergency_contact_phone: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Register Patient</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default PatientsPage;
