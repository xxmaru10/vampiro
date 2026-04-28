import React from 'react';
import type { User } from '@supabase/supabase-js';
import { AdminPanel } from './AdminPanel';
import { WeeklyNews } from './WeeklyNews';
import { ForumFeed } from './ForumFeed';
import { MessagesView } from './MessagesView';
import { Classifieds } from './Classifieds';
import { NotificationsView } from './NotificationsView';
import { useNews } from '../../hooks/useNews';
import { useNotifications } from '../../hooks/useNotifications';

interface MainDisplayProps {
  currentPath: string;
  user?: User | null;
  onNavigate?: (path: string) => void;
}

const ACTIVE_PATHS = ['/LOCAL_BROADCAST', '/ROOT_ACCESS', '/SECURE_COMMS', '/CLASSIFIEDS', '/NOTIFICATIONS'];

export const MainDisplay: React.FC<MainDisplayProps> = ({ currentPath, user, onNavigate }) => {
  const { news, createNews, deleteNews, loading: newsLoading, error: newsError } = useNews();
  const isAdmin = user?.email?.toLowerCase() === 'admin@blinkmotion.com';
  const { notifications, loading: notifLoading, markAsRead, markAllAsRead } = useNotifications(user?.id, isAdmin, user?.email);
  // Extrai apenas o path base para as verificações de renderização
  const safePath = currentPath || '';
  console.log('MainDisplay - currentPath:', safePath);
  const basePath = safePath.split('?')[0].split('#')[0];
  const isActive = ACTIVE_PATHS.includes(basePath);
  console.log('MainDisplay - basePath:', basePath, 'isActive:', isActive);

  return (
    <div className={`main-display ${isActive ? 'feed-active' : ''}`}>
      {basePath === '/ROOT_ACCESS' && (
        <AdminPanel 
          news={news} 
          createNews={createNews} 
          deleteNews={deleteNews} 
          newsLoading={newsLoading} 
          newsError={newsError} 
        />
      )}

      {basePath === '/LOCAL_BROADCAST' && (
        <div className="feed-container">
          <WeeklyNews news={news} userId={user?.id} userEmail={user?.email} isAdmin={isAdmin} />
          <div style={{ borderTop: '2px dashed #00ff0022', marginTop: 8, paddingTop: 16 }}>
            <ForumFeed userId={user?.id} userEmail={user?.email} isAdmin={isAdmin} />
          </div>
        </div>
      )}

      {basePath === '/SECURE_COMMS' && (
        <div className="feed-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <MessagesView userId={user?.id} userEmail={user?.email} isAdmin={isAdmin} />
        </div>
      )}

      {basePath === '/CLASSIFIEDS' && (
        <div className="feed-container" style={{ height: '100%' }}>
          <Classifieds />
        </div>
      )}
      
      {basePath === '/NOTIFICATIONS' && (
        <div className="feed-container" style={{ height: '100%' }}>
          <NotificationsView 
            notifications={notifications} 
            loading={notifLoading} 
            onMarkRead={markAsRead} 
            onMarkAllRead={markAllAsRead}
            onNavigate={onNavigate}
          />
        </div>
      )}

      {!isActive && (
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
        .main-display.feed-active {
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
