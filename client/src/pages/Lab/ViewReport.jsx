import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Printer, ArrowLeft, CheckCircle } from 'lucide-react';

const ViewReport = ({ orderId, setActiveTab, setViewingOrderId }) => {
    const [order, setOrder] = useState(null);
    const user = JSON.parse(localStorage.getItem('user'));
    const isDoctor = user?.role === 'doctor' || user?.role === 'admin';

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get("http://localhost:5000/api/lab/orders/" + orderId, {
                    headers: { Authorization: "Bearer " + token }
                });
                setOrder(res.data);
            } catch (err) {
                console.error("Failed to load order results", err);
            }
        };
        if (orderId) fetchOrder();
    }, [orderId]);

    const handleVerify = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put("http://localhost:5000/api/lab/orders/" + orderId + "/verify", {}, {
                headers: { Authorization: "Bearer " + token }
            });
            alert("Report officially verified.");
            const res = await axios.get("http://localhost:5000/api/lab/orders/" + orderId, {
                headers: { Authorization: "Bearer " + token }
            });
            setOrder(res.data);
        } catch (err) {
            console.error(err);
            alert("Verification failed");
        }
    };

    if (!order) return <div style={{ padding: '20px' }}>Loading Report...</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', fontFamily: '"Inter", sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <button className="btn" style={{ background: 'transparent', color: '#4b5563', padding: 0 }}
                    onClick={() => { setViewingOrderId(null); setActiveTab('LabOrders'); }}>
                    <ArrowLeft size={18} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> Back
                </button>
                <button className="btn" style={{ background: '#4b5563', color: '#fff' }} onClick={() => window.print()}>
                    <Printer size={18} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> Print Abstract
                </button>
            </div>

            <div className="glass-card" style={{ padding: '40px', background: '#fff' }}>

                <div style={{ textAlign: 'center', borderBottom: '2px solid #e5e7eb', paddingBottom: '20px', marginBottom: '20px' }}>
                    <h1 style={{ margin: 0, color: '#1f2937' }}>Enterprise Hospital Core</h1>
                    <h3 style={{ margin: '5px 0 0 0', color: '#6b7280' }}>Laboratory Medical Report</h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                    <div>
                        <p><strong>Patient Name:</strong> {order.patient_name}</p>
                        <p><strong>Lab Tracking ID:</strong> #{order.id}</p>
                        <p><strong>Date Collected:</strong> {new Date(order.order_date).toLocaleString()}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p><strong>Prescribed By:</strong> Dr. {order.doctor_name || 'N/A'}</p>
                        <p><strong>Status:</strong> {order.status}</p>
                    </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
                    <thead>
                        <tr style={{ background: '#f3f4f6', textAlign: 'left', borderBottom: '2px solid #d1d5db' }}>
                            <th style={{ padding: '10px' }}>Test Conducted</th>
                            <th style={{ padding: '10px' }}>Result Value</th>
                            <th style={{ padding: '10px' }}>Biological Range</th>
                            <th style={{ padding: '10px' }}>Diagnostic Flag</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.tests.map(t => (
                            <tr key={t.order_item_id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                <td style={{ padding: '10px' }}>
                                    <strong>{t.test_name}</strong>
                                </td>
                                <td style={{ padding: '10px', fontSize: '1.1rem', fontWeight: 600 }}>
                                    {t.result_value || '-'} {t.unit}
                                </td>
                                <td style={{ padding: '10px', color: '#4b5563' }}>
                                    {t.reference_range || t.default_range} {t.unit}
                                </td>
                                <td style={{ padding: '10px' }}>
                                    {t.flag === 'Normal' && <span style={{ color: '#10b981', fontWeight: 'bold' }}>Normal</span>}
                                    {t.flag === 'High' && <span style={{ color: '#ef4444', fontWeight: 'bold' }}>High</span>}
                                    {t.flag === 'Low' && <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>Low</span>}
                                    {!t.flag && <span style={{ color: '#9ca3af' }}>Pending</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '40px', padding: '20px', background: '#f8fafc', borderRadius: '8px' }}>
                    <div>
                        <p style={{ color: '#64748b' }}>Assessed By Laboratory Technician</p>
                        <h4 style={{ margin: '5px 0 0 0' }}>{order.technician_name || 'Pending Submission'}</h4>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ color: '#64748b' }}>Medically Verified By</p>
                        {order.status === 'Approved' ? (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                <h4 style={{ margin: '5px 0 0 0', color: '#1d4ed8' }}>Dr. {order.verified_by_name}</h4>
                                <CheckCircle size={20} color="#10b981" />
                            </div>
                        ) : (
                            isDoctor && order.status === 'Completed' ? (
                                <button className="btn btn-primary" onClick={handleVerify} style={{ marginTop: '10px' }}>
                                    Verify & Approve
                                </button>
                            ) : (
                                <p style={{ color: '#f59e0b', fontWeight: 'bold' }}>Awaiting Approval</p>
                            )
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ViewReport;
