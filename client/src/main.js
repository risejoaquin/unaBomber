import Phaser from 'phaser'; // ¡Esta debe seguir comentada!
import BootScene from './scenes/BootScene.js';
import GameScene from './scenes/GameScene.js';

// --- CONFIGURACIÓN DIMENSIONES DEL JUEGO ---
// Dimensiones de tu mapa en Tiled (en tiles)
const TILE_MAP_WIDTH = 25;
const TILE_MAP_HEIGHT = 25;
const TILE_SIZE = 16; // Tamaño de cada tile en píxeles
const SCALE_FACTOR = 3; // El factor de escala que aplicas en GameScene.js para los gráficos

// Calcular el tamaño deseado para la ventana del juego
// para que coincida exactamente con el mapa escalado
const gameWidth = TILE_MAP_WIDTH * TILE_SIZE * SCALE_FACTOR;
const gameHeight = TILE_MAP_HEIGHT * TILE_SIZE * SCALE_FACTOR;

const config = {
    type: Phaser.AUTO,
    // Establecer el ancho y alto del juego para que coincidan con el mapa escalado
    width: gameWidth,
    height: gameHeight,
    parent: 'game-container', // ID del div en index.html donde se renderizará el juego
    pixelArt: true, // Asegura que los gráficos de baja resolución se vean nítidos
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, // No hay gravedad en un juego top-down
            debug: false // Ponlo en true para ver las cajas de colisión (muy útil para depurar)
        }
    },
    scene: [BootScene, GameScene], // Las escenas de tu juego
    scale: {
        mode: Phaser.Scale.FIT, // Ajusta la ventana del juego a la pantalla del navegador manteniendo la relación de aspecto
        autoCenter: Phaser.Scale.CENTER_BOTH, // Centra el juego horizontal y verticalmente en la pantalla
    }
};

new Phaser.Game(config);