import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import GameScene from './scenes/GameScene.js';

// Configuración de dimensiones base (16x16 tiles * 13x11 mapa * 3x escala)
const config = {
    type: Phaser.AUTO,
    width: 13 * 16 * 3,
    height: 11 * 16 * 3,
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            // debug: true, // Útil para ver hitboxes (descomenta si lo necesitas)
            gravity: { y: 0 }
        }
    },
    scene: [BootScene, GameScene]
};

const game = new Phaser.Game(config);