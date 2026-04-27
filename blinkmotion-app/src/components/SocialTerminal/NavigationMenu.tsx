import React from 'react';

interface NavItem {
  key: string;
  label: string;
}

interface NavigationMenuProps {
  items: NavItem[];
}

export const NavigationMenu: React.FC<NavigationMenuProps> = ({ items }) => {
  return (
    <div className="nav-menu">
      <h1 className="brand-name">BLINKMOTION // SOCIAL_NET</h1>
      <div className="nav-items">
        {items.map((item) => (
          <div key={item.key} className="nav-item">
            <span className="nav-key">[{item.key}]</span>
            <span className="nav-label">{item.label}</span>
          </div>
        ))}
      </div>
      <style>{`
        .nav-menu {
          padding: 20px 16px;
          color: #00ff00;
          font-family: 'Courier New', Courier, monospace;
        }
        .brand-name {
          font-size: 1.5rem;
          margin-bottom: 20px;
          font-weight: bold;
          text-shadow: 0 0 10px #00ff00;
        }
        .nav-items {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .nav-item {
          font-size: 1.1rem;
          display: flex;
          gap: 15px;
          cursor: default;
        }
        .nav-key {
          color: #ff00ff;
          text-shadow: 0 0 5px #ff00ff;
        }
        .nav-label {
          letter-spacing: 2px;
        }
      `}</style>
    </div>
  );
};
漫
