import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        console.log("BOOT SCENE: Cargando assets...");

        // Tileset: Asegúrate de que el nombre del archivo es exactamente '0x72_DungeonTilesetII_v1.7.png'
        this.load.image('dungeon_tileset_image', 'assets/tilesets/0x72_DungeonTilesetII_v1.7.png');

        // Mapa: Asegúrate de que el nombre del archivo es exactamente 'level1.json'
        this.load.tilemapTiledJSON('map_level1', 'assets/maps/level1.json');

        // Sprites: 16x16 frames, 4 frames
        this.load.spritesheet('player', 'assets/sprites/player.png', { frameWidth: 16, frameHeight: 16 });

        console.log("BOOT SCENE: Carga terminada.");
    }

    create() {
        this.scene.start('GameScene');
    }
}