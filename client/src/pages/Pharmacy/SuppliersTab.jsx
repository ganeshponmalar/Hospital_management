import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SuppliersTab = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [supName, setSupName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');

    const fetchSuppliers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/pharmacy/suppliers', {
                headers: { Authorization: `Bearer ${token}` }});
            setSuppliers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => { fetchSuppliers(); }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/pharmacy/suppliers', 
                { supplier_name: supName, phone, email, address },
                { headers: { Authorization: `Bearer ${token}` }}
            );
            setSupName(''); setPhone(''); setEmail(''); setAddress('');
            fetchSuppliers();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
            <div className="glass-card" style={{ padding: '20px', height: 'fit-content' }}>
                <h3 style={{ marginBottom: '15px' }}>Add Supplier</h3>
                <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div className="form-group">
                        <label>Supplier Name</label>
                        <input type="text" value={supName} onChange={(e) => setSupName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Phone</label>
                        <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Address</label>
                        <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
                    </div>
                    <button type="submit" className="btn btn-primary">Add Supplier</button>
                </form>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
                <h3 style={{ marginBottom: '15px' }}>Suppliers Directory</h3>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Supplier Name</th>
                            <th>Phone</th>
                            <th>Email</th>
                            <th>Address</th>
                        </tr>
                    </thead>
                    <tbody>
                        {suppliers.map(s => (
                            <tr key={s.id}>
                                <td>{s.supplier_name}</td>
                                <td>{s.phone}</td>
                                <td>{s.email}</td>
                                <td>{s.address}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SuppliersTab;
