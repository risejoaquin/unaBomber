import Phaser from 'phaser';
import Player from '../objects/Player.js'; // Ruta de importación revisada

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.player = null;
        this.cursors = null;
    }

    create() {
        console.log("--- GameScene ha comenzado (Busca el mapa y el personaje) ---");
        const SCALE_FACTOR = 3;

        // 1. Carga y configuración del Mapa
        const map = this.make.tilemap({ key: 'map_level1' });

        // Nombres estrictos: Nombre del Tileset en Tiled, Key de la imagen en BootScene
        const tileset = map.addTilesetImage('0x72_DungeonTilesetII_v1.7', 'dungeon_tileset_image');
        map.setScale(SCALE_FACTOR);

        // 2. Capas y Colisiones
        this.groundLayer = map.createLayer('ground', tileset, 0, 0);
        this.wallsLayer = map.createLayer('walls', tileset, 0, 0);

        // Capa de colisión (asumiendo que tiene la propiedad 'collides: true' en Tiled)
        this.wallsLayer.setCollisionByProperty({ collides: true });

        // 3. Jugador
        // Posición inicial (tile 5, 5, escalado)
        const startX = 5 * 16 * SCALE_FACTOR;
        const startY = 5 * 16 * SCALE_FACTOR;
        this.player = new Player(this, startX, startY);
        this.player.setScale(SCALE_FACTOR);

        // 4. Colisiones y Cámara
        this.physics.add.collider(this.player, this.wallsLayer);

        // Límites del mundo
        const worldWidth = map.widthInPixels * SCALE_FACTOR;
        const worldHeight = map.heightInPixels * SCALE_FACTOR;
        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

        // Cámara
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(1);
        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

        // Controles globales
        this.cursors = this.input.keyboard.createCursorKeys();
        console.log("--- Configuración de GameScene finalizada ---");
    }

    update(time, delta) {
        if (this.player) {
            this.player.update(time, delta);
        }
    }
}