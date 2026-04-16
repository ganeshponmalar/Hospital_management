import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, User, CheckCircle, XCircle, Trash2 } from 'lucide-react';

const DoctorSchedulePage = () => {
    const { user } = useAuth();
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(false);

    // New Schedule State
    const [newSchedule, setNewSchedule] = useState({
        doctor_id: '',
        available_date: new Date().toISOString().split('T')[0],
        start_time: '09:00',
        end_time: '17:00',
        slot_duration: '15'
    });

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const response = await api.get('/doctors');
            setDoctors(response.data);
            if (response.data.length > 0) {
                setNewSchedule(prev => ({ ...prev, doctor_id: response.data[0].id }));
            }
        } catch (err) {
            console.error('Failed to fetch doctors', err);
        }
    };

    const fetchSlots = async () => {
        if (!selectedDoctor) return;
        setLoading(true);
        try {
            const response = await api.get(`/schedule/availability?doctorId=${selectedDoctor.id}&date=${date}`);
            setSlots(response.data);
        } catch (err) {
            console.error('Failed to fetch slots', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSlots();
    }, [selectedDoctor, date]);

    const handleCreateSchedule = async (e) => {
        e.preventDefault();
        try {
            await api.post('/schedule/create', newSchedule);
            alert('Schedule and slots generated successfully');
            if (selectedDoctor?.id == newSchedule.doctor_id && date == newSchedule.available_date) {
                fetchSlots();
            }
        } catch (err) {
            alert('Failed to create schedule');
        }
    };

    return (
        <DashboardLayout>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Create Schedule Card */}
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Calendar color="var(--primary)" /> Generate Weekly Schedule
                    </h2>
                    <form onSubmit={handleCreateSchedule}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Select Doctor</label>
                            <select required value={newSchedule.doctor_id} onChange={e => setNewSchedule({ ...newSchedule, doctor_id: e.target.value })}>
                                {doctors.map(d => (
                                    <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Date</label>
                            <input type="date" required value={newSchedule.available_date} onChange={e => setNewSchedule({ ...newSchedule, available_date: e.target.value })} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Start Time</label>
                                <input type="time" required value={newSchedule.start_time} onChange={e => setNewSchedule({ ...newSchedule, start_time: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px' }}>End Time</label>
                                <input type="time" required value={newSchedule.end_time} onChange={e => setNewSchedule({ ...newSchedule, end_time: e.target.value })} />
                            </div>
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Slot Duration (minutes)</label>
                            <select value={newSchedule.slot_duration} onChange={e => setNewSchedule({ ...newSchedule, slot_duration: e.target.value })}>
                                <option value="10">10 mins</option>
                                <option value="15">15 mins</option>
                                <option value="20">20 mins</option>
                                <option value="30">30 mins</option>
                            </select>
                        </div>
                        <button type="submit" className="btn-primary" style={{ width: '100%' }}>Generate Time Slots</button>
                    </form>
                </div>

                {/* View Availability Card */}
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Clock color="var(--primary)" /> View Availability
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                        <select onChange={e => setSelectedDoctor(doctors.find(d => d.id == e.target.value))}>
                            <option value="">Select Doctor</option>
                            {doctors.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
                        {loading ? (
                            <p style={{ gridColumn: '1/-1', textAlign: 'center' }}>Loading slots...</p>
                        ) : slots.length === 0 ? (
                            <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)' }}>No slots found for this day.</p>
                        ) : (
                            slots.map(slot => (
                                <div
                                    key={slot.id}
                                    style={{
                                        padding: '10px 5px',
                                        borderRadius: '8px',
                                        textAlign: 'center',
                                        fontSize: '0.85rem',
                                        backgroundColor: slot.is_booked ? '#fee2e2' : '#f0fdf4',
                                        border: slot.is_booked ? '1px solid #fecaca' : '1px solid #bbf7d0',
                                        color: slot.is_booked ? '#991b1b' : '#166534'
                                    }}
                                >
                                    {slot.slot_time.substring(0, 5)}
                                    <div style={{ fontSize: '0.7rem' }}>{slot.is_booked ? 'Booked' : 'Available'}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default DoctorSchedulePage;
