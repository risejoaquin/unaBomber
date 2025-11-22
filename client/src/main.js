import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import GameScene from './scenes/GameScene.js';

// --- CONSTANTES GLOBALES DEL JUEGO ---
// Define el tamaño de cada tile y las dimensiones de tu mapa en Tiled (en número de tiles)
const TILE_SIZE = 16; // Tamaño base de cada tile en píxeles (¡Muy importante que coincida con tus tiles!)
const MAP_WIDTH_TILES = 30; // <--- ¡VERIFICA ESTO! Ancho de tu mapa en Tiled (en número de tiles)
const MAP_HEIGHT_TILES = 20; // <--- ¡VERIFICA ESTO! Alto de tu mapa en Tiled (en número de tiles)

// Calcula el ancho y alto TOTAL del canvas del juego en PÍXELES
const GAME_WIDTH = MAP_WIDTH_TILES * TILE_SIZE;
const GAME_HEIGHT = MAP_HEIGHT_TILES * TILE_SIZE;

// --- Configuración Principal de Phaser ---
const config = {
    type: Phaser.AUTO, // Phaser intentará usar WebGL, y si no, Canvas
    width: GAME_WIDTH, // Ancho del canvas del juego
    height: GAME_HEIGHT, // Alto del canvas del juego
    parent: 'game-container', // El ID del elemento HTML (div) donde se inyectará el canvas de Phaser
    pixelArt: true, // ¡Importante para mantener la nitidez en juegos pixel art!
    physics: {
        default: 'arcade', // Usamos el sistema de físicas Arcade (ligero y rápido)
        arcade: {
            gravity: { y: 0 }, // No hay gravedad en un juego top-down como Bomberman
            debug: true // Muestra los cuerpos de colisión (cámbialo a 'false' para la versión final)
        }
    },
    // Definición de las escenas del juego y su orden de carga
    scene: [
        BootScene, // Se carga primero para pre-cargar los assets
        GameScene  // La escena principal del juego
    ]
};

// --- Inicialización del Juego ---
const game = new Phaser.Game(config);

// --- Exportación de Constantes ---
// Esto permite que otras clases (como Player, Bomb, etc.) accedan a estas constantes
// sin tener que definirlas de nuevo o "hardcodearlas".
export { TILE_SIZE, MAP_WIDTH_TILES, MAP_HEIGHT_TILES };