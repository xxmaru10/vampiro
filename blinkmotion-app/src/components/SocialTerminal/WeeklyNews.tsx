import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Newspaper } from 'lucide-react';
import type { NewsItem } from '../../hooks/useNews';
import { CommentSection } from './CommentSection';

interface WeeklyNewsProps {
  news: NewsItem[];
  userId?: string;
  userEmail?: string;
  isAdmin?: boolean;
}

export const WeeklyNews: React.FC<WeeklyNewsProps> = ({ news, userId, userEmail, isAdmin = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [asciiContent, setAsciiContent] = useState<string>('');
  const [commentsOpen, setCommentsOpen] = useState(false);

  // Fecha os comentários ao trocar de notícia
  useEffect(() => { setCommentsOpen(false); }, [currentIndex]);

  // Navegação direta via newsId e scroll para comentário
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const newsId = params.get('newsId');
    if (newsId && news.length > 0) {
      const index = news.findIndex(n => n.id === newsId);
      if (index !== -1) {
        setCurrentIndex(index);
        setCommentsOpen(true);
        
        // Se houver hash de comentário, aguarda o render e scrolla
        const hash = window.location.hash;
        if (hash.startsWith('#comment-')) {
          setTimeout(() => {
            const el = document.getElementById(hash.substring(1));
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              el.style.backgroundColor = 'rgba(0, 255, 0, 0.2)';
              setTimeout(() => { el.style.backgroundColor = '#050505'; }, 2000);
            }
          }, 500);
        }
      }
    }
  }, [news]);

  useEffect(() => {
    if (news.length === 0) { setAsciiContent(''); return; }
    const item = news[currentIndex];
    if (item?.content_ascii) { setAsciiContent(item.content_ascii); return; }
    if (item?.ascii_url) {
      fetch(item.ascii_url).then(r => r.text()).then(t => setAsciiContent(t)).catch(() => setAsciiContent(''));
    } else {
      setAsciiContent('');
    }
  }, [currentIndex, news]);

  const currentNews = news.length > 0 ? news[currentIndex] : null;

  return (
    <>
      {/* ── CARD DE NOTÍCIA ── */}
      <div style={{ background: '#0a0a0a', border: '1px solid #00ff0033', marginBottom: 6, display: 'flex', flexDirection: 'column', fontFamily: "'VT323', monospace", color: '#00ff00' }}>
        {/* Header */}
        <div style={{ background: '#00ff0011', borderBottom: '1px solid #00ff0033', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.8rem', color: '#00ff00cc' }}>
          <Newspaper size={14} />
          <span style={{ letterSpacing: 2 }}>NOTÍCIAS_DA_SEMANA</span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => setCurrentIndex(i => (i - 1 + Math.max(news.length, 1)) % Math.max(news.length, 1))}
              disabled={news.length <= 1}
              style={{ background: 'transparent', border: 'none', color: '#00ff00', cursor: 'pointer', padding: 2, opacity: news.length <= 1 ? 0.3 : 1 }}>
              <ChevronLeft size={14} />
            </button>
            <span style={{ fontSize: '0.75rem' }}>{news.length > 0 ? `${currentIndex + 1}/${news.length}` : '0/0'}</span>
            <button onClick={() => setCurrentIndex(i => (i + 1) % Math.max(news.length, 1))}
              disabled={news.length <= 1}
              style={{ background: 'transparent', border: 'none', color: '#00ff00', cursor: 'pointer', padding: 2, opacity: news.length <= 1 ? 0.3 : 1 }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Body */}
        {!currentNews ? (
          <div style={{ padding: '24px 12px', textAlign: 'center', color: '#00ff0033', fontSize: '0.85rem', letterSpacing: 3 }}>
            NO_SIGNAL // AGUARDANDO_TRANSMISSÃO
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 24, padding: 24 }}>
              {asciiContent && (
                <div style={{ 
                  background: '#000', 
                  border: '1px solid #00ff0033', 
                  width: 300, 
                  minWidth: 300, 
                  height: 240, 
                  overflow: 'hidden', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  flexShrink: 0,
                  position: 'relative',
                  boxShadow: 'inset 0 0 20px rgba(0,255,0,0.05)'
                }}>
                  <div style={((): React.CSSProperties => {
                    const lines = asciiContent.split('\n');
                    let maxLineLen = 0;
                    for (let i = 0; i < lines.length; i++) {
                      const len = lines[i].trimEnd().length;
                      if (len > maxLineLen) maxLineLen = len;
                    }
                    const lineCount = lines.length || 1;
                    const safeMaxLen = maxLineLen || 1;
                    
                    const charWidth = 6;
                    const charHeight = 10;
                    const contentWidth = safeMaxLen * charWidth;
                    const contentHeight = lineCount * charHeight;
                    
                    const scaleW = 290 / contentWidth; 
                    const scaleH = 230 / contentHeight;
                    const scale = Math.min(1.5, Math.min(scaleW, scaleH)); // Permite um pouco de zoom se for pequeno

                    return {
                      transform: `scale(${scale})`,
                      transformOrigin: 'center',
                      whiteSpace: 'pre',
                      color: '#00ff00',
                      opacity: 1,
                      lineHeight: `${charHeight}px`,
                      fontSize: '10px',
                      fontFamily: "'VT323', monospace",
                      textAlign: 'center',
                      display: 'inline-block'
                    };
                  })()}>
                    {asciiContent}
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, minWidth: 0, paddingTop: 10 }}>
                <div style={{ fontWeight: 'bold', fontSize: '1.8rem', color: '#00ff00', textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: 2, textShadow: '0 0 10px rgba(0,255,0,0.3)' }}>
                  {currentNews.title}
                </div>
                <div style={{ fontSize: '1.1rem', color: '#00ff00ee', lineHeight: 1.5, textAlign: 'justify', letterSpacing: 0.5 }}>
                  {currentNews.content}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#00ff0044', textAlign: 'right', marginTop: 'auto', letterSpacing: 3, fontFamily: 'monospace' }}>
                  DATA_REF: {currentNews.published_at
                    ? new Date(currentNews.published_at + 'T12:00:00').toLocaleDateString('pt-BR')
                    : new Date(currentNews.created_at).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>

            {/* Botão COMENTAR */}
            <div style={{ borderTop: '1px solid #00ff0011', padding: '6px 12px' }}>
              <button
                onClick={() => setCommentsOpen(o => !o)}
                style={{ background: 'transparent', border: 'none', color: commentsOpen ? '#00ff00' : '#00ff0066', fontFamily: "'VT323', monospace", fontSize: '0.85rem', cursor: 'pointer', padding: 0, letterSpacing: 1 }}
              >
                {commentsOpen ? '▲ OCULTAR_COMENTÁRIOS' : '▼ COMENTAR'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* ── CARD DE COMENTÁRIOS (abre/fecha) ── */}
      {currentNews && commentsOpen && (
        <div style={{ background: '#070707', border: '1px solid #00ff0022', marginBottom: 20, padding: '12px 14px', fontFamily: "'VT323', monospace" }}>
          <CommentSection
            newsId={currentNews.id}
            userId={userId}
            userEmail={userEmail}
            isAdmin={isAdmin}
          />
        </div>
      )}
    </>
  );
};
