import React, { useState, useEffect, useRef } from 'react';
import { useMessages } from '../../hooks/useMessages';
import { supabase } from '../../lib/supabaseClient';

interface MessagesViewProps {
  userId?: string;
  userEmail?: string;
  isAdmin?: boolean;
}

const S = {
  root: { fontFamily: "'VT323', monospace", color: '#00ff00', display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 } as React.CSSProperties,
  header: { display: 'flex', alignItems: 'center', gap: 12, padding: '0 0 10px', borderBottom: '2px solid #00ff0033', marginBottom: 10, flexShrink: 0 } as React.CSSProperties,
  adminRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: '0.82rem', color: '#00ff0088', flexShrink: 0 } as React.CSSProperties,
  select: { flex: 1, background: '#000', border: '1px solid #00ff0044', color: '#00ff00', fontFamily: "'VT323', monospace", fontSize: '0.82rem', padding: '2px 6px' } as React.CSSProperties,
  body: { display: 'flex', flex: 1, gap: 0, minHeight: 0, overflow: 'hidden' } as React.CSSProperties,
  sidebar: { width: 200, minWidth: 160, flexShrink: 0, display: 'flex', flexDirection: 'column', borderRight: '1px solid #00ff0022', paddingRight: 10, marginRight: 10 } as React.CSSProperties,
  searchBox: { width: '100%', background: '#000', border: '1px solid #00ff0044', color: '#00ff00', fontFamily: "'VT323', monospace", fontSize: '0.82rem', padding: '4px 6px', outline: 'none', marginBottom: 6, boxSizing: 'border-box' } as React.CSSProperties,
  convList: { flex: 1, overflowY: 'auto' } as React.CSSProperties,
  convName: { fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } as React.CSSProperties,
  convLast: { fontSize: '0.7rem', color: '#00ff0044', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } as React.CSSProperties,
  chat: { flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 } as React.CSSProperties,
  chatHeader: { fontSize: '0.85rem', color: '#00ff0077', borderBottom: '1px solid #00ff0022', paddingBottom: 6, marginBottom: 8, flexShrink: 0, letterSpacing: 2 } as React.CSSProperties,
  messages: { flex: 1, overflowY: 'auto', marginBottom: 8, display: 'flex', flexDirection: 'column', gap: 4 } as React.CSSProperties,
  msgContent: { color: '#ccffcc', whiteSpace: 'pre-wrap', lineHeight: 1.4 } as React.CSSProperties,
  msgTime: { color: '#00ff0033', fontSize: '0.65rem', marginTop: 2, textAlign: 'right' } as React.CSSProperties,
  inputRow: { display: 'flex', gap: 6, alignItems: 'flex-end', flexShrink: 0 } as React.CSSProperties,
  textarea: { flex: 1, background: '#000', border: '1px solid #00ff0033', color: '#00ff00', fontFamily: "'VT323', monospace", fontSize: '0.85rem', padding: '5px 7px', resize: 'none', outline: 'none' } as React.CSSProperties,
  btnSend: { background: '#00ff00', color: '#000', border: 'none', padding: '6px 14px', fontFamily: "'VT323', monospace", fontSize: '0.88rem', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap', alignSelf: 'flex-end' } as React.CSSProperties,
  btnSendDis: { background: '#003300', color: '#005500', border: 'none', padding: '6px 14px', fontFamily: "'VT323', monospace", fontSize: '0.88rem', fontWeight: 'bold', cursor: 'default', whiteSpace: 'nowrap', alignSelf: 'flex-end' } as React.CSSProperties,
  empty: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00ff0022', fontSize: '0.82rem', letterSpacing: 3 } as React.CSSProperties,
  searchResult: { padding: '4px 7px', cursor: 'pointer', fontSize: '0.82rem', color: '#00ff0077', borderBottom: '1px solid #00ff0011' } as React.CSSProperties,
  btnConnect: { width: '100%', background: '#00ff0011', color: '#00ff00', border: '1px solid #00ff0044', padding: '6px', fontFamily: "'VT323', monospace", fontSize: '0.85rem', cursor: 'pointer', marginBottom: 8, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 } as React.CSSProperties,
};

