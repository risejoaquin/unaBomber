import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        console.log("BOOT SCENE: Iniciando carga de assets. Verificando rutas...");

        // --- Manejadores de errores de carga (¡CRÍTICO para diagnóstico!) ---
        this.load.on('loaderror', (file) => {
            console.error(`ERROR DE CARGA DE ARCHIVO: Falló al procesar ${file.key}. Ruta: ${file.src}`);
        });

        this.load.on('filecomplete', (key, type, data) => {
            console.log(`Carga exitosa: ${key} (${type})`);
        });

        // Este se dispara cuando TODOS los archivos han terminado (exitosos o fallidos)
        this.load.on('complete', () => {
            console.log("BOOT SCENE: Proceso de carga de assets COMPLETO (revisar errores anteriores si los hay).");
            // Si hay errores de carga, es probable que GameScene falle.
            // Aquí podrías añadir lógica para mostrar un mensaje de error al usuario si hubo fallos críticos.
            this.scene.start('GameScene');
        });

        // --- Carga de Tileset y Mapa ---
        this.load.image('dungeon_tileset', 'assets/tilesets/0x72_DungeonTilesetII_v1.7.png');
        this.load.tilemapTiledJSON('level1_map', 'assets/maps/level1.json');

        // --- Carga de Spritesheets ---
        // ¡CORREGIDO! Ahora apunta a 'player.png' (como en tu nueva estructura)
        this.load.spritesheet('player_sprite', 'assets/sprites/player.png', { frameWidth: 16, frameHeight: 16 });

        // Estos archivos ya están en tu estructura.
        this.load.spritesheet('seal_sprite', 'assets/sprites/seal.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('explosion_sprite', 'assets/sprites/explosion.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('enemy_sprite', 'assets/sprites/enemy.png', { frameWidth: 16, frameHeight: 16 });
    }

    create() {
        // No hay necesidad de código aquí, el 'on complete' maneja el inicio de la siguiente escena.
    }
}