import React, { useState, useEffect } from 'react';
import { useComments } from '../../hooks/useComments';
import { CommentItem } from './CommentItem';
import { supabase } from '../../lib/supabaseClient';

interface CommentSectionProps {
  newsId: string;
  userId?: string;
  userEmail?: string;
  isAdmin: boolean;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ newsId, userId, userEmail, isAdmin }) => {
  const currentUserName = userEmail ? userEmail.split('@')[0].toUpperCase() : 'ANON';

  const { comments, loading, error, addComment, toggleLike, setExtraLikes, deleteComment } = useComments(newsId, userId);

  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedIdentity, setSelectedIdentity] = useState('__self__');
  const [identities, setIdentities] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (isAdmin) {
      supabase.from('blink_identities').select('id, name').order('name').then(({ data }) => {
        setIdentities(data ?? []);
      });
    }
  }, [isAdmin]);

  const resolveAuthor = (): { name: string; isNpc: boolean } => {
    if (!isAdmin || selectedIdentity === '__self__') return { name: currentUserName, isNpc: false };
    const found = identities.find(i => i.id === selectedIdentity);
    return found ? { name: found.name, isNpc: true } : { name: currentUserName, isNpc: false };
  };

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const { name, isNpc } = resolveAuthor();
      await addComment(newComment.trim(), name, isNpc);
      setNewComment('');
    } catch (e: any) {
      alert('Erro ao publicar: ' + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const totalCount = countAll(comments);

  return (
    <div style={{ marginTop: 16, borderTop: '1px solid #00ff0022', paddingTop: 12 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, color: '#00ff0088', fontFamily: "'VT323', monospace", fontSize: '0.85rem', letterSpacing: 2 }}>
        <span>[ THREAD_DE_COMENTÁRIOS ]</span>
        <span style={{ marginLeft: 'auto', color: '#00ff0044' }}>{totalCount} MSG{totalCount !== 1 ? 'S' : ''}</span>
      </div>

      {/* Admin identity selector */}
      {isAdmin && (
        <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'VT323', monospace", fontSize: '0.85rem', color: '#00ff0088' }}>
          <span>COMENTAR_COMO:</span>
          <select
            value={selectedIdentity}
            onChange={e => setSelectedIdentity(e.target.value)}
            style={{ background: '#000', border: '1px solid #00ff0066', color: '#00ff00', fontFamily: "'VT323', monospace", fontSize: '0.85rem', padding: '2px 6px', flex: 1 }}
          >
            <option value="__self__">[ {currentUserName} ]</option>
            {identities.map(id => (
              <option key={id.id} value={id.id}>[NPC] {id.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ color: '#ff3333', fontSize: '0.75rem', marginBottom: 8, fontFamily: "'VT323', monospace" }}>
          ⚠ {error}
        </div>
      )}

      {/* Comments list */}
      {loading && comments.length === 0 ? (
        <div style={{ color: '#00ff0033', fontSize: '0.75rem', fontFamily: "'VT323', monospace", textAlign: 'center', padding: 16 }}>
          CARREGANDO_THREAD...
        </div>
      ) : comments.length === 0 ? (
        <div style={{ color: '#00ff0022', fontSize: '0.75rem', fontFamily: "'VT323', monospace", textAlign: 'center', padding: 16, letterSpacing: 3 }}>
          SEM_TRANSMISSÕES // SEJA_O_PRIMEIRO
        </div>
      ) : (
        <div style={{ marginBottom: 12 }}>
          {comments.map(c => (
            <CommentItem
              key={c.id}
              comment={c}
              depth={0}
              isAdmin={isAdmin}
              currentUserId={userId}
              currentUserName={currentUserName}
              identities={identities}
              selectedIdentity={selectedIdentity}
              onToggleLike={toggleLike}
              onReply={addComment}
              onDelete={deleteComment}
              onSetExtraLikes={setExtraLikes}
            />
          ))}
        </div>
      )}

      {/* New comment form */}
      <div style={{ borderTop: '1px solid #00ff0022', paddingTop: 10, display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <span style={{ color: '#00ff0066', fontFamily: "'VT323', monospace", fontSize: '1rem', paddingBottom: 6 }}>▶</span>
        <textarea
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleSubmit(); }}
          placeholder="Digite sua mensagem... (Ctrl+Enter para enviar)"
          rows={2}
          style={{ flex: 1, background: '#000', border: '1px solid #00ff0044', color: '#00ff00', fontFamily: "'VT323', monospace", fontSize: '0.85rem', padding: 8, resize: 'none', outline: 'none' }}
        />
        <button
          onClick={handleSubmit}
          disabled={submitting || !newComment.trim()}
          style={{ background: '#00ff00', color: '#000', border: 'none', padding: '6px 14px', fontFamily: "'VT323', monospace", fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer', alignSelf: 'flex-end' }}
        >
          {submitting ? '...' : '[ TRANSMITIR ]'}
        </button>
      </div>
      <div style={{ color: '#00ff0022', fontSize: '0.65rem', fontFamily: "'VT323', monospace", marginTop: 4 }}>
        Ctrl+Enter para enviar
      </div>
    </div>
  );
};

function countAll(comments: any[]): number {
  return comments.reduce((acc: number, c: any) => acc + 1 + countAll(c.replies ?? []), 0);
}
