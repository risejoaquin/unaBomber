import Phaser from 'phaser';
import Player from '../objects/Player.js';
import Enemy from '../objects/Enemy.js';
import Bomb from '../objects/Bomb.js';
import Explosion from '../objects/Explosion.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.map = null;
        this.wallsLayer = null;
        this.destructibleLayer = null;
        this.player = null;
        this.cursors = null;

        // Grupos de físicas para gestión y colisiones
        this.enemiesGroup = null;
        this.bombsGroup = null;
        this.explosionsGroup = null;

        this.SCALE_FACTOR = 3;
        this.TILE_SIZE = 16;
    }

    create() {
        console.log('--- GameScene: Inicializando mundo de juego ---');

        this.createMap();

        // Inicialización de Grupos (pools de objetos)
        this.enemiesGroup = this.physics.add.group({ classType: Enemy, runChildUpdate: true });
        this.bombsGroup = this.physics.add.group({ classType: Bomb, runChildUpdate: true, maxSize: 10 });
        this.explosionsGroup = this.physics.add.group({ classType: Explosion, runChildUpdate: true, maxSize: 50 });

        // CREACIÓN DE ENTIDADES
        this.createPlayer(); // <--- LA CREACIÓN DEL JUGADOR AHORA ES CORRECTA
        this.spawnEnemies();

        this.setupCollisions();
        this.setupCameraAndControls();
    }

    createMap() {
        this.map = this.make.tilemap({ key: 'map_level1' });
        // Nombre del tileset en Tiled: '0x72_DungeonTilesetII_v1.7'
        const tileset = this.map.addTilesetImage('0x72_DungeonTilesetII_v1.7', 'tileset_main');

        this.map.setScale(this.SCALE_FACTOR);

        // Nombres de capas EXACTOS de Tiled
        this.groundLayer = this.map.createLayer('ground', tileset, 0, 0);
        this.wallsLayer = this.map.createLayer('walls', tileset, 0, 0); // Muros INDESTRUCTIBLES
        this.destructibleLayer = this.map.createLayer('kitkat', tileset, 0, 0); // Muros DESTRUCTIBLES

        // Activación de colisiones por la propiedad 'collides: true' que configuraste en Tiled
        this.wallsLayer.setCollisionByProperty({ collides: true });
        this.destructibleLayer.setCollisionByProperty({ collides: true });
    }

    createPlayer() {
        // Spawn en una posición segura (1,1 en coordenadas de tiles)
        const spawnX = (this.TILE_SIZE * 1.5) * this.SCALE_FACTOR;
        const spawnY = (this.TILE_SIZE * 1.5) * this.SCALE_FACTOR;

        // Instancia del objeto Player
        this.player = new Player(this, spawnX, spawnY);
        this.player.setScale(this.SCALE_FACTOR);
    }

    spawnEnemies() {
        // Ejemplo de spawn de un enemigo
        const enemyX = (this.TILE_SIZE * 10.5) * this.SCALE_FACTOR;
        const enemyY = (this.TILE_SIZE * 5.5) * this.SCALE_FACTOR;
        const enemy = this.enemiesGroup.get(enemyX, enemyY);
        if (enemy) {
            enemy.setScale(this.SCALE_FACTOR);
            enemy.init();
        }
    }

    setupCollisions() {
        // Colisiones de Movimiento (Physics.Collider)
        this.physics.add.collider(this.player, this.wallsLayer);
        this.physics.add.collider(this.player, this.destructibleLayer);
        this.physics.add.collider(this.enemiesGroup, this.wallsLayer);
        this.physics.add.collider(this.enemiesGroup, this.destructibleLayer);
        this.physics.add.collider(this.player, this.bombsGroup);
        this.physics.add.collider(this.enemiesGroup, this.bombsGroup);

        // Interacciones Letales (Physics.Overlap)

        // 1. Jugador muere por Enemigo o Explosión
        this.physics.add.overlap(this.player, this.enemiesGroup, (player, enemy) => {
            player.die();
        });
        this.physics.add.overlap(this.explosionsGroup, this.player, (explosion, player) => {
            player.die();
        });

        // 2. Enemigo muere por Explosión
        this.physics.add.overlap(this.explosionsGroup, this.enemiesGroup, (explosion, enemy) => {
            enemy.die();
        });

        // 3. Destrucción de bloques por Explosión
        this.physics.add.overlap(this.explosionsGroup, this.destructibleLayer, (explosion, tile) => {
            // Eliminar el tile destructible del mapa
            this.destructibleLayer.removeTileAt(tile.x, tile.y);
        });
    }

    setupCameraAndControls() {
        const worldWidth = this.map.widthInPixels * this.SCALE_FACTOR;
        const worldHeight = this.map.heightInPixels * this.SCALE_FACTOR;

        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
        this.cameras.main.startFollow(this.player);

        this.cursors = this.input.keyboard.createCursorKeys();
        // Evento para colocar bomba al presionar ESPACIO
        this.input.keyboard.on('keydown-SPACE', () => {
            if (this.player && this.player.isAlive) {
                this.player.tryPlaceBomb();
            }
        });
    }

    /**
     * Devuelve el tile en una coordenada mundial (world X/Y).
     * Es crucial para que la bomba verifique si está sobre un muro antes de explotar.
     */
    getTileAtWorldXY(worldX, worldY) {
        const wallTile = this.wallsLayer.getTileAtWorldXY(worldX, worldY, true);
        const destructibleTile = this.destructibleLayer.getTileAtWorldXY(worldX, worldY, true);
        // Si no es un muro ni un bloque destructible, devuelve null.
        return wallTile || destructibleTile;
    }
}