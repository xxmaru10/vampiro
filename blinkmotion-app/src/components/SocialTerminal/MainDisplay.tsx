import React from 'react';
import { AdminPanel } from './AdminPanel';
import { WeeklyNews } from './WeeklyNews';
import { useNews } from '../../hooks/useNews';

interface MainDisplayProps {
  currentPath: string;
}

export const MainDisplay: React.FC<MainDisplayProps> = ({ currentPath }) => {
  const { news } = useNews();

  return (
    <div className={`main-display ${currentPath === '/LOCAL_BROADCAST' ? 'feed-active' : ''}`}>
      {currentPath === '/ROOT_ACCESS' && (
        <AdminPanel />
      )}
      
      {currentPath === '/LOCAL_BROADCAST' && (
        <div className="feed-container">
          <WeeklyNews news={news} />
          {/* Outros componentes do feed aqui no futuro */}
        </div>
      )}

      {!['/ROOT_ACCESS', '/LOCAL_BROADCAST'].includes(currentPath) && (
        <div className="empty-indicator">SYSTEM_IDLE... WAITING_FOR_CONTENT</div>
      )}

      <style>{`
        .main-display {
          flex-grow: 1;
          margin: 16px;
          background: #000000;
          border: 1px dashed #333;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          min-height: 300px;
          overflow-y: auto;
        }
        .main-display.feed-active, .main-display:has(.admin-container) {
          align-items: stretch;
          justify-content: flex-start;
          border-style: solid;
        }
        .feed-container {
          padding: 16px;
          width: 100%;
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
