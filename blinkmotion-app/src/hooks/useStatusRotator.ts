import { useState, useEffect } from 'react';

const STATIC_MESSAGES = [
  "segurança mantida",
  "criptografia reescrita",
  "mudando localização",
  "carregando vias",
  "checando criptografia",
  "criptografia concluída"
];

export const useStatusRotator = () => {
  const [currentMessage, setCurrentMessage] = useState("");

  useEffect(() => {
    const rotate = () => {
      const isRandomAccess = Math.random() > 0.7;
      
      if (isRandomAccess) {
        const attempts = Math.floor(Math.random() * 45) + 1;
        setCurrentMessage(`tentativas de acesso restrito (${attempts}/45)`);
      } else {
        const randomIndex = Math.floor(Math.random() * STATIC_MESSAGES.length);
        setCurrentMessage(STATIC_MESSAGES[randomIndex]);
      }
    };

    rotate();
    const interval = setInterval(rotate, 3000);
    return () => clearInterval(interval);
  }, []);

  return currentMessage;
};
