import React from 'react';

interface SidebarProps {
  isOpen: boolean;
  onNewChat: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onNewChat }) => {
  return (
    <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
      
      {/* 1. New Chat Button */}
      <div style={{ padding: '0 1rem 1rem 1rem' }}>
        <button 
          onClick={onNewChat}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: '#282a2c',
            color: '#c4c7c5',
            border: 'none',
            borderRadius: '24px',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#37393b'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#282a2c'}
        >
          <i className="ph ph-plus" style={{ fontSize: '18px' }}></i>
          <span>New chat</span>
        </button>
      </div>

      {/* 2. My Workspace (History) */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '1rem' }}>
        <h3 style={{ 
          fontSize: '12px', fontWeight: 500, color: '#c4c7c5', 
          padding: '10px 24px', marginTop: '10px' 
        }}>
          My Workspace
        </h3>
        
        <div className="nav-item">
          <i className="ph ph-chat-circle"></i>
          <span>Motherboard Diagnostic...</span>
        </div>
        <div className="nav-item">
           <i className="ph ph-chat-circle"></i>
           <span>BIOS Reset Logic</span>
        </div>
        
        {/* 3. Become Pro Section */}
        <h3 style={{ 
          fontSize: '12px', fontWeight: 500, color: '#c4c7c5', 
          padding: '20px 24px 10px 24px', borderTop: '1px solid #333', marginTop: '10px' 
        }}>
          Become Pro
        </h3>

        <div className="nav-item">
          <i className="ph ph-shield-check" style={{ color: '#a8c7fa' }}></i>
          <span>Cyber Security Ops</span>
        </div>

        <div className="nav-item">
           <i className="ph ph-wrench" style={{ color: '#a8c7fa' }}></i>
           <span>Master Level Repair</span>
        </div>
      </div>

      {/* 4. Footer Settings (Optional, visual filler) */}
      <div style={{ padding: '1rem' }}>
         <div className="nav-item">
            <i className="ph ph-gear"></i>
            <span>Settings</span>
         </div>
      </div>

    </aside>
  );
};