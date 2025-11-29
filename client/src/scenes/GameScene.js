import Phaser from 'phaser';
import Player from '../objects/Player.js';
import Enemy from '../objects/Enemy.js';
import Bomb from '../objects/Bomb.js';
import Explosion from '../objects/Explosion.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.map = null;
        this.groundLayer = null;
        this.wallsLayer = null;
        this.destructibleLayer = null;
        this.player = null;
        this.cursors = null;
        this.enemiesGroup = null;
        this.bombsGroup = null;
        this.explosionsGroup = null;
        this.TILE_SIZE = 16;
    }

    create() {
        console.log('--- GameScene: Inicializando mundo de juego (sin escalado) ---');
        this.createMap();
        this.enemiesGroup = this.physics.add.group({ classType: Enemy, runChildUpdate: true });
        this.bombsGroup = this.physics.add.group({ classType: Bomb, runChildUpdate: true, maxSize: 10 });
        this.explosionsGroup = this.physics.add.group({ classType: Explosion, runChildUpdate: true, maxSize: 50 });
        this.createPlayer();
        this.spawnEnemies();
        this.setupCollisions();
        this.setupCameraAndControls();
    }

    createMap() {
        this.map = this.make.tilemap({ key: 'map_level1' });

        // CON EL TILESET EMPOTRADO, ya no es tan crítico el nombre del tileset para addTilesetImage
        // ya que la información está en el JSON. Pero el nombre de la KEY ('tileset_main') sigue siendo vital.
        // Usa el nombre que aparece en la sección "tilesets" -> "name" de tu level1.json (probablemente sigue siendo '0x72_DungeonTilesetII_v1.7')
        const tileset = this.map.addTilesetImage('0x72_DungeonTilesetII_v1.7', 'tileset_main');

        if (!tileset) {
            console.error("ERROR CRÍTICO: El tileset no se pudo enlazar. Asegúrate de que 'tileset_main' se cargó en BootScene y que el tileset está EMBUTIDO en level1.json o que el nombre coincide.");
            return;
        }

        this.groundLayer = this.map.createLayer('ground', tileset, 0, 0);
        this.wallsLayer = this.map.createLayer('walls', tileset, 0, 0);
        this.destructibleLayer = this.map.createLayer('kitkat', tileset, 0, 0);

        if (!this.groundLayer || !this.wallsLayer || !this.destructibleLayer) {
            console.error("ERROR CRÍTICO: No se pudieron crear una o más capas. Verifica los nombres de las capas en level1.json (ground, walls, kitkat).");
            return;
        }

        this.wallsLayer.setCollisionByProperty({ collides: true });
        this.destructibleLayer.setCollisionByProperty({ collides: true });
    }

    createPlayer() {
        const spawnX = (this.TILE_SIZE * 1) + (this.TILE_SIZE / 2);
        const spawnY = (this.TILE_SIZE * 1) + (this.TILE_SIZE / 2);
        this.player = new Player(this, spawnX, spawnY);
    }

    spawnEnemies() {
        const enemyX = (this.TILE_SIZE * 10) + (this.TILE_SIZE / 2);
        const enemyY = (this.TILE_SIZE * 5) + (this.TILE_SIZE / 2);
        const enemy = this.enemiesGroup.get(enemyX, enemyY);
        if (enemy) {
            enemy.init();
        }
    }

    setupCollisions() {
        this.physics.add.collider(this.player, this.wallsLayer);
        this.physics.add.collider(this.player, this.destructibleLayer);
        this.physics.add.collider(this.enemiesGroup, this.wallsLayer);
        this.physics.add.collider(this.enemiesGroup, this.destructibleLayer);
        this.physics.add.collider(this.player, this.bombsGroup);
        this.physics.add.collider(this.enemiesGroup, this.bombsGroup);
        this.physics.add.overlap(this.player, this.enemiesGroup, (player, enemy) => { player.die(); });
        this.physics.add.overlap(this.explosionsGroup, this.player, (explosion, player) => { player.die(); });
        this.physics.add.overlap(this.explosionsGroup, this.enemiesGroup, (explosion, enemy) => { enemy.die(); });
        this.physics.add.overlap(this.explosionsGroup, this.destructibleLayer, (explosion, tile) => {
            this.destructibleLayer.removeTileAt(tile.x, tile.y);
        });
    }

    setupCameraAndControls() {
        if (!this.map) {
            console.error("ERROR: No se pudo configurar la cámara porque el mapa no existe.");
            return;
        }
        const worldWidth = this.map.widthInPixels;
        const worldHeight = this.map.heightInPixels;
        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
        this.cameras.main.startFollow(this.player);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.input.keyboard.on('keydown-SPACE', () => {
            if (this.player && this.player.isAlive) {
                this.player.tryPlaceBomb();
            }
        });
    }

    getTileAtWorldXY(worldX, worldY) {
        if (!this.wallsLayer || !this.destructibleLayer) {
            console.warn("Advertencia: Intentando obtener tile antes de que las capas estén completamente creadas.");
            return null;
        }
        const wallTile = this.wallsLayer.getTileAtWorldXY(worldX, worldY, true);
        const destructibleTile = this.destructibleLayer.getTileAtWorldXY(worldX, worldY, true);
        return wallTile || destructibleTile;
    }
}
