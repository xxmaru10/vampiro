import { useState } from 'react';

export type TerminalCommand = {
  id: string;
  label: string;
  path: string;
  adminOnly?: boolean;
};

const COMMANDS: Record<string, TerminalCommand> = {
  '0': { id: 'notifications', label: 'NOTIFICAÇÕES', path: '/NOTIFICATIONS' },
  '1': { id: 'feed', label: 'FEED', path: '/LOCAL_BROADCAST' },
  '2': { id: 'messages', label: 'MENSAGENS', path: '/SECURE_COMMS' },
  '3': { id: 'blackmarket', label: 'CLASSIFICADOS', path: '/CLASSIFIEDS' },
  '4': { id: 'disconnect', label: 'DESCONECTAR', path: '/TERMINATING_SESSION...' },
  '5': { id: 'admin', label: 'ADMINISTRAÇÃO', path: '/ROOT_ACCESS', adminOnly: true },
};

export const useTerminalNavigation = (userEmail?: string) => {
  const [currentPath, setCurrentPath] = useState("/LOCAL_BROADCAST");
  const [logs, setLogs] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Filtra os comandos visíveis baseados no papel do usuário
  const isAdmin = userEmail === 'admin@blinkmotion.com';
  
  const availableCommands = Object.entries(COMMANDS).filter(
    ([, cmd]) => !cmd.adminOnly || isAdmin
  );

  const availableCommandsMap = Object.fromEntries(availableCommands);

  const executeCommand = (input: string) => {
    const cmd = availableCommandsMap[input.trim()];
    
    if (cmd) {
      setIsProcessing(true);
      setLogs([]);
      
      const newLogs = [
        `> Requesting access to ${cmd.label}...`,
        `> Origin: ${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.1.12`,
        `> Bypassing security node ${Math.random().toString(16).substring(2, 8).toUpperCase()}...`,
        `> Connection established.`,
        `> Navigating to ${cmd.path}`
      ];

      // Simulate log stream
      newLogs.forEach((log, index) => {
        setTimeout(() => {
          setLogs(prev => [...prev, log]);
          if (index === newLogs.length - 1) {
            setCurrentPath(cmd.path);
            setIsProcessing(false);
          }
        }, (index + 1) * 300);
      });
    } else {
      setLogs(prev => [...prev, `> Unknown command: ${input}`]);
    }
  };

  return {
    currentPath,
    logs,
    isProcessing,
    executeCommand,
    commands: availableCommands.map(([key, cmd]) => ({ key, ...cmd }))
  };
};
