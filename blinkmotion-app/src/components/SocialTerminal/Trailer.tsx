import React from 'react';

export const Trailer: React.FC = () => {
  return (
    <div className="trailer-container">
      <div className="trailer-header">
        <span className="blink-dot"></span>
        ▓▓ TRANSMISSÃO_DE_ARQUIVO // TRAILER.MP4 ▓▓
      </div>
      
      <div className="video-wrapper">
        <video 
          width="100%" 
          height="auto" 
          controls 
          autoPlay 
          style={{ border: '1px solid #00ff0044', boxShadow: '0 0 20px rgba(0, 255, 0, 0.1)' }}
        >
          <source src="https://drive.google.com/uc?export=download&id=1ntIUwZV649X-8svwVF34zwGmerSoNQDS" type="video/mp4" />
          Seu navegador não suporta a tag de vídeo.
        </video>
      </div>

      <div className="trailer-footer">
        [!] TRANSMISSÃO VIA GOOGLE_DRIVE_SERVER // STATUS: CONECTADO
      </div>

      <style>{`
        .trailer-container {
          display: flex;
          flex-direction: column;
          gap: 15px;
          color: #00ff00;
          font-family: 'VT323', monospace;
        }
        .trailer-header {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 1.1rem;
          letter-spacing: 2px;
          border-bottom: 1px solid #00ff0033;
          padding-bottom: 10px;
        }
        .blink-dot {
          width: 8px;
          height: 8px;
          background: #ff0000;
          border-radius: 50%;
          animation: pulse 1s infinite alternate;
        }
        @keyframes pulse { from { opacity: 0.4; } to { opacity: 1; } }
        .video-wrapper {
          background: #000;
          padding: 5px;
        }
        .trailer-footer {
          font-size: 0.75rem;
          color: #00ff0044;
          text-align: center;
          letter-spacing: 1px;
        }
      `}</style>
    </div>
  );
};
