import Phaser from 'phaser';

/**
 * Explosion: Objeto efímero que representa un segmento de la explosión.
 * Tiene una duración corta y es responsable de interactuar con otros objetos para causar daño.
 */
export default class Explosion extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        // 'explosion_sprite' es la KEY del spritesheet de la explosión
        super(scene, x, y, 'explosion_sprite');
        // Las explosiones se gestionan a través de un grupo, no se añaden directamente aquí
    }

    /**
     * Inicializa y activa la explosión.
     * @param {number} scaleFactor El factor de escalado de la escena.
     */
    fire(scaleFactor) {
        this.setActive(true);    // Activa la explosión en el grupo
        this.setVisible(true);   // La hace visible
        this.setScale(scaleFactor); // Aplica la escala global
        this.body.enable = true; // Activa su cuerpo de físicas
        this.body.setImmovable(true); // Impide que la explosión se mueva

        // La explosión dura solo 500 milisegundos
        this.scene.time.delayedCall(500, () => {
            // Desactiva la explosión para que pueda ser reciclada en el pool
            this.setActive(false);
            this.setVisible(false);
            this.body.enable = false;
        });

        // Aquí se iniciaría la animación de la explosión (ej. this.anims.play('explosion_anim'))
    }
}