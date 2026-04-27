import React, { useState, useRef, useEffect } from 'react';

interface CommandConsoleProps {
  currentPath: string;
  logs: string[];
  onExecute: (cmd: string) => void;
  isProcessing: boolean;
}

export const CommandConsole: React.FC<CommandConsoleProps> = ({ 
  currentPath, 
  logs, 
  onExecute,
  isProcessing 
}) => {
  const [input, setInput] = useState("");
  const logEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isProcessing) {
      onExecute(input);
      setInput("");
    }
  };

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="console-wrapper">
      <div className="path-line">{currentPath}</div>
      <div className="logs-area">
        {logs.map((log, i) => (
          <div key={i} className="log-entry">{log}</div>
        ))}
        <div ref={logEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="command-form">
        <label htmlFor="terminal-input" className="command-label">command:</label>
        <input
          id="terminal-input"
          type="text"
          autoFocus
          autoComplete="off"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isProcessing}
          className="command-input"
        />
      </form>

      <style>{`
        .console-wrapper {
          padding: 16px;
          background: rgba(0, 0, 0, 0.9);
          border: 1px solid #00ff0033;
          margin: 0 16px;
          min-height: 150px;
          display: flex;
          flex-direction: column;
        }
        .path-line {
          color: #00ff00;
          font-weight: bold;
          margin-bottom: 10px;
          font-family: 'VT323', monospace;
        }
        .logs-area {
          flex-grow: 1;
          margin-bottom: 15px;
          max-height: 100px;
          overflow-y: auto;
          scrollbar-width: none;
        }
        .log-entry {
          color: #00ff00aa;
          font-size: 0.85rem;
          margin-bottom: 2px;
          font-family: 'VT323', monospace;
        }
        .command-form {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .command-label {
          color: #00ff00;
          font-family: 'VT323', monospace;
        }
        .command-input {
          background: transparent;
          border: none;
          color: #00ff00;
          outline: none;
          font-family: 'VT323', monospace;
          font-size: 1rem;
          flex-grow: 1;
        }
      `}</style>
    </div>
  );
};
