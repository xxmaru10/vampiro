import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useNews } from '../../hooks/useNews';

export const AdminPanel: React.FC = () => {
  console.log("[DEBUG] ADMIN_PANEL_V2_LOADED");
  const [identities, setIdentities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [newName, setNewName] = useState('');
  const [newBio, setNewBio] = useState('');
  const [activeTab, setActiveTab] = useState<'npcs' | 'news'>('npcs');

  // News states
  const { news, createNews, deleteNews, loading: newsLoading, error: newsError } = useNews();
  const [newsTitle, setNewsTitle] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [newsContentAscii, setNewsContentAscii] = useState('');
  const [newsFile, setNewsFile] = useState<File | null>(null);

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
    await createNews(newsTitle, newsContent, newsFile || undefined, newsContentAscii);
    setNewsTitle('');
    setNewsContent('');
    setNewsContentAscii('');
    setNewsFile(null);
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
{`CREATE TABLE blink_identities (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  bio TEXT,
  is_npc BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE blink_news (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  ascii_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilite RLS e políticas de acesso no Supabase`}
          </pre>
        </div>
      )}

      <div className="admin-tabs">
        <button 
          className={activeTab === 'npcs' ? 'active' : ''} 
          onClick={() => setActiveTab('npcs')}
        >
          [ GERENCIAR_NPCS ]
        </button>
        <button 
          className={activeTab === 'news' ? 'active' : ''} 
          onClick={() => setActiveTab('news')}
        >
          [ GERENCIAR_NOTICIAS ]
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
                    <button onClick={() => handleDeleteNPC(npc.id)} className="btn-delete">APAGAR</button>
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
                  <label>CONTEÚDO ASCII (OPCIONAL - COLE OU FAÇA UPLOAD)</label>
                  <textarea 
                    value={newsContentAscii}
                    onChange={e => setNewsContentAscii(e.target.value)}
                    placeholder="Cole sua arte ASCII aqui ou selecione um arquivo abaixo..."
                    className="ascii-textarea"
                  />
                </div>
                <div className="input-group">
                  <label>ARQUIVO ASCII (.TXT)</label>
                  <input 
                    type="file" 
                    accept=".txt"
                    onChange={e => {
                      const file = e.target.files?.[0] || null;
                      setNewsFile(file);
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => setNewsContentAscii(ev.target?.result as string);
                        reader.readAsText(file);
                      }
                    }}
                    className="file-input"
                  />
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
                      <div className="npc-date">{new Date(item.created_at).toLocaleDateString()}</div>
                    </div>
                    <button onClick={() => {
                      if(window.confirm('Apagar notícia?')) deleteNews(item.id, item.ascii_url)
                    }} className="btn-delete">APAGAR</button>
                  </div>
                ))}
                {news.length === 0 && !newsLoading && (
                  <div className="empty-state">NENHUMA NOTÍCIA PUBLICADA.</div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <style>{styles}</style>
    </div>
  );
};

const styles = `
  .admin-container {
    background: #050505;
    color: #00ff00;
    font-family: 'VT323', monospace;
    padding: 20px;
    height: 100%;
    border: 1px solid #00ff0033;
  }
  .admin-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    border-bottom: 2px solid #00ff00;
    padding-bottom: 10px;
  }
  .admin-tabs {
    display: flex;
    gap: 0;
    margin-bottom: 25px;
    border: 1px solid #00ff0044;
    padding: 0;
  }
  .admin-tabs button {
    flex: 1;
    background: #000;
    border: none;
    border-right: 1px solid #00ff0044;
    color: #00ff00;
    padding: 12px;
    font-family: 'VT323', monospace;
    cursor: pointer;
    font-size: 1.2rem;
    transition: all 0.2s;
    text-transform: uppercase;
  }
  .admin-tabs button:last-child {
    border-right: none;
  }
  .admin-tabs button:hover {
    background: #00ff0022;
  }
  .admin-tabs button.active {
    background: #00ff00;
    color: #000;
    font-weight: bold;
    box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
  }
  .badge-admin {
    background: #00ff00;
    color: #000;
    padding: 2px 10px;
    font-weight: bold;
    font-size: 0.9rem;
  }
  .admin-grid {
    display: flex;
    flex-direction: column;
    gap: 30px;
  }
  .admin-card {
    background: #080808;
    border: 1px solid #00ff0044;
    padding: 20px;
    box-shadow: 0 0 15px rgba(0,255,0,0.05);
  }
  .admin-card h3 {
    margin-top: 0;
    font-size: 1.2rem;
    color: #00ff00;
    border-bottom: 1px solid #00ff0033;
    padding-bottom: 10px;
  }
  .admin-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  .input-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .input-group label {
    font-size: 0.8rem;
    color: #00ff00aa;
  }
  .input-group input, .input-group textarea {
    background: #000;
    border: 1px solid #00ff0066;
    color: #00ff00;
    padding: 8px;
    font-family: 'VT323', monospace;
    font-size: 1rem;
    outline: none;
  }
  .input-group textarea {
    height: 100px;
    resize: none;
  }
  .btn-save {
    background: #00ff00;
    color: #000;
    border: none;
    padding: 10px;
    font-family: 'VT323', monospace;
    font-weight: bold;
    cursor: pointer;
    font-size: 1.1rem;
  }
  .btn-save:hover { background: #00cc00; }
  
  .npc-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-height: 400px;
    overflow-y: auto;
  }
  .npc-item {
    display: flex;
    align-items: center;
    gap: 15px;
    background: #000;
    padding: 10px;
    border: 1px solid #00ff0022;
  }
  .npc-info {
    flex-grow: 1;
  }
  .npc-name {
    font-weight: bold;
    font-size: 1.1rem;
    color: #00ff00;
  }
  .npc-bio {
    font-size: 0.8rem;
    color: #00ff0088;
    line-height: 1.2;
  }
  .btn-delete {
    background: transparent;
    color: #ff3333;
    border: 1px solid #ff3333;
    padding: 2px 8px;
    cursor: pointer;
    font-family: 'VT323', monospace;
  }
  .btn-delete:hover { background: #ff333322; }
  
  .admin-error {
    background: #330000;
    color: #ff3333;
    padding: 15px;
    border: 1px solid #ff3333;
    margin-bottom: 20px;
  }
  .empty-state {
    text-align: center;
    padding: 20px;
    color: #00ff0044;
  }
  .file-input {
    font-size: 0.8rem;
    color: #00ff00;
  }
  .npc-date {
    font-size: 0.7rem;
    color: #00ff0066;
  }
  .ascii-textarea {
    height: 150px !important;
    font-family: 'Courier New', monospace;
    font-size: 0.8rem;
    line-height: 1;
    white-space: pre;
    overflow: auto;
  }
`;
