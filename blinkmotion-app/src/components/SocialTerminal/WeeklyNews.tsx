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

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % news.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + news.length) % news.length);
  };

  useEffect(() => {
    if (news.length === 0) {
      setAsciiContent('');
      return;
    }
    const item = news[currentIndex];
    // 1) Preferir conteúdo inline (sem dependência de Storage)
    if (item?.content_ascii) {
      setAsciiContent(item.content_ascii);
      return;
    }
    // 2) Fallback: buscar do bucket via URL pública
    if (item?.ascii_url) {
      fetch(item.ascii_url)
        .then(res => res.text())
        .then(text => setAsciiContent(text))
        .catch(() => setAsciiContent('ERROR_LOADING_ASCII'));
    } else {
      setAsciiContent('');
    }
  }, [currentIndex, news]);

  const currentNews = news.length > 0 ? news[currentIndex] : null;

  return (
    <div className="weekly-news-box">
      <div className="news-header">
        <Newspaper size={16} />
        <span>NOTÍCIAS_DA_SEMANA_V.1.0</span>
        <div className="news-nav">
          <button onClick={prevSlide} disabled={news.length <= 1}><ChevronLeft size={14} /></button>
          <span>{news.length > 0 ? `${currentIndex + 1}/${news.length}` : '0/0'}</span>
          <button onClick={nextSlide} disabled={news.length <= 1}><ChevronRight size={14} /></button>
        </div>
      </div>

      {!currentNews ? (
        <div className="news-empty">
          <span>NO_SIGNAL // AGUARDANDO_TRANSMISSÃO</span>
        </div>
      ) : (
      <div className="news-content-wrapper">
        {asciiContent && (
          <div className="news-ascii-thumb">
            <pre>{asciiContent}</pre>
          </div>
        )}
        <div className="news-text-info">
          <h3 className="news-title">{currentNews.title}</h3>
          <p className="news-description">{currentNews.content}</p>
          <div className="news-date">
            DATA_REF: {currentNews.published_at
              ? new Date(currentNews.published_at + 'T12:00:00').toLocaleDateString('pt-BR')
              : new Date(currentNews.created_at).toLocaleDateString('pt-BR')}
          </div>
        </div>
      </div>
      )}

      {/* Seção de comentários da notícia atual */}
      {currentNews && (
        <div style={{ padding: '0 12px 12px' }}>
          <CommentSection
            newsId={currentNews.id}
            userId={userId}
            userEmail={userEmail}
            isAdmin={isAdmin}
          />
        </div>
      )}

      <style>{`
        .weekly-news-box {
          width: calc(100% - 32px);
          background: #0a0a0a;
          border: 1px solid #00ff0033;
          margin-bottom: 16px;
          display: flex;
          flex-direction: column;
        }
        .news-header {
          background: #00ff0011;
          border-bottom: 1px solid #00ff0033;
          padding: 4px 10px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.75rem;
          color: #00ff00cc;
        }
        .news-nav {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .news-nav button {
          background: transparent;
          border: none;
          color: #00ff00;
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 2px;
        }
        .news-nav button:hover {
          color: #fff;
        }
        .news-empty {
          padding: 24px 12px;
          text-align: center;
          color: #00ff0033;
          font-family: 'VT323', monospace;
          font-size: 0.9rem;
          letter-spacing: 3px;
        }
        .news-content-wrapper {
          display: flex;
          gap: 15px;
          padding: 12px;
          min-height: 100px;
        }
        .news-ascii-thumb {
          background: #000;
          border: 1px solid #111;
          width: 120px;
          min-width: 120px;
          height: 100px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 4px;
          line-height: 1;
          flex-shrink: 0;
        }
        .news-ascii-thumb pre {
          margin: 0;
          color: #00ff00;
          opacity: 0.8;
          white-space: pre-wrap;
          word-break: break-all;
        }
        .news-text-info {
          display: flex;
          flex-direction: column;
          gap: 5px;
          overflow: hidden;
          flex: 1;
        }
        .news-title {
          margin: 0;
          font-size: 1.1rem;
          color: #00ff00;
          text-transform: uppercase;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .news-description {
          margin: 0;
          font-size: 0.85rem;
          color: #00ff00aa;
          line-height: 1.2;
          flex-grow: 1;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .news-date {
          font-size: 0.7rem;
          color: #00ff0066;
          text-align: right;
        }
      `}</style>
    </div>
  );
};