const convItem = (active: boolean): React.CSSProperties => ({
  padding: '5px 7px', cursor: 'pointer',
  background: active ? '#00ff0022' : 'transparent',
  border: active ? '1px solid #00ff0044' : '1px solid transparent',
  marginBottom: 3, fontSize: '0.85rem',
  color: active ? '#00ff00' : '#00ff0088',
});
const msgBubble = (mine: boolean): React.CSSProperties => ({
  alignSelf: mine ? 'flex-end' : 'flex-start',
  maxWidth: '75%',
  background: mine ? '#001a00' : '#050505',
  border: `1px solid ${mine ? '#00ff0055' : '#00ff0022'}`,
  padding: '5px 10px', fontSize: '0.85rem',
});
const msgAuthor = (mine: boolean): React.CSSProperties => ({
  color: mine ? '#00ff00' : '#00ff0088',
  fontSize: '0.75rem', marginBottom: 2, fontWeight: 'bold',
});

function fmtTime(iso: string) {
  const d = new Date(iso);
  return `${d.toLocaleDateString('pt-BR')} ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
}

export const MessagesView: React.FC<MessagesViewProps> = ({ userEmail, isAdmin }) => {
  const baseName = userEmail ? userEmail.split('@')[0].toUpperCase() : 'ANON';

  const [selectedIdentity, setSelectedIdentity] = useState('__self__');
  const [identities, setIdentities] = useState<{ id: string; name: string }[]>([]);
  const [activeName, setActiveName] = useState(baseName);

  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [searching, setSearching] = useState(false);

  const [openConv, setOpenConv] = useState<string | null>(null);
  const [msgText, setMsgText] = useState('');
  const [sending, setSending] = useState(false);
  const [showConnectList, setShowConnectList] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { conversations, chat, loading, chatLoading, error, fetchConversations, fetchChat, sendMessage, searchContacts } = useMessages(activeName);

  // Carregar identidades para todos (para permitir conectar)
  useEffect(() => {
    supabase.from('blink_identities').select('id, name').order('name')
      .then(({ data }) => setIdentities(data ?? []));
  }, []);

  // Quando admin muda identidade
  useEffect(() => {
    if (!isAdmin) return;
    if (selectedIdentity === '__self__') {
      setActiveName(baseName);
    } else {
      const found = identities.find(i => i.id === selectedIdentity);
      setActiveName(found ? found.name.toUpperCase() : baseName);
    }
    setOpenConv(null);
    setSearch('');
    setSearchResults([]);
  }, [selectedIdentity, identities, isAdmin, baseName]);

  // Atualiza conversas quando activeName muda
  useEffect(() => {
    fetchConversations(activeName);
  }, [activeName]);

  // Abre chat
  const openChat = (otherName: string) => {
    setOpenConv(otherName);
    setSearch('');
    setSearchResults([]);
    fetchChat(activeName, otherName);
  };

  // Scroll para baixo quando chat atualiza
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chat]);

  // Busca de contatos com debounce
  useEffect(() => {
    if (!search.trim()) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      const results = await searchContacts(search, activeName);
      setSearchResults(results);
      setSearching(false);
    }, 300);
    return () => clearTimeout(t);
  }, [search, activeName]);

  const handleSend = async () => {
    if (!msgText.trim() || !openConv) return;
    setSending(true);
    const isNpc = isAdmin && selectedIdentity !== '__self__';
    try {
      await sendMessage(activeName, openConv, msgText.trim(), isNpc);
      setMsgText('');
    } catch (e: any) {
      alert('Erro: ' + e.message);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) handleSend();
  };

  return (
    <div style={S.root}>
      {/* Header */}
      <div style={S.header}>
        <span style={{ fontSize: '1rem', letterSpacing: 3, color: '#00ff00cc' }}>▓▓ SECURE_COMMS // MENSAGENS ▓▓</span>
      </div>

      {/* Admin: seletor de identidade */}
      {isAdmin && (
        <div style={S.adminRow}>
          <span>COMO:</span>
          <select
            value={selectedIdentity}
            onChange={e => setSelectedIdentity(e.target.value)}
            style={S.select}
          >
            <option value="__self__">[ {baseName} ]</option>
            {identities.map(id => <option key={id.id} value={id.id}>{id.name}</option>)}
          </select>
          <span style={{ color: '#00ff0044', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
            — {activeName}
          </span>
        </div>
      )}

      {error && <div style={{ color: '#ff3333', fontSize: '0.75rem', marginBottom: 8, flexShrink: 0 }}>⚠ {error} — execute a migration em /database/migrations/</div>}

      {/* Corpo: sidebar + chat */}
      <div style={S.body}>
        {/* Sidebar */}
        <div style={S.sidebar}>
          {/* Botão de Conectar */}
          <button 
            style={S.btnConnect} 
            onClick={() => setShowConnectList(!showConnectList)}
          >
            <span style={{ fontSize: '1rem' }}>{showConnectList ? '[X]' : '[+]'}</span>
            [ {showConnectList ? 'CANCELAR' : 'CONECTAR A USUÁRIO'} ]
          </button>

          {/* Lista de Identidades para Conectar */}
          {showConnectList && (
            <div style={{ 
              background: '#001a00', 
              border: '1px solid #00ff0033', 
              marginBottom: 10, 
              maxHeight: 200, 
              overflowY: 'auto',
              boxShadow: 'inset 0 0 10px #000'
            }}>
              <div style={{ padding: '5px 8px', fontSize: '0.7rem', color: '#00ff0044', borderBottom: '1px solid #00ff0022', letterSpacing: 1 }}>
                IDENTIDADES DISPONÍVEIS:
              </div>
              {identities
                .filter(i => i.name.toUpperCase() !== activeName)
                .map(i => (
                <div 
                  key={i.id} 
                  style={S.searchResult} 
                  onClick={() => {
                    openChat(i.name.toUpperCase());
                    setShowConnectList(false);
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#00ff0011')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  [ {i.name.toUpperCase()} ]
                </div>
              ))}
              {identities.length === 0 && (
                <div style={{ padding: '10px', fontSize: '0.75rem', color: '#00ff0033', textAlign: 'center' }}>
                  NENHUMA IDENTIDADE_DETECTADA
                </div>
              )}
            </div>
          )}

          {/* Campo de busca */}
          <input
            type="text"
            placeholder="BUSCAR USUÁRIO..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={S.searchBox}
          />

          {/* Resultados de busca */}
          {search.trim() && (
            <div style={{ background: '#050505', border: '1px solid #00ff0033', marginBottom: 6 }}>
              {searching && <div style={{ color: '#00ff0044', fontSize: '0.75rem', padding: '4px 7px' }}>BUSCANDO...</div>}
              {!searching && searchResults.length === 0 && (
                <div style={{ color: '#00ff0033', fontSize: '0.75rem', padding: '4px 7px' }}>SEM RESULTADOS</div>
              )}
              {searchResults.map(name => (
                <div key={name} style={S.searchResult} onClick={() => openChat(name)}>
                  ▶ {name}
                </div>
              ))}
            </div>
          )}

          {/* Lista de conversas */}
          <div style={{ fontSize: '0.7rem', color: '#00ff0033', letterSpacing: 2, marginBottom: 4 }}>
            CONVERSAS ATIVAS {loading ? '...' : `(${conversations.length})`}
          </div>
          <div style={S.convList}>
            {conversations.length === 0 && !loading && (
              <div style={{ color: '#00ff0022', fontSize: '0.75rem', padding: '8px 0' }}>SEM_MENSAGENS</div>
            )}
            {conversations.map(c => (
              <div key={c.otherName} style={convItem(openConv === c.otherName)} onClick={() => openChat(c.otherName)}>
                <div style={S.convName}>▶ {c.otherName}</div>
                <div style={S.convLast}>{c.lastMessage}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Painel de chat */}
        {!openConv ? (
          <div style={S.empty}>SELECIONE_UM_CONTATO</div>
        ) : (
          <div style={S.chat}>
            <div style={S.chatHeader}>
              ▌ CHAT // {openConv} ▌
            </div>

            <div style={S.messages}>
              {chatLoading && <div style={{ color: '#00ff0022', fontSize: '0.75rem', textAlign: 'center' }}>CARREGANDO...</div>}
              {!chatLoading && chat.length === 0 && (
                <div style={{ color: '#00ff0022', fontSize: '0.75rem', textAlign: 'center', marginTop: 20 }}>
                  SEM_MENSAGENS // INICIE_O_CONTATO
                </div>
              )}
              {chat.map(msg => {
                const mine = msg.sender_name === activeName;
                return (
                  <div key={msg.id} style={msgBubble(mine)}>
                    <div style={msgAuthor(mine)}>[{msg.sender_name}]</div>
                    <div style={S.msgContent}>{msg.content}</div>
                    <div style={S.msgTime}>{fmtTime(msg.created_at)}</div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div style={S.inputRow}>
              <span style={{ color: '#00ff0044', fontSize: '1rem', paddingBottom: 5 }}>▶</span>
              <textarea
                value={msgText}
                onChange={e => setMsgText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Mensagem para ${openConv}... (Ctrl+Enter)`}
                rows={2}
                style={S.textarea}
              />
              <button
                onClick={handleSend}
                disabled={sending || !msgText.trim()}
                style={sending || !msgText.trim() ? S.btnSendDis : S.btnSend}
              >
                {sending ? '...' : '[ ENVIAR ]'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
