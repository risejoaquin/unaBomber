import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // --- CARGA DEL MAPA TILEMAP (JSON) ---
        this.load.tilemapTiledJSON('map_level1', 'assets/maps/level1.json');

        // --- CARGA DE LA IMAGEN DEL TILESET ---
        // 'tileset_main' es la KEY que usaremos en GameScene.js para el addTilesetImage
        // 'assets/tilesets/0x72_DungeonTilesetII_v1.7.png' es la RUTA REAL a tu imagen PNG
        this.load.image('tileset_main', 'assets/tilesets/0x72_DungeonTilesetII_v1.7.png');

        // --- CARGA DE LA HOJA DE SPRITES DEL JUGADOR ---
        // 'player_sprite' es la KEY para el jugador
        // 'assets/sprites/player.png' es la RUTA a la imagen del jugador
        // { frameWidth: 16, frameHeight: 16 } son las dimensiones de CADA FRAME del jugador
        // ASEGÚRATE de que 16x16 es el tamaño correcto para cada frame en tu player.png
        this.load.spritesheet('player_sprite', 'assets/sprites/player.png', {
            frameWidth: 16,
            frameHeight: 16
        });

        // --- CARGA DE LA HOJA DE SPRITES DE BOMBA (si usas una) ---
        // Si las "bombas" que ves son tu placeholder para tiles, asegúrate de que no se carguen aquí.
        // Si tienes un sprite para la bomba, cárgalo así:
        this.load.spritesheet('bomb_sprite', 'assets/sprites/bomb.png', {
            frameWidth: 16, // O el tamaño de tu frame de bomba
            frameHeight: 16
        });

        // --- CARGA DE LA HOJA DE SPRITES DE EXPLOSIÓN (si usas una) ---
        this.load.spritesheet('explosion_sprite', 'assets/sprites/explosion.png', {
            frameWidth: 16, // O el tamaño de tu frame de explosión
            frameHeight: 16
        });


        console.log('--- BootScene: Iniciando carga crítica de assets ---');
    }

    create() {
        console.log('--- BootScene: Carga completada con éxito. Iniciando GameScene. ---');
        this.scene.start('GameScene');
    }
}