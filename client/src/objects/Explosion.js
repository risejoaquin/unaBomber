import Phaser from 'phaser';

export default class Explosion extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'explosion');

        scene.add.existing(this); // Añade la explosión a la escena
        this.setScale(2); // Escala para que sea más visible, ajusta si es necesario

        // Crea la animación de explosión si no existe
        if (!this.scene.anims.get('explode')) {
            this.scene.anims.create({
                key: 'explode',
                frames: this.scene.anims.generateFrameNumbers('explosion', { start: 0, end: 7 }), // Ajusta los frames si tienes más/menos
                frameRate: 15, // Velocidad de la animación
                hideOnComplete: true // Oculta el sprite cuando la animación termina
            });
        }

        // Reproduce la animación
        this.play('explode');

        // Destruye el objeto una vez que la animación termina para liberar recursos
        this.on('animationcomplete', () => {
            this.destroy();
        }, this);
    }
}