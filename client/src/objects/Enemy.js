import Phaser from 'phaser';

export default class Enemy extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture = 'enemy', frame = 0) {
        super(scene, x, y, texture, frame);

        scene.add.existing(this); // Añade el enemigo a la escena
        scene.physics.world.enable(this); // Habilita la física para el enemigo

        this.body.setCollideWorldBounds(true); // Asegura que el enemigo no salga del mundo
        this.body.setImmovable(false); // Puede moverse

        // Ejemplo básico de movimiento del enemigo
        this.speed = 50; // Velocidad del enemigo
        this.setFlipX(true); // Orientación inicial del sprite
        this.moveDirection = 1; // 1 para derecha, -1 para izquierda
        this.lastUpdateTime = 0;
        this.changeDirectionInterval = 2000; // Cambiar de dirección cada 2 segundos

        this.anims.create({
            key: 'enemy_walk',
            frames: this.anims.generateFrameNumbers('enemy', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.play('enemy_walk');
    }

    update(time, delta) {
        // Movimiento simple de un lado a otro
        if (time - this.lastUpdateTime > this.changeDirectionInterval) {
            this.moveDirection *= -1; // Invierte la dirección
            this.setFlipX(this.moveDirection === 1); // Voltea el sprite
            this.lastUpdateTime = time;
        }

        this.body.setVelocityX(this.speed * this.moveDirection);
    }
}