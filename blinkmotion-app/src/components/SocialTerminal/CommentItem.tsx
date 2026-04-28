import React, { useState } from 'react';
import type { Comment, BulkItem } from '../../hooks/useComments';

interface CommentItemProps {
  comment: Comment;
  depth: number;
  isAdmin: boolean;
  currentUserId?: string;
  currentUserName: string;
  identities: { id: string; name: string }[];
  selectedIdentity: string;
  onToggleLike: (id: string, liked: boolean) => void;
  onReply: (content: string, authorName: string, isNpc: boolean, parentId: string) => Promise<void>;
  onDelete: (id: string) => void;
  onEdit: (id: string, content: string) => Promise<void>;
  onSetExtraLikes: (id: string, count: number) => void;
  onBulkReply?: (parentId: string, items: BulkItem[]) => Promise<void>;
  parseBulkInput?: (text: string) => BulkItem[];
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment, depth, isAdmin, currentUserId, currentUserName,
  identities, selectedIdentity,
  onToggleLike, onReply, onDelete, onEdit, onSetExtraLikes,
  onBulkReply, parseBulkInput,
}) => {
  const [replying, setReplying] = useState(false);
  const [replyMode, setReplyMode] = useState<'text' | 'inject'>('text');
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [injectText, setInjectText] = useState('');
  const [injectError, setInjectError] = useState('');
  const [injectDone, setInjectDone] = useState(false);
  const [editingLikes, setEditingLikes] = useState(false);
  const [likesInput, setLikesInput] = useState(String(comment.extra_likes));
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [editLoading, setEditLoading] = useState(false);

  const totalLikes = (comment.extra_likes ?? 0) + (comment.real_like_count ?? 0);
  const ts = new Date(comment.created_at);
  const timestamp = `${ts.toLocaleDateString('pt-BR')} ${ts.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

  const resolveAuthor = (): { name: string; isNpc: boolean } => {
    if (!isAdmin) return { name: currentUserName, isNpc: false };
    if (selectedIdentity === '__self__') return { name: currentUserName, isNpc: false };
    const found = identities.find(i => i.id === selectedIdentity);
    return found ? { name: found.name, isNpc: true } : { name: currentUserName, isNpc: false };
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setReplyLoading(true);
    const { name, isNpc } = resolveAuthor();
    await onReply(replyText.trim(), name, isNpc, comment.id);
    setReplyText('');
    setReplying(false);
    setReplyLoading(false);
  };

  const handleInjectReply = async () => {
    if (!parseBulkInput || !onBulkReply) return;
    const items = parseBulkInput(injectText);
    if (items.length === 0) { setInjectError('Nenhum item válido.'); return; }
    setInjectError('');
    setReplyLoading(true);
    try {
      await onBulkReply(comment.id, items);
      setInjectText('');
      setInjectDone(true);
      setTimeout(() => { setReplying(false); setInjectDone(false); }, 1200);
    } catch (e: any) {
      setInjectError('Erro: ' + e.message);
    } finally {
      setReplyLoading(false);
    }
  };

  const handleSaveLikes = () => {
    const n = Math.max(0, parseInt(likesInput, 10) || 0);
    onSetExtraLikes(comment.id, n);
    setEditingLikes(false);
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;
    setEditLoading(true);
    try {
      await onEdit(comment.id, editContent.trim());
      setEditing(false);
    } catch (e: any) {
      alert('Erro ao editar: ' + e.message);
    } finally {
      setEditLoading(false);
    }
  };

  const indent = depth * 16;
  const borderColor = depth === 0 ? '#00ff0022' : '#00ff0011';

  // Regra de identificação de jogador cadastrado (apenas admin atualmente)
  const displayName = comment.is_npc ? comment.author_name.toUpperCase() : `${comment.author_name.toUpperCase()}**`;

  return (
    <div 
      id={`comment-${comment.id}`}
      style={{ marginLeft: indent, borderLeft: depth > 0 ? '2px solid #00ff0033' : 'none', paddingLeft: depth > 0 ? 10 : 0, marginBottom: 8 }}
    >
      <div style={{ background: '#050505', border: `1px solid ${borderColor}`, padding: '8px 12px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
          <span style={{ color: comment.is_npc ? '#00ffff' : '#00ff00', fontWeight: 'bold', fontSize: '0.95rem' }}>
            [{displayName}]
          </span>
          {comment.is_npc && (
            <span style={{ color: '#00ffff', fontSize: '0.65rem', border: '1px solid #00ffff44', padding: '0 4px', borderRadius: 2 }}>NPC</span>
          )}
          <span style={{ color: '#00ff0044', fontSize: '0.7rem', marginLeft: 'auto' }}>
            {timestamp}
          </span>
        </div>

        {/* Content */}
        {editing ? (
          <div style={{ marginBottom: 10 }}>
            <textarea
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              rows={3}
              style={{ width: '100%', background: '#000', border: '1px solid #00ff0088', color: '#00ff00', fontFamily: "'VT323', monospace", fontSize: '0.85rem', padding: 6, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button onClick={handleSaveEdit} disabled={editLoading} style={{ background: '#00ff00', color: '#000', border: 'none', padding: '2px 10px', fontFamily: "'VT323', monospace", fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}>
                {editLoading ? '...' : '[ SALVAR ]'}
              </button>
              <button onClick={() => { setEditing(false); setEditContent(comment.content); }} style={{ background: 'transparent', border: '1px solid #ff333366', color: '#ff3333', padding: '2px 10px', fontFamily: "'VT323', monospace", fontSize: '0.8rem', cursor: 'pointer' }}>
                [ CANCELAR ]
              </button>
            </div>
          </div>
        ) : (
          <div style={{ color: '#ccffcc', fontSize: '0.85rem', lineHeight: 1.4, whiteSpace: 'pre-wrap', marginBottom: 8 }}>
            {comment.content}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {/* Like */}
          <button
            onClick={() => onToggleLike(comment.id, comment.user_liked)}
            style={{
              background: 'transparent',
              border: 'none',
              color: comment.user_liked ? '#ff66aa' : '#00ff0066',
              cursor: 'pointer',
              fontFamily: "'VT323', monospace",
              fontSize: '0.85rem',
              padding: 0,
            }}
          >
            {comment.user_liked ? '[ ♥ CURTIDO ]' : '[ ♥ CURTIR ]'}
          </button>
          <span style={{ color: '#00ff0055', fontSize: '0.75rem' }}>♥ {totalLikes}</span>

          {/* Reply */}
          <button
            onClick={() => { setReplying(r => !r); setReplyMode('text'); setInjectError(''); setInjectDone(false); }}
            style={{ background: 'transparent', border: 'none', color: '#00ff0066', cursor: 'pointer', fontFamily: "'VT323', monospace", fontSize: '0.85rem', padding: 0 }}
          >
            [ RESPONDER ]
          </button>

          {/* Edit (Admin) */}
          {isAdmin && !editing && (
            <button
              onClick={() => { setEditContent(comment.content); setEditing(true); }}
              style={{ background: 'transparent', border: 'none', color: '#00ff0066', cursor: 'pointer', fontFamily: "'VT323', monospace", fontSize: '0.85rem', padding: 0 }}
            >
              [ EDITAR ]
            </button>
          )}

          {/* Admin: edit extra likes + delete */}
          {isAdmin && (
            <>
              {editingLikes ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <input
                    type="number" min={0} value={likesInput}
                    onChange={e => setLikesInput(e.target.value)}
                    style={{ width: 50, background: '#000', border: '1px solid #00ff0066', color: '#00ff00', fontFamily: "'VT323', monospace", fontSize: '0.85rem', padding: '0 4px' }}
                  />
                  <button onClick={handleSaveLikes} style={{ background: 'transparent', border: 'none', color: '#00ff00', cursor: 'pointer', fontFamily: "'VT323', monospace", fontSize: '0.85rem' }}>OK</button>
                  <button onClick={() => setEditingLikes(false)} style={{ background: 'transparent', border: 'none', color: '#ff3333', cursor: 'pointer', fontFamily: "'VT323', monospace", fontSize: '0.85rem' }}>X</button>
                </span>
              ) : (
                <button
                  onClick={() => { setLikesInput(String(comment.extra_likes)); setEditingLikes(true); }}
                  style={{ background: 'transparent', border: 'none', color: '#00ff0044', cursor: 'pointer', fontFamily: "'VT323', monospace", fontSize: '0.75rem', padding: 0 }}
                >
                  [+LIKES]
                </button>
              )}
              <button
                onClick={() => { if (window.confirm('Apagar comentário?')) onDelete(comment.id); }}
                style={{ background: 'transparent', border: 'none', color: '#ff333355', cursor: 'pointer', fontFamily: "'VT323', monospace", fontSize: '1rem', padding: 0 }}
              >
                🗑
              </button>
            </>
          )}
        </div>

        {/* Reply form */}
        {replying && (
          <div style={{ marginTop: 8, borderTop: '1px solid #00ff0022', paddingTop: 8 }}>
            {/* Toggle text/inject for admin */}
            {isAdmin && onBulkReply && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                <button
                  onClick={() => setReplyMode('text')}
                  style={{ background: replyMode === 'text' ? '#00ff00' : 'transparent', color: replyMode === 'text' ? '#000' : '#00ff0066', border: '1px solid #00ff0044', padding: '2px 10px', fontFamily: "'VT323', monospace", fontSize: '0.78rem', cursor: 'pointer' }}
                >
                  [ TEXTO ]
                </button>
                <button
                  onClick={() => setReplyMode('inject')}
                  style={{ background: replyMode === 'inject' ? '#00ff00' : 'transparent', color: replyMode === 'inject' ? '#000' : '#00ff0066', border: '1px solid #00ff0044', padding: '2px 10px', fontFamily: "'VT323', monospace", fontSize: '0.78rem', cursor: 'pointer' }}
                >
                  [ INJEÇÃO ]
                </button>
              </div>
            )}

            {replyMode === 'text' ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span style={{ color: '#00ff0066', fontFamily: "'VT323', monospace", marginTop: 4 }}>▶</span>
                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Resposta..."
                  rows={2}
                  style={{ flex: 1, background: '#000', border: '1px solid #00ff0044', color: '#00ff00', fontFamily: "'VT323', monospace", fontSize: '0.85rem', padding: 6, resize: 'none', outline: 'none' }}
                />
                <button
                  onClick={handleReply}
                  disabled={replyLoading || !replyText.trim()}
                  style={{ background: '#00ff00', color: '#000', border: 'none', padding: '4px 10px', fontFamily: "'VT323', monospace", fontSize: '0.85rem', cursor: 'pointer', alignSelf: 'flex-end' }}
                >
                  {replyLoading ? '...' : 'OK'}
                </button>
              </div>
            ) : (
              <div>
                <div style={{ color: '#00ff0044', fontSize: '0.7rem', marginBottom: 4, fontFamily: 'Courier New, monospace', whiteSpace: 'pre', lineHeight: 1.6 }}>
                  {'Nome / Mensagem / Curtidas\n> Resposta  >> MaisAninhado'}
                </div>
                <textarea
                  value={injectText}
                  onChange={e => { setInjectText(e.target.value); setInjectError(''); setInjectDone(false); }}
                  placeholder={'Ph4ntom\nVi. Parecia codificado.\n2\n\n> Nyx\n> Sim, estive lá.\n1'}
                  rows={5}
                  style={{ width: '100%', background: '#000', border: `1px solid ${injectError ? '#ff3333' : '#00ff0033'}`, color: '#00ff00', fontFamily: 'Courier New, monospace', fontSize: '0.78rem', padding: 6, resize: 'vertical', outline: 'none', boxSizing: 'border-box', marginBottom: 6 }}
                />
                {injectError && <div style={{ color: '#ff3333', fontSize: '0.72rem', marginBottom: 4 }}>⚠ {injectError}</div>}
                {injectDone && <div style={{ color: '#00ff00', fontSize: '0.78rem', marginBottom: 4 }}>✓ INJETADO</div>}
                <button
                  onClick={handleInjectReply}
                  disabled={replyLoading || !injectText.trim()}
                  style={{ background: '#00ff00', color: '#000', border: 'none', padding: '4px 14px', fontFamily: "'VT323', monospace", fontSize: '0.88rem', cursor: 'pointer' }}
                >
                  {replyLoading ? 'INJETANDO...' : '[ INJETAR_RESPOSTAS ]'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recursive replies */}
      {comment.replies.length > 0 && (
        <div style={{ marginTop: 4 }}>
          {comment.replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              isAdmin={isAdmin}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              identities={identities}
              selectedIdentity={selectedIdentity}
              onToggleLike={onToggleLike}
              onReply={onReply}
              onDelete={onDelete}
              onEdit={onEdit}
              onSetExtraLikes={onSetExtraLikes}
              onBulkReply={onBulkReply}
              parseBulkInput={parseBulkInput}
            />
          ))}
        </div>
      )}
    </div>
  );
};
