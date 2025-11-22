import Phaser from 'phaser';

/**
 * Player: Representa al jugador controlable en el juego.
 * Maneja el movimiento, la colocación de bombas y su ciclo de vida (morir/reaparecer).
 */
export default class Player extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        // Llama al constructor de la clase base Sprite
        // 'player_sprite' es la KEY del spritesheet cargado en BootScene
        super(scene, x, y, 'player_sprite');

        // Añade el jugador a la escena y al sistema de físicas de la escena
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Configuración del cuerpo de físicas
        this.body.setCollideWorldBounds(true); // El jugador no puede salir de los límites del mundo
        this.body.setSize(10, 10);             // Ajusta el tamaño de la hitbox del cuerpo físico
        this.body.setOffset(3, 6);             // Desplaza la hitbox para centrarla mejor con el sprite de 16x16

        // Propiedades del jugador
        this.speed = 120;        // Velocidad de movimiento en píxeles/segundo
        this.isAlive = true;     // Estado de vida del jugador
        this.bombCount = 1;      // Máximo de bombas que el jugador puede tener activas simultáneamente
    }

    /**
     * El método update se llama automáticamente en cada fotograma del juego.
     * Maneja el input del jugador y actualiza su posición.
     */
    update(time, delta) {
        if (!this.isAlive) return; // Si el jugador no está vivo, no procesa el input ni el movimiento

        this.body.setVelocity(0); // Reinicia la velocidad en cada frame para evitar el "deslizamiento"
        const cursors = this.scene.cursors; // Obtiene el objeto de cursores de la GameScene

        let velocityX = 0;
        let velocityY = 0;

        // Lee el input del teclado
        if (cursors.left.isDown) velocityX -= 1;
        if (cursors.right.isDown) velocityX += 1;
        if (cursors.up.isDown) velocityY -= 1;
        if (cursors.down.isDown) velocityY += 1;

        // Normaliza el vector de velocidad para que el movimiento diagonal no sea más rápido
        if (velocityX !== 0 || velocityY !== 0) {
            const length = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
            velocityX = (velocityX / length) * this.speed;
            velocityY = (velocityY / length) * this.speed;
        }

        this.body.setVelocity(velocityX, velocityY); // Aplica la velocidad al cuerpo físico

        // Controla el flip del sprite para que mire en la dirección del movimiento horizontal
        if (velocityX < 0) this.setFlipX(true);
        else if (velocityX > 0) this.setFlipX(false);

        // Aquí se implementarían las animaciones (ej. this.anims.play('player_walk_left', true))
    }

    /**
     * Intenta colocar una bomba en la posición actual del jugador.
     * Solo se permite si el jugador tiene bombas disponibles y el tile no es un muro.
     */
    tryPlaceBomb() {
        // Verifica si el número de bombas activas es menor que la capacidad del jugador
        if (this.scene.bombsGroup.countActive() < this.bombCount) {
            const map = this.scene.map;
            const scale = this.scene.SCALE_FACTOR;
            const scaledTileSize = map.tileWidth * scale;

            // Calcula la posición del centro del tile donde se encuentra el jugador
            const tileX = Math.floor(this.x / scaledTileSize);
            const tileY = Math.floor(this.y / scaledTileSize);

            const bombWorldX = (tileX * scaledTileSize) + (scaledTileSize / 2);
            const bombWorldY = (tileY * scaledTileSize) + (scaledTileSize / 2);

            // Usa GameScene.getTileAtWorldXY para verificar si el tile es un muro
            const tileAtPos = this.scene.getTileAtWorldXY(bombWorldX, bombWorldY);
            if (tileAtPos && tileAtPos.collides) {
                return; // No se puede colocar una bomba dentro de un muro
            }

            // Obtiene una bomba del pool de bombas de la GameScene y la activa
            const bomb = this.scene.bombsGroup.get(bombWorldX, bombWorldY);
            if (bomb) {
                bomb.place(this.scene.SCALE_FACTOR); // Inicializa la bomba con la escala de la escena
            }
        }
    }

    /**
     * Lógica cuando el jugador muere.
     */
    die() {
        if (!this.isAlive) return; // Evita morir varias veces

        console.log('Jugador ha muerto');
        this.isAlive = false;
        this.body.enable = false; // Desactiva las físicas para que el jugador no interactúe más
        this.setTint(0xff0000);   // Cambia el color del sprite a rojo como feedback visual

        // Espera un tiempo (ej. 2 segundos) antes de reaparecer
        this.scene.time.delayedCall(2000, () => {
            this.respawn();
        });
    }

    /**
     * Lógica para reaparecer al jugador.
     */
    respawn() {
        console.log('Jugador reaparece');
        this.isAlive = true;
        this.body.enable = true; // Reactiva las físicas
        this.clearTint();        // Restaura el color original del sprite

        // Mueve al jugador a una posición de spawn predefinida
        const spawnX = (this.scene.TILE_SIZE * 1.5) * this.scene.SCALE_FACTOR;
        const spawnY = (this.scene.TILE_SIZE * 1.5) * this.scene.SCALE_FACTOR;
        this.setPosition(spawnX, spawnY);
    }
}