import React, { useState } from 'react';
import { 
  FolderLock, 
  KeyRound, 
  Users, 
  ShieldCheck, 
  CreditCard, 
  LogOut, 
  Menu, 
  X, 
  ShieldAlert 
} from 'lucide-react';
import { useClerk, useUser } from '@clerk/clerk-react';
import '../Sidebar.css';

export default function Sidebar({ activeTab, setActiveTab }) {
  const [isOpen, setIsOpen] = useState(false);
  const { signOut } = useClerk();
  const { user } = useUser();

  const menuItems = [
    { id: 'dashboard', label: 'Vault Dashboard', icon: FolderLock },
    { id: 'credentials', label: 'Credentials Locker', icon: KeyRound },
    { id: 'staff', label: 'Assign & Manage Staff', icon: Users },
    { id: 'audit', label: 'Security Audit', icon: ShieldCheck },
    { id: 'plans', label: 'Subscription Plans', icon: CreditCard },
  ];

  return (
    <>
      {/* 1. Mobile Top Navigation Bar with Hamburger Icon */}
      <header className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={20} color="#38bdf8" />
          <span style={{ fontWeight: 'bold', color: '#fff', fontSize: '15px' }}>Digital Vault</span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="mobile-menu-btn"
          type="button"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* 2. Mobile Backdrop (Touch panna close aagum) */}
      {isOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={() => setIsOpen(false)} 
        />
      )}

      {/* 3. Sliding Drawer */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
          
          <div>
            {/* Drawer Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid #1e293b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '6px', background: 'rgba(56,189,248,0.1)', borderRadius: '8px', border: '1px solid rgba(56,189,248,0.2)' }}>
                  <ShieldAlert size={22} color="#38bdf8" />
                </div>
                <div>
                  <h2 style={{ color: '#fff', fontSize: '15px', fontWeight: 'bold', margin: 0 }}>Digital Vault</h2>
                  <span style={{ fontSize: '10px', color: '#f59e0b', background: 'rgba(245,158,11,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                    ROOT / ENTERPRISE
                  </span>
                </div>
              </div>

              <button 
                onClick={() => setIsOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex' }}
                type="button"
              >
                <X size={20} />
              </button>
            </div>

            {/* Profile info */}
            <div style={{ margin: '14px 0', padding: '10px', background: '#070b14', borderRadius: '8px', border: '1px solid #1e293b' }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.primaryEmailAddress?.emailAddress || 'administrator@vault.com'}
              </p>
              <span style={{ fontSize: '10px', color: '#f59e0b' }}>👑 System Administrator</span>
            </div>

            {/* Menu Links */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (setActiveTab) setActiveTab(item.id);
                      setIsOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: isActive ? '1px solid rgba(56,189,248,0.3)' : '1px solid transparent',
                      background: isActive ? 'rgba(56,189,248,0.1)' : 'transparent',
                      color: isActive ? '#38bdf8' : '#94a3b8',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: isActive ? '600' : 'normal',
                      textAlign: 'left',
                      width: '100%'
                    }}
                    type="button"
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Logout Section */}
          <div style={{ paddingTop: '16px', borderTop: '1px solid #1e293b' }}>
            <button
              onClick={() => (signOut ? signOut() : null)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                fontSize: '13px',
                cursor: 'pointer'
              }}
              type="button"
            >
              <LogOut size={16} />
              <span>Sign Out / Lock Vault</span>
            </button>
          </div>

        </div>
      </aside>
    </>
  );
}