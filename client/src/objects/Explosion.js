import Phaser from 'phaser';

export default class Explosion extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'explosion_sprite');
    }

    fire(scaleFactor) {
        this.setActive(true);
        this.setVisible(true);
        this.setScale(scaleFactor);
        this.body.enable = true;
        this.body.setImmovable(true);

        // La explosión dura solo 500ms
        this.scene.time.delayedCall(500, () => {
            this.setActive(false);
            this.setVisible(false);
            this.body.enable = false;
        });

        // Aquí iría la animación de la explosión
    }
}