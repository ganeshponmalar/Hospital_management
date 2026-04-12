import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Clock, CheckCircle, FileText } from 'lucide-react';

const LabDashboard = () => {
    const [stats, setStats] = useState({ totalTests: 0, pendingOrders: 0, completedToday: 0 });

    useEffect(() => {
        // In a real scenario, an endpoint for lab stats might exist. Right now we calculate from orders.
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/lab/orders', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                const orders = res.data;
                const pending = orders.filter(o => o.status === 'Pending').length;
                const completedTodayCount = orders.filter(o => {
                    const ok = o.status === 'Completed' || o.status === 'Approved';
                    const isToday = new Date(o.order_date).toDateString() === new Date().toDateString();
                    return ok && isToday;
                }).length;

                setStats({
                    totalTests: orders.length,
                    pendingOrders: pending,
                    completedToday: completedTodayCount
                });
            } catch (err) {
                console.error("Error fetching dashboard stats", err);
            }
        };
        fetchStats();
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>Lab Overview Dashboard</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                <StatCard 
                    title="Total Lab Orders" 
                    value={stats.totalTests} 
                    icon={<Activity size={30} />} 
                    color="#3b82f6" 
                />
                <StatCard 
                    title="Pending Action" 
                    value={stats.pendingOrders} 
                    icon={<Clock size={30} />} 
                    color="#f59e0b" 
                />
                <StatCard 
                    title="Completed Today" 
                    value={stats.completedToday} 
                    icon={<CheckCircle size={30} />} 
                    color="#10b981" 
                />
            </div>

            <div className="glass-card" style={{ marginTop: '30px', padding: '20px', borderRadius: '15px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileText size={24} color="#6366f1"/> Operational Reminders
                </h3>
                <ul style={{ marginTop: '15px', lineHeight: '1.8', color: '#4b5563' }}>
                    <li>Ensure all reference margins are updated relative to patient age.</li>
                    <li>MRI Scans require physical printouts combined with digital PDF uploads.</li>
                    <li>Pending reports escalate to Doctor Verification once complete.</li>
                </ul>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, color }) => (
    <div className="glass-card stat-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '20px', borderLeft: `4px solid ${color}` }}>
        <div style={{ padding: '15px', borderRadius: '12px', backgroundColor: `${color}20`, color: color }}>
            {icon}
        </div>
        <div>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem', fontWeight: 600 }}>{title}</p>
            <h3 style={{ margin: '5px 0 0 0', fontSize: '1.8rem', color: '#1f2937' }}>{value}</h3>
        </div>
    </div>
);

export default LabDashboard;
