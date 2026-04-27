import React, { useState, useEffect } from 'react';
import { usePosts } from '../../hooks/usePosts';
import { CommentSection } from './CommentSection';
import { supabase } from '../../lib/supabaseClient';

interface ForumFeedProps {
  userId?: string;
  userEmail?: string;
  isAdmin?: boolean;
}

export const ForumFeed: React.FC<ForumFeedProps> = ({ userId, userEmail, isAdmin = false }) => {
  const { posts, loading, hasMore, error, fetchPage, loadMore, createPost, deletePost } = usePosts();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [selectedIdentity, setSelectedIdentity] = useState('__self__');
  const [identities, setIdentities] = useState<{ id: string; name: string }[]>([]);

  const authorName = userEmail ? userEmail.split('@')[0].toUpperCase() : 'ANON';

  useEffect(() => { fetchPage(0, true); }, []);

  useEffect(() => {
    if (isAdmin) {
      supabase.from('blink_identities').select('id, name').order('name')
        .then(({ data }) => setIdentities(data ?? []));
    }
  }, [isAdmin]);

  const [customName, setCustomName] = useState('');

  const resolveAuthor = (): { name: string; isNpc: boolean } => {
    if (!isAdmin) return { name: authorName, isNpc: false };
    if (selectedIdentity === '__self__') return { name: authorName, isNpc: false };
    if (selectedIdentity === '__custom__') return { name: customName.toUpperCase() || 'ANON', isNpc: true };
    const found = identities.find(i => i.id === selectedIdentity);
    return found ? { name: found.name, isNpc: true } : { name: authorName, isNpc: false };
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) { setFormError('TÍTULO E CONTEÚDO OBRIGATÓRIOS.'); return; }
    setSubmitting(true);
    setFormError('');
    try {
      const { name, isNpc } = resolveAuthor();
      await createPost(title.trim(), content.trim(), name, userId, isNpc);
      setTitle(''); setContent(''); setShowForm(false);
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const ts = (iso: string) => {
    const d = new Date(iso);
    return `${d.toLocaleDateString('pt-BR')} ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div style={{ fontFamily: "'VT323', monospace", color: '#00ff00' }}>

      {/* ── HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, borderBottom: '2px solid #00ff0033', paddingBottom: 8 }}>
        <span style={{ fontSize: '1rem', letterSpacing: 3, color: '#00ff00cc' }}>
          ▓▓ BBS_KINDRED // FÓRUM_DA_REDE ▓▓
        </span>
        <button
          onClick={() => setShowForm(s => !s)}
          style={{ marginLeft: 'auto', background: showForm ? '#00ff00' : 'transparent', color: showForm ? '#000' : '#00ff00', border: '1px solid #00ff00', padding: '3px 12px', fontFamily: "'VT323', monospace", fontSize: '0.9rem', cursor: 'pointer' }}
        >
          {showForm ? '[ CANCELAR ]' : '[ + NOVO_TÓPICO ]'}
        </button>
      </div>

      {/* ── FORM NOVO TÓPICO ── */}
      {showForm && (
        <div style={{ background: '#050505', border: '1px solid #00ff0044', padding: 14, marginBottom: 16 }}>
          {isAdmin && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: '0.82rem', color: '#00ff0088' }}>
              <span>POSTAR_COMO:</span>
              <select
                value={selectedIdentity}
                onChange={e => setSelectedIdentity(e.target.value)}
                style={{ flex: 1, background: '#000', border: '1px solid #00ff0044', color: '#00ff00', fontFamily: "'VT323', monospace", fontSize: '0.82rem', padding: '2px 6px' }}
              >
                <option value="__self__">[ {authorName} ]</option>
                {identities.map(id => <option key={id.id} value={id.id}>{id.name}</option>)}
                <option value="__custom__">[ NOME_PERSONALIZADO... ]</option>
              </select>
              {selectedIdentity === '__custom__' && (
                <input 
                  type="text"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  placeholder="Digite o nome..."
                  style={{ flex: 1, background: '#000', border: '1px solid #00ff00', color: '#00ff00', fontFamily: "'VT323', monospace", fontSize: '0.82rem', padding: '2px 6px' }}
                />
              )}
            </div>
          )}
          <input
            type="text"
            placeholder="TÍTULO DO TÓPICO..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={{ width: '100%', background: '#000', border: '1px solid #00ff0044', color: '#00ff00', fontFamily: "'VT323', monospace", fontSize: '0.95rem', padding: '6px 8px', marginBottom: 8, outline: 'none', boxSizing: 'border-box' }}
          />
          <textarea
            placeholder="Conteúdo da mensagem..."
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={4}
            style={{ width: '100%', background: '#000', border: '1px solid #00ff0044', color: '#00ff00', fontFamily: "'VT323', monospace", fontSize: '0.85rem', padding: '6px 8px', resize: 'vertical', outline: 'none', boxSizing: 'border-box', marginBottom: 8 }}
          />
          {formError && <div style={{ color: '#ff3333', fontSize: '0.8rem', marginBottom: 6 }}>⚠ {formError}</div>}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{ background: '#00ff00', color: '#000', border: 'none', padding: '6px 20px', fontFamily: "'VT323', monospace", fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {submitting ? 'ENVIANDO...' : '[ TRANSMITIR_TÓPICO ]'}
          </button>
        </div>
      )}

      {/* ── ERRO GLOBAL ── */}
      {error && (
        <div style={{ color: '#ff3333', fontSize: '0.78rem', marginBottom: 12, padding: '8px 12px', border: '1px solid #ff333333', background: '#1a0000' }}>
          ⚠ {error}
          <br /><span style={{ color: '#ff333388', fontSize: '0.7rem' }}>Execute no Supabase: CREATE TABLE blink_posts (...) — veja /database/migrations/</span>
        </div>
      )}

      {/* ── LISTA DE POSTS ── */}
      {posts.length === 0 && !loading && !error && (
        <div style={{ color: '#00ff0022', textAlign: 'center', padding: '32px 0', fontSize: '0.85rem', letterSpacing: 4 }}>
          SEM_TRANSMISSÕES // INICIE_O_DIÁLOGO
        </div>
      )}

      {posts.map((post, idx) => {
        const isOpen = expandedId === post.id;
        return (
          <div key={post.id} style={{ marginBottom: 8 }}>
            {/* Row do post */}
            <div
              style={{
                background: isOpen ? '#0a0a0a' : '#050505',
                border: `1px solid ${isOpen ? '#00ff0055' : '#00ff0022'}`,
                padding: '8px 12px',
                cursor: 'pointer',
                transition: 'border-color 0.15s',
              }}
              onClick={() => setExpandedId(isOpen ? null : post.id)}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ color: '#00ff0033', fontSize: '0.72rem', minWidth: 24 }}>#{String(idx + 1).padStart(3, '0')}</span>
                <span style={{ fontWeight: 'bold', fontSize: '0.95rem', flex: 1, color: '#00ff00' }}>{post.title}</span>
                <span style={{ color: '#00ff0077', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                  [{post.author_name}]
                </span>
                <span style={{ color: '#00ff0033', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>{ts(post.created_at)}</span>
                {isAdmin && (
                  <button
                    onClick={e => { e.stopPropagation(); if (window.confirm('Apagar tópico?')) deletePost(post.id); }}
                    style={{ background: 'transparent', border: 'none', color: '#ff333355', cursor: 'pointer', fontSize: '1rem', padding: 0 }}
                  >
                    🗑
                  </button>
                )}
                <span style={{ color: '#00ff0044', fontSize: '0.75rem' }}>{isOpen ? '▲' : '▼'}</span>
              </div>
            </div>

            {/* Conteúdo expandido */}
            {isOpen && (
              <div style={{ background: '#080808', border: '1px solid #00ff0022', borderTop: 'none', padding: '12px 14px' }}>
                <div style={{ color: '#ccffcc', fontSize: '0.85rem', lineHeight: 1.5, whiteSpace: 'pre-wrap', marginBottom: 16, borderBottom: '1px solid #00ff0011', paddingBottom: 12 }}>
                  {post.content}
                </div>
                <CommentSection
                  newsId={post.id}
                  userId={userId}
                  userEmail={userEmail}
                  isAdmin={isAdmin}
                />
              </div>
            )}
          </div>
        );
      })}

      {/* ── LOAD MORE ── */}
      {(hasMore || loading) && posts.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <button
            onClick={loadMore}
            disabled={loading}
            style={{ background: 'transparent', border: '1px solid #00ff0044', color: '#00ff0088', fontFamily: "'VT323', monospace", fontSize: '0.85rem', padding: '6px 24px', cursor: 'pointer', letterSpacing: 2 }}
          >
            {loading ? 'CARREGANDO...' : '[ CARREGAR_MAIS ]'}
          </button>
        </div>
      )}
    </div>
  );
};
