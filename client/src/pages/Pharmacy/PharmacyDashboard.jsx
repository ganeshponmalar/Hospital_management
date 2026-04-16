import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { AlertTriangle, TrendingDown, TrendingUp, Package, AlertCircle } from 'lucide-react';

const StatCard = ({ title, value, icon, color }) => (
    <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '20px', borderLeft: `4px solid ${color}` }}>
        <div style={{ width: '50px', height: '50px', borderRadius: '12px', backgroundColor: `${color}20`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {icon}
        </div>
        <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '5px' }}>{title}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{value}</div>
        </div>
    </div>
);

const PharmacyDashboard = () => {
    const [stats, setStats] = useState({ totalMedicines: 0, lowStockMedicines: 0, expiredMedicines: 0, todaySales: 0, todayPurchases: 0 });
    const [alerts, setAlerts] = useState({ expiredMedicines: [], expiringSoon: [], lowStockMedicines: [] });

    useEffect(() => {
        const fetchDashboardInfo = async () => {
            try {
                const statsRes = await api.get('/pharmacy/dashboard');
                setStats(statsRes.data);

                const alertsRes = await api.get('/pharmacy/alerts');
                setAlerts(alertsRes.data);
            } catch (err) {
                console.error("Dashboard fetch error", err);
            }
        };
        fetchDashboardInfo();
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                <StatCard title="Total Medicines" value={stats.totalMedicines} icon={<Package size={24} />} color="#3b82f6" />
                <StatCard title="Low Stock" value={stats.lowStockMedicines} icon={<AlertTriangle size={24} />} color="#eab308" />
                <StatCard title="Expired" value={stats.expiredMedicines} icon={<AlertCircle size={24} />} color="#ef4444" />
                <StatCard title="Today's Sales" value={`$${stats.todaySales}`} icon={<TrendingUp size={24} />} color="#22c55e" />
                <StatCard title="Today's Purchases" value={`$${stats.todayPurchases}`} icon={<TrendingDown size={24} />} color="#8b5cf6" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="glass-card" style={{ padding: '20px' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ef4444', marginBottom: '15px' }}>
                        <AlertCircle size={20} /> Expiry Alerts
                    </h3>

                    {alerts.expiredMedicines.length > 0 && <h4 style={{ color: '#ef4444' }}>Expired</h4>}
                    {alerts.expiredMedicines.map(m => (
                        <div key={m.id} style={{ padding: '10px', background: '#ef444420', borderLeft: '3px solid #ef4444', marginBottom: '5px', borderRadius: '4px' }}>
                            {m.medicine_name} (Batch: {m.batch_no}) - Expired on {new Date(m.expiry_date).toLocaleDateString()}
                        </div>
                    ))}

                    {alerts.expiringSoon.length > 0 && <h4 style={{ color: '#eab308', marginTop: '15px' }}>Expiring in &lt; 30 Days</h4>}
                    {alerts.expiringSoon.map(m => (
                        <div key={m.id} style={{ padding: '10px', background: '#eab30820', borderLeft: '3px solid #eab308', marginBottom: '5px', borderRadius: '4px' }}>
                            {m.medicine_name} (Batch: {m.batch_no}) - Expiry: {new Date(m.expiry_date).toLocaleDateString()}
                        </div>
                    ))}

                    {alerts.expiredMedicines.length === 0 && alerts.expiringSoon.length === 0 && (
                        <div style={{ color: 'var(--text-muted)' }}>No expiry alerts. Everything looks good!</div>
                    )}
                </div>

                <div className="glass-card" style={{ padding: '20px' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#eab308', marginBottom: '15px' }}>
                        <AlertTriangle size={20} /> Low Stock Alerts
                    </h3>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Medicine</th>
                                <th>Reorder Lvl</th>
                                <th>Cur Qty</th>
                            </tr>
                        </thead>
                        <tbody>
                            {alerts.lowStockMedicines.length > 0 ? alerts.lowStockMedicines.map(m => (
                                <tr key={m.id}>
                                    <td>{m.medicine_name}</td>
                                    <td>{m.reorder_level}</td>
                                    <td style={{ color: '#eab308', fontWeight: 'bold' }}>{m.total_quantity}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No low stock items.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default PharmacyDashboard;
