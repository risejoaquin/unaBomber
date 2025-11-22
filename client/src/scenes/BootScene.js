import Phaser from 'phaser';

/**
 * BootScene: Encargada de precargar todos los recursos (assets) del juego.
 * Es la primera escena en ejecutarse y es crítica para el inicio del juego.
 * Si algún asset falla en la carga, se reporta un error y la GameScene no debería iniciar.
 */
export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        console.log('--- BootScene: Iniciando carga crítica de assets ---');

        // Manejador de eventos para errores de carga. Esencial para depuración.
        this.load.on('loaderror', (file) => {
            console.error(`CRITICAL FAILURE: Error cargando asset: ${file.key} desde ${file.src}`);
            // Podríamos mostrar una pantalla de error aquí en un juego real
        });

        // Manejador de eventos para cuando todos los assets han terminado de cargar.
        this.load.on('complete', () => {
            console.log('--- BootScene: Carga completada con éxito. Iniciando GameScene. ---');
            this.scene.start('GameScene'); // Una vez cargado todo, inicia la escena principal del juego
        });

        // --- Carga de Assets (asegurando rutas y nombres EXACTOS según tu estructura) ---

        // Tileset principal del mapa
        // 'tileset_main' es la KEY que Phaser usará para referenciar la imagen del tileset.
        this.load.image('tileset_main', 'assets/tilesets/0x72_DungeonTilesetII_v1.7.png');

        // Archivo JSON del mapa exportado desde Tiled
        // 'map_level1' es la KEY que Phaser usará para referenciar la estructura del mapa.
        this.load.tilemapTiledJSON('map_level1', 'assets/maps/level1.json');

        // Spritesheets para las entidades del juego (asegurando 16x16px por frame)
        this.load.spritesheet('player_sprite', 'assets/sprites/player.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('enemy_sprite', 'assets/sprites/enemy.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('bomb_sprite', 'assets/sprites/bomb.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('explosion_sprite', 'assets/sprites/explosion.png', { frameWidth: 16, frameHeight: 16 });

        // Otros sprites (si se usan, como 'seal.png', 'skull.png', 'door.png')
        this.load.image('seal_sprite', 'assets/sprites/seal.png');
        this.load.image('skull_sprite', 'assets/sprites/skull.png'); // Ejemplo, si tienes este asset
        this.load.image('door_sprite', 'assets/sprites/door.png');   // Ejemplo, si tienes este asset
    }
}