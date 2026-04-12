import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import PharmacyDashboard from './Pharmacy/PharmacyDashboard';
import MedicinesTab from './Pharmacy/MedicinesTab';
import SuppliersTab from './Pharmacy/SuppliersTab';
import PurchasesTab from './Pharmacy/PurchasesTab';
import SalesTab from './Pharmacy/SalesTab';
import LedgerTab from './Pharmacy/LedgerTab';
import { LayoutDashboard, Pill, Truck, ShoppingCart, Receipt, ScrollText } from 'lucide-react';

const PharmacyPage = () => {
    const [activeTab, setActiveTab] = useState('dashboard');

    const tabs = [
        { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard size={18} /> },
        { id: 'medicines', label: 'Medicines & Batches', icon: <Pill size={18} /> },
        { id: 'suppliers', label: 'Suppliers', icon: <Truck size={18} /> },
        { id: 'purchases', label: 'Purchases (In)', icon: <ShoppingCart size={18} /> },
        { id: 'sales', label: 'Sales (Out)', icon: <Receipt size={18} /> },
        { id: 'ledger', label: 'Stock Ledger', icon: <ScrollText size={18} /> }
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <PharmacyDashboard />;
            case 'medicines': return <MedicinesTab />;
            case 'suppliers': return <SuppliersTab />;
            case 'purchases': return <PurchasesTab />;
            case 'sales': return <SalesTab />;
            case 'ledger': return <LedgerTab />;
            default: return <PharmacyDashboard />;
        }
    };

    return (
        <DashboardLayout>
            <div className="pharmacy-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.8rem', color: 'var(--text)' }}>Pharmacy Management</h2>
                </header>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 20px',
                                backgroundColor: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                                color: activeTab === tab.id ? 'white' : 'var(--text-muted)',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '500',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div style={{ minHeight: '60vh' }}>
                    {renderContent()}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default PharmacyPage;
