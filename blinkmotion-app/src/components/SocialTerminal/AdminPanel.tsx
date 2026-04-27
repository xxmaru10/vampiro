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
    </div>
  );
};
