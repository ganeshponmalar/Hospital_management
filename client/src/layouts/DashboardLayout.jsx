import React from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const DashboardLayout = ({ children }) => {
    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <main style={{
                flex: 1,
                marginLeft: '260px',
                minHeight: '100vh',
                backgroundColor: 'var(--background)'
            }}>
                <Navbar />
                <div style={{ padding: '2rem' }}>
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
