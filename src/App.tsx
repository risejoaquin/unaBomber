import React, { useState } from 'react';
import { useAuth } from './core/auth/AuthContext';
import { LoginPage } from './ui/components/LoginPage';
import { MainMenu } from './ui/components/MainMenu';
import { GamePage } from './ui/components/GamePage';

function App() {
  const { user, loading } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [difficulty, setDifficulty] = useState('easy');

  if (loading) {
    return (
      <div style={{
        height: '100vh', backgroundColor: '#0b0c15', color: 'white',
        display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'monospace'
      }}>
        CARGANDO SISTEMAS...
      </div>
    );
  }

  // 1. Si no hay usuario -> Login Screen
  if (!user) {
    return <LoginPage />;
  }

  // 2. Si hay usuario y dio 'Jugar' -> Juego
  if (isPlaying) {
    return (
      <GamePage
        difficulty={difficulty}
        onExit={() => setIsPlaying(false)}
      />
    );
  }

  // 3. Si hay usuario pero no juega -> Menú Principal
  return (
    <MainMenu
      onStartGame={(diff) => {
        setDifficulty(diff);
        setIsPlaying(true);
      }}
    />
  );
}

export default App;