import React, { useState, useEffect } from 'react';
import { useComments, type BulkItem } from '../../hooks/useComments';
import { CommentItem } from './CommentItem';
import { supabase } from '../../lib/supabaseClient';

interface CommentSectionProps {
  newsId: string;
  userId?: string;
  userEmail?: string;
  isAdmin: boolean;
}

function parseBulkSimple(text: string): BulkItem[] {
  const blocks = text.trim().split(/\n[ \t]*\n/);

  interface ParsedBlock {
    depth: number;
    author: string;
    content: string;
    likes: number;
  }

  const parsed: ParsedBlock[] = [];

  for (const block of blocks) {
    const lines = block.trim().split('\n').map(l => l.trimEnd()).filter(Boolean);
    if (lines.length === 0) continue;

    const depthMatch = lines[0].match(/^(>+)\s*/);
    const depth = depthMatch ? depthMatch[1].length : 0;
    const stripped = lines.map(l => l.replace(/^>+\s*/, '').trimStart());

    const author = stripped[0];
    if (!author) continue;

    const lastLine = stripped[stripped.length - 1];
    const hasLikes = stripped.length > 1 && /^\d+$/.test(lastLine);
    const likes = hasLikes ? parseInt(lastLine, 10) : 0;
    const contentLines = hasLikes ? stripped.slice(1, -1) : stripped.slice(1);
    const content = contentLines.join('\n').trim();
    if (!content) continue;

    parsed.push({ depth, author, content, likes });
  }

  const roots: BulkItem[] = [];
  const stack: Array<{ depth: number; item: BulkItem }> = [];

  for (const p of parsed) {
    const item: BulkItem = { author: p.author, content: p.content, likes: p.likes, is_npc: true, replies: [] };

    while (stack.length > 0 && stack[stack.length - 1].depth >= p.depth) stack.pop();

    if (stack.length === 0) {
      roots.push(item);
    } else {
      (stack[stack.length - 1].item.replies ??= []).push(item);
    }

    stack.push({ depth: p.depth, item });
  }

  return roots;
}

export function parseBulkInput(text: string): BulkItem[] {
  const trimmed = text.trim();
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {}
  }
  return parseBulkSimple(text);
}

