import { Explosion } from './Explosion.js';

export class Seal extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        // Usamos la imagen 'seal_sprite' (la calavera)
        super(scene, x, y, 'seal_sprite');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.scene = scene; // Guardar referencia para poder explotar después
        this.range = 2;     // Radio de explosión (2 bloques)

        // --- APARIENCIA ---
        this.setScale(2.5); // Tamaño de la calavera

        // --- FÍSICAS ---
        this.body.setImmovable(true);
        this.body.setSize(12, 12);

        // --- TEMPORIZADOR ---
        // Explotar después de 3 segundos
        scene.time.delayedCall(3000, () => {
            this.explode();
        });

        // Animación de latido (Peligro)
        scene.tweens.add({
            targets: this,
            scale: 3,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
    }

    explode() {
        // Generar la explosión lógica y visual
        new Explosion(this.scene, this.x, this.y, this.range);

        // Destruir este objeto (la calavera desaparece)
        this.destroy();
    }
}