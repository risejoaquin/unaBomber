import Phaser from 'phaser'; // <<-- ¡NECESITAS IMPORTAR PHASER AQUÍ TAMBIÉN!
import Explosion from '../objects/Explosion.js'; // Este import es correcto para Explosion si también es default

export default class Seal extends Phaser.Physics.Arcade.Sprite { // <<-- ¡CAMBIAR A 'export default'!
    constructor(scene, x, y) {
        super(scene, x, y, 'seal_sprite');
        scene.add.existing(this);
        scene.physics.add.existing(this, true); // 'true' para que sea estático (no se mueva por colisiones, si es el objetivo)

        this.setScale(3);
        // hacemos el cuerpo de colisión un poco más pequeño que el sprite visual
        this.body.setSize(this.width * 0.8, this.height * 0.8);
        this.setDepth(5);

        this.range = 2; // Rango de explosión en tiles

        // Temporizador para explotar (3 segundos)
        this.scene.time.delayedCall(3000, () => {
            this.explode();
        });

        // Animación simple de "palpitar" antes de explotar
        this.scene.tweens.add({
            targets: this,
            scale: 3.5,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
    }

    explode() {
        if (this.active) { // Asegúrate de que la calavera sigue activa
            // Crear el objeto Explosión en la posición de la bomba
            new Explosion(this.scene, this.x, this.y, this.range); // <-- Si Explosion necesita 'range', pásalo

            // Destruir el objeto bomba (la calavera)
            this.destroy();
        }
    }
}