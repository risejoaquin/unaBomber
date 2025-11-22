import Phaser from 'phaser';

export default class Player extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player_sprite');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setCollideWorldBounds(true);
        this.body.setSize(10, 10);
        this.body.setOffset(3, 6); // Ajuste de hitbox para el sprite de 16x16

        this.speed = 120;
        this.isAlive = true;
        this.bombCount = 1; // Máximo de bombas simultáneas
    }

    update(time, delta) {
        if (!this.isAlive) return;

        this.body.setVelocity(0);
        const cursors = this.scene.cursors;

        let velocityX = 0;
        let velocityY = 0;

        // Lectura de input
        if (cursors.left.isDown) velocityX -= 1;
        if (cursors.right.isDown) velocityX += 1;
        if (cursors.up.isDown) velocityY -= 1;
        if (cursors.down.isDown) velocityY += 1;

        // Normalización y aplicación de velocidad para evitar movimiento diagonal rápido
        if (velocityX !== 0 || velocityY !== 0) {
            const length = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
            velocityX = (velocityX / length) * this.speed;
            velocityY = (velocityY / length) * this.speed;
        }

        this.body.setVelocity(velocityX, velocityY);

        // Control del flip visual
        if (velocityX < 0) this.setFlipX(true);
        else if (velocityX > 0) this.setFlipX(false);
    }

    tryPlaceBomb() {
        // Verificar si puede colocar más bombas
        if (this.scene.bombsGroup.countActive() < this.bombCount) {
            const map = this.scene.map;
            const scale = this.scene.SCALE_FACTOR;
            const scaledTileSize = map.tileWidth * scale;

            // Centrar la bomba en el tile actual del jugador
            const tileX = Math.floor(this.x / scaledTileSize);
            const tileY = Math.floor(this.y / scaledTileSize);

            const bombWorldX = (tileX * scaledTileSize) + (scaledTileSize / 2);
            const bombWorldY = (tileY * scaledTileSize) + (scaledTileSize / 2);

            // Evitar colocar bomba si ya hay un muro en el centro del tile
            const tileAtPos = this.scene.getTileAtWorldXY(bombWorldX, bombWorldY);
            if (tileAtPos && tileAtPos.collides) {
                return;
            }

            // Obtener bomba del pool y activarla
            const bomb = this.scene.bombsGroup.get(bombWorldX, bombWorldY);
            if (bomb) {
                bomb.place(this.scene.SCALE_FACTOR);
            }
        }
    }

    die() {
        if (!this.isAlive) return;
        console.log('Jugador ha muerto');
        this.isAlive = false;
        this.body.enable = false;
        this.setTint(0xff0000);

        this.scene.time.delayedCall(2000, () => {
            this.respawn();
        });
    }

    respawn() {
        console.log('Jugador reaparece');
        this.isAlive = true;
        this.body.enable = true;
        this.clearTint();
        // Volver al spawn inicial (1,1)
        const spawnX = (16 * 1.5) * this.scene.SCALE_FACTOR;
        const spawnY = (16 * 1.5) * this.scene.SCALE_FACTOR;
        this.setPosition(spawnX, spawnY);
    }
}