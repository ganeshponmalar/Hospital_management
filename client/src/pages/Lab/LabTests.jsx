import React, { useEffect, useState } from 'react';
import axios from 'axios';

const LabTests = () => {
    const [tests, setTests] = useState([]);
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        test_name: '',
        category: '',
        reference_range: '',
        unit: '',
        price: ''
    });

    // FETCH TESTS
    const fetchTests = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/lab/tests');
            setTests(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchTests();
    }, []);

    // HANDLE ADD TEST
    const handleAddTest = async () => {
        try {
            await axios.post('http://localhost:5000/api/lab/tests', formData);

            alert("Test added successfully");

            setFormData({
                test_name: '',
                category: '',
                reference_range: '',
                unit: '',
                price: ''
            });

            setShowForm(false);
            fetchTests(); // refresh list

        } catch (err) {
            console.error(err);
            alert("Error adding test");
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Lab Tests</h2>

            {/* ADD BUTTON */}
            <button onClick={() => setShowForm(!showForm)}>
                {showForm ? "Close" : "Add Test"}
            </button>

            {/* FORM */}
            {showForm && (
                <div style={{ marginTop: "20px", border: "1px solid #ccc", padding: "15px" }}>
                    <input
                        placeholder="Test Name"
                        value={formData.test_name}
                        onChange={(e) => setFormData({ ...formData, test_name: e.target.value })}
                    /><br /><br />

                    <input
                        placeholder="Category (Blood, Scan)"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    /><br /><br />

                    <input
                        placeholder="Reference Range (e.g 13-17)"
                        value={formData.reference_range}
                        onChange={(e) => setFormData({ ...formData, reference_range: e.target.value })}
                    /><br /><br />

                    <input
                        placeholder="Unit (mg/dL)"
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    /><br /><br />

                    <input
                        type="number"
                        placeholder="Price"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    /><br /><br />

                    <button onClick={handleAddTest}>Save Test</button>
                </div>
            )}

            {/* TABLE */}
            <table border="1" cellPadding="10" style={{ marginTop: "20px", width: "100%" }}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Test Name</th>
                        <th>Category</th>
                        <th>Range</th>
                        <th>Unit</th>
                        <th>Price</th>
                    </tr>
                </thead>
                <tbody>
                    {tests.length === 0 ? (
                        <tr>
                            <td colSpan="6">No tests found</td>
                        </tr>
                    ) : (
                        tests.map(test => (
                            <tr key={test.id}>
                                <td>{test.id}</td>
                                <td>{test.test_name}</td>
                                <td>{test.category}</td>
                                <td>{test.reference_range}</td>
                                <td>{test.unit}</td>
                                <td>{test.price}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default LabTests;
