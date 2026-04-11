import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../utils/api';
import { UserRound, Search, Filter, Plus } from 'lucide-react';

const DoctorsPage = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newDoctor, setNewDoctor] = useState({
        name: '',
        specialization: '',
        qualification: '',
        experience: '',
        phone: '',
        email: '',
        consultation_fee: '',
        available_days: 'Mon-Fri',
        available_time: '10AM-5PM'
    });

    const fetchDoctors = async () => {
        try {
            const response = await api.get('/doctors');
            setDoctors(response.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDoctors();
    }, []);

    const handleCreateDoctor = async (e) => {
        e.preventDefault();
        try {
            await api.post('/doctors', newDoctor);
            setShowModal(false);
            fetchDoctors();
            setNewDoctor({
                name: '', specialization: '', qualification: '', experience: '',
                phone: '', email: '', consultation_fee: '', available_days: 'Mon-Fri', available_time: '10AM-5PM'
            });
        } catch (err) {
            alert('Failed to register doctor');
        }
    };

    return (
        <DashboardLayout>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>Doctors Directory</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Browse through our specialized medical professionals</p>
                </div>
                <button
                    className="btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    onClick={() => setShowModal(true)}
                >
                    <Plus size={18} /> Register Doctor
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {loading ? (
                    <p>Loading doctors...</p>
                ) : doctors.length === 0 ? (
                    <div className="glass-card" style={{ gridColumn: '1/-1', padding: '3rem', textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-muted)' }}>No doctors registered yet.</p>
                    </div>
                ) : (
                    doctors.map(doctor => (
                        <div key={doctor.id} className="glass-card" style={{ padding: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
                                    {doctor.name[0]}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>{doctor.name}</h3>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: '500' }}>{doctor.specialization}</p>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{doctor.qualification}</p>
                                </div>
                            </div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                                <div style={{ marginBottom: '8px' }}>📞 {doctor.phone}</div>
                                <div style={{ marginBottom: '8px' }}>💼 {doctor.experience} Years Experience</div>
                                <div style={{ marginBottom: '8px' }}>💰 Fee: ${doctor.consultation_fee}</div>
                                <div>📅 Available: {doctor.available_days} ({doctor.available_time})</div>
                            </div>
                            <button className="btn-secondary" style={{ width: '100%' }}>View Profile</button>
                        </div>
                    ))
                )}
            </div>

            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
                }}>
                    <div className="glass-card" style={{ width: '550px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', backgroundColor: 'white' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Register New Doctor</h2>
                        <form onSubmit={handleCreateDoctor}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Full Name</label>
                                    <input required value={newDoctor.name} onChange={e => setNewDoctor({ ...newDoctor, name: e.target.value })} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Specialization</label>
                                    <input required value={newDoctor.specialization} onChange={e => setNewDoctor({ ...newDoctor, specialization: e.target.value })} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Qualification</label>
                                    <input required value={newDoctor.qualification} onChange={e => setNewDoctor({ ...newDoctor, qualification: e.target.value })} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Experience (Years)</label>
                                    <input type="number" required value={newDoctor.experience} onChange={e => setNewDoctor({ ...newDoctor, experience: e.target.value })} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Phone</label>
                                    <input required value={newDoctor.phone} onChange={e => setNewDoctor({ ...newDoctor, phone: e.target.value })} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Email</label>
                                    <input type="email" value={newDoctor.email} onChange={e => setNewDoctor({ ...newDoctor, email: e.target.value })} />
                                </div>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Consultation Fee</label>
                                <input type="number" required value={newDoctor.consultation_fee} onChange={e => setNewDoctor({ ...newDoctor, consultation_fee: e.target.value })} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Available Days</label>
                                    <input value={newDoctor.available_days} onChange={e => setNewDoctor({ ...newDoctor, available_days: e.target.value })} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Available Time</label>
                                    <input value={newDoctor.available_time} onChange={e => setNewDoctor({ ...newDoctor, available_time: e.target.value })} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Register Doctor</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default DoctorsPage;
