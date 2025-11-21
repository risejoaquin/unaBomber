// client/src/scenes/BootScene.js
export class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        console.log('--> BootScene: Cargando recursos...');

        // --- CARGA DE MAPAS (JSON) ---
        // Apodo: 'map_level1' | Ruta: tu archivo json
        this.load.tilemapTiledJSON('map_level1', 'assets/maps/level1.json');

        // --- CARGA DE IMÁGENES (PNG) ---
        // IMPORTANTE: Aquí le damos el apodo 'tileset_img' a la imagen grande.
        this.load.image('tileset_img', 'assets/tilesets/0x72_DungeonTilesetII_v1.7.png');

        // Apodo para el héroe: 'hero'
        this.load.image('hero', 'assets/sprites/hero.png');
    }

    create() {
        console.log('--> BootScene: Carga completa. Iniciando GameScene...');
        // Una vez cargado todo, inicia la escena del juego
        this.scene.start('GameScene');
    }
}