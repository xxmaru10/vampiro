import { useState, useEffect } from 'react';
import { useBlinkAuth } from './hooks/useBlinkAuth';
import { StatusHeader } from './components/SocialTerminal/StatusHeader';
import { NavigationMenu } from './components/SocialTerminal/NavigationMenu';
import { CommandConsole } from './components/SocialTerminal/CommandConsole';
import { MainDisplay } from './components/SocialTerminal/MainDisplay';
import { useTerminalNavigation } from './hooks/useTerminalNavigation';

function App() {
  const { user, login, register, logout, isAuthenticated, loading, error } = useBlinkAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const { currentPath, logs, isProcessing, executeCommand, commands } = useTerminalNavigation(user?.email);

  // Load saved email
  useEffect(() => {
    const savedEmail = localStorage.getItem('blink_remember_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Watch for disconnect command
  useEffect(() => {
    if (currentPath === '/TERMINATING_SESSION...') {
      const timer = setTimeout(() => {
        logout();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentPath, logout]);

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
        if (rememberMe) {
          localStorage.setItem('blink_remember_email', email);
        } else {
          localStorage.removeItem('blink_remember_email');
        }
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
      <div className="social-terminal-layout">
        <StatusHeader />
        <NavigationMenu items={commands} />
        <CommandConsole 
          currentPath={currentPath}
          logs={logs}
          onExecute={executeCommand}
          isProcessing={isProcessing}
        />
        <MainDisplay currentPath={currentPath} />
        
        <style>{`
          .social-terminal-layout {
            min-height: 100vh;
            background-color: #000;
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }
        `}</style>
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
              type="text" 
              className="terminal-input" 
              placeholder="USUARIO" 
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
          
          <div className="terminal-prompt checkbox-prompt">
            <input 
              type="checkbox" 
              id="remember" 
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="remember">SALVAR_LOGIN_NA_SESSION</label>
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
        <style>{`
          .checkbox-prompt {
            margin: 15px 0;
            display: flex;
            align-items: center;
            gap: 10px;
            color: #00ff00;
            font-family: 'VT323', monospace;
            cursor: pointer;
            border-bottom: none !important;
          }
          .checkbox-prompt::before {
            content: "[ ]" !important;
            font-size: 1.2rem;
          }
          .checkbox-prompt:has(input:checked)::before {
            content: "[X]" !important;
          }
          .checkbox-prompt input {
            opacity: 0;
            position: absolute;
            cursor: pointer;
          }
          .checkbox-prompt label {
            cursor: pointer;
            font-size: 1.1rem;
            margin-top: 2px;
          }
        `}</style>
      </div>
    </div>
  );
}

export default App;
