import Phaser from 'phaser';

/**
 * Explosion: Objeto efímero que representa un segmento de la explosión.
 * Sin factor de escalado.
 */
export default class Explosion extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'explosion_sprite');
        // Las explosiones se gestionan a través de un grupo
    }

    /**
     * Inicializa y activa la explosión. No requiere scaleFactor.
     */
    fire() {
        this.setActive(true);
        this.setVisible(true);
        // ¡ATENCIÓN! No hay setScale() aquí, el sprite de la explosión ya es 16x16.
        this.body.enable = true;
        this.body.setImmovable(true);

        this.scene.time.delayedCall(500, () => {
            this.setActive(false);
            this.setVisible(false);
            this.body.enable = false;
        });
    }
}