import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../utils/api';
import { Users, UserRound, Calendar, DollarSign, CreditCard } from 'lucide-react';

const StatCard = ({ title, value, icon, color }) => (
    <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ backgroundColor: `${color}15`, color: color, padding: '12px', borderRadius: '12px' }}>
            {icon}
        </div>
        <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{title}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{value}</div>
        </div>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalPatients: 0,
        totalDoctors: 0,
        todayAppointments: 0,
        totalRevenue: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/stats');
                setStats(response.data);
            } catch (err) {
                console.error('Failed to fetch stats', err);
            }
        };
        fetchStats();
    }, []);

    return (
        <DashboardLayout>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '8px' }}>Hospital Overview</h1>
                <p style={{ color: 'var(--text-muted)' }}>Welcome back! Here's what's happening today.</p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2.5rem'
            }}>
                <StatCard title="Total Patients" value={stats.totalPatients} icon={<Users size={24} />} color="#0f766e" />
                <StatCard title="Total Doctors" value={stats.totalDoctors} icon={<UserRound size={24} />} color="#0ea5e9" />
                <StatCard title="Today's Appointments" value={stats.todayAppointments} icon={<Calendar size={24} />} color="#8b5cf6" />
                <StatCard title="Revenue" value={`$${stats.totalRevenue}`} icon={<DollarSign size={24} />} color="#10b981" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontWeight: '600' }}>Recent Summary</h3>
                    </div>
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Module active and synchronized with production data.</p>
                </div>

                <div className="glass-card" style={{ padding: '2rem' }}>
                    <h3 style={{ fontWeight: '600', marginBottom: '1.5rem' }}>Quick Actions</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <button className="btn-secondary" style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }} onClick={() => window.location.hash = '/patients'}>
                            <Users size={18} /> Register New Patient
                        </button>
                        <button className="btn-secondary" style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }} onClick={() => window.location.hash = '/appointments'}>
                            <Calendar size={18} /> Book Appointment
                        </button>
                        <button className="btn-secondary" style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }} onClick={() => window.location.hash = '/billing'}>
                            <CreditCard size={18} /> Generate Invoice
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Dashboard;
