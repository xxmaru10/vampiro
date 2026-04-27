import React from 'react';

export const MainDisplay: React.FC = () => {
  return (
    <div className="main-display">
      {/* Conteúdo futuro será injetado aqui */}
      <div className="empty-indicator">SYSTEM_IDLE... WAITING_FOR_CONTENT</div>
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
          font-family: 'Courier New', Courier, monospace;
          font-size: 0.8rem;
          letter-spacing: 5px;
        }
      `}</style>
    </div>
  );
};
