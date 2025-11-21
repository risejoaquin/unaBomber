// client/src/main.js
import { BootScene } from './scenes/BootScene.js';
import { GameScene } from './scenes/GameScene.js';

// --- CONFIGURACIÓN PRINCIPAL DE PHASER ---
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#0a0a12', // Color de fondo oscuro
    parent: 'game-container',
    pixelArt: true, // Vital para que los sprites no se vean borrosos al escalar
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, // Top-down, sin gravedad
            debug: false // Cambia a true si quieres ver las cajas de colisión rojas/azules
        }
    },
    // Importante: El orden importa. BootScene va primero.
    scene: [BootScene, GameScene]
};

// Iniciar el juego
const game = new Phaser.Game(config);