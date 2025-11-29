import Phaser from 'phaser';

export type ItemType = 'range' | 'speed' | 'bomb';

export class Item {
  private sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private type: ItemType;
  private scene: Phaser.Scene;
  private isInvulnerable: boolean = true; // Empieza invulnerable

  // CONFIGURACIÓN
  private readonly LIFETIME = 10000; // 10s vida total
  private readonly BLINK_START = 7000; // 7s empieza a parpadear

  constructor(scene: Phaser.Scene, x: number, y: number, type: ItemType) {
    this.scene = scene;
    this.type = type;

    let textureKey = '';
    switch (type) {
      case 'range': textureKey = 'item_range'; break;
      case 'speed': textureKey = 'item_speed'; break;
      case 'bomb': textureKey = 'item_bomb'; break;
    }

    this.sprite = scene.physics.add.sprite(x, y, textureKey);
    this.sprite.setData('item', this);

    // Configuración física
    this.sprite.setImmovable(true);
    this.sprite.body.moves = false;
    this.sprite.body.setSize(24, 24); // Hitbox ligeramente más pequeña

    // ANIMACIÓN DE APARICIÓN (POP)
    this.sprite.setScale(0);
    scene.tweens.add({
      targets: this.sprite,
      scale: 1,
      duration: 400,
      ease: 'Back.out'
    });

    // ANIMACIÓN FLOTANDO
    scene.tweens.add({
      targets: this.sprite,
      y: y - 4,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // TEMPORIZADORES

    // 1. Quitar invulnerabilidad después de 600ms (la explosión dura 500ms)
    this.scene.time.delayedCall(600, () => {
      this.isInvulnerable = false;
    });

    // 2. Parpadeo de aviso
    this.scene.time.delayedCall(this.BLINK_START, () => {
      if (!this.sprite || !this.sprite.active) return;
      this.scene.tweens.add({
        targets: this.sprite,
        alpha: 0.2,
        duration: 200,
        yoyo: true,
        repeat: -1
      });
    });

    // 3. Muerte natural por tiempo
    this.scene.time.delayedCall(this.LIFETIME, () => {
      if (this.sprite && this.sprite.active) {
        this.destroy();
      }
    });
  }

  public getSprite() { return this.sprite; }
  public getType() { return this.type; }

  // Se llama cuando una explosión toca el item
  public explode() {
    // Si acaba de nacer, ignoramos la explosión madre
    if (this.isInvulnerable) return;
    this.destroy();
  }

  public destroy() {
    if (this.scene) this.scene.tweens.killTweensOf(this.sprite);

    if (this.sprite && this.sprite.active) {
      this.sprite.body.enable = false;

      this.scene.tweens.add({
        targets: this.sprite,
        scale: 0,
        alpha: 0,
        duration: 200,
        onComplete: () => this.sprite.destroy()
      });
    }
  }
}