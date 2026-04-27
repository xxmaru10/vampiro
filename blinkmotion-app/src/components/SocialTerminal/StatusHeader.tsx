import React from 'react';
import { useStatusRotator } from '../../hooks/useStatusRotator';

export const StatusHeader: React.FC = () => {
  const message = useStatusRotator();

  return (
    <div className="status-header">
      <div className="status-message">
        <span className="status-dot"></span>
        {message.toUpperCase()}
      </div>
      <style>{`
        .status-header {
          width: 100%;
          padding: 8px 16px;
          background: rgba(0, 0, 0, 0.8);
          border-bottom: 1px solid #00ff0033;
          color: #00ff00;
          font-family: 'VT323', monospace;
          font-size: 0.75rem;
          letter-spacing: 2px;
          display: flex;
          align-items: center;
        }
        .status-message {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .status-dot {
          width: 6px;
          height: 6px;
          background: #00ff00;
          border-radius: 50%;
          box-shadow: 0 0 8px #00ff00;
          animation: pulse 1s infinite alternate;
        }
        @keyframes pulse {
          from { opacity: 0.4; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};
