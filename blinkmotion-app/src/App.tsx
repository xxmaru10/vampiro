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

  const { currentPath, logs, isProcessing, executeCommand, commands } = useTerminalNavigation();

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
        <MainDisplay />
        
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
