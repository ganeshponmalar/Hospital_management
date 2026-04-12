import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Search, Trash2 } from 'lucide-react';

const CreateLabOrder = () => {
    const [patients, setPatients] = useState([]);
    const [tests, setTests] = useState([]);

    // Form State
    const [patientId, setPatientId] = useState('');
    const [selectedTests, setSelectedTests] = useState([]); // List of test items
    const [selectedTestId, setSelectedTestId] = useState(''); // Current test dropdown value

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const token = localStorage.getItem('token');
                const [patRes, testRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/patients', { headers: { Authorization: "Bearer " + token } }),
                    axios.get('http://localhost:5000/api/lab/tests', { headers: { Authorization: "Bearer " + token } })
                ]);
                console.log("Patients:", patRes.data);
                console.log("Tests API Response:", testRes.data);

                setPatients(Array.isArray(patRes.data) ? patRes.data : []);
                setTests(Array.isArray(testRes.data) ? testRes.data : []);
            } catch (err) {
                console.error(err);
            }
        };
        fetchInitialData();
    }, []);

    const addTestToOrder = (testId) => {
        if (!testId) return;
        const test = tests.find(t => t.id == testId);
        if (test && !selectedTests.find(t => t.id === test.id)) {
            setSelectedTests([...selectedTests, test]);
        }
    };

    const removeTest = (index) => {
        const newTests = [...selectedTests];
        newTests.splice(index, 1);
        setSelectedTests(newTests);
    };

    const handleCreateOrder = async (e) => {
        e.preventDefault();

        let pendingTests = [...selectedTests];

        // If they selected a test in the dropdown but forgot to click "Add To Cart"
        if (selectedTestId) {
            const tempTest = tests.find(t => t.id == selectedTestId);
            if (tempTest && !pendingTests.find(t => t.id === tempTest.id)) {
                pendingTests.push(tempTest);
            }
        }

        if (!patientId) return alert('Select a patient');
        if (pendingTests.length === 0) return alert('Add at least one test to order using the dropdown & Add To Cart button');

        try {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user'));
            const isDoctor = user.role === 'doctor';

            const payload = {
                patient_id: patientId,
                doctor_id: isDoctor ? user.id : null,
                test_ids: pendingTests.map(t => t.id)
            };

            await axios.post('http://localhost:5000/api/lab/orders', payload, {
                headers: { Authorization: "Bearer " + token }
            });
            alert('Lab Order generated successfully!');
            setPatientId('');
            setSelectedTests([]);
        } catch (err) {
            console.error(err);
            alert('Failed to generate order');
        }
    };

    const totalAmount = selectedTests.reduce((sum, t) => sum + Number(t.price), 0);

    return (
        <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>Prescribe Lab Order</h2>
            <form onSubmit={handleCreateOrder} className="glass-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Select Patient</label>
                    <select value={patientId} onChange={(e) => setPatientId(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px' }}>
                        <option value="">-- Choose Patient --</option>
                        {patients.map(p => (
                            <option key={p.id} value={p.id}>{p.name} (Phone: {p.phone})</option>
                        ))}
                    </select>
                </div>

                <div className="glass-card" style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.4)' }}>
                    <h3 style={{ marginBottom: '15px' }}>Requires Tests</h3>

                    <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                        <select
                            value={selectedTestId}
                            onChange={(e) => {
                                if (e.target.value === 'add_new') {
                                    window.open('/lab-tests', '_blank');
                                    setSelectedTestId('');
                                } else {
                                    setSelectedTestId(e.target.value);
                                }
                            }}
                            style={{ flex: 1, padding: '10px', borderRadius: '6px' }}
                        >
                            <option value="">-- Select Test from Catalog --</option>
                            {tests.length === 0 ? (
                                <option disabled>No tests available</option>
                            ) : (
                                tests.map(t => (
                                    <option key={t.id} value={t.id}>
                                        {t.test_name} - ₹{t.price}
                                    </option>
                                ))
                            )}
                            <option value="add_new" style={{ fontWeight: 'bold', color: '#1d4ed8' }}>+ Add New Test Option...</option>
                        </select>
                        <button type="button" className="btn btn-primary" onClick={() => {
                            addTestToOrder(selectedTestId);
                            setSelectedTestId('');
                        }}>
                            <PlusCircle size={20} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> Add To Cart
                        </button>
                        <button type="button" className="btn" style={{ background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe' }} onClick={() => {
                            setSelectedTests([...tests]);
                        }}>
                            Select All Tests
                        </button>
                    </div>

                    <table className="table" style={{ width: '100%', background: '#fff', borderRadius: '8px' }}>
                        <thead>
                            <tr>
                                <th>Test Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedTests.length === 0 ? (
                                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No tests selected yet</td></tr>
                            ) : selectedTests.map((t, idx) => (
                                <tr key={idx}>
                                    <td>{t.test_name}</td>
                                    <td>{t.category}</td>
                                    <td>${Number(t.price).toFixed(2)}</td>
                                    <td>
                                        <Trash2 color="#ef4444" style={{ cursor: 'pointer' }} onClick={() => removeTest(idx)} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        {selectedTests.length > 0 && (
                            <tfoot>
                                <tr>
                                    <td colSpan="2" style={{ textAlign: 'right', fontWeight: 'bold' }}>Total Invoice:</td>
                                    <td colSpan="2" style={{ fontWeight: 'bold', color: '#3b82f6' }}>${totalAmount.toFixed(2)}</td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>

                <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', padding: '12px 30px', fontSize: '1.1rem' }}>
                    Generate Lab Invoice
                </button>
            </form>
        </div>
    );
};

export default CreateLabOrder;
