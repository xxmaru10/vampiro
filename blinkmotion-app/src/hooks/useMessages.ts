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
      .or(`sender_name.ilike.${name},receiver_name.ilike.${name}`)
      .order('created_at', { ascending: false });

    if (err) { setError(err.message); setLoading(false); return; }

    // Merge conversations with different casings (e.g. "Echo" and "ECHO" become one)
    const seen = new Map<string, Conversation>();
    const nameUpper = name.toUpperCase();
    for (const msg of data ?? []) {
      const senderUpper = msg.sender_name.toUpperCase();
      const receiverUpper = msg.receiver_name.toUpperCase();
      const otherRaw = senderUpper === nameUpper ? msg.receiver_name : msg.sender_name;
      const otherKey = otherRaw.toUpperCase();
      if (!seen.has(otherKey)) {
        seen.set(otherKey, { otherName: otherKey, lastMessage: msg.content, lastAt: msg.created_at });
      }
    }
    setConversations(Array.from(seen.values()));
    setLoading(false);
  };

  const fetchChat = async (nameA: string, nameB: string) => {
    setChatLoading(true);
    activeChatRef.current = { a: nameA.toUpperCase(), b: nameB.toUpperCase() };
    const { data, error: err } = await supabase
      .from('blink_messages')
      .select('*')
      .or(`and(sender_name.ilike.${nameA},receiver_name.ilike.${nameB}),and(sender_name.ilike.${nameB},receiver_name.ilike.${nameA})`)
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
    // Normalize names to UPPERCASE on insert to prevent future case mismatches
    const normalizedSender = senderName.toUpperCase();
    const normalizedReceiver = receiverName.toUpperCase();
    const { error: err } = await supabase
      .from('blink_messages')
      .insert([{ sender_name: normalizedSender, receiver_name: normalizedReceiver, content, is_npc_sender: isNpc }]);
    if (err) throw err;
    // Refresh both chat and conversations
    await Promise.all([
      fetchChat(normalizedSender, normalizedReceiver),
      fetchConversations(normalizedSender),
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

  // Realtime: escuta novas mensagens (sem filtro case-sensitive no receiver_name,
  // filtramos client-side para capturar qualquer variação de case)
  useEffect(() => {
    if (!myName) return;
    const myNameUpper = myName.toUpperCase();

    const channel = supabase
      .channel(`messages_${myNameUpper}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'blink_messages',
      }, (payload) => {
        const msg = payload.new as Message;
        const receiverUpper = (msg.receiver_name || '').toUpperCase();
        const senderUpper = (msg.sender_name || '').toUpperCase();

        // Só processa se a mensagem envolve este usuário
        if (receiverUpper !== myNameUpper && senderUpper !== myNameUpper) return;

        // Atualiza o chat aberto se for desta conversa
        if (activeChatRef.current) {
          const { a, b } = activeChatRef.current;
          const involves = (senderUpper === a || senderUpper === b) &&
                           (receiverUpper === a || receiverUpper === b);
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
