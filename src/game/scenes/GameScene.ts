import Phaser from 'phaser';
import { Enemy } from '../entities/Enemy';
import { Item, ItemType } from '../entities/Item';
import { Portal } from '../entities/Portal';
import { GameAction, PlayerSessionData, ActionType, XP_VALUES } from '../../core/progression/XPSystemTypes';

const BRICK_TILE_ID = 449;
let GAME_START_TIME = Date.now();
const MAX_STORY_LEVEL = 7; // Define el número máximo de niveles de la historia.

// --- 👑 NARRATIVA DEL JUEGO (7 Niveles) 👑 ---
const STORY_NARRATIVE = [
  // Nivel 1 -> 2 (Índice 0)
  { title: "El Decreto del Rey", text: "El reino ha sido silenciado. La Princesa Elara ha sido secuestrada por el Barón Oscuro. ¡Debes liberar el primer sector del calabozo!" },
  // Nivel 2 -> 3 (Índice 1)
  { title: "Primer Desafío Superado", text: "Has limpiado la guardia menor. El Barón se esconde en los pisos inferiores, custodiado por sus mejores orcos." },
  { title: "Profundizando", text: "El aire se vuelve denso y frío. El Barón ha colocado trampas. ¡Ten cuidado!" },
  { title: "El Laberinto de la Locura", text: "Te acercas. Sientes la presencia de Elara. Sus lamentos se pierden en este laberinto de piedra y metal." },
  { title: "La Fortaleza Interior", text: "Solo dos pisos te separan de la Princesa. Sus defensores ahora son más rápidos y letales. El final está cerca." },
  { title: "La Antesala del Jefe", text: "Escuchas la voz del Barón. Ha preparado su sala del trono para tu llegada. Este es el último mapa antes de la confrontación." },
  { title: "¡El Rescate Final!", text: "¡Has derrotado al Barón Oscuro y la Princesa Elara está a salvo! El reino te debe la vida eterna." }
];


