import Phaser from 'phaser';

/**
 * Escena de precarga. Es crítica, si falla, el juego no inicia.
 * Las claves de assets deben coincidir exactamente con el uso en GameScene.
 */
export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        console.log('--- BootScene: Iniciando carga crítica de assets ---');

        // Manejador de errores
        this.load.on('loaderror', (file) => {
            console.error(`CRITICAL FAILURE: Error cargando asset: ${file.key} desde ${file.src}`);
        });

        // Evento de completado
        this.load.on('complete', () => {
            console.log('--- BootScene: Carga completada con éxito. Iniciando GameScene. ---');
            this.scene.start('GameScene');
        });

        // Carga de Assets (Rutas basadas en tu estructura confirmada)
        this.load.image('tileset_main', 'assets/tilesets/0x72_DungeonTilesetII_v1.7.png');
        this.load.tilemapTiledJSON('map_level1', 'assets/maps/level1.json');

        // Spritesheets de Entidades (16x16 frames, crucial para Bomberman)
        this.load.spritesheet('player_sprite', 'assets/sprites/player.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('enemy_sprite', 'assets/sprites/enemy.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('bomb_sprite', 'assets/sprites/bomb.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('explosion_sprite', 'assets/sprites/explosion.png', { frameWidth: 16, frameHeight: 16 });
        // Asumiendo que 'seal.png' se usará como un objeto, lo cargamos aquí
        this.load.image('seal_sprite', 'assets/sprites/seal.png');
    }
}