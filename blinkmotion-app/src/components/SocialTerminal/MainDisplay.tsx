import React from 'react';
import { AdminPanel } from './AdminPanel';

interface MainDisplayProps {
  currentPath: string;
}

export const MainDisplay: React.FC<MainDisplayProps> = ({ currentPath }) => {
  return (
    <div className="main-display">
      {currentPath === '/ROOT_ACCESS' ? (
        <AdminPanel />
      ) : (
        <div className="empty-indicator">SYSTEM_IDLE... WAITING_FOR_CONTENT</div>
      )}
      <style>{`
        .main-display {
          flex-grow: 1;
          margin: 16px;
          background: #000000;
          border: 1px dashed #333;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 300px;
        }
        .empty-indicator {
          color: #222;
          font-family: 'VT323', monospace;
          font-size: 0.8rem;
          letter-spacing: 5px;
        }
      `}</style>
    </div>
  );
};