export class GameScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey!: Phaser.Input.Keyboard.Key;

  private isPlayerDead: boolean = false;
  private isLevelComplete: boolean = false;
  private portalSpawned: boolean = false;
  private gameEnded: boolean = false;

  private currentLevel: number = 1;
  private difficulty: string = 'easy';
  private playerSpeed: number = 160;
  private bombRange: number = 1;
  private maxBombs: number = 1;
  private currentBombs: number = 0;
  private score: number = 0;
  private lives: number = 3;
  private deaths: number = 0;

  private currentSessionXP: number = 0;
  private statusText!: Phaser.GameObjects.Text;

  private map!: Phaser.Tilemaps.Tilemap;
  private wallsLayer!: Phaser.Tilemaps.TilemapLayer | null;

  private portal!: Portal;
  private enemiesList: Enemy[] = [];

  private cratesGroup!: Phaser.Physics.Arcade.Group;

  private bombs!: Phaser.Physics.Arcade.Group;
  private explosionGroup!: Phaser.Physics.Arcade.Group;
  private itemsGroup!: Phaser.Physics.Arcade.Group;
  private enemiesGroup!: Phaser.Physics.Arcade.Group;

  private MAP_WIDTH = 25;
  private MAP_HEIGHT = 19;

  private sessionActions: GameAction[] = [];
  private lastMovementReport: number = 0;
  private addSessionXP!: (data: PlayerSessionData) => Promise<number>;

  constructor() {
    super('GameScene');
  }

  init(data: { difficulty: string, level?: number, score?: number, lives?: number, bombs?: number, speed?: number, range?: number, addSessionXP?: (data: PlayerSessionData) => Promise<number> }) {

    this.difficulty = data.difficulty || 'easy';

    if (this.difficulty === 'medium' && !data.speed) this.playerSpeed = 180;
    if (this.difficulty === 'hard' && !data.speed) this.playerSpeed = 250;

    this.currentLevel = data.level || 1;
    this.score = data.score || 0;
    this.lives = data.lives !== undefined ? data.lives : 3;
    this.maxBombs = data.bombs || 1;
    this.playerSpeed = data.speed || 160;
    this.bombRange = data.range || 1;

    if (data.addSessionXP) {
      this.addSessionXP = data.addSessionXP;
    }

    this.isPlayerDead = false;
    this.isLevelComplete = false;
    this.portalSpawned = false;
    this.currentBombs = 0;
    this.deaths = 0;

    this.sessionActions = [];
    this.gameEnded = false;
    GAME_START_TIME = Date.now();
    this.currentSessionXP = 0;

    console.log(`[GameScene INIT] Intentando cargar Nivel: ${this.currentLevel}`);
  }

  preload() {
    this.load.spritesheet('player', 'assets/sprites/player.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('enemy', 'assets/sprites/enemy.png', { frameWidth: 32, frameHeight: 32 });
    this.load.image('bomb', 'assets/sprites/bomb.png');
    this.load.image('portal', 'assets/sprites/portal.png');
    this.load.image('crate', 'assets/sprites/crate.png');

    this.load.tilemapTiledJSON('level1', 'assets/maps/level1.json');
    this.load.tilemapTiledJSON('level2', 'assets/maps/level2.json');
    this.load.tilemapTiledJSON('level3', 'assets/maps/level3.json');
    this.load.tilemapTiledJSON('level4', 'assets/maps/level4.json');
    this.load.tilemapTiledJSON('level5', 'assets/maps/level5.json');
    this.load.tilemapTiledJSON('level6', 'assets/maps/level6.json');
    this.load.tilemapTiledJSON('level7', 'assets/maps/level7.json');

    this.load.image('tiles', 'assets/maps/tileset.png');

    this.load.image('item_range', 'assets/items/powerup_range.png');
    this.load.image('item_speed', 'assets/items/powerup_speed.png');
    this.load.image('item_bomb', 'assets/items/powerup_bomb.png');

    this.load.audio('bgm', 'assets/sounds/bgm.mp3');
    this.load.audio('sfx_bomb', 'assets/sounds/place_bomb.wav');
    this.load.audio('sfx_explode', 'assets/sounds/explosion.mp3');
    this.load.audio('sfx_powerup', 'assets/sounds/powerup.wav');
  }

  create() {
    this.sound.stopAll();
    this.sound.play('bgm', { loop: true, volume: 0.3 });

    this.bombs = this.physics.add.group();
    this.explosionGroup = this.physics.add.group();
    this.enemiesGroup = this.physics.add.group();
    this.itemsGroup = this.physics.add.group();
    this.cratesGroup = this.physics.add.group();
    this.enemiesList = [];

    const levelKey = `level${this.currentLevel}`;

    const mapExists = this.cache.tilemap.exists(levelKey);
    console.log(`[GameScene CREATE] Buscando clave "${levelKey}". Existe: ${mapExists}`);

    const mapKey = mapExists ? levelKey : 'level1';

    if (mapKey === 'level1' && this.currentLevel !== 1) {
      console.warn(`[MAP LOAD ERROR] No se pudo cargar el mapa "${levelKey}". Usando FALLBACK a level1.json.`);
    }

    this.map = this.make.tilemap({ key: mapKey });

    this.MAP_WIDTH = this.map.width;
    this.MAP_HEIGHT = this.map.height;

    let tileset: Phaser.Tilemaps.Tileset | null = null;
    if (this.map.tilesets.length > 0) {
      const tilesetName = this.map.tilesets[0].name;
      tileset = this.map.addTilesetImage(tilesetName, 'tiles');
      if (tileset) {

        this.textures.get('tiles').setFilter(1);

        const floorLayer = this.map.layers.find(l => l.name.toLowerCase().includes('floor') || l.name.toLowerCase().includes('suelo'));
        if (floorLayer) {
          this.map.createLayer(floorLayer.name, tileset, 0, 0);
        }

        const wallLayer = this.map.layers.find(l => l.name.toLowerCase().includes('wall') || l.name.toLowerCase().includes('muro'));
        if (wallLayer) {
          this.wallsLayer = this.map.createLayer(wallLayer.name, tileset, 0, 0);
          if (this.wallsLayer) {
            this.wallsLayer.setCollisionByExclusion([-1]);
          }
        }

        this.generateCrates();
      }
    }

    this.createAnimations();
    this.portal = new Portal(this);

    const px = (1 * 32) + 16;
    const py = (1 * 32) + 16;
    this.player = this.physics.add.sprite(px, py, 'player');
    this.player.body.setSize(20, 20);
    this.player.body.setOffset(6, 12);
    this.player.setCollideWorldBounds(true);

    // ✅ Configura los límites del mundo para que coincidan EXACTAMENTE con tu mapa.
    this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.physics.world.on('worldbounds', (body: Phaser.Physics.Arcade.Body) => {
      // Forzar cambio de dirección en enemigo si toca el límite
      const enemy = body.gameObject.getData('owner') as Enemy;
      if (enemy) {
        enemy.changeDirection();
      }
    }, this);


    this.spawnEnemies(3 + (this.currentLevel * 2));

    if (this.wallsLayer) {
      this.physics.add.collider(this.player, this.wallsLayer);
      this.physics.add.collider(this.enemiesGroup, this.wallsLayer);
    }
    this.physics.add.collider(this.player, this.cratesGroup);
    this.physics.add.collider(this.enemiesGroup, this.cratesGroup);


    this.physics.add.collider(this.player, this.bombs);
    this.physics.add.collider(this.enemiesGroup, this.bombs);

    this.physics.add.overlap(this.explosionGroup, this.enemiesGroup, this.handleExplosionEnemy, undefined, this);
    this.physics.add.overlap(this.explosionGroup, this.cratesGroup, this.handleExplosionCrate, undefined, this);
    this.physics.add.overlap(this.explosionGroup, this.itemsGroup, this.handleExplosionItem, undefined, this);

    this.physics.add.overlap(this.player, this.enemiesGroup, this.handlePlayerDeath, undefined, this);
    this.physics.add.overlap(this.player, this.itemsGroup, this.handlePickupItem, undefined, this);
    this.physics.add.overlap(this.player, this.portal.getSprite(), this.handleLevelComplete, undefined, this);

    this.statusText = this.add.text(10, 10, this.getHudText(), {
      fontFamily: 'monospace', fontSize: '16px', color: '#fff', backgroundColor: '#000000aa'
    }).setScrollFactor(0).setDepth(100);

    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    this.player.anims.play('turn');
  }

  // FUNCIÓN PARA GENERAR EL TEXTO DEL HUD
  private getHudText(): string {
    return `NIVEL ${this.currentLevel} | VIDAS: ${this.lives} | SCORE: ${this.score} | XP BASE: ${this.currentSessionXP}`;
  }

  update(time: number, delta: number) {
    if (this.isPlayerDead || this.isLevelComplete || this.gameEnded) return;

    this.handlePlayerMovement();
    this.handleBombInput();

    this.enemiesList.forEach(e => e.update(delta));

    // ✅ CLAVE: Limpia la lista de enemigos muertos para que el contador llegue a cero.
    this.enemiesList = this.enemiesList.filter(e => !e.isDead());

    if (this.enemiesList.length === 0 && !this.portalSpawned) {
      console.log("[GameScene TNT] Eliminados todos los enemigos. Spawneando portal.");
      this.spawnPortalRandomly();
    }

    this.statusText.setText(this.getHudText());
  }

  private trackAction(type: ActionType, data: { entityId?: string, gridX?: number, gridY?: number } = {}) {
    this.sessionActions.push({ type, timestamp: Date.now(), data });
  }

  private async reportSessionEnd(isComplete: boolean) {
    if (this.gameEnded) return;
    this.gameEnded = true;

    if (!this.addSessionXP) return;

    const sessionData: PlayerSessionData = {
      actions: this.sessionActions,
      sessionDurationSeconds: Math.floor((Date.now() - GAME_START_TIME) / 1000),
      deaths: this.deaths
    };

    const awardedXP = await this.addSessionXP(sessionData);

    const message = isComplete ? "¡NIVEL COMPLETADO!" : "GAME OVER";

    this.add.text(400, 300, message, { fontSize: '40px', color: '#FFD700', stroke: '#000', strokeThickness: 6, fontFamily: 'monospace' }).setOrigin(0.5);

    this.add.text(400, 350, `XP FINAL: ${awardedXP}`, { fontSize: '24px', color: '#00ff00', stroke: '#000', strokeThickness: 4, fontFamily: 'monospace' }).setOrigin(0.5).setDepth(100);
  }

  // 👑 MÉTODO DE NARRATIVA (Avance de Nivel) 👑
  private displayNarrative(level: number) {
    this.sound.stopAll();

    const storyIndex = level - 1;
    const finalIndex = Math.min(storyIndex, STORY_NARRATIVE.length - 1);
    const narrativeData = STORY_NARRATIVE[finalIndex];

    const isGameEnd = level >= MAX_STORY_LEVEL;

    this.cameras.main.setBackgroundColor('#000000');

    this.add.text(400, 200, narrativeData.title, {
      fontSize: '32px', color: '#FFD700', fontFamily: 'monospace'
    }).setOrigin(0.5).setDepth(100);

    this.add.text(400, 300, narrativeData.text, {
      fontSize: '18px', color: '#FFFFFF', wordWrap: { width: 600 }, align: 'center', fontFamily: 'monospace'
    }).setOrigin(0.5).setDepth(100);

    const continueText = this.add.text(400, 400, isGameEnd ? "PRINCESA SALVADA. VOLVIENDO AL MENÚ..." : "CONTINUAR EN 10 SEGUNDOS...", {
      fontSize: '16px', color: '#00FF00', fontFamily: 'monospace'
    }).setOrigin(0.5).setDepth(100);

    // Lógica de temporizador de 10 segundos
    this.time.delayedCall(10000, () => {
      if (isGameEnd) {
        window.location.reload();
      } else {
        const nextLevel = this.currentLevel + 1;

        this.scene.start('GameScene', {
          difficulty: this.difficulty,
          level: nextLevel,
          score: this.score,
          lives: this.lives,
          bombs: this.maxBombs,
          speed: this.playerSpeed,
          range: this.bombRange,
          addSessionXP: this.addSessionXP
        });
      }
    });
  }


  private handleLevelComplete = (player: Phaser.GameObjects.GameObject, portal: Phaser.GameObjects.GameObject) => {
    if (this.isLevelComplete) return;
    if (!this.portalSpawned) return;

    this.isLevelComplete = true; // Establecer bandera de completado inmediatamente
    this.physics.pause();
    this.sound.stopAll();

    this.score += 500;
    this.currentSessionXP += XP_VALUES.LEVEL_CLEARED;

    this.trackAction('LEVEL_CLEARED');
    this.reportSessionEnd(true);

    this.time.delayedCall(2000, () => {
      // LÓGICA PARA HARDCORE (Bucle Infinito) vs. HISTORIA
      if (this.difficulty === 'hardcore') {
        const randomLevel = Phaser.Math.Between(1, MAX_STORY_LEVEL);
        console.log(`[GameScene] Modo Hardcore: Reiniciando nivel aleatorio ${randomLevel}`);
        this.scene.start('GameScene', {
          difficulty: 'hardcore',
          level: randomLevel,
          score: this.score,
          lives: this.lives,
          bombs: this.maxBombs,
          speed: this.playerSpeed,
          range: this.bombRange,
          addSessionXP: this.addSessionXP
        });
      } else {
        // Modo Historia (Avance)
        this.displayNarrative(this.currentLevel);
      }
    });
  }

  private handleExplosionCrate = (exp: Phaser.GameObjects.GameObject, crateSprite: Phaser.GameObjects.GameObject) => {
    const sprite = crateSprite as Phaser.Physics.Arcade.Sprite;

    if (sprite && sprite.active) {
      const gridX = Math.floor(sprite.x / 32);
      const gridY = Math.floor(sprite.y / 32);

      sprite.destroy(); // Destruye el sprite de la caja
      this.currentSessionXP += XP_VALUES.BLOCK_WEAK_DESTROYED;
      this.trackAction('BLOCK_WEAK_DESTROYED', { gridX, gridY });

      if (Math.random() < 0.5) {
        this.spawnItem(sprite.x, sprite.y);
      }
    }
  }

  private handleExplosionEnemy = (exp: Phaser.GameObjects.GameObject, enemySprite: Phaser.GameObjects.GameObject) => {
    const sprite = enemySprite as Phaser.Physics.Arcade.Sprite;
    const enemy = sprite.getData('owner') as Enemy;
    if (enemy && !enemy.isDead()) {
      enemy.die();
      this.score += 100;
      this.currentSessionXP += XP_VALUES.ENEMY_KILLED;
      this.trackAction('ENEMY_KILLED', { entityId: enemy.getSprite().name });
    }
  }

  private handleExplosionItem = (exp: Phaser.GameObjects.GameObject, itemSprite: Phaser.GameObjects.GameObject) => {
    const item = itemSprite.getData('item') as Item;
    if (item) {
      item.explode();
    }
  }

  private handlePlayerDeath = (player: Phaser.GameObjects.GameObject, enemy: Phaser.GameObjects.GameObject) => {
    if (this.isPlayerDead) return;

    const eSprite = enemy as Phaser.Physics.Arcade.Sprite;
    const enemyObj = eSprite.getData('owner') as Enemy;
    if (enemyObj && enemyObj.isDead()) return;

    this.lives--;
    this.deaths++;
    this.isPlayerDead = true;
    this.physics.pause();
    (player as Phaser.Physics.Arcade.Sprite).setTint(0xff0000);

    if (this.lives > 0) {
      this.time.delayedCall(1500, () => {
        this.isPlayerDead = false;
        this.physics.resume();
        this.player.clearTint();
        this.player.setPosition((1 * 32) + 16, (1 * 32) + 16);
        this.player.alpha = 0.5;
        this.tweens.add({
          targets: this.player,
          alpha: 1,
          duration: 200,
          repeat: 5,
          onComplete: () => { this.player.alpha = 1; }
        });
      });
    } else {
      this.add.text(400, 300, "GAME OVER", { fontSize: '60px', color: '#ff0000', stroke: '#fff', strokeThickness: 4 }).setOrigin(0.5);
      this.reportSessionEnd(false);
      this.time.delayedCall(3000, () => window.location.reload());
    }
  }

  private handlePickupItem = (player: Phaser.GameObjects.GameObject, itemSprite: Phaser.GameObjects.GameObject) => {
    const item = itemSprite.getData('item') as Item;
    if (item) {
      this.sound.play('sfx_powerup');
      this.currentSessionXP += XP_VALUES.ITEM_COLLECTED;
      this.trackAction('ITEM_COLLECTED');

      if (item.getType() === 'range') {
        if (this.bombRange < 6) this.bombRange++;
      }
      if (item.getType() === 'speed') {
        this.playerSpeed = Math.min(this.playerSpeed + 20, 300);
      }
      if (item.getType() === 'bomb') {
        if (this.maxBombs < 6) this.maxBombs++;
      }

      this.score += 50;
      item.destroy();
    }
  }

  private handlePlayerMovement() {
    if (!this.player.body) return;
    this.player.setVelocity(0);

    const isMoving = this.cursors.left.isDown || this.cursors.right.isDown || this.cursors.up.isDown || this.cursors.down.isDown;
    if (isMoving && Date.now() - this.lastMovementReport > 100) {
      this.trackAction('MOVEMENT_INPUT');
      this.lastMovementReport = Date.now();
    }

    if (this.cursors.left.isDown) { this.player.setVelocityX(-this.playerSpeed); this.player.anims.play('left', true); }
    else if (this.cursors.right.isDown) { this.player.setVelocityX(this.playerSpeed); this.player.anims.play('right', true); }
    else if (this.cursors.up.isDown) { this.player.setVelocityY(-this.playerSpeed); this.player.anims.play('up', true); }
    else if (this.cursors.down.isDown) { this.player.setVelocityY(this.playerSpeed); this.player.anims.play('down', true); }
    else { this.player.anims.play('turn'); this.player.anims.stop(); }
  }

  private handleBombInput() {
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      if (this.currentBombs >= this.maxBombs) return;
      const gridX = Math.round((this.player.x - 16) / 32);
      const gridY = Math.round((this.player.y - 16) / 32);
      const x = (gridX * 32) + 16;
      const y = (gridY * 32) + 16;

      const existingBombs = this.bombs.getChildren();
      const overlap = existingBombs.some((b: any) => Phaser.Math.Distance.Between(b.x, b.y, x, y) < 10);
      if (overlap) return;

      const bomb = this.physics.add.sprite(x, y, 'bomb');
      bomb.setImmovable(true);
      bomb.body.moves = false;
      this.bombs.add(bomb);
      this.currentBombs++;
      this.sound.play('sfx_bomb');

      this.trackAction('BOMB_PLACED', { gridX, gridY });

      this.time.delayedCall(3000, () => { if (bomb.active) this.explodeBomb(bomb, bomb.x, bomb.y); });
    }
  }

  private explodeBomb(bomb: Phaser.GameObjects.GameObject, x: number, y: number) {
    (bomb as Phaser.Physics.Arcade.Sprite).disableBody(true, true);
    bomb.destroy();

    this.currentBombs--;
    this.sound.play('sfx_explode');
    this.createExplosionSprite(x, y);

    const dirs = [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }];
    let chainHitCount = 0;

    dirs.forEach(dir => {
      for (let i = 1; i <= this.bombRange; i++) {
        const tx = x + (dir.x * i * 32);
        const ty = y + (dir.y * i * 32);
        const tileX = Math.floor(tx / 32);
        const tileY = Math.floor(ty / 32);

        if (this.wallsLayer?.hasTileAt(tileX, tileY)) break;

        const hitCrate = this.cratesGroup.getChildren().find(
          (c: Phaser.GameObjects.Sprite) => Math.floor(c.x / 32) === tileX && Math.floor(c.y / 32) === tileY
        ) as Phaser.GameObjects.Sprite | undefined;

        if (hitCrate) {
          this.createExplosionSprite(tx, ty);
          this.handleExplosionCrate(undefined as any, hitCrate);
          chainHitCount++;
          break; // Una caja detiene la explosión en esa dirección
        }

        this.createExplosionSprite(tx, ty);
      }
    });

    for (let i = 0; i < chainHitCount; i++) {
      this.currentSessionXP += XP_VALUES.CHAIN_HIT_BONUS;
      this.trackAction('CHAIN_HIT_BONUS');
    }
  }

  private createExplosionSprite(x: number, y: number) {
    const ex = this.add.rectangle(x, y, 32, 32, 0xffa500, 1);
    this.physics.add.existing(ex);
    this.explosionGroup.add(ex);
    this.tweens.add({ targets: ex, alpha: 0, duration: 500, onComplete: () => ex.destroy() });
  }

  private spawnPortalRandomly() {
    this.portalSpawned = true;
    let valid = false;
    let x = 0, y = 0, tries = 200;

    while (!valid && tries > 0) {
      tries--;
      const gx = Phaser.Math.Between(1, this.MAP_WIDTH - 2);
      const gy = Phaser.Math.Between(1, this.MAP_HEIGHT - 2);

      const hasWall = this.wallsLayer?.hasTileAt(gx, gy);
      const hasCrate = this.cratesGroup.getChildren().some(
        (c: Phaser.GameObjects.Sprite) => Math.floor(c.x / 32) === gx && Math.floor(c.y / 32) === gy
      );

      if (!hasWall && !hasCrate) {
        x = (gx * 32) + 16;
        y = (gy * 32) + 16;

        if (Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y) > 64) {
          valid = true;
        }
      }
    }
    if (!valid) {
      x = (this.MAP_WIDTH - 2) * 32 + 16;
      y = (this.MAP_HEIGHT - 2) * 32 + 16;
      console.warn("[Portal Spawn] No se encontró ubicación aleatoria válida. Usando esquina inferior derecha.");
    }

    this.portal.spawn(x, y);
    const txt = this.add.text(400, 300, "¡PORTAL ABIERTO!", { fontSize: '30px', color: '#00ff00', stroke: '#000', strokeThickness: 4, fontFamily: 'monospace' }).setOrigin(0.5);
    this.time.delayedCall(2000, () => txt.destroy());
  }

  private spawnItem(x: number, y: number) {
    const itemTypes: ItemType[] = ['range', 'speed', 'bomb'];
    const randomType = itemTypes[Phaser.Math.Between(0, itemTypes.length - 1)];
    const item = new Item(this, x, y, randomType);
    this.itemsGroup.add(item.getSprite());
  }

  private createAnimations() {
    if (!this.anims.exists('down')) {
      this.anims.create({ key: 'down', frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }), frameRate: 8, repeat: -1 });
      this.anims.create({ key: 'up', frames: this.anims.generateFrameNumbers('player', { start: 4, end: 7 }), frameRate: 8, repeat: -1 });
      this.anims.create({ key: 'right', frames: this.anims.generateFrameNumbers('player', { start: 8, end: 11 }), frameRate: 8, repeat: -1 });
      this.anims.create({ key: 'left', frames: this.anims.generateFrameNumbers('player', { start: 12, end: 15 }), frameRate: 8, repeat: -1 });
    }
    if (!this.anims.exists('enemy_down')) {
      this.anims.create({ key: 'enemy_down', frames: this.anims.generateFrameNumbers('enemy', { start: 0, end: 3 }), frameRate: 6, repeat: -1 });
      this.anims.create({ key: 'enemy_right', frames: this.anims.generateFrameNumbers('enemy', { start: 4, end: 7 }), frameRate: 6, repeat: -1 });
      this.anims.create({ key: 'enemy_up', frames: this.anims.generateFrameNumbers('enemy', { start: 8, end: 11 }), frameRate: 6, repeat: -1 });
      this.anims.create({ key: 'enemy_left', frames: this.anims.generateFrameNumbers('enemy', { start: 4, end: 7 }), frameRate: 6, repeat: -1 });
    }
    this.anims.create({ key: 'turn', frames: [{ key: 'player', frame: 0 }], frameRate: 20 });
  }

  private spawnEnemies(count: number) {
    let spawned = 0; let tries = 0;
    while (spawned < count && tries < 100) {
      tries++;
      const x = Phaser.Math.Between(1, this.MAP_WIDTH - 2);
      const y = Phaser.Math.Between(1, this.MAP_HEIGHT - 2);
      if (x < 5 && y < 5) continue;

      const hasWall = this.wallsLayer?.hasTileAt(x, y);
      const hasCrate = this.cratesGroup.getChildren().some(
        (c: Phaser.GameObjects.Sprite) => Math.floor(c.x / 32) === x && Math.floor(c.y / 32) === y
      );

      if (!hasWall && !hasCrate) {
        // ✅ CORRECCIÓN: Pasar la referencia del jugador
        const enemy = new Enemy(this, (x * 32) + 16, (y * 32) + 16, this.player);
        this.enemiesList.push(enemy);
        this.enemiesGroup.add(enemy.getSprite());
        spawned++;
      }
    }
  }

  private generateCrates() {
    for (let y = 0; y < this.MAP_HEIGHT; y++) {
      for (let x = 0; x < this.MAP_WIDTH; x++) {
        // Excluir área de inicio del jugador (1,1)
        if ((x === 1 && y === 1) || (x === 1 && y === 2) || (x === 2 && y === 1)) continue;

        const hasWall = this.wallsLayer?.hasTileAt(x, y);

        // Si no es un muro y hay una probabilidad del 30% de colocar una caja
        if (!hasWall && Math.random() < 0.3) {
          const px = (x * 32) + 16;
          const py = (y * 32) + 16;

          const crate = this.physics.add.sprite(px, py, 'crate');
          crate.setImmovable(true);
          crate.body.moves = false;
          crate.body.setSize(32, 32);
          crate.setDepth(1);

          this.cratesGroup.add(crate);
        }
      }
    }
  }
}