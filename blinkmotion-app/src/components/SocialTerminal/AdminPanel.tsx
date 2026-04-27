import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://srajipjjlhevdniujwod.supabase.co';

export const AdminPanel: React.FC = () => {
  const [serviceKey, setServiceKey] = useState(localStorage.getItem('blink_service_key') || '');
  const [isAuthenticated, setIsAuthenticated] = useState(!!serviceKey);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPass, setNewUserPass] = useState('');
  
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const getAdminClient = () => {
    return createClient(SUPABASE_URL, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    const adminAuth = getAdminClient().auth.admin;
    
    const { data, error } = await adminAuth.listUsers();
    
    if (error) {
      setError(error.message);
      setIsAuthenticated(false);
      localStorage.removeItem('blink_service_key');
    } else {
      setUsers(data.users || []);
      if (!isAuthenticated) {
        setIsAuthenticated(true);
        localStorage.setItem('blink_service_key', serviceKey);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (serviceKey.trim()) {
      fetchUsers();
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail || !newUserPass) return;
    setLoading(true);
    
    const email = newUserEmail.includes('@') ? newUserEmail : `${newUserEmail.toLowerCase().replace(/[^a-z0-9]/g, '')}@blinkmotion.com`;

    const { error } = await getAdminClient().auth.admin.createUser({
      email: email,
      password: newUserPass,
      email_confirm: true,
    });

    if (error) setError(error.message);
    else {
      setNewUserEmail('');
      setNewUserPass('');
      fetchUsers();
    }
    setLoading(false);
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja apagar este usuário?')) return;
    setLoading(true);
    const { error } = await getAdminClient().auth.admin.deleteUser(id);
    if (error) setError(error.message);
    else fetchUsers();
    setLoading(false);
  };

  const handleChangePassword = async (id: string) => {
    setLoading(true);
    const { error } = await getAdminClient().auth.admin.updateUserById(id, {
      password: newPassword
    });
    
    if (error) setError(error.message);
    else {
      setEditingUserId(null);
      setNewPassword('');
      alert('Senha alterada com sucesso!');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('blink_service_key');
    setServiceKey('');
    setIsAuthenticated(false);
    setUsers([]);
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-container">
        <h2>Acesso Administrativo Requerido</h2>
        <p>Insira a <strong>Service Role Key</strong> do Supabase para gerenciar os usuários.</p>
        <form onSubmit={handleLogin} className="admin-form">
          <input 
            type="password" 
            placeholder="eyJhbGciOiJIUzI1NiIs..." 
            value={serviceKey}
            onChange={e => setServiceKey(e.target.value)}
            className="admin-input"
          />
          <button type="submit" className="admin-btn" disabled={loading}>
            {loading ? 'Validando...' : 'Conectar'}
          </button>
        </form>
        {error && <div className="admin-error">{error}</div>}
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Painel de Controle</h2>
        <button onClick={handleLogout} className="admin-btn-logout">Sair do Painel</button>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-card">
        <h3>Criar Novo Usuário</h3>
        <form onSubmit={handleCreateUser} className="admin-form-row">
          <input 
            type="text" 
            placeholder="Usuário (ex: marcos)" 
            value={newUserEmail}
            onChange={e => setNewUserEmail(e.target.value)}
            className="admin-input"
            required
          />
          <input 
            type="text" 
            placeholder="Senha" 
            value={newUserPass}
            onChange={e => setNewUserPass(e.target.value)}
            className="admin-input"
            required
          />
          <button type="submit" className="admin-btn" disabled={loading}>Criar</button>
        </form>
      </div>

      <div className="admin-card">
        <h3>Lista de Usuários ({users.length})</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID / Email</th>
              <th>Criado em</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>
                  <strong>{u.email?.split('@')[0]}</strong><br/>
                  <span style={{fontSize: '0.8rem', color: '#666'}}>{u.id}</span>
                </td>
                <td>{new Date(u.created_at).toLocaleDateString()}</td>
                <td>
                  {editingUserId === u.id ? (
                    <div className="admin-action-row">
                      <input 
                        type="text" 
                        placeholder="Nova senha" 
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className="admin-input-small"
                      />
                      <button onClick={() => handleChangePassword(u.id)} className="admin-btn-small" disabled={loading}>Salvar</button>
                      <button onClick={() => setEditingUserId(null)} className="admin-btn-small danger">X</button>
                    </div>
                  ) : (
                    <div className="admin-action-row">
                      <button onClick={() => { setEditingUserId(u.id); setNewPassword(''); }} className="admin-btn-small">Trocar Senha</button>
                      <button onClick={() => handleDeleteUser(u.id)} className="admin-btn-small danger" disabled={loading}>Deletar</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <style>{styles}</style>
    </div>
  );
};

const styles = `
  .admin-container {
    background: #f4f4f9;
    color: #333;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    padding: 20px;
    border-radius: 8px;
    height: 100%;
    overflow-y: auto;
  }
  .admin-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    border-bottom: 2px solid #ddd;
    padding-bottom: 10px;
  }
  .admin-container h2, .admin-container h3 {
    margin: 0;
    color: #222;
  }
  .admin-card {
    background: white;
    padding: 15px;
    border-radius: 6px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    margin-bottom: 20px;
  }
  .admin-form {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 400px;
    margin-top: 15px;
  }
  .admin-form-row {
    display: flex;
    gap: 10px;
    margin-top: 10px;
  }
  .admin-input {
    padding: 8px 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
    flex-grow: 1;
  }
  .admin-input-small {
    padding: 4px 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 12px;
    width: 100px;
  }
  .admin-btn {
    background: #0066cc;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
  }
  .admin-btn:hover { background: #0055aa; }
  .admin-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  
  .admin-btn-logout {
    background: #444;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .admin-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
  }
  .admin-table th, .admin-table td {
    text-align: left;
    padding: 10px;
    border-bottom: 1px solid #eee;
  }
  .admin-table th {
    background: #f8f8f8;
    font-weight: 600;
  }
  .admin-action-row {
    display: flex;
    gap: 5px;
  }
  .admin-btn-small {
    background: #e0e0e0;
    border: 1px solid #ccc;
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
  }
  .admin-btn-small:hover { background: #d0d0d0; }
  .admin-btn-small.danger {
    background: #ffecec;
    color: #cc0000;
    border-color: #ffcccc;
  }
  .admin-btn-small.danger:hover {
    background: #ffdddd;
  }
  .admin-error {
    background: #ffeeee;
    color: #cc0000;
    padding: 10px;
    border-radius: 4px;
    margin: 10px 0;
    border-left: 4px solid #cc0000;
  }
`;
