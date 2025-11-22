import Phaser from 'phaser';

/**
 * Bomb: Entidad Bomba. Sin factor de escalado.
 */
export default class Bomb extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'bomb_sprite');
        // Las bombas se gestionan a través de un grupo, no se añaden directamente aquí
    }

    /**
     * Inicializa y activa la bomba. No requiere scaleFactor.
     */
    place() {
        this.setActive(true);
        this.setVisible(true);
        // ¡ATENCIÓN! No hay setScale() aquí, el sprite de la bomba ya es 16x16.
        this.body.enable = true;
        this.body.setImmovable(true);

        this.scene.time.delayedCall(3000, () => {
            this.explode();
        });
    }

    /**
     * Lógica de explosión. Los cálculos de expansión son directos, sin escalado.
     */
    explode() {
        if (!this.active) return;

        console.log('Bomba explota en', this.x, this.y);

        this.setActive(false);
        this.setVisible(false);
        this.body.enable = false;

        this.createExplosionAt(this.x, this.y); // Explosión central

        const range = 2; // Rango de la explosión en número de tiles desde el centro
        const tileSize = this.scene.TILE_SIZE; // Usar TILE_SIZE directamente

        // Direcciones cardinales para la expansión de la explosión
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
                    // Si es un bloque destructible ('kitkat'), lo explota y detiene la propagación en esa dirección
                    if (tile.layer.name === 'kitkat') {
                        this.createExplosionAt(targetX, targetY);
                    }
                    // Si es un muro indestructible ('walls') o ya se explotó un kitkat, la explosión se detiene
                    break;
                }

                // Si no hay un muro sólido, crea la explosión y continúa el rango
                this.createExplosionAt(targetX, targetY);
            }
        });
    }

    createExplosionAt(x, y) {
        const explosion = this.scene.explosionsGroup.get(x, y);
        if (explosion) {
            explosion.fire(); // Ya no se pasa scaleFactor
        }
    }
}