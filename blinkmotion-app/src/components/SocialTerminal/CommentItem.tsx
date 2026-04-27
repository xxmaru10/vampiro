import React, { useState } from 'react';
import type { Comment } from '../../hooks/useComments';

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
  onSetExtraLikes: (id: string, count: number) => void;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment, depth, isAdmin, currentUserId, currentUserName,
  identities, selectedIdentity,
  onToggleLike, onReply, onDelete, onSetExtraLikes,
}) => {
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [editingLikes, setEditingLikes] = useState(false);
  const [likesInput, setLikesInput] = useState(String(comment.extra_likes));

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

  const handleSaveLikes = () => {
    const n = Math.max(0, parseInt(likesInput, 10) || 0);
    onSetExtraLikes(comment.id, n);
    setEditingLikes(false);
  };

  const indent = depth * 16;
  const borderColor = depth === 0 ? '#00ff0022' : '#00ff0011';

  return (
    <div style={{ marginLeft: indent, borderLeft: depth > 0 ? '2px solid #00ff0033' : 'none', paddingLeft: depth > 0 ? 10 : 0, marginBottom: 8 }}>
      <div style={{ background: '#050505', border: `1px solid ${borderColor}`, padding: '8px 12px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
          <span style={{ color: comment.is_npc ? '#00ffff' : '#00ff00', fontWeight: 'bold', fontSize: '0.95rem' }}>
            [{comment.author_name.toUpperCase()}]
          </span>
          {comment.is_npc && (
            <span style={{ color: '#00ffff', border: '1px solid #00ffff44', padding: '0 4px', fontSize: '0.65rem' }}>NPC</span>
          )}
          <span style={{ color: '#00ff0044', fontSize: '0.7rem', marginLeft: 'auto' }}>
            {timestamp}
          </span>
        </div>

        {/* Content */}
        <div style={{ color: '#ccffcc', fontSize: '0.85rem', lineHeight: 1.4, whiteSpace: 'pre-wrap', marginBottom: 8 }}>
          {comment.content}
        </div>

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
            onClick={() => setReplying(r => !r)}
            style={{ background: 'transparent', border: 'none', color: '#00ff0066', cursor: 'pointer', fontFamily: "'VT323', monospace", fontSize: '0.85rem', padding: 0 }}
          >
            [ RESPONDER ]
          </button>

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
                style={{ background: 'transparent', border: 'none', color: '#ff333355', cursor: 'pointer', fontFamily: "'VT323', monospace", fontSize: '0.75rem', padding: 0 }}
              >
                [APAGAR]
              </button>
            </>
          )}
        </div>

        {/* Reply form */}
        {replying && (
          <div style={{ marginTop: 8, borderTop: '1px solid #00ff0022', paddingTop: 8, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
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
              onSetExtraLikes={onSetExtraLikes}
            />
          ))}
        </div>
      )}
    </div>
  );
};
