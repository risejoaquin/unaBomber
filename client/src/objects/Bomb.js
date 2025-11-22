import Phaser from 'phaser';

export default class Bomb extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'bomb_sprite');
    }

    /**
     * Inicializa y activa la bomba.
     */
    place(scaleFactor) {
        this.setActive(true);
        this.setVisible(true);
        this.setScale(scaleFactor);
        this.body.enable = true;
        this.body.setImmovable(true); // Impide que la bomba sea movida

        // Temporizador de 3 segundos
        this.scene.time.delayedCall(3000, () => {
            this.explode();
        });
    }

    explode() {
        if (!this.active) return;

        console.log('Bomba explota en', this.x, this.y);

        // Desactivar la bomba
        this.setActive(false);
        this.setVisible(false);
        this.body.enable = false;

        this.createExplosionAt(this.x, this.y); // Centro

        const range = 2; // Rango de explosión de 2 tiles
        const scale = this.scene.SCALE_FACTOR;
        const tileSize = 16 * scale;

        const directions = [
            { x: 0, y: -1 }, // Arriba
            { x: 0, y: 1 },  // Abajo
            { x: -1, y: 0 }, // Izquierda
            { x: 1, y: 0 }   // Derecha
        ];

        directions.forEach(dir => {
            for (let i = 1; i <= range; i++) {
                const targetX = this.x + (dir.x * tileSize * i);
                const targetY = this.y + (dir.y * tileSize * i);

                const tile = this.scene.getTileAtWorldXY(targetX, targetY);

                if (tile && tile.collides) {
                    // Si encuentra un bloque destructible ('kitkat'), lo destruye y detiene la propagación
                    if (tile.layer.name === 'kitkat') {
                        this.createExplosionAt(targetX, targetY);
                    }
                    // Si encuentra un muro indestructible ('walls'), o destruye el kitkat, se detiene
                    break;
                }

                // Si está vacío, crea explosión y continúa el rango
                this.createExplosionAt(targetX, targetY);
            }
        });
    }

    createExplosionAt(x, y) {
        const explosion = this.scene.explosionsGroup.get(x, y);
        if (explosion) {
            explosion.fire(this.scene.SCALE_FACTOR);
        }
    }
}