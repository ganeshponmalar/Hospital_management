import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Database, PlusCircle } from 'lucide-react';

const ManageTests = () => {
    const [tests, setTests] = useState([]);

    const [testName, setTestName] = useState('');
    const [category, setCategory] = useState('');
    const [referenceRange, setReferenceRange] = useState('');
    const [unit, setUnit] = useState('');
    const [price, setPrice] = useState('');

    useEffect(() => {
        fetchTests();
    }, []);

    const fetchTests = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/lab/tests', {
                headers: { Authorization: "Bearer " + token }
            });
            setTests(res.data || []);
        } catch (err) {
            console.error("Failed to fetch lab tests", err);
        }
    };

    const handleAddTest = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/lab/tests', {
                test_name: testName,
                category: category,
                reference_range: referenceRange,
                unit: unit,
                price: parseFloat(price) || 0
            }, {
                headers: { Authorization: "Bearer " + token }
            });

            alert('Lab test added successfully!');
            setTestName('');
            setCategory('');
            setReferenceRange('');
            setUnit('');
            setPrice('');
            fetchTests(); // Refresh the list
        } catch (err) {
            console.error(err);
            alert('Failed to add lab test. Ensure you are an Admin.');
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '20px', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Database size={24} color="#3b82f6" /> Manage Master Lab Tests
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
                {/* Add New Test Form */}
                <form onSubmit={handleAddTest} className="glass-card" style={{ padding: '20px', height: 'fit-content' }}>
                    <h3 style={{ marginBottom: '15px' }}>Add New Test</h3>

                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label>Test Name</label>
                        <input type="text" value={testName} onChange={(e) => setTestName(e.target.value)} required placeholder="e.g. Hemoglobin" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                    </div>

                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label>Category</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}>
                            <option value="">Select Category</option>
                            <option value="Blood">Blood</option>
                            <option value="Urine">Urine</option>
                            <option value="Scan">Scan</option>
                            <option value="X-Ray">X-Ray</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label>Reference Range</label>
                        <input type="text" value={referenceRange} onChange={(e) => setReferenceRange(e.target.value)} placeholder="e.g. 13-17" required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                    </div>

                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label>Unit</label>
                        <input type="text" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="e.g. g/dL" required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                    </div>

                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label>Price ($)</label>
                        <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                        <PlusCircle size={18} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> Add Test
                    </button>
                </form>

                {/* List of Existing Tests */}
                <div className="glass-card" style={{ padding: '20px', overflowX: 'auto' }}>
                    <h3 style={{ marginBottom: '15px' }}>Available Configurations</h3>
                    <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
                                <th style={{ padding: '10px' }}>Test Name</th>
                                <th style={{ padding: '10px' }}>Category</th>
                                <th style={{ padding: '10px' }}>Range</th>
                                <th style={{ padding: '10px' }}>Unit</th>
                                <th style={{ padding: '10px' }}>Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tests.length === 0 ? (
                                <tr><td colSpan="5" style={{ padding: '10px', textAlign: 'center' }}>No tests registered yet</td></tr>
                            ) : tests.map(t => (
                                <tr key={t.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                    <td style={{ padding: '10px', fontWeight: '500' }}>{t.test_name}</td>
                                    <td style={{ padding: '10px' }}>{t.category}</td>
                                    <td style={{ padding: '10px' }}>{t.reference_range}</td>
                                    <td style={{ padding: '10px', color: '#6b7280' }}>{t.unit}</td>
                                    <td style={{ padding: '10px' }}>${parseFloat(t.price).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageTests;
