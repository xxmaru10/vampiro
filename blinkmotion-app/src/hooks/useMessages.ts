import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface Message {
  id: string;
  sender_name: string;
  receiver_name: string;
  content: string;
  is_npc_sender: boolean;
  created_at: string;
}

export interface Conversation {
  otherName: string;
  lastMessage: string;
  lastAt: string;
}

export function useMessages(myName: string) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [chat, setChat] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeChatRef = useRef<{ a: string; b: string } | null>(null);

  const fetchConversations = async (name: string) => {
    if (!name) return;
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('blink_messages')
      .select('sender_name, receiver_name, content, created_at')
      .or(`sender_name.eq.${name},receiver_name.eq.${name}`)
      .order('created_at', { ascending: false });

    if (err) { setError(err.message); setLoading(false); return; }

    const seen = new Map<string, Conversation>();
    for (const msg of data ?? []) {
      const other = msg.sender_name === name ? msg.receiver_name : msg.sender_name;
      if (!seen.has(other)) {
        seen.set(other, { otherName: other, lastMessage: msg.content, lastAt: msg.created_at });
      }
    }
    setConversations(Array.from(seen.values()));
    setLoading(false);
  };

  const fetchChat = async (nameA: string, nameB: string) => {
    setChatLoading(true);
    activeChatRef.current = { a: nameA, b: nameB };
    const { data, error: err } = await supabase
      .from('blink_messages')
      .select('*')
      .or(`and(sender_name.eq.${nameA},receiver_name.eq.${nameB}),and(sender_name.eq.${nameB},receiver_name.eq.${nameA})`)
      .order('created_at', { ascending: true });

    if (err) { setError(err.message); }
    setChat(data ?? []);
    setChatLoading(false);
  };

  const sendMessage = async (
    senderName: string,
    receiverName: string,
    content: string,
    isNpc: boolean = false
  ) => {
    const { error: err } = await supabase
      .from('blink_messages')
      .insert([{ sender_name: senderName, receiver_name: receiverName, content, is_npc_sender: isNpc }]);
    if (err) throw err;
    // Refresh both chat and conversations
    await Promise.all([
      fetchChat(senderName, receiverName),
      fetchConversations(senderName),
    ]);
  };

  const searchContacts = async (query: string, currentName: string): Promise<string[]> => {
    if (!query.trim()) return [];
    const names = new Set<string>();

    const [{ data: npcs }, { data: msgs }] = await Promise.all([
      supabase.from('blink_identities').select('name').ilike('name', `%${query}%`).limit(10),
      supabase.from('blink_messages').select('sender_name, receiver_name')
        .or(`sender_name.ilike.%${query}%,receiver_name.ilike.%${query}%`).limit(50),
    ]);

    (npcs ?? []).forEach(n => { if (n.name !== currentName) names.add(n.name); });
    (msgs ?? []).forEach(m => {
      if (m.sender_name !== currentName && m.sender_name.toLowerCase().includes(query.toLowerCase())) names.add(m.sender_name);
      if (m.receiver_name !== currentName && m.receiver_name.toLowerCase().includes(query.toLowerCase())) names.add(m.receiver_name);
    });

    return Array.from(names).slice(0, 15);
  };

  // Realtime: escuta novas mensagens que chegam para myName
  useEffect(() => {
    if (!myName) return;

    const channel = supabase
      .channel(`messages_${myName}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'blink_messages',
        filter: `receiver_name=eq.${myName}`,
      }, (payload) => {
        const msg = payload.new as Message;
        // Atualiza o chat aberto se for desta conversa
        if (activeChatRef.current) {
          const { a, b } = activeChatRef.current;
          const involves = (msg.sender_name === a || msg.sender_name === b) &&
                           (msg.receiver_name === a || msg.receiver_name === b);
          if (involves) setChat(prev => [...prev, msg]);
        }
        // Atualiza lista de conversas
        fetchConversations(myName);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [myName]);

  useEffect(() => {
    if (myName) fetchConversations(myName);
  }, [myName]);

  return {
    conversations,
    chat,
    loading,
    chatLoading,
    error,
    fetchConversations,
    fetchChat,
    sendMessage,
    searchContacts,
  };
}
