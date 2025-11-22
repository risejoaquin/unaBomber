// client/src/scenes/BootScene.js
import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Carga la imagen del tileset con el key que vas a usar en GameScene.js
        this.load.image('dungeon_tileset_image', 'assets/tilesets/dungeon_tileset.png'); // <<-- Nuevo key recomendado
        // Carga el JSON del mapa
        this.load.tilemapTiledJSON('map_levels', 'assets/maps/level1.json');

        // ... el resto de tus spritesheets ...
        this.load.spritesheet('player', 'assets/sprites/player.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('seal', 'assets/sprites/seal.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('enemy', 'assets/sprites/enemy.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('explosion', 'assets/sprites/explosion.png', { frameWidth: 16, frameHeight: 16 });
    }

    create() {
        this.scene.start('GameScene');
    }
}