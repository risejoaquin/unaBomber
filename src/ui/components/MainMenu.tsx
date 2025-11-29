import React, { useState } from 'react';
import { useAuth } from '../../core/auth/AuthContext';
import { ProfileCard } from './ProfileCard';
import { HourlyReward } from './HourlyReward';
import { Leaderboard } from './Leaderboard';

interface Props { onStartGame: (diff: string) => void; }

export const MainMenu: React.FC<Props> = ({ onStartGame }) => {
  const { profile, logout, linkGoogleAccount, updateUsername } = useAuth();

  // CORRECCIÓN UX: Iniciar el alias como cadena vacía para que actúe como placeholder.
  const [nickname, setNickname] = useState('');

  if (!profile) return <div style={{ color: 'white', padding: '20px' }}>Cargando perfil...</div>;

  const handleStartGame = async (diff: string) => {
    // Si el campo nickname no está vacío, actualizar el nombre de usuario (alias guardado).
    if (nickname && nickname.length >= 2 && nickname !== profile.username) {
      await updateUsername(nickname);
    }
    onStartGame(diff);
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)' }}>

      {/* HEADER CORREGIDO: Estilo barra roja gótica */}
      <header style={{
        padding: '15px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'var(--gothic-accent)', // Color Rojo Oscuro
        boxShadow: '0 2px 10px rgba(0,0,0,0.5)'
      }}>
        <div className="font-retro" style={{ fontSize: '1.2rem', color: 'var(--gothic-gold)' }}>
          <span style={{ color: 'var(--gothic-gold)' }}>UNA</span>BOMBER
        </div>
        <button
          onClick={logout}
          style={{ padding: '8px 15px', fontSize: '0.9rem', marginBottom: 0, background: 'var(--gothic-dark-color)', color: '#fff', border: '1px solid var(--gothic-border)' }}
        >
          SALIR
        </button>
      </header>

      {/* CONTENIDO PRINCIPAL - GRID LAYOUT */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '40px', gap: '30px' }}>

        {/* COLUMNA IZQUIERDA: PERFIL Y OFERTAS */}
        <div style={{ width: '350px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* ProfileCard mantiene su estilo dark interno */}
          <ProfileCard />
          {/* HourlyReward se corrige para usar el tema oscuro */}
          <HourlyReward />

          {/* Caja de vinculación si es anónimo */}
          {profile.isAnonymous && (
            <div className="glass-panel" style={{ padding: '15px', border: '2px dashed var(--gothic-accent)' }}>
              <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#ccc' }}>⚠️ Cuenta de invitado. ¡Guarda tu progreso!</p>
              <button
                onClick={linkGoogleAccount}
                className="cyber-btn google"
                style={{ width: '100%', padding: '8px', marginBottom: 0 }}
              >
                Vincular con Google
              </button>
            </div>
          )}
        </div>

        {/* COLUMNA CENTRAL: JUGAR (Aplica glass-panel) */}
        <div className="glass-panel" style={{ width: '400px', padding: '30px', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--gothic-gold)', marginBottom: '20px', textShadow: '0 0 5px rgba(199, 164, 110, 0.4)' }}>JUGAR AHORA</h2>

          <input
            type="text"
            placeholder="Ingresa tu Alias (Mín. 2 caracteres)" // CORRECCIÓN UX: Placeholder
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="cyber-input"
            style={{ marginBottom: '20px' }}
          />

          <button
            onClick={() => handleStartGame('easy')}
            disabled={nickname.length < 2}
            className="cyber-btn"
            style={{
              width: '100%', padding: '20px 15px',
              fontSize: '1.2rem',
              boxShadow: '0 4px 0 #5e4719'
            }}
          >
            PLAY (HISTORIA)
          </button>

          <button
            onClick={() => handleStartGame('hard')}
            disabled={nickname.length < 2}
            className="cyber-btn primary"
            style={{
              width: '100%', padding: '10px',
              fontSize: '0.9rem',
              boxShadow: '0 4px 0 #9a2020'
            }}
          >
            MODO HARDCORE
          </button>
        </div>

        {/* COLUMNA DERECHA: LEADERBOARD (Aplica glass-panel) */}
        <div className="glass-panel" style={{ width: '300px', padding: '20px', minHeight: '200px' }}>
          <Leaderboard />
        </div>

      </div>
    </div>
  );
};