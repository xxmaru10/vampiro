import React from 'react';
import type { Notification } from '../../hooks/useNotifications';
import { Bell, MessageSquare, Heart, FileClock } from 'lucide-react';

interface NotificationsViewProps {
  notifications: Notification[];
  loading: boolean;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onNavigate?: (path: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ 
  notifications, 
  loading, 
  onMarkRead, 
  onMarkAllRead,
  onNavigate 
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'reply': return <MessageSquare size={16} />;
      case 'message': return <MessageSquare size={16} />;
      case 'like': return <Heart size={16} />;
      case 'post_pending': return <FileClock size={16} />;
      default: return <Bell size={16} />;
    }
  };

  const formatTitle = (notif: Notification) => {
    if (!notif.title) return '';
    // Se não é NPC, adiciona ** (conforme solicitado para jogadores cadastrados)
    if (notif.is_npc === false) {
      return notif.title.replace(/ JOGADOR| USUÁRIO/g, (match) => match + '**');
    }
    return notif.title;
  };

  const formatContent = (notif: Notification) => {
     if (!notif.content) return '';
     if (notif.is_npc === false) {
       // Tenta extrair o nome do autor do início do conteúdo (ex: "ph4ntom comentou...")
       const parts = notif.content.split(' ');
       if (parts.length > 0) {
         parts[0] = parts[0] + '**';
         return parts.join(' ');
       }
     }
     return notif.content;
  };

  return (
    <div className="notifications-container">
      <div className="notif-header">
        <Bell size={20} />
        <h2>CENTRAL_DE_NOTIFICAÇÕES</h2>
        {notifications.some(n => !n.read) && (
          <button className="btn-mark-all" onClick={onMarkAllRead}>
            [ MARCAR_TUDO_LIDO ]
          </button>
        )}
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
              className={`notif-item ${n.type} ${n.read ? 'read' : 'unread'}`}
              style={{ cursor: n.link ? 'pointer' : 'default' }}
              onClick={() => {
                if (!n.read) onMarkRead(n.id);
                if (n.link) onNavigate?.(n.link);
              }}
            >
              <div className="notif-icon">{getIcon(n.type)}</div>
              <div className="notif-content">
                <div className="notif-title">{formatTitle(n)}</div>
                <div className="notif-text">{formatContent(n)}</div>
                <div className="notif-footer">
                  <span className="notif-time">
                    {new Date(n.created_at).toLocaleString('pt-BR')}
                  </span>
                  {!n.read && (
                    <button 
                      className="btn-mark-read" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkRead(n.id);
                      }}
                    >
                      [ LIDO ]
                    </button>
                  )}
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
          flex: 1;
        }
        .btn-mark-all {
          background: transparent;
          border: 1px solid #00ff0044;
          color: #00ff0088;
          font-family: 'VT323', monospace;
          cursor: pointer;
          padding: 4px 10px;
          font-size: 0.8rem;
          transition: all 0.2s;
        }
        .btn-mark-all:hover {
          background: #00ff0011;
          color: #00ff00;
          border-color: #00ff00;
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
        .notif-item.unread {
          background: rgba(0, 255, 0, 0.08);
          border-left: 4px solid #00ff00;
          box-shadow: inset 5px 0 10px -5px rgba(0, 255, 0, 0.2);
        }
        .notif-item.read {
          opacity: 0.6;
          border-left: 4px solid #00ff0022;
        }
        .notif-item:hover {
          background: rgba(0, 255, 0, 0.12);
          border-color: #00ff0088;
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
          margin-bottom: 12px;
        }
        .notif-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .notif-time {
          font-size: 0.75rem;
          color: #00ff0044;
        }
        .btn-mark-read {
          background: transparent;
          border: none;
          color: #00ff00aa;
          font-family: 'VT323', monospace;
          cursor: pointer;
          font-size: 0.85rem;
          padding: 0;
          text-decoration: underline;
        }
        .btn-mark-read:hover {
          color: #00ff00;
        }
      `}</style>
    </div>
  );
};