export const CommentSection: React.FC<CommentSectionProps> = ({ newsId, userId, userEmail, isAdmin }) => {
  const currentUserName = userEmail ? userEmail.split('@')[0].toUpperCase() : 'ANON';
  const { comments, loading, error, addComment, toggleLike, setExtraLikes, deleteComment, bulkInsert } = useComments(newsId, userId);

  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedIdentity, setSelectedIdentity] = useState('__self__');
  const [identities, setIdentities] = useState<{ id: string; name: string }[]>([]);

  // Injeção em massa inline
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkRunning, setBulkRunning] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{ done: number; total: number } | null>(null);
  const [bulkDone, setBulkDone] = useState(false);
  const [bulkError, setBulkError] = useState('');

  useEffect(() => {
    if (isAdmin) {
      supabase.from('blink_identities').select('id, name').order('name')
        .then(({ data }) => setIdentities(data ?? []));
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
      alert('Erro: ' + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkRun = async () => {
    const items = parseBulkInput(bulkText);
    if (items.length === 0) { setBulkError('Nenhum comentário válido encontrado.'); return; }
    setBulkError('');
    setBulkRunning(true);
    setBulkDone(false);
    setBulkProgress({ done: 0, total: items.length });
    try {
      await bulkInsert(newsId, items, (done, total) => setBulkProgress({ done, total }));
      setBulkDone(true);
      setBulkText('');
    } catch (e: any) {
      setBulkError('Erro: ' + e.message);
    } finally {
      setBulkRunning(false);
    }
  };

  const handleBulkReply = async (parentId: string, items: BulkItem[]) => {
    await bulkInsert(newsId, items, () => {}, parentId);
  };

  const totalCount = countAll(comments);

  return (
    <div style={{ fontFamily: "'VT323', monospace" }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, color: '#00ff0066', fontSize: '0.8rem', letterSpacing: 2 }}>
        <span>[ THREAD_DE_COMENTÁRIOS ]</span>
        <span style={{ marginLeft: 'auto', color: '#00ff0033' }}>{totalCount} MSG{totalCount !== 1 ? 'S' : ''}</span>
      </div>

      {/* Admin: seletor de identidade */}
      {isAdmin && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: '0.8rem', color: '#00ff0077' }}>
          <span>COMO:</span>
          <select
            value={selectedIdentity}
            onChange={e => setSelectedIdentity(e.target.value)}
            style={{ flex: 1, background: '#000', border: '1px solid #00ff0044', color: '#00ff00', fontFamily: "'VT323', monospace", fontSize: '0.8rem', padding: '2px 6px' }}
          >
            <option value="__self__">[ {currentUserName} ]</option>
            {identities.map(id => <option key={id.id} value={id.id}>{id.name}</option>)}
          </select>
        </div>
      )}

      {/* Erro */}
      {error && <div style={{ color: '#ff3333', fontSize: '0.75rem', marginBottom: 8 }}>⚠ {error}</div>}

      {/* Lista de comentários */}
      {loading && comments.length === 0 ? (
        <div style={{ color: '#00ff0022', fontSize: '0.75rem', textAlign: 'center', padding: '12px 0' }}>CARREGANDO...</div>
      ) : comments.length === 0 ? (
        <div style={{ color: '#00ff0022', fontSize: '0.75rem', textAlign: 'center', padding: '12px 0', letterSpacing: 3 }}>
          SEM_TRANSMISSÕES // SEJA_O_PRIMEIRO
        </div>
      ) : (
        <div style={{ marginBottom: 10 }}>
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
              onBulkReply={handleBulkReply}
              parseBulkInput={parseBulkInput}
            />
          ))}
        </div>
      )}

      {/* Formulário de novo comentário */}
      <div style={{ borderTop: '1px solid #00ff0011', paddingTop: 8 }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
          <span style={{ color: '#00ff0044', fontSize: '1rem', paddingBottom: 5 }}>▶</span>
          <textarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleSubmit(); }}
            placeholder="Mensagem... (Ctrl+Enter)"
            rows={2}
            style={{ flex: 1, background: '#000', border: '1px solid #00ff0033', color: '#00ff00', fontFamily: "'VT323', monospace", fontSize: '0.85rem', padding: '5px 7px', resize: 'none', outline: 'none' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignSelf: 'flex-end' }}>
            <button
              onClick={handleSubmit}
              disabled={submitting || !newComment.trim()}
              style={{ background: '#00ff00', color: '#000', border: 'none', padding: '5px 10px', fontFamily: "'VT323', monospace", fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              {submitting ? '...' : '[ TRANSMITIR ]'}
            </button>
            {isAdmin && (
              <button
                onClick={() => { setBulkOpen(o => !o); setBulkDone(false); setBulkError(''); }}
                style={{ background: 'transparent', border: '1px solid #00ff0044', color: '#00ff0088', padding: '4px 10px', fontFamily: "'VT323', monospace", fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                {bulkOpen ? '[ ✕ LOTE ]' : '[ LOTE ]'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Painel de injeção em massa (admin, inline) */}
      {isAdmin && bulkOpen && (
        <div style={{ marginTop: 10, background: '#050505', border: '1px solid #00ff0033', padding: 12 }}>
          <div style={{ color: '#00ff0077', fontSize: '0.78rem', marginBottom: 8, letterSpacing: 1 }}>
            INJEÇÃO_EM_MASSA — use &gt; para respostas aninhadas:
          </div>
          <div style={{ color: '#00ff0044', fontSize: '0.72rem', marginBottom: 8, fontFamily: 'Courier New, monospace', lineHeight: 1.8, whiteSpace: 'pre' }}>
            {'Nome\nMensagem\nCurtidas\n\n> NomeResposta\n> Mensagem\nCurtidas\n\n>> NomeMaisAninhado\n>> Mensagem'}
          </div>
          <textarea
            value={bulkText}
            onChange={e => { setBulkText(e.target.value); setBulkDone(false); setBulkError(''); }}
            placeholder={'Zero_Cool\nAlguém viu o sinal no setor 7?\n4\n\n> Ph4ntom\n> Vi. Parecia codificado.\n2\n\n>> Nyx\n>> Sim, estive lá.\n1'}
            rows={10}
            style={{ width: '100%', background: '#000', border: `1px solid ${bulkError ? '#ff3333' : '#00ff0033'}`, color: '#00ff00', fontFamily: 'Courier New, monospace', fontSize: '0.78rem', padding: 8, resize: 'vertical', outline: 'none', boxSizing: 'border-box', marginBottom: 8 }}
          />
          {bulkError && <div style={{ color: '#ff3333', fontSize: '0.75rem', marginBottom: 6 }}>⚠ {bulkError}</div>}
          {bulkProgress && (
            <div style={{ color: bulkDone ? '#00ff00' : '#00ffaa', fontSize: '0.82rem', marginBottom: 6, letterSpacing: 1 }}>
              {bulkDone ? `✓ ${bulkProgress.done} comentário(s) injetado(s).` : `INJETANDO... ${bulkProgress.done}/${bulkProgress.total}`}
            </div>
          )}
          <button
            onClick={handleBulkRun}
            disabled={bulkRunning || !bulkText.trim()}
            style={{ background: '#00ff00', color: '#000', border: 'none', padding: '6px 16px', fontFamily: "'VT323', monospace", fontSize: '0.95rem', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {bulkRunning ? `INJETANDO ${bulkProgress?.done}/${bulkProgress?.total}...` : '[ EXECUTAR_INJEÇÃO ]'}
          </button>
        </div>
      )}
    </div>
  );
};

function countAll(comments: any[]): number {
  return comments.reduce((acc: number, c: any) => acc + 1 + countAll(c.replies ?? []), 0);
}
