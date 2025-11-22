import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import GameScene from './scenes/GameScene.js';

// Configuración de dimensiones base para un mapa de 13x11 tiles de 16x16px con un factor de escala de 3.
// Esto asegura que la ventana del juego se ajuste al mapa con el escalado.
const MAP_WIDTH_TILES = 13;
const MAP_HEIGHT_TILES = 11;
const TILE_SIZE = 16;
const SCALE_FACTOR = 3;

const config = {
    type: Phaser.AUTO,
    width: MAP_WIDTH_TILES * TILE_SIZE * SCALE_FACTOR,
    height: MAP_HEIGHT_TILES * TILE_SIZE * SCALE_FACTOR,
    pixelArt: true, // Crucial para mantener la nitidez de los gráficos pixel art
    physics: {
        default: 'arcade',
        arcade: {
            // debug: true, // Descomentar para ver las hitboxes de física (muy útil para depurar)
            gravity: { y: 0 } // Deshabilita la gravedad vertical para un juego tipo Bomberman
        }
    },
    scene: [BootScene, GameScene] // Define la secuencia de las escenas del juego
};

new Phaser.Game(config);