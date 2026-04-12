import React, { useState } from 'react';
import LabDashboard from './LabDashboard';
import CreateLabOrder from './CreateLabOrder';
import LabOrders from './LabOrders';
import LabResults from './LabResults';
import ViewReport from './ViewReport';
import ManageTests from './ManageTests';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Microscope, Activity, FileText, PlusCircle, Database } from 'lucide-react';

const LabPage = () => {
    const [activeTab, setActiveTab] = useState('Overview');
    const [viewingOrderId, setViewingOrderId] = useState(null);

    const renderContent = () => {
        if (activeTab === 'CreateLabOrder') return <CreateLabOrder />;
        if (activeTab === 'LabOrders') return <LabOrders setActiveTab={setActiveTab} setViewingOrderId={setViewingOrderId} />;
        if (activeTab === 'LabResults') return <LabResults orderId={viewingOrderId} setActiveTab={setActiveTab} setViewingOrderId={setViewingOrderId} />;
        if (activeTab === 'ViewReport') return <ViewReport orderId={viewingOrderId} setActiveTab={setActiveTab} setViewingOrderId={setViewingOrderId} />;
        if (activeTab === 'ManageTests') return <ManageTests />;
        return <LabDashboard />;
    };

    return (
        <DashboardLayout>
            <div style={{ padding: '20px' }}>
                <h2 style={{ fontSize: '1.8rem', color: 'var(--text)', marginBottom: '20px' }}>Lab Report Module</h2>

                <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', flexWrap: 'wrap' }}>
                    <button
                        className={`btn ${activeTab === 'Overview' ? 'btn-primary' : ''}`}
                        style={activeTab !== 'Overview' ? { background: '#fff', color: '#374151', border: '1px solid #d1d5db' } : {}}
                        onClick={() => { setActiveTab('Overview'); setViewingOrderId(null); }}
                    >
                        <Activity size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Dashboard
                    </button>
                    <button
                        className={`btn ${activeTab === 'CreateLabOrder' ? 'btn-primary' : ''}`}
                        style={activeTab !== 'CreateLabOrder' ? { background: '#fff', color: '#374151', border: '1px solid #d1d5db' } : {}}
                        onClick={() => { setActiveTab('CreateLabOrder'); setViewingOrderId(null); }}
                    >
                        <PlusCircle size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Prescribe Tests
                    </button>
                    <button
                        className={`btn ${activeTab === 'LabOrders' ? 'btn-primary' : ''}`}
                        style={activeTab !== 'LabOrders' ? { background: '#fff', color: '#374151', border: '1px solid #d1d5db' } : {}}
                        onClick={() => { setActiveTab('LabOrders'); setViewingOrderId(null); }}
                    >
                        <Microscope size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Lab Queue
                    </button>
                    <button
                        className={`btn ${activeTab === 'ManageTests' ? 'btn-primary' : ''}`}
                        style={activeTab !== 'ManageTests' ? { background: '#fff', color: '#374151', border: '1px solid #d1d5db' } : {}}
                        onClick={() => { setActiveTab('ManageTests'); setViewingOrderId(null); }}
                    >
                        <Database size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Manage Tests
                    </button>
                </div >

                <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                    {renderContent()}
                </div>
            </div >
        </DashboardLayout >
    );
};

export default LabPage;
