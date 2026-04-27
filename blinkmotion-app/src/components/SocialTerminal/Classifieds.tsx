import React, { useState } from 'react';

export const Classifieds: React.FC = () => {
  const [code, setCode] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Código de acesso padrão: SOMBRA (pode ser alterado depois)
    if (code.toUpperCase() === 'SOMBRA') {
      setAuthorized(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  if (!authorized) {
    return (
      <div className="access-prompt">
        <div className="security-header">
          <span className="warning-icon">[!]</span>
          <h2 className="glitch-text" data-text="ACESSO RESTRITO">ACESSO RESTRITO</h2>
          <span className="warning-icon">[!]</span>
        </div>
        
        <p className="instruction">ESTA ÁREA REQUER DECRIPTOGRAFIA DE NÍVEL 4</p>
        
        <form onSubmit={handleSubmit} className="code-form">
          <label htmlFor="access-code">INSIRA O CÓDIGO DE ACESSO:</label>
          <div className="input-wrapper">
            <span className="cursor-prefix">{'>'}</span>
            <input 
              id="access-code"
              type="password" 
              value={code} 
              onChange={e => setCode(e.target.value)}
              className="code-input"
              autoFocus
              placeholder="****"
            />
          </div>
          {error && <p className="error-msg">ALERTA: CÓDIGO INVÁLIDO. TENTATIVA REGISTRADA NO LOG DO SISTEMA.</p>}
          <button type="submit" style={{ display: 'none' }}>ENTER</button>
        </form>

        <div className="security-footer">
          LOCALIZANDO IP... [ OK ]<br />
          VARRENDO NODOS... [ OK ]
        </div>

        <style>{`
          .access-prompt {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            color: #00ff00;
            font-family: 'VT323', monospace;
            padding: 20px;
            text-align: center;
          }
          .security-header {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 20px;
          }
          .warning-icon {
            font-size: 1.2rem;
            color: #00ff00;
          }
          .glitch-text {
            color: #00ff00;
            font-size: 1.8rem;
            letter-spacing: 4px;
            margin: 0;
            text-shadow: 2px 2px #000;
          }
          .instruction {
            color: #00ff0088;
            font-size: 0.9rem;
            margin-bottom: 30px;
            letter-spacing: 2px;
          }
          .code-form {
            display: flex;
            flex-direction: column;
            gap: 15px;
            width: 100%;
            max-width: 300px;
          }
          .input-wrapper {
            display: flex;
            align-items: center;
            background: #000;
            border: 1px solid #00ff0044;
            padding: 5px 15px;
          }
          .cursor-prefix {
            margin-right: 10px;
            font-size: 1.2rem;
          }
          .code-input {
            background: transparent;
            border: none;
            color: #00ff00;
            font-family: 'VT323', monospace;
            font-size: 1.5rem;
            width: 100%;
            outline: none;
            letter-spacing: 10px;
          }
          .error-msg {
            color: #00ff00;
            font-size: 0.8rem;
            background: rgba(0, 255, 0, 0.1);
            padding: 10px;
            border: 1px solid rgba(0, 255, 255, 0.3);
          }
          .security-footer {
            margin-top: 40px;
            font-size: 0.7rem;
            color: #00ff0033;
            line-height: 1.5;
            text-align: left;
            align-self: flex-start;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="classifieds-content">
      <div className="header">
        <h2 style={{ letterSpacing: 5, margin: 0 }}>▓▓ CLASSIFICADOS_REDE_SHADOW ▓▓</h2>
        <div style={{ fontSize: '0.7rem', color: '#00ff0044', marginTop: 4 }}>
          DECRIPTOGRAFIA_SUCEDIDA // ACESSO_AUTORIZADO
        </div>
      </div>

      <div className="list-container">
        <div className="item-card">
          <div className="item-header">
            <span className="item-price">[ 5000 CR ]</span>
            <span className="item-title">SOFTWARE_DE_BYPASS_ICE_v3.2</span>
          </div>
          <div className="item-desc">
            Ferramenta avançada para contornar protocolos de segurança corporativos.
          </div>
        </div>

        <div className="item-card">
          <div className="item-header">
            <span className="item-price">[ 12000 CR ]</span>
            <span className="item-title">CHASSI_CIBERNÉTICO_MILITAR</span>
          </div>
          <div className="item-desc">
            Peça de reposição rara obtida em depósitos da Militech. Condição: Pouco uso.
          </div>
        </div>

        <div className="empty-state">
           [ MAIS_ITENS_EM_BREVE_-_AGUARDANDO_SINCRONIZAÇÃO_COM_O_MERCADO ]
        </div>
      </div>

      <style>{`
        .classifieds-content {
          color: #00ff00;
          font-family: 'VT323', monospace;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .header {
          border-bottom: 2px solid #00ff0033;
          padding-bottom: 15px;
          margin-bottom: 20px;
        }
        .list-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .item-card {
          border: 1px solid #00ff0022;
          background: #050505;
          padding: 12px;
          transition: all 0.2s;
          cursor: pointer;
        }
        .item-card:hover {
          border-color: #00ff00;
          background: #001100;
          transform: translateX(5px);
        }
        .item-header {
          display: flex;
          justify-content: space-between;
          font-weight: bold;
          font-size: 1.1rem;
          margin-bottom: 5px;
        }
        .item-price {
          color: #ccffcc;
        }
        .item-desc {
          color: #00ff00aa;
          font-size: 0.85rem;
          line-height: 1.4;
        }
        .empty-state {
          text-align: center;
          padding: 30px;
          color: #00ff0022;
          letter-spacing: 3px;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
};
