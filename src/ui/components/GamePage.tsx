import React, { useEffect, useRef } from "react";
import Phaser from "phaser";
// Ajusta esta ruta si tu GameScene no está exactamente en el path ../../game/scenes/GameScene
import { GameScene } from "../../game/scenes/GameScene";

interface GamePageProps {
  difficulty: string;
  onExit: () => void;
}

export const GamePage: React.FC<GamePageProps> = ({ difficulty, onExit }) => {
  const phaserRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!phaserRef.current && containerRef.current) {
      console.log("[GamePage] Inicializando Phaser…");

      // 1. CONFIGURACIÓN DEL JUEGO CON LA CLASE DE ESCENA
      const game = new Phaser.Game({
        type: Phaser.AUTO,
        width: 960,
        height: 720,
        parent: containerRef.current,
        backgroundColor: "#000000",
        physics: {
          default: "arcade",
          arcade: { debug: false },
        },
        // Usar la clase GameScene, no una instancia (crucial para scene.start)
        scene: [GameScene],
      });

      // 2. ✅ MODIFICACIÓN: FORZAR EL INICIO EN NIVEL 3
      game.scene.start('GameScene', {
        difficulty: difficulty,
        level: 3
      });

      phaserRef.current = game;
    }

    return () => {
      if (phaserRef.current) {
        console.log("[GamePage] Destruyendo Phaser…");
        phaserRef.current.destroy(true);
        phaserRef.current = null;
      }
    };
  }, [difficulty]);

  return (
    <div style={{ width: "100%", height: "100vh", background: "#0b0c15" }}>
      {/* Contenedor del juego */}
      <div
        ref={containerRef}
        id="phaser-container"
        style={{ width: "100%", height: "100%" }}
      />

      {/* Botón salir */}
      <button
        onClick={onExit}
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          background: "#8c0000",
          color: "white",
          border: "none",
          padding: "12px 18px",
          fontFamily: "monospace",
          borderRadius: "6px",
          cursor: "pointer",
          zIndex: 20,
        }}
      >
        SALIR
      </button>
    </div>
  );
};