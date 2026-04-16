import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Microscope, ArrowLeft, Save } from 'lucide-react';

const LabResults = ({ orderId, setActiveTab, setViewingOrderId }) => {
    const [order, setOrder] = useState(null);
    const [resultsForm, setResultsForm] = useState({});

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await api.get("/lab/orders/" + orderId);
                setOrder(res.data);
            } catch (err) {
                console.error("Failed to load order details", err);
            }
        };
        if (orderId) fetchOrder();
    }, [orderId]);

    const handleResultChange = (itemId, field, value) => {
        setResultsForm(prev => ({
            ...prev,
            [itemId]: {
                ...prev[itemId],
                [field]: value
            }
        }));
    };

    const submitResult = async (itemId) => {
        try {
            const data = resultsForm[itemId];
            if (!data || !data.result_value) return alert('Result Value is required');

            const res = await api.post("/lab/order-items/" + itemId + "/results", data);
            alert("Result logged successfully! Auto-flag logic concluded it was: " + res.data.flag);

            // Reload order to reflect the newly inserted metrics
            const reloadRes = await api.get("/lab/orders/" + orderId);
            setOrder(reloadRes.data);
            setResultsForm(prev => {
                const copy = { ...prev };
                delete copy[itemId];
                return copy;
            });

        } catch (err) {
            console.error(err);
            alert('Failed to submit result');
        }
    };

    if (!order) return <div style={{ padding: '20px' }}>Loading...</div>;

    const allCompleted = order.tests.every(t => t.result_id);

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <button className="btn" style={{ marginBottom: '20px', background: 'transparent', color: '#4b5563', padding: 0 }}
                onClick={() => { setViewingOrderId(null); setActiveTab('LabOrders'); }}>
                <ArrowLeft size={18} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                Back to Orders
            </button>

            <div className="glass-card" style={{ padding: '20px', marginBottom: '20px', background: '#eff6ff', borderLeft: '4px solid #3b82f6' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1d4ed8' }}>
                    <Microscope size={24} /> Lab Order #{order.id} - Input Metrics
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '15px' }}>
                    <p><strong>Patient:</strong> {order.patient_name}</p>
                    <p><strong>Status:</strong> {order.status}</p>
                    <p><strong>Prescribed Date:</strong> {new Date(order.order_date).toLocaleString()}</p>
                    <p><strong>Doctor:</strong> {order.doctor_name || 'N/A'}</p>
                </div>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
                <h4 style={{ marginBottom: '15px' }}>Test Metrics</h4>
                <table className="table" style={{ width: '100%' }}>
                    <thead>
                        <tr>
                            <th>Test Name</th>
                            <th>Reference Margin</th>
                            <th>Metrics Input</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.tests.map(t => {
                            const isSubmitted = !!t.result_id;
                            const currentForm = resultsForm[t.order_item_id] || {};

                            return (
                                <tr key={t.order_item_id} style={{ background: isSubmitted ? '#f0fdf4' : 'transparent' }}>
                                    <td>
                                        <strong>{t.test_name}</strong><br />
                                        <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{t.category}</span>
                                    </td>
                                    <td>
                                        {t.default_range || 'N/A'} <br />
                                        <span style={{ fontSize: '0.8rem' }}>{t.default_unit}</span>
                                    </td>
                                    <td>
                                        {isSubmitted ? (
                                            <div>
                                                <strong>{t.result_value}</strong> {t.unit} <br />
                                                <span style={{
                                                    fontWeight: 'bold', fontSize: '0.8rem',
                                                    color: t.flag === 'Normal' ? '#10b981' : '#ef4444'
                                                }}>[{t.flag}]</span>
                                                {t.remarks && <p style={{ fontSize: '0.8rem', margin: '5px 0 0 0' }}>Notes: {t.remarks}</p>}
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <input
                                                    type="text"
                                                    placeholder="Enter metric (e.g. 14.5)"
                                                    value={currentForm.result_value || ''}
                                                    onChange={(e) => handleResultChange(t.order_item_id, 'result_value', e.target.value)}
                                                    style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Technician remarks (optional)"
                                                    value={currentForm.remarks || ''}
                                                    onChange={(e) => handleResultChange(t.order_item_id, 'remarks', e.target.value)}
                                                    style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.9rem' }}
                                                />
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ verticalAlign: 'middle' }}>
                                        {!isSubmitted ? (
                                            <button className="btn btn-primary" onClick={() => submitResult(t.order_item_id)}>
                                                <Save size={16} /> Log Result
                                            </button>
                                        ) : (
                                            <span style={{ color: '#10b981', fontWeight: 'bold' }}>Logged</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {allCompleted && order.status === 'Completed' && (
                <div style={{ padding: '20px', marginTop: '20px', background: '#fffbeb', border: '1px dashed #f59e0b', borderRadius: '8px', textAlign: 'center' }}>
                    <p style={{ color: '#b45309', fontWeight: 600 }}>All metrics logged. This report is awaiting Doctor Verification.</p>
                </div>
            )}
        </div>
    );
};

export default LabResults;
