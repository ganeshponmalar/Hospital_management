import React from 'react';
import { Bell, LogOut, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { logout } = useAuth();

    return (
        <header className="navbar" style={{
            height: '70px',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(8px)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem',
            position: 'sticky',
            top: 0,
            zIndex: 10
        }}>
            <div className="search-bar" style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'var(--background)',
                padding: '8px 16px',
                borderRadius: '10px',
                width: '400px',
                gap: '10px'
            }}>
                <Search size={18} color="var(--text-muted)" />
                <input
                    type="text"
                    placeholder="Search records, patients..."
                    style={{
                        border: 'none',
                        background: 'none',
                        padding: 0,
                        fontSize: '0.9rem'
                    }}
                />
            </div>

            <div className="actions" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <button style={{ background: 'none', position: 'relative' }}>
                    <Bell size={20} color="var(--text-muted)" />
                    <span style={{
                        position: 'absolute',
                        top: '-2px',
                        right: '-2px',
                        width: '8px',
                        height: '8px',
                        backgroundColor: 'var(--accent)',
                        borderRadius: '50%',
                        border: '2px solid white'
                    }}></span>
                </button>
                <button
                    onClick={logout}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: 'var(--text-muted)',
                        background: 'none',
                        fontSize: '0.9rem',
                        padding: '8px 12px',
                        borderRadius: '8px'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fae8e8'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <LogOut size={18} />
                    Logout
                </button>
            </div>
        </header>
    );
};

export default Navbar;
