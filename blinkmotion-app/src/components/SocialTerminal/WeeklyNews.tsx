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
            <div style={{ display: 'flex', gap: 12, padding: 12 }}>
              {asciiContent && (
                <div style={{ background: '#000', border: '1px solid #111', width: 110, minWidth: 110, height: 90, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <pre style={{ 
                    margin: 0, 
                    color: '#00ff00', 
                    opacity: 0.8, 
                    whiteSpace: 'pre',
                    fontSize: `${Math.min(5, Math.min(110 / (Math.max(...asciiContent.split('\n').map(l => l.length)) || 1) / 0.6, 90 / (asciiContent.split('\n').length || 1)))}px`,
                    lineHeight: 1,
                    textAlign: 'center'
                  }}>
                    {asciiContent}
                  </pre>
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 'bold', fontSize: '1.05rem', color: '#00ff00', textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentNews.title}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#00ff00aa', lineHeight: 1.3 }}>
                  {currentNews.content}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#00ff0055', textAlign: 'right', marginTop: 'auto' }}>
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
