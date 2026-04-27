import React, { useState, useEffect } from 'react';
import type { BulkItem, BulkPreset } from '../../hooks/useComments';
import { useComments } from '../../hooks/useComments';

interface BulkCommentModalProps {
  news: { id: string; title: string }[];
  onClose: () => void;
}

const EXAMPLE_JSON: BulkItem[] = [
  {
    author: 'Zero_Cool',
    is_npc: true,
    content: 'Alguém mais notou o sinal intermitente no setor 7?',
    likes: 3,
    replies: [
      {
        author: 'Ph4ntom',
        is_npc: true,
        content: 'Sim. Parece codificado em Morse.',
        likes: 1,
        replies: [
          { author: 'ADMIN', is_npc: false, content: '> verificando logs... confirmado.', likes: 0 }
        ]
      }
    ]
  }
];

export const BulkCommentModal: React.FC<BulkCommentModalProps> = ({ news, onClose }) => {
  const [selectedNewsId, setSelectedNewsId] = useState(news[0]?.id ?? '');
  const [jsonText, setJsonText] = useState(JSON.stringify(EXAMPLE_JSON, null, 2));
  const [jsonError, setJsonError] = useState('');
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [done, setDone] = useState(false);
  const [presets, setPresets] = useState<BulkPreset[]>([]);
  const [presetName, setPresetName] = useState('');
  const [savingPreset, setSavingPreset] = useState(false);

  const { bulkInsert, fetchPresets, savePreset, deletePreset } = useComments(selectedNewsId);

  useEffect(() => {
    fetchPresets().then(setPresets).catch(() => {});
  }, []);

  const validate = (): BulkItem[] | null => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) { setJsonError('O JSON deve ser um array [...].'); return null; }
      setJsonError('');
      return parsed;
    } catch (e: any) {
      setJsonError('JSON inválido: ' + e.message);
      return null;
    }
  };

  const handleRun = async () => {
    const items = validate();
    if (!items || !selectedNewsId) return;
    setProgress({ done: 0, total: 0 });
    setDone(false);
    try {
      await bulkInsert(selectedNewsId, items, (d, t) => setProgress({ done: d, total: t }));
      setDone(true);
    } catch (e: any) {
      setJsonError('Erro na injeção: ' + e.message);
      setProgress(null);
    }
  };

  const handleSavePreset = async () => {
    const items = validate();
    if (!items || !presetName.trim()) return;
    setSavingPreset(true);
    try {
      await savePreset(presetName.trim(), items);
      const updated = await fetchPresets();
      setPresets(updated);
      setPresetName('');
    } catch (e: any) {
      setJsonError('Erro ao salvar preset: ' + e.message);
    } finally {
      setSavingPreset(false);
    }
  };

  const handleDeletePreset = async (id: string) => {
    if (!window.confirm('Apagar preset?')) return;
    await deletePreset(id);
    setPresets(p => p.filter(x => x.id !== id));
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#080808', border: '1px solid #00ff00', width: '100%', maxWidth: 700, maxHeight: '90vh', display: 'flex', flexDirection: 'column', fontFamily: "'VT323', monospace", color: '#00ff00' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid #00ff0033', background: '#00ff0011' }}>
          <span style={{ fontSize: '1.1rem', letterSpacing: 2 }}>[ INJEÇÃO_EM_MASSA_DE_COMENTÁRIOS ]</span>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#ff3333', cursor: 'pointer', fontFamily: "'VT323', monospace", fontSize: '1.2rem' }}>✕</button>
        </div>

        <div style={{ overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Notícia alvo */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#00ff0088', marginBottom: 4 }}>NOTÍCIA ALVO</label>
            <select
              value={selectedNewsId}
              onChange={e => setSelectedNewsId(e.target.value)}
              style={{ width: '100%', background: '#000', border: '1px solid #00ff0066', color: '#00ff00', fontFamily: "'VT323', monospace", fontSize: '0.9rem', padding: '4px 8px' }}
            >
              {news.map(n => <option key={n.id} value={n.id}>{n.title}</option>)}
            </select>
          </div>

          {/* Presets */}
          <div>
            <div style={{ fontSize: '0.75rem', color: '#00ff0088', marginBottom: 6 }}>PRESETS SALVOS</div>
            {presets.length === 0 ? (
              <div style={{ color: '#00ff0033', fontSize: '0.75rem' }}>Nenhum preset salvo ainda.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 100, overflowY: 'auto' }}>
                {presets.map(p => (
                  <div key={p.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button
                      onClick={() => setJsonText(JSON.stringify(p.data, null, 2))}
                      style={{ flex: 1, background: '#001100', border: '1px solid #00ff0033', color: '#00ff00', cursor: 'pointer', fontFamily: "'VT323', monospace", fontSize: '0.85rem', textAlign: 'left', padding: '2px 8px' }}
                    >
                      {p.name}
                    </button>
                    <button
                      onClick={() => handleDeletePreset(p.id)}
                      style={{ background: 'transparent', border: '1px solid #ff333344', color: '#ff3333', cursor: 'pointer', fontFamily: "'VT323', monospace", fontSize: '0.75rem', padding: '2px 6px' }}
                    >
                      DEL
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* JSON textarea */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#00ff0088', marginBottom: 4 }}>
              SCRIPT JSON — <span style={{ color: '#00ff0055' }}>campos: author, is_npc, content, likes?, replies?</span>
            </label>
            <textarea
              value={jsonText}
              onChange={e => { setJsonText(e.target.value); setJsonError(''); setDone(false); }}
              rows={12}
              style={{ width: '100%', background: '#000', border: `1px solid ${jsonError ? '#ff3333' : '#00ff0044'}`, color: '#00ff00', fontFamily: 'Courier New, monospace', fontSize: '0.78rem', padding: 8, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
            />
            {jsonError && <div style={{ color: '#ff3333', fontSize: '0.75rem', marginTop: 4 }}>⚠ {jsonError}</div>}
          </div>

          {/* Salvar preset */}
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={presetName}
              onChange={e => setPresetName(e.target.value)}
              placeholder="Nome do preset..."
              style={{ flex: 1, background: '#000', border: '1px solid #00ff0044', color: '#00ff00', fontFamily: "'VT323', monospace", fontSize: '0.85rem', padding: '4px 8px', outline: 'none' }}
            />
            <button
              onClick={handleSavePreset}
              disabled={savingPreset || !presetName.trim()}
              style={{ background: '#001100', border: '1px solid #00ff0066', color: '#00ff00', fontFamily: "'VT323', monospace", fontSize: '0.85rem', cursor: 'pointer', padding: '4px 12px' }}
            >
              {savingPreset ? '...' : 'SALVAR PRESET'}
            </button>
          </div>

          {/* Progresso */}
          {progress && (
            <div style={{ color: progress.total > 0 && done ? '#00ff00' : '#00ffaa', fontSize: '0.85rem', letterSpacing: 2 }}>
              {done
                ? `✓ INJEÇÃO CONCLUÍDA — ${progress.done} comentário(s) inserido(s).`
                : `INJETANDO... ${progress.done}/${progress.total}`}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleRun}
              disabled={!!progress && !done}
              style={{ flex: 1, background: '#00ff00', color: '#000', border: 'none', padding: '10px', fontFamily: "'VT323', monospace", fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {progress && !done ? `INJETANDO ${progress.done}/${progress.total}...` : '[ EXECUTAR_INJEÇÃO ]'}
            </button>
            <button
              onClick={onClose}
              style={{ background: 'transparent', border: '1px solid #ff333366', color: '#ff3333', padding: '10px 20px', fontFamily: "'VT323', monospace", fontSize: '1rem', cursor: 'pointer' }}
            >
              CANCELAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
