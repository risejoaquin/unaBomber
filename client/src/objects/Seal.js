// client/src/objects/Seal.js
export class Seal extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        // Usamos el sprite 'hero' temporalmente
        super(scene, x, y, 'hero');

        // Añadir a la escena y a las físicas
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // --- APARIENCIA ---
        this.setScale(2);         // Tamaño
        this.setTint(0xff0000);   // Color ROJO para indicar peligro

        // --- FÍSICAS ---
        this.body.setImmovable(true); // Nadie puede mover la bomba empujándola
        this.body.setSize(14, 14);    // Tamaño del choque

        // --- LÓGICA DE DETONACIÓN ---
        // Esperar 3000 milisegundos (3 segundos) y luego explotar
        scene.time.delayedCall(3000, () => {
            this.explode();
        });

        // Animación de "palpitar" para indicar que va a explotar
        scene.tweens.add({
            targets: this,
            alpha: 0.5,       // Se hace medio transparente
            duration: 500,
            yoyo: true,       // Va y vuelve
            repeat: -1        // Infinito hasta que explote
        });
    }

    explode() {
        console.log("¡BOOM! El sello ha detonado");
        // Aquí pondremos la lógica de fuego y daño en el futuro

        // Por ahora, solo desaparece
        this.destroy();
    }
}