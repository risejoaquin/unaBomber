import { Seal } from '../objects/Seal.js';
import { Enemy } from '../objects/Enemy.js'; // <--- IMPORTAR

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

        // NUEVO: Grupo de Enemigos
        this.enemies = this.physics.add.group({ classType: Enemy, runChildUpdate: true });

        // --- 3. JUGADOR ---
        this.player = this.physics.add.sprite(100, 100, 'hero');
        this.player.setScale(3);
        this.player.body.setSize(12, 14);
        this.player.body.setOffset(2, 16);
        this.player.setCollideWorldBounds(true);

        // --- 4. SPAWN DE ENEMIGOS (Manual por ahora) ---
        // Vamos a crear 3 enemigos en posiciones libres
        this.enemies.add(new Enemy(this, 300, 300));
        this.enemies.add(new Enemy(this, 500, 100));
        this.enemies.add(new Enemy(this, 500, 500));

        // --- 5. COLISIONES ---
        this.physics.add.collider(this.player, this.wallsLayer);
        this.physics.add.collider(this.player, this.seals);

        // Enemigos chocan con muros y bombas
        this.physics.add.collider(this.enemies, this.wallsLayer, (enemy) => enemy.changeDirection());
        this.physics.add.collider(this.enemies, this.seals, (enemy) => enemy.changeDirection());

        // NUEVO: GAME OVER (Enemigo toca Jugador)
        this.physics.add.collider(this.player, this.enemies, () => {
            this.playerDie();
        });

        // --- 6. INPUT ---
        this.cursors = this.input.keyboard.createCursorKeys();
        this.input.keyboard.on('keydown-SPACE', () => this.placeSeal());

        // --- 7. CÁMARA ---
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(0, 0, map.widthInPixels * 3, map.heightInPixels * 3);
    }

    playerDie() {
        // Pausar físicas
        this.physics.pause();
        this.player.setTint(0xff0000);

        console.log("GAME OVER - Contrato Anulado");

        // Reiniciar escena después de 1 segundo
        this.time.delayedCall(1000, () => {
            this.scene.restart();
        });
    }

    placeSeal() {
        const TILE_SIZE = 48;
        const x = Math.floor((this.player.x) / TILE_SIZE) * TILE_SIZE + (TILE_SIZE / 2);
        const y = Math.floor((this.player.y) / TILE_SIZE) * TILE_SIZE + (TILE_SIZE / 2);

        const bombsAtLocation = this.seals.getChildren().filter(seal => seal.x === x && seal.y === y);
        if (bombsAtLocation.length > 0) return;

        const seal = new Seal(this, x, y);
        this.seals.add(seal);
    }

    update() {
        if (!this.player || !this.cursors) return;

        const speed = 200;
        this.player.setVelocity(0);

        // Solo mover si el jugador está vivo (physics no pausadas)
        if (this.physics.world.isPaused) return;

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