import Phaser from 'phaser';
import { TILE_SIZE } from '../main.js'; // Importa el tamaño del tile para cálculos precisos

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        // Llama al constructor de la clase padre (Sprite de Arcade Physics)
        // 'player_sprite' es la KEY que debes haber definido en BootScene.js
        super(scene, x, y, 'player_sprite');

        // Añade el sprite del jugador a la escena para que se dibuje
        scene.add.existing(this);
        // Añade el cuerpo físico del jugador al sistema de físicas de la escena
        scene.physics.add.existing(this);

        // Configuración del cuerpo físico
        this.setCollideWorldBounds(true); // Impide que el jugador se salga del mapa
        // Ajusta el tamaño de la caja de colisión (hitbox). Un poco más pequeño que el tile para un movimiento más suave.
        this.body.setSize(TILE_SIZE * 0.8, TILE_SIZE * 0.8);
        // Centra la hitbox dentro del sprite. Ajusta estos valores si tu sprite no está centrado.
        this.body.setOffset(TILE_SIZE * 0.1, TILE_SIZE * 0.1);

        // Propiedades del jugador
        this.speed = 100; // Velocidad de movimiento en píxeles/segundo
        this.isAlive = true; // Estado de vida del jugador
        this.bombsAvailable = 1; // Número máximo de bombas que puede colocar simultáneamente
        this.bombsPlaced = 0; // Contador de bombas activas en el mapa

        // Inicializa las animaciones del jugador
        this.initAnimations();
    }

    initAnimations() {
        // Crea las animaciones para el jugador.
        // ¡IMPORTANTE! Asegúrate de que los números de frame (start: 0, end: 2, etc.)
        // coinciden con la disposición de tu hoja de sprites (player.png).

        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('player_sprite', { start: 0, end: 0 }), // Frame para estado de reposo
            frameRate: 10,
            repeat: -1 // Repetir indefinidamente
        });

        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers('player_sprite', { start: 0, end: 2 }), // Frames para caminar hacia abajo
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers('player_sprite', { start: 3, end: 5 }), // Frames para caminar hacia arriba
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('player_sprite', { start: 6, end: 8 }), // Frames para caminar hacia la izquierda
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('player_sprite', { start: 9, end: 11 }), // Frames para caminar hacia la derecha
            frameRate: 10,
            repeat: -1
        });

        this.play('idle'); // Inicia con la animación de reposo
    }

    /**
     * Método update del jugador, llamado en cada frame por GameScene.
     * Maneja el movimiento basado en los cursores.
     * @param {Phaser.Types.Input.Keyboard.CursorKeys} cursors - Objeto con el estado de las flechas del teclado.
     */
    update(cursors) {
        if (!this.isAlive) {
            this.setVelocity(0); // Si está muerto, no se mueve
            return;
        }

        this.setVelocity(0); // Reinicia la velocidad en cada frame

        // Movimiento Horizontal
        if (cursors.left.isDown) {
            this.setVelocityX(-this.speed);
            this.play('left', true); // Reproduce la animación 'left', ignorando si ya se está reproduciendo
        } else if (cursors.right.isDown) {
            this.setVelocityX(this.speed);
            this.play('right', true); // Reproduce la animación 'right'
        }

        // Movimiento Vertical
        if (cursors.up.isDown) {
            this.setVelocityY(-this.speed);
            this.play('up', true); // Reproduce la animación 'up'
        } else if (cursors.down.isDown) {
            this.setVelocityY(this.speed);
            this.play('down', true); // Reproduce la animación 'down'
        }

        // Si no hay teclas de movimiento presionadas, vuelve a la animación 'idle'
        if (this.body.velocity.x === 0 && this.body.velocity.y === 0) {
            this.play('idle', true);
        }
    }

    /**
     * Intenta colocar una bomba en la posición actual del jugador.
     * Se llama cuando se presiona la tecla ESPACIO.
     */
    tryPlaceBomb() {
        if (this.bombsPlaced < this.bombsAvailable) {
            // Calcula la posición del centro del tile donde se encuentra el jugador
            const tileX = Math.floor(this.x / TILE_SIZE);
            const tileY = Math.floor(this.y / TILE_SIZE);
            const bombX = (tileX * TILE_SIZE) + (TILE_SIZE / 2);
            const bombY = (tileY * TILE_SIZE) + (TILE_SIZE / 2);

            // Obtiene una bomba del grupo de bombas en GameScene y la activa
            // Se pasa 'this' (la referencia al jugador) para que la bomba sepa quién la colocó
            const bomb = this.scene.bombsGroup.get(bombX, bombY, this);

            if (bomb) {
                this.bombsPlaced++; // Incrementa el contador de bombas colocadas
                // Opcional: si la bomba necesita inicialización adicional, puedes llamarla aquí:
                // bomb.init(this); 
            }
        }
    }

    /**
     * Lógica para cuando el jugador muere.
     * Se llama cuando el jugador colisiona con un enemigo o una explosión.
     */
    die() {
        if (!this.isAlive) return; // Evita llamar a die() varias veces si ya está muerto

        this.isAlive = false;
        this.setVelocity(0); // Detiene el movimiento
        this.setTint(0xff0000); // Cambia el color del sprite a rojo como feedback visual
        this.anims.stop(); // Detiene cualquier animación
        console.log('¡Jugador muerto!');

        // Desactiva el cuerpo físico para que no siga colisionando mientras está "muerto"
        this.body.enable = false;

        // Opcional: Reinicia la escena después de un corto retraso
        this.scene.time.delayedCall(1500, () => {
            this.scene.scene.restart(); // Reinicia la escena del juego (puedes cambiar esto por lógica de vidas, etc.)
        }, [], this);
    }

    /**
     * Método para liberar una bomba (se llama cuando una bomba explota).
     * Decrementa el contador de bombas colocadas.
     */
    releaseBomb() {
        this.bombsPlaced--;
        if (this.bombsPlaced < 0) this.bombsPlaced = 0; // Asegura que no sea negativo
    }
}