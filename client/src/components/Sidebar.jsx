import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    UserRound,
    Calendar,
    CreditCard,
    Pill,
    FlaskConical,
    FileText,
    Settings,
    BedDouble,
    ClipboardList
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { user } = useAuth();

    const links = [
        { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} />, roles: ['admin', 'doctor', 'receptionist', 'patient'] },
        { name: 'Patients', path: '/patients', icon: <Users size={20} />, roles: ['admin', 'doctor', 'receptionist'] },
        { name: 'Doctors', path: '/doctors', icon: <UserRound size={20} />, roles: ['admin', 'doctor', 'receptionist', 'patient'] },
        { name: 'Appointments', path: '/appointments', icon: <Calendar size={20} />, roles: ['admin', 'doctor', 'receptionist', 'patient'] },
        { name: 'Billing', path: '/billing', icon: <CreditCard size={20} />, roles: ['admin', 'doctor', 'receptionist', 'patient'] },
        { name: 'Pharmacy', path: '/pharmacy', icon: <Pill size={20} />, roles: ['admin', 'doctor', 'receptionist'] },
        { name: 'Lab Reports', path: '/lab', icon: <FlaskConical size={20} />, roles: ['admin', 'doctor', 'receptionist', 'patient'] },
        { name: 'Admissions', path: '/admissions', icon: <ClipboardList size={20} />, roles: ['admin', 'doctor', 'receptionist', 'nurse'] },
        { name: 'Bed Management', path: '/beds', icon: <BedDouble size={20} />, roles: ['admin', 'doctor', 'receptionist', 'nurse'] },
    ];

    const filteredLinks = links.filter(link => link.roles.includes(user?.role));

    return (
        <aside className="sidebar glass-card" style={{
            width: '260px',
            height: '100vh',
            padding: '2rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            left: 0,
            top: 0,
            borderRadius: 0,
            borderRight: '1px solid var(--border)'
        }}>
            <div className="logo" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '2.5rem',
                color: 'var(--primary)',
                fontSize: '1.25rem',
                fontWeight: 'bold'
            }}>
                <div style={{ backgroundColor: 'var(--primary)', padding: '6px', borderRadius: '8px', color: 'white' }}>
                    <FlaskConical size={24} />
                </div>
                <span>CarePulse</span>
            </div>

            <nav style={{ flex: 1 }}>
                <ul style={{ listStyle: 'none' }}>
                    {filteredLinks.map((link) => (
                        <li key={link.name} style={{ marginBottom: '8px' }}>
                            <NavLink
                                to={link.path}
                                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                                style={({ isActive }) => ({
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '12px 14px',
                                    textDecoration: 'none',
                                    color: isActive ? 'white' : 'var(--text-muted)',
                                    backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                                    borderRadius: '10px',
                                    transition: 'all 0.2s ease'
                                })}
                            >
                                {link.icon}
                                <span>{link.name}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="user-info" style={{
                marginTop: 'auto',
                paddingTop: '20px',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
            }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold'
                }}>
                    {user?.username?.[0].toUpperCase()}
                </div>
                <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{user?.username}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role}</div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
