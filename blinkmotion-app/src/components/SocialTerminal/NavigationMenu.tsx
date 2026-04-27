import React from 'react';

interface NavItem {
  key: string;
  label: string;
}

interface NavigationMenuProps {
  items: NavItem[];
  unreadCount?: number;
  onSelect?: (key: string) => void;
}

export const NavigationMenu: React.FC<NavigationMenuProps> = ({ items, unreadCount, onSelect }) => {
  return (
    <div className="nav-menu">
      <h1 className="brand-name">BLINKMOTION // SOCIAL_NET</h1>
      <div className="nav-items">
        {items.map((item) => (
          <div 
            key={item.key} 
            className="nav-item" 
            onClick={() => onSelect?.(item.key)}
            style={{ cursor: onSelect ? 'pointer' : 'default' }}
          >
            <span className="nav-key">[{item.key}]</span>
            <span className="nav-label">
              {item.label}
              {item.key === '0' && unreadCount !== undefined && unreadCount > 0 && (
                <span className="notif-badge">{unreadCount}</span>
              )}
            </span>
          </div>
        ))}
      </div>
      <style>{`
        .nav-menu {
          padding: 20px 16px;
          color: #00ff00;
          font-family: 'VT323', monospace;
        }
        .brand-name {
          font-size: 1.5rem;
          margin-bottom: 20px;
          font-weight: bold;
          text-shadow: 0 0 10px #00ff00;
        }
        .nav-items {
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          gap: 20px;
        }
        .nav-item {
          font-size: 1.1rem;
          display: flex;
          gap: 15px;
          cursor: default;
        }
        .nav-key {
          color: #00ff00;
          text-shadow: 0 0 5px #00ff00;
        }
        .nav-label {
          letter-spacing: 2px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .notif-badge {
          background: #ff0000;
          color: #fff;
          font-size: 0.7rem;
          padding: 1px 6px;
          border-radius: 10px;
          font-family: sans-serif;
          font-weight: bold;
          box-shadow: 0 0 10px #ff0000;
          animation: blink-notif 1s infinite;
        }
        @keyframes blink-notif {
          0% { opacity: 0.7; }
          50% { opacity: 1; transform: scale(1.1); }
          100% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};
