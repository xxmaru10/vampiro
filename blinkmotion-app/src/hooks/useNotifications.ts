import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface Notification {
  id: string;
  type: 'reply' | 'like' | 'post_pending' | 'mention' | 'message';
  title: string;
  content: string;
  created_at: string;
  read: boolean;
  link?: string;
  is_npc?: boolean; // Adicionado para identificar se o autor da interação é NPC
}

const READ_NOTIFS_KEY = 'blink_read_notifications';
const READ_NOTIFS_EVENT = 'blink_notifications_read_changed';

export const useNotifications = (userId?: string, isAdminParam: boolean = false, userEmail?: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Carregar IDs lidos do localStorage
  const getReadIds = (): string[] => {
    try {
      const stored = localStorage.getItem(READ_NOTIFS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveReadId = (id: string) => {
    const ids = getReadIds();
    if (!ids.includes(id)) {
      localStorage.setItem(READ_NOTIFS_KEY, JSON.stringify([...ids, id]));
    }
  };

  const notifyReadIdsChanged = () => {
    window.dispatchEvent(new Event(READ_NOTIFS_EVENT));
  };

  const fetchNotifications = async () => {
    if (!userId && !isAdminParam) return;
    setLoading(true);

    try {
      const allNotifs: Notification[] = [];
      const readIds = getReadIds();

      // 1. ADMIN: Postagens pendentes de aprovação
      if (isAdminParam) {
        const { data: pendingPosts, error: postErr } = await supabase
          .from('blink_posts')
          .select('id, author_name, title, created_at')
          .eq('approved', false);

        if (!postErr && pendingPosts) {
          pendingPosts.forEach(post => {
            const id = `post_${post.id}`;
            allNotifs.push({
              id,
              type: 'post_pending',
              title: 'POSTAGEM PENDENTE',
              content: `${post.author_name || 'ANÔNIMO'} enviou "${post.title || 'SEM TÍTULO'}" para aprovação.`,
              created_at: post.created_at,
              read: readIds.includes(id),
              link: '/ROOT_ACCESS?tab=approval',
              is_npc: false
            });
          });
        }

        // 2. ADMIN: Interações de Jogadores (is_npc = false) em Comentários
        const { data: playerComments, error: commentErr } = await supabase
          .from('blink_comments')
          .select('id, news_id, author_name, content, created_at')
          .eq('is_npc', false)
          .order('created_at', { ascending: false })
          .limit(10);

        if (!commentErr && playerComments) {
          playerComments.forEach(comment => {
            const id = `comment_${comment.id}`;
            allNotifs.push({
              id,
              type: 'reply',
              title: 'INTERAÇÃO DE JOGADOR',
              content: `${comment.author_name || 'ANÔNIMO'} comentou: "${(comment.content || '').substring(0, 30)}..."`,
              created_at: comment.created_at,
              read: readIds.includes(id),
              link: `/LOCAL_BROADCAST?newsId=${comment.news_id}#comment-${comment.id}`,
              is_npc: false
            });
          });
        }
      }

      // 3. JOGADOR: Respostas de NPCs em seus posts ou comentários
      if (userId && userEmail) {
        const playerUsername = userEmail.split('@')[0];
        const playerName = playerUsername.toUpperCase();

        const { data: directMessages, error: messageErr } = await supabase
          .from('blink_messages')
          .select('id, sender_name, receiver_name, content, is_npc_sender, created_at')
          .ilike('receiver_name', playerName)
          .order('created_at', { ascending: false })
          .limit(10);

        if (!messageErr && directMessages) {
          directMessages.forEach(message => {
            const id = `message_${message.id}`;
            allNotifs.push({
              id,
              type: 'message',
              title: 'MENSAGEM PRIVADA',
              content: `${message.sender_name || 'ANON'} enviou: "${(message.content || '').substring(0, 30)}..."`,
              created_at: message.created_at,
              read: readIds.includes(id),
              link: `/SECURE_COMMS?chat=${encodeURIComponent(message.sender_name || '')}`,
              is_npc: message.is_npc_sender
            });
          });
        }
        
        const { data: npcInteractions, error: npcErr } = await supabase
          .from('blink_comments')
          .select('id, news_id, author_name, content, created_at')
          .eq('is_npc', true)
          .order('created_at', { ascending: false })
          .limit(15);

        if (!npcErr && npcInteractions) {
          let relevant = (npcInteractions ?? []).filter(c => (c.content || '').toLowerCase().includes(playerUsername.toLowerCase()));
          
          if (relevant.length === 0 && npcInteractions.length > 0) {
             relevant = [npcInteractions[0]];
          }

          relevant.forEach(interaction => {
            const id = `npc_${interaction.id}`;
            allNotifs.push({
              id,
              type: 'reply',
              title: 'NOVA MENSAGEM RECEBIDA',
              content: `${interaction.author_name || 'NPC'} interagiu: "${(interaction.content || '').substring(0, 30)}..."`,
              created_at: interaction.created_at,
              read: readIds.includes(id),
              link: `/LOCAL_BROADCAST?newsId=${interaction.news_id}#comment-${interaction.id}`,
              is_npc: true
            });
          });
        }
      }

      const sorted = allNotifs.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setNotifications(sorted);
      setUnreadCount(sorted.filter(n => !n.read).length);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (id: string) => {
    saveReadId(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => notifications.some(n => n.id === id && !n.read) ? Math.max(0, prev - 1) : prev);
    notifyReadIdsChanged();
  };

  const markAllAsRead = () => {
    notifications.forEach(n => saveReadId(n.id));
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    notifyReadIdsChanged();
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    window.addEventListener(READ_NOTIFS_EVENT, fetchNotifications);
    window.addEventListener('storage', fetchNotifications);
    return () => {
      clearInterval(interval);
      window.removeEventListener(READ_NOTIFS_EVENT, fetchNotifications);
      window.removeEventListener('storage', fetchNotifications);
    };
  }, [userId, isAdminParam, userEmail]);

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead, refresh: fetchNotifications };
};
