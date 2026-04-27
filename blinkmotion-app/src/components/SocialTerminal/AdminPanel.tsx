import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { usePosts } from '../../hooks/usePosts';
import { BulkCommentModal } from './BulkCommentModal';
import { NewsItem } from '../../hooks/useNews';

interface AdminPanelProps {
  news: NewsItem[];
  createNews: (title: string, content: string, asciiText?: string, publishedAt?: string) => Promise<void>;
  deleteNews: (id: string) => Promise<void>;
  newsLoading: boolean;
  newsError: string | null;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  news, 
  createNews, 
  deleteNews, 
  newsLoading, 
  newsError 
}) => {
  const [identities, setIdentities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [newName, setNewName] = useState('');
  const [newBio, setNewBio] = useState('');
  const [activeTab, setActiveTab] = useState<'npcs' | 'news' | 'comments' | 'approval'>('npcs');
  const [showBulkModal, setShowBulkModal] = useState(false);

  // News states
  const [newsTitle, setNewsTitle] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [newsContentAscii, setNewsContentAscii] = useState('');
  const [newsPublishedAt, setNewsPublishedAt] = useState('');
  
  // Post Approval states
  const { posts: pendingPosts, loading: postsLoading, fetchUnapproved, approvePost, deletePost: rejectPost } = usePosts();

  const fetchIdentities = async () => {
    setLoading(true);
    setError('');
    
    // Tentamos buscar da tabela blink_identities
    const { data, error: err } = await supabase
      .from('blink_identities')
      .select('*')
      .order('name', { ascending: true });

    if (err) {
      if (err.code === 'PGRST116' || err.message.includes('not found')) {
        setError('Tabela "blink_identities" não encontrada no Supabase. Execute o SQL de criação primeiro.');
      } else {
        setError(err.message);
      }
    } else {
      setIdentities(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchIdentities();
  }, []);

  useEffect(() => {
    if (activeTab === 'approval') {
      fetchUnapproved();
    }
  }, [activeTab]);

  const handleCreateNPC = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    setLoading(true);
    setError('');

    const { error: err } = await supabase
      .from('blink_identities')
      .insert([
        { 
          name: newName, 
          bio: newBio, 
          is_npc: true 
        }
      ]);

    if (err) {
      setError(err.message);
    } else {
      setNewName('');
      setNewBio('');
      fetchIdentities();
    }
    setLoading(false);
  };

  const handleDeleteNPC = async (id: string) => {
    if (!window.confirm('Deseja realmente apagar este NPC?')) return;
    setLoading(true);
    const { error: err } = await supabase
      .from('blink_identities')
      .delete()
      .eq('id', id);

    if (err) setError(err.message);
    else fetchIdentities();
    setLoading(false);
  };

  const handleCreateNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle || !newsContent) return;
    await createNews(newsTitle, newsContent, newsContentAscii, newsPublishedAt);
    setNewsTitle('');
    setNewsContent('');
    setNewsContentAscii('');
    setNewsPublishedAt('');
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>GAME MASTER DASHBOARD</h2>
        <span className="badge-admin">ROOT_ACCESS</span>
      </div>

      {(error || newsError) && (
        <div className="admin-error">
          <p>⚠️ {error || newsError}</p>
          <pre style={{fontSize: '0.7rem', background: '#000', color: '#0f0', padding: '10px', marginTop: '10px', overflowX: 'auto'}}>
{`-- TABELAS
CREATE TABLE IF NOT EXISTS blink_identities (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  bio TEXT,
  is_npc BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS blink_news (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  ascii_url TEXT,
  content_ascii TEXT,
  published_at DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Se a tabela já existe, adicione as colunas:
ALTER TABLE blink_news ADD COLUMN IF NOT EXISTS content_ascii TEXT;
ALTER TABLE blink_news ADD COLUMN IF NOT EXISTS published_at DATE;

CREATE TABLE IF NOT EXISTS blink_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  author_name TEXT NOT NULL,
  user_id uuid,
  is_npc BOOLEAN DEFAULT false,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE blink_posts ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT false;

-- Habilite RLS e políticas de acesso (CORRIGE ERRO DE ENVIO)
ALTER TABLE blink_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access" ON blink_messages FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE blink_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access Posts" ON blink_posts FOR ALL USING (true) WITH CHECK (true);

-- Se preferir restrito (apenas logados):
-- CREATE POLICY "Authenticated Access" ON blink_messages FOR ALL TO authenticated USING (true);
`}
          </pre>
        </div>
      )}

      <div className="admin-tabs">
        <button className={activeTab === 'npcs' ? 'active' : ''} onClick={() => setActiveTab('npcs')}>
          [ GERENCIAR_NPCS ]
        </button>
        <button className={activeTab === 'news' ? 'active' : ''} onClick={() => setActiveTab('news')}>
          [ GERENCIAR_NOTICIAS ]
        </button>
        <button className={activeTab === 'comments' ? 'active' : ''} onClick={() => setActiveTab('comments')}>
          [ COMENTÁRIOS ]
        </button>
        <button className={activeTab === 'approval' ? 'active' : ''} onClick={() => setActiveTab('approval')}>
          [ APROVAR_POSTS {pendingPosts.length > 0 ? `(${pendingPosts.length})` : ''} ]
        </button>
      </div>

      <div className="admin-grid">
        {activeTab === 'npcs' && (
          <>
            {/* Formulário de Criação */}
            <div className="admin-card">
              <h3>[+] CADASTRAR NOVA IDENTIDADE (NPC)</h3>
              <form onSubmit={handleCreateNPC} className="admin-form">
                <div className="input-group">
                  <label>NOME / ALIAS</label>
                  <input 
                    type="text" 
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="Ex: Zero_Cool"
                    required
                  />
                </div>
                <div className="input-group">
                  <label>BIO / DESCRIÇÃO</label>
                  <textarea 
                    value={newBio}
                    onChange={e => setNewBio(e.target.value)}
                    placeholder="Descrição do personagem no sistema..."
                  />
                </div>
                <button type="submit" className="btn-save" disabled={loading}>
                  {loading ? 'PROCESSANDO...' : 'EXECUTAR_CADASTRO'}
                </button>
              </form>
            </div>

            {/* Lista de NPCs */}
            <div className="admin-card">
              <h3>[#] IDENTIDADES ATIVAS NO SISTEMA ({identities.length})</h3>
              <div className="npc-list">
                {identities.map(npc => (
                  <div key={npc.id} className="npc-item">
                    <div className="npc-info">
                      <div className="npc-name">ID: {npc.name}</div>
                      <div className="npc-bio">{npc.bio || 'Sem biografia...'}</div>
                    </div>
                    <button onClick={() => handleDeleteNPC(npc.id)} className="btn-delete">🗑</button>
                  </div>
                ))}
                {identities.length === 0 && !loading && (
                  <div className="empty-state">NENHUMA IDENTIDADE VIRTUAL ENCONTRADA.</div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'news' && (
          <>
            {/* Gerenciamento de Notícias */}
            <div className="admin-card">
              <h3>[+] PUBLICAR NOTÍCIA SEMANAL</h3>
              <form onSubmit={handleCreateNews} className="admin-form">
                <div className="input-group">
                  <label>TÍTULO DA NOTÍCIA</label>
                  <input 
                    type="text" 
                    value={newsTitle}
                    onChange={e => setNewsTitle(e.target.value)}
                    placeholder="Título impactante..."
                    required
                  />
                </div>
                <div className="input-group">
                  <label>CONTEÚDO / DESCRIÇÃO</label>
                  <textarea 
                    value={newsContent}
                    onChange={e => setNewsContent(e.target.value)}
                    placeholder="Detalhes da notícia..."
                    required
                  />
                </div>
                <div className="input-group">
                  <label>DATA DE PUBLICAÇÃO</label>
                  <input
                    type="date"
                    value={newsPublishedAt}
                    onChange={e => setNewsPublishedAt(e.target.value)}
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
                <div className="input-group">
                  <label>ARTE ASCII (OPCIONAL)</label>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <textarea
                      value={newsContentAscii}
                      onChange={e => setNewsContentAscii(e.target.value)}
                      placeholder="Cole sua arte ASCII aqui..."
                      className="ascii-textarea"
                      style={{ flex: 1 }}
                    />
                    <div style={{ 
                      background: '#000', 
                      border: '1px solid #00ff0044', 
                      width: 110, 
                      minWidth: 110, 
                      height: 90, 
                      overflow: 'hidden', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      flexShrink: 0,
                      marginTop: 0
                    }}>
                      {newsContentAscii ? (
                        <pre style={((): React.CSSProperties => {
                          const lines = newsContentAscii.split('\n');
                          let maxLineLen = 0;
                          for (let i = 0; i < lines.length; i++) {
                            const len = lines[i].trimEnd().length;
                            if (len > maxLineLen) maxLineLen = len;
                          }
                          const lineCount = lines.length || 1;
                          const safeMaxLen = maxLineLen || 1;
                          // Cálculo seguro de font-size para caber em 104x84
                          const fontSize = Math.min(8, Math.min(104 / (safeMaxLen * 0.55), 84 / lineCount));
                          
                          return {
                            margin: 0,
                            color: '#00ff00',
                            whiteSpace: 'pre',
                            fontSize: `${fontSize}px`,
                            lineHeight: 1,
                            letterSpacing: 0,
                            textAlign: 'center',
                            fontFamily: "'VT323', monospace"
                          };
                        })()}>
                          {newsContentAscii}
                        </pre>
                      ) : (
                        <span style={{ fontSize: '0.6rem', color: '#00ff0033', letterSpacing: 2 }}>PREVIEW</span>
                      )}
                    </div>
                  </div>
                </div>
                <button type="submit" className="btn-save" disabled={newsLoading}>
                  {newsLoading ? 'ENVIANDO...' : 'PUBLICAR_NOTÍCIA'}
                </button>
              </form>
            </div>

            <div className="admin-card">
              <h3>[#] NOTÍCIAS ATIVAS ({news.length})</h3>
              <div className="npc-list">
                {news.map(item => (
                  <div key={item.id} className="npc-item">
                    <div className="npc-info">
                      <div className="npc-name">{item.title}</div>
                      <div className="npc-date">
                        {item.published_at
                          ? new Date(item.published_at + 'T12:00:00').toLocaleDateString('pt-BR')
                          : new Date(item.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    <button onClick={() => {
                      if (window.confirm('Apagar notícia?')) deleteNews(item.id);
                    }} className="btn-delete">🗑</button>
                  </div>
                ))}
                {news.length === 0 && !newsLoading && (
                  <div className="empty-state">NENHUMA NOTÍCIA PUBLICADA.</div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'comments' && (
          <div className="admin-card">
            <h3>[⚡] INJEÇÃO EM MASSA DE COMENTÁRIOS</h3>
            <p style={{ color: '#00ff0088', fontSize: '0.85rem', marginBottom: 16, lineHeight: 1.5 }}>
              Insira um bloco de comentários pré-roteirizados em uma notícia com um único clique.
              Suporta threads aninhadas ilimitadas, NPCs, curtidas artificiais e presets salvos no Supabase.
            </p>
            <button
              onClick={() => setShowBulkModal(true)}
              className="btn-save"
              style={{ fontSize: '1rem', letterSpacing: 2 }}
            >
              [ ABRIR_INJEÇÃO_EM_MASSA ]
            </button>

            <div style={{ marginTop: 24, borderTop: '1px solid #00ff0022', paddingTop: 16 }}>
              <h3 style={{ marginTop: 0 }}>[?] ESTRUTURA DO JSON</h3>
              <pre style={{ fontSize: '0.72rem', background: '#000', color: '#00ff00', padding: 12, overflowX: 'auto', lineHeight: 1.4 }}>
{`[
  {
    "author": "Zero_Cool",   // nome exibido
    "is_npc": true,          // badge [NPC] + cor ciano
    "content": "Mensagem...",
    "likes": 5,              // curtidas artificiais
    "replies": [             // aninhamento ilimitado
      {
        "author": "Ph4ntom",
        "is_npc": true,
        "content": "Resposta...",
        "likes": 2,
        "replies": [ ... ]
      }
    ]
  }
]`}
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'approval' && (
          <div className="admin-card" style={{ gridColumn: '1 / -1' }}>
            <h3>[🛡️] MODERAÇÃO DE TÓPICOS PENDENTES</h3>
            <p style={{ color: '#00ff0088', fontSize: '0.85rem', marginBottom: 16 }}>
              Analise e aprove posts de jogadores antes que eles fiquem visíveis no feed global.
            </p>

            <div className="npc-list">
              {pendingPosts.map(post => (
                <div key={post.id} className="npc-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', borderBottom: '1px solid #00ff0022', paddingBottom: 6 }}>
                    <div className="npc-name">TÍTULO: {post.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#00ff0066' }}>AUTOR: {post.author_name} // {new Date(post.created_at).toLocaleString('pt-BR')}</div>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#ccffcc', background: '#000', padding: 10, width: '100%', boxSizing: 'border-box', border: '1px solid #00ff0011' }}>
                    {post.content}
                  </div>
                  <div style={{ display: 'flex', gap: 10, alignSelf: 'flex-end', marginTop: 5 }}>
                    <button 
                      onClick={() => { if (window.confirm('Rejeitar e apagar este post?')) rejectPost(post.id).then(fetchUnapproved); }} 
                      className="btn-delete" 
                      style={{ padding: '4px 12px', fontSize: '0.8rem' }}
                    >
                      [ REJEITAR ]
                    </button>
                    <button 
                      onClick={() => approvePost(post.id).then(fetchUnapproved)} 
                      className="btn-save" 
                      style={{ padding: '4px 20px', fontSize: '0.8rem', marginTop: 0 }}
                    >
                      [ APROVAR_POSTAGEM ]
                    </button>
                  </div>
                </div>
              ))}
              {pendingPosts.length === 0 && !postsLoading && (
                <div className="empty-state">NENHUM POST AGUARDANDO APROVAÇÃO.</div>
              )}
              {postsLoading && (
                <div className="empty-state">CARREGANDO...</div>
              )}
            </div>
          </div>
        )}
      </div>

      {showBulkModal && (
        <BulkCommentModal
          news={news.map(n => ({ id: n.id, title: n.title }))}
          onClose={() => setShowBulkModal(false)}
        />
      )}
    </div>
  );
};
