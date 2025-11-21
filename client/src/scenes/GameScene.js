import { Seal } from '../objects/Seal.js';
import { Enemy } from '../objects/Enemy.js';

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

        // --- 2. GRUPOS ---
        this.seals = this.physics.add.group({ classType: Seal, runChildUpdate: true });
        this.enemies = this.physics.add.group({ classType: Enemy, runChildUpdate: true });

        // --- 3. JUGADOR ---
        this.player = this.physics.add.sprite(100, 100, 'hero');
        this.player.setScale(3);
        this.player.body.setSize(12, 14);
        this.player.body.setOffset(2, 16);
        this.player.setCollideWorldBounds(true);

        // --- 4. LA PUERTA (CORREGIDO) ---
        this.door = this.physics.add.sprite(0, 0, 'door');
        this.door.setScale(3);
        this.door.setVisible(false);
        this.door.setActive(false);

        // CAMBIO IMPORTANTE: Asegurar que se dibuje encima de todo
        this.door.setDepth(10);
        // CAMBIO IMPORTANTE: Pintarla de amarillo para verla si el fondo es oscuro
        this.door.setTint(0xffff00);

        this.hideDoorUnderCrate(map);

        // --- 5. ENEMIGOS ---
        this.enemies.add(new Enemy(this, 300, 300));
        this.enemies.add(new Enemy(this, 500, 100));
        this.enemies.add(new Enemy(this, 500, 500));

        // --- 6. COLISIONES ---
        this.physics.add.collider(this.player, this.wallsLayer);
        this.physics.add.collider(this.player, this.seals);
        this.physics.add.collider(this.enemies, this.wallsLayer, (e) => e.changeDirection());
        this.physics.add.collider(this.enemies, this.seals, (e) => e.changeDirection());
        this.physics.add.collider(this.player, this.enemies, () => this.playerDie());

        // DETECTAR VICTORIA (Overlap en lugar de Collider para pasar por encima)
        this.physics.add.overlap(this.player, this.door, () => this.checkWin(), null, this);

        // --- 7. INPUT ---
        this.cursors = this.input.keyboard.createCursorKeys();
        this.input.keyboard.on('keydown-SPACE', () => this.placeSeal());

        // --- 8. UI ---
        this.scoreText = this.add.text(10, 10, 'ENEMIGOS: 3', {
            fontSize: '20px', fill: '#ffffff', fontFamily: 'Courier New', backgroundColor: '#000000'
        }).setScrollFactor(0).setDepth(20); // UI encima de todo

        this.infoText = this.add.text(400, 300, '', {
            fontSize: '40px', fill: '#00ff00', fontFamily: 'Courier New', align: 'center', backgroundColor: '#000000aa'
        }).setOrigin(0.5).setScrollFactor(0).setVisible(false).setDepth(20);

        // --- 9. CÁMARA ---
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(0, 0, map.widthInPixels * 3, map.heightInPixels * 3);
    }

    hideDoorUnderCrate(map) {
        const crateTiles = this.wallsLayer.filterTiles(tile => tile.index === 2);

        if (crateTiles.length > 0) {
            const randomTile = Phaser.Utils.Array.GetRandom(crateTiles);

            // Ajuste de coordenadas preciso
            const TILE_SIZE = 48; // 16 * 3
            const x = randomTile.x * TILE_SIZE + (TILE_SIZE / 2);
            const y = randomTile.y * TILE_SIZE + (TILE_SIZE / 2);

            this.door.setPosition(x, y);

            this.doorTileX = randomTile.x;
            this.doorTileY = randomTile.y;

            console.log(`SECRETO: La puerta está en coordenadas de mapa: ${x}, ${y}`);
        } else {
            console.warn("¡No hay cajas para esconder la puerta!");
        }
    }

    checkDoorReveal(tileX, tileY) {
        // Verificar coordenadas lógicas del Tile
        if (tileX === this.doorTileX && tileY === this.doorTileY) {
            console.log("¡PUERTA REVELADA!");
            this.door.setVisible(true);
            this.door.setActive(true);
        }
    }

    updateUI() {
        const count = this.enemies.countActive();
        this.scoreText.setText(`ENEMIGOS: ${count}`);

        if (count === 0 && this.door.visible) {
            this.scoreText.setText('¡ESCAPE ABIERTO!');
            this.scoreText.setColor('#00ff00');
        }
    }

    checkWin() {
        if (this.door.visible && this.enemies.countActive() === 0) {
            this.physics.pause();
            this.infoText.setText('¡SECTOR PURIFICADO!\nContrato Completado');
            this.infoText.setVisible(true);
            // Reiniciar
            this.time.delayedCall(3000, () => this.scene.restart());
        }
    }

    playerDie() {
        this.physics.pause();
        this.player.setTint(0xff0000);
        this.infoText.setText('CONTRATO ANULADO\nSeñal Perdida');
        this.infoText.setColor('#ff0000');
        this.infoText.setVisible(true);
        this.time.delayedCall(2000, () => this.scene.restart());
    }

    placeSeal() {
        const TILE_SIZE = 48;
        const x = Math.floor((this.player.x) / TILE_SIZE) * TILE_SIZE + (TILE_SIZE / 2);
        const y = Math.floor((this.player.y) / TILE_SIZE) * TILE_SIZE + (TILE_SIZE / 2);

        const bombsAtLocation = this.seals.getChildren().filter(seal => seal.x === x && seal.y === y);
        if (bombsAtLocation.length > 0) return;

        this.seals.add(new Seal(this, x, y));
    }

    update() {
        this.updateUI();
        if (!this.player || !this.cursors || this.physics.world.isPaused) return;

        const speed = 200;
        this.player.setVelocity(0);

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-speed);
            this.player.setFlipX(true);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(speed);
            this.player.setFlipX(false);
        } else if (this.cursors.up.isDown) {
            this.player.setVelocityY(-speed);
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(speed);
        }

        this.player.body.velocity.normalize().scale(speed);
    }
}