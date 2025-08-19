import { ChatInterface } from './components/chat/chat-interface.tsx';

interface AppProps {
  demoMode?: boolean;
}

export function App({ demoMode = false }: AppProps) {
  return <ChatInterface demoMode={demoMode} />;
}
