// client/src/scenes/GameScene.js
import { Seal } from '../objects/Seal.js'; // <--- Importamos la bomba

export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        // --- 1. MAPA ---
        const map = this.make.tilemap({ key: 'map_level1' });
        const tileset = map.addTilesetImage('dungeon_tiles', 'tileset_img');
        this.wallsLayer = map.createLayer('ground', tileset, 0, 0);
        this.wallsLayer.setScale(3);
        this.wallsLayer.setCollision([1, 2]);

        // --- 2. GRUPO DE BOMBAS (SELLOS) ---
        // Creamos un grupo para manejar todas las bombas que pongamos
        this.seals = this.physics.add.group({
            classType: Seal,
            runChildUpdate: true
        });

        // --- 3. JUGADOR ---
        this.player = this.physics.add.sprite(100, 100, 'hero');
        this.player.setScale(3);
        this.player.body.setSize(12, 14);
        this.player.body.setOffset(2, 16);
        this.player.setCollideWorldBounds(true);

        // --- 4. COLISIONES ---
        this.physics.add.collider(this.player, this.wallsLayer);

        // El jugador choca con las bombas (para no atravesarlas)
        this.physics.add.collider(this.player, this.seals);

        // --- 5. CONTROLES ---
        this.cursors = this.input.keyboard.createCursorKeys();

        // DETECTAR TECLA ESPACIO (PONER BOMBA)
        this.input.keyboard.on('keydown-SPACE', () => {
            this.placeSeal();
        });

        // --- 6. CÁMARA ---
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(0, 0, map.widthInPixels * 3, map.heightInPixels * 3);
    }

    placeSeal() {
        // 1. Calcular el centro del tile (cuadrito) más cercano
        // El mapa está escalado x3 y los tiles son de 16px. 16 * 3 = 48px por celda.
        const TILE_SIZE = 48;

        // Matemáticas de Grid: Redondear la posición del jugador a la celda más cercana
        const x = Math.floor((this.player.x) / TILE_SIZE) * TILE_SIZE + (TILE_SIZE / 2);
        const y = Math.floor((this.player.y) / TILE_SIZE) * TILE_SIZE + (TILE_SIZE / 2);

        // 2. Verificar si ya hay una bomba ahí (para no poner una encima de otra)
        const bombsAtLocation = this.seals.getChildren().filter(seal => seal.x === x && seal.y === y);
        if (bombsAtLocation.length > 0) {
            return; // Ya hay bomba, no hacer nada
        }

        // 3. Crear la bomba
        const seal = new Seal(this, x, y);
        this.seals.add(seal);
    }

    update() {
        if (!this.player || !this.cursors) return;

        const speed = 200;
        this.player.setVelocity(0);

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-speed);
            this.player.setFlipX(true);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(speed);
            this.player.setFlipX(false);
        }

        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-speed);
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(speed);
        }

        this.player.body.velocity.normalize().scale(speed);
    }
}