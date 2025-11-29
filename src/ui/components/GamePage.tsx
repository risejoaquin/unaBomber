import React, { useEffect, useRef } from 'react';
import startGame from '../../game/PhaserGame';
import { useAuth } from '../../core/auth/AuthContext'; // Importar useAuth

interface Props { difficulty: string; onExit: () => void; }

export const GamePage: React.FC<Props> = ({ difficulty, onExit }) => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const initialized = useRef(false); // Mantenemos el flag para asegurar la inicialización única
  const { addSessionXP } = useAuth(); // Obtener la función de XP

  useEffect(() => {
    // CORRECCIÓN DE SINCRONIZACIÓN: Esperar explícitamente a que el contenedor esté en el DOM.
    const container = document.getElementById('phaser-container');

    if (container && !initialized.current) {
      // Pasar la función de XP como dato de inicialización
      gameRef.current = startGame('phaser-container', difficulty, { addSessionXP });
      initialized.current = true;
    }

    return () => {
      // Lógica de limpieza cuando el componente se desmonta
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
      initialized.current = false;
    };
  }, [difficulty, addSessionXP]); // Las dependencias son correctas

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: '100vh', width: '100vw', background: '#111', overflow: 'hidden'
    }}>
      {/* HUD */}
      <div style={{
        position: 'absolute', top: '20px', zIndex: 10, width: '100%', maxWidth: '800px',
        display: 'flex', justifyContent: 'space-between', padding: '0 20px', pointerEvents: 'none'
      }}>
        <div style={{ background: 'rgba(0,0,0,0.8)', padding: '8px 20px', borderRadius: '4px', border: '1px solid #05d9e8', color: '#fff', fontFamily: 'monospace' }}>
          <span style={{ color: '#05d9e8' }}>MODO:</span> {difficulty.toUpperCase()}
        </div>
        <button onClick={onExit} className="cyber-btn danger" style={{ padding: '8px 20px', fontSize: '0.8rem', pointerEvents: 'auto' }}>
          SALIR
        </button>
      </div>

      {/* CONTENEDOR JUEGO: Se mantiene el ID para que el useEffect lo encuentre */}
      <div
        id="phaser-container"
        style={{
          width: '800px', height: '608px', border: '3px solid #333',
          boxShadow: '0 0 30px rgba(0,0,0,0.7)', backgroundColor: '#000',
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}
      />
    </div>
  );
};