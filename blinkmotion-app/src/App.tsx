import { useState } from 'react';
import { useBlinkAuth } from './hooks/useBlinkAuth';

function App() {
  const { user, login, register, logout, isAuthenticated, loading, error } = useBlinkAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    try {
      if (isRegistering) {
        await register(email, password);
        setSuccessMsg('CONTA CRIADA. REALIZE O LOGIN.');
        setIsRegistering(false);
      } else {
        await login(email, password);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="terminal-container">
        <div className="terminal-box">
          <div className="terminal-title">INICIALIZANDO...</div>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="terminal-container">
        <div className="terminal-box">
          <div className="ascii-logo">
{` ██████╗ ██╗     ██╗███╗   ██╗██╗  ██╗███╗   ███╗ ██████╗ ████████╗██╗ ██████╗ ███╗   ██╗
 ██╔══██╗██║     ██║████╗  ██║██║ ██╔╝████╗ ████║██╔═══██╗╚══██╔══╝██║██╔═══██╗████╗  ██║
 ██████╔╝██║     ██║██╔██╗ ██║█████╔╝ ██╔████╔██║██║   ██║   ██║   ██║██║   ██║██╔██╗ ██║
 ██╔══██╗██║     ██║██║╚██╗██║██╔═██╗ ██║╚██╔╝██║██║   ██║   ██║   ██║██║   ██║██║╚██╗██║
 ██████╔╝███████╗██║██║ ╚████║██║  ██╗██║ ╚═╝ ██║╚██████╔╝   ██║   ██║╚██████╔╝██║ ╚████║
 ╚══════╝╚══════╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝     ╚═╝ ╚═════╝    ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝`}
          </div>
          <h2 className="terminal-title">ACESSO CONCEDIDO</h2>
          <div className="terminal-footer">
            BEM-VINDO, {user?.email?.split('@')[0].toUpperCase()}.<br />
            STATUS: CONECTADO À REDE BLiNKMOTiON.<br /><br />
            [ REDE SOCIAL EM DESENVOLVIMENTO ]
          </div>
          <button className="btn-terminal" onClick={logout} style={{ width: 'auto', padding: '10px 40px', marginTop: '40px' }}>
            desconectar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="terminal-container">
      <div className="terminal-box">
        <div className="ascii-logo">
{` ██████╗ ██╗     ██╗███╗   ██╗██╗  ██╗███╗   ███╗ ██████╗ ████████╗██╗ ██████╗ ███╗   ██╗
 ██╔══██╗██║     ██║████╗  ██║██║ ██╔╝████╗ ████║██╔═══██╗╚══██╔══╝██║██╔═══██╗████╗  ██║
 ██████╔╝██║     ██║██╔██╗ ██║█████╔╝ ██╔████╔██║██║   ██║   ██║   ██║██║   ██║██╔██╗ ██║
 ██╔══██╗██║     ██║██║╚██╗██║██╔═██╗ ██║╚██╔╝██║██║   ██║   ██║   ██║██║   ██║██║╚██╗██║
 ██████╔╝███████╗██║██║ ╚████║██║  ██╗██║ ╚═╝ ██║╚██████╔╝   ██║   ██║╚██████╔╝██║ ╚████║
 ╚══════╝╚══════╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝     ╚═╝ ╚═════╝    ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝`}
        </div>
        
        <h2 className="terminal-title">{isRegistering ? 'REGISTRO DE ACESSO' : 'TERMINAL DE ACESSO'}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="terminal-prompt">
            <input 
              type="email" 
              className="terminal-input" 
              placeholder="USUARIO (EMAIL)" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="terminal-prompt">
            <input 
              type="password" 
              className="terminal-input" 
              placeholder="SENHA" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          
          <button type="submit" className="btn-terminal" disabled={loading}>
            {loading ? 'PROCESSANDO...' : isRegistering ? 'registrar' : 'conectar'}
          </button>
        </form>

        {error && <div className="terminal-error">ERRO: {error}</div>}
        {successMsg && <div className="terminal-success">{successMsg}</div>}

        <div className="terminal-footer">
          <a href="#" onClick={(e) => { e.preventDefault(); setIsRegistering(!isRegistering); }} style={{ color: '#00ff00' }}>
            {isRegistering ? '[ VOLTAR AO LOGIN ]' : '[ SOLICITAR NOVO ACESSO ]'}
          </a>
        </div>
      </div>
    </div>
  );
}

export default App;
