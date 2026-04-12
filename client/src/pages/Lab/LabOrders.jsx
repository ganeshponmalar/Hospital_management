import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileSearch } from 'lucide-react';

const LabOrders = ({ setActiveTab, setViewingOrderId }) => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/lab/orders', {
                    headers: { Authorization: "Bearer " + token }
                });
                setOrders(res.data || []);
            } catch (err) {
                console.error("Failed to load lab orders", err);
            }
        };
        fetchOrders();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return '#f59e0b';
            case 'In Progress': return '#3b82f6';
            case 'Completed': return '#10b981';
            case 'Approved': return '#8b5cf6';
            default: return '#6b7280';
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>Lab Orders / Queue</h2>

            <div className="glass-card" style={{ padding: '20px', overflowX: 'auto' }}>
                <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Patient Name</th>
                            <th>Prescribed By</th>
                            <th>Technician</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length === 0 ? (
                            <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>No Lab Orders found</td></tr>
                        ) : orders.map(o => (
                            <tr key={o.id}>
                                <td>#{o.id}</td>
                                <td>{new Date(o.order_date).toLocaleString()}</td>
                                <td>{o.patient_name}</td>
                                <td>{o.doctor_name || 'N/A'}</td>
                                <td>{o.technician || 'Pending'}</td>
                                <td>
                                    <span style={{
                                        backgroundColor: `${getStatusColor(o.status)}20`,
                                        color: getStatusColor(o.status),
                                        padding: '4px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600
                                    }}>
                                        {o.status}
                                    </span>
                                </td>
                                <td>
                                    {(o.status === 'Pending' || o.status === 'In Progress') && (
                                        <button className="btn btn-primary" style={{ padding: '5px 10px', fontSize: '0.85rem' }} 
                                                onClick={() => { setViewingOrderId(o.id); setActiveTab('LabResults'); }}>
                                            Input Metrics
                                        </button>
                                    )}
                                    {(o.status === 'Completed' || o.status === 'Approved') && (
                                        <button className="btn" style={{ padding: '5px 10px', fontSize: '0.85rem', background: '#e0e7ff', color: '#4f46e5' }} 
                                                onClick={() => { setViewingOrderId(o.id); setActiveTab('ViewReport'); }}>
                                            <FileSearch size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }}/> Read Report
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
        </div >
    );
};

export default LabOrders;
