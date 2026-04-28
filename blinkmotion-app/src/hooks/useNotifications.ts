import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface Notification {
  id: string;
  type: 'reply' | 'like' | 'post_pending' | 'mention';
  title: string;
  content: string;
  created_at: string;
  read: boolean;
  link?: string;
}

export const useNotifications = (userId?: string, isAdminParam: boolean = false, userEmail?: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!userId && !isAdminParam) return;
    setLoading(true);

    try {
      const allNotifs: Notification[] = [];

      // 1. ADMIN: Postagens pendentes de aprovação
      if (isAdminParam) {
        const { data: pendingPosts } = await supabase
          .from('blink_posts')
          .select('id, author_name, title, created_at')
          .eq('approved', false);

        (pendingPosts ?? []).forEach(post => {
          allNotifs.push({
            id: `post_${post.id}`,
            type: 'post_pending',
            title: 'POSTAGEM PENDENTE',
            content: `${post.author_name} enviou "${post.title}" para aprovação.`,
            created_at: post.created_at,
            read: false,
            link: '/ROOT_ACCESS'
          });
        });

        // 2. ADMIN: Interações de Jogadores (is_npc = false) em Comentários
        // Como não temos uma tabela de notificações real ainda, buscamos comentários recentes de jogadores
        const { data: playerComments } = await supabase
          .from('blink_comments')
          .select('id, author_name, content, created_at')
          .eq('is_npc', false)
          .order('created_at', { ascending: false })
          .limit(10);

        (playerComments ?? []).forEach(comment => {
          allNotifs.push({
            id: `comment_${comment.id}`,
            type: 'reply',
            title: 'INTERAÇÃO DE JOGADOR',
            content: `${comment.author_name} comentou: "${comment.content.substring(0, 30)}..."`,
            created_at: comment.created_at,
            read: false,
            link: '/LOCAL_BROADCAST'
          });
        });
      }

      // 3. JOGADOR: Respostas de NPCs em seus posts ou comentários
      if (userId && !isAdminParam && userEmail) {
        // O username/author_name na rede social é derivado do email
        const playerUsername = userEmail.split('@')[0];
        
        // Simulação mais próxima: pegamos os últimos comentários de NPCs e vemos se mencionam o jogador (na vida real faríamos um join)
        // Como o supabaseClient permite text search:
        const { data: npcInteractions } = await supabase
          .from('blink_comments')
          .select('id, author_name, content, created_at')
          .eq('is_npc', true)
          .order('created_at', { ascending: false })
          .limit(15);

        // Filtra localmente se o conteúdo menciona o jogador de alguma forma ou se é pra ele
        // Para garantir que haja notificações, vamos simular que qualquer NPC reply é relevante se tivermos poucas
        let relevant = (npcInteractions ?? []).filter(c => c.content.toLowerCase().includes(playerUsername.toLowerCase()));
        
        // Fallback para dar a sensação de rede ativa
        if (relevant.length === 0 && npcInteractions && npcInteractions.length > 0) {
           relevant = [npcInteractions[0]];
        }

        relevant.forEach(interaction => {
          allNotifs.push({
            id: `npc_${interaction.id}`,
            type: 'reply',
            title: 'NOVA MENSAGEM RECEBIDA',
            content: `${interaction.author_name} interagiu: "${interaction.content.substring(0, 30)}..."`,
            created_at: interaction.created_at,
            read: false,
            link: '/LOCAL_BROADCAST'
          });
        });
      }

      // Ordenar por data
      const sorted = allNotifs.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setNotifications(sorted);
      setUnreadCount(sorted.length); // Por enquanto tudo é unread até clicarmos
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = () => {
    setUnreadCount(0);
    // Em uma implementação real, atualizaríamos o banco ou localStorage
  };

  useEffect(() => {
    fetchNotifications();
    // Refresh a cada 1 minuto
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [userId, isAdminParam]);

  return { notifications, unreadCount, loading, markAllAsRead, refresh: fetchNotifications };
};
