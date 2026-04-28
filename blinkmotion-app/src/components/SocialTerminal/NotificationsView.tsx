import React from 'react';
import type { Notification } from '../../hooks/useNotifications';
import { Bell, MessageSquare, Heart, FileClock } from 'lucide-react';

interface NotificationsViewProps {
  notifications: Notification[];
  loading: boolean;
  onMarkRead: () => void;
  onNavigate?: (path: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ notifications, loading, onMarkRead, onNavigate }) => {
  React.useEffect(() => {
    // Marcar como lido ao abrir a página
    onMarkRead();
  }, [onMarkRead]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'reply': return <MessageSquare size={16} />;
      case 'like': return <Heart size={16} />;
      case 'post_pending': return <FileClock size={16} />;
      default: return <Bell size={16} />;
    }
  };

  return (
    <div className="notifications-container">
      <div className="notif-header">
        <Bell size={20} />
        <h2>CENTRAL_DE_NOTIFICAÇÕES</h2>
      </div>

      {loading && notifications.length === 0 ? (
        <div className="notif-status">BUSCANDO_INTERAÇÕES...</div>
      ) : notifications.length === 0 ? (
        <div className="notif-empty">NENHUMA_NOTIFICAÇÃO_RECENTE</div>
      ) : (
        <div className="notif-list">
          {notifications.map((n) => (
            <div 
              key={n.id} 
              className={`notif-item ${n.type}`}
              style={{ cursor: n.link ? 'pointer' : 'default' }}
              onClick={() => n.link && onNavigate?.(n.link)}
            >
              <div className="notif-icon">{getIcon(n.type)}</div>
              <div className="notif-content">
                <div className="notif-title">{n.title}</div>
                <div className="notif-text">{n.content}</div>
                <div className="notif-time">
                  {new Date(n.created_at).toLocaleString('pt-BR')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .notifications-container {
          padding: 20px;
          color: #00ff00;
          font-family: 'VT323', monospace;
          max-width: 800px;
          margin: 0 auto;
          width: 100%;
        }
        .notif-header {
          display: flex;
          align-items: center;
          gap: 15px;
          border-bottom: 1px solid #00ff0044;
          padding-bottom: 15px;
          margin-bottom: 20px;
        }
        .notif-header h2 {
          margin: 0;
          letter-spacing: 3px;
          font-size: 1.5rem;
        }
        .notif-status, .notif-empty {
          text-align: center;
          padding: 40px;
          color: #00ff0044;
          letter-spacing: 2px;
          border: 1px dashed #00ff0022;
        }
        .notif-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .notif-item {
          background: rgba(0, 255, 0, 0.05);
          border: 1px solid #00ff0022;
          padding: 15px;
          display: flex;
          gap: 15px;
          transition: all 0.2s;
        }
        .notif-item:hover {
          background: rgba(0, 255, 0, 0.1);
          border-color: #00ff0066;
        }
        .notif-item.post_pending {
          border-left: 4px solid #ffaa00;
        }
        .notif-item.reply {
          border-left: 4px solid #00aaff;
        }
        .notif-icon {
          color: #00ff00aa;
          padding-top: 2px;
        }
        .notif-title {
          font-weight: bold;
          font-size: 1.1rem;
          margin-bottom: 4px;
          letter-spacing: 1px;
        }
        .notif-text {
          font-size: 0.95rem;
          color: #00ff00cc;
          margin-bottom: 8px;
        }
        .notif-time {
          font-size: 0.75rem;
          color: #00ff0044;
        }
      `}</style>
    </div>
  );
};
