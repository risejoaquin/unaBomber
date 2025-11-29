import Phaser from 'phaser';

export class Portal {
    private sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    private isActive: boolean = false;

    constructor(scene: Phaser.Scene) {
        // Inicializar oculto fuera de pantalla
        this.sprite = scene.physics.add.sprite(-100, -100, 'portal');
        this.sprite.setDepth(0);
        this.sprite.setVisible(false);
        this.sprite.body.enable = false;

        // Animación de "latido"
        scene.tweens.add({
            targets: this.sprite,
            scale: { from: 0.9, to: 1.1 },
            alpha: { from: 0.8, to: 1 },
            duration: 1000,
            yoyo: true,
            repeat: -1
        });

        this.sprite.setData('type', 'portal');
    }

    public getSprite() {
        return this.sprite;
    }

    public spawn(x: number, y: number) {
        if (this.isActive) return;
        this.isActive = true;

        this.sprite.setPosition(x, y);
        this.sprite.setVisible(true);
        this.sprite.body.enable = true;
        console.log(`Portal abierto en ${x}, ${y}`);
    }
}