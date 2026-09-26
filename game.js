const WIDTH = 800;
const HEIGHT = 600;
const GROUND_Y = 580; // top of the ground platform
const FONT = 'Futura Condensed ExtraBold, Futura, Impact, sans-serif';

const PLAYER = {
    startX: 100,
    accel: 700,
    maxSpeed: 200,
    sprintSpeed: 360, // holding Z
    jump: -400,
    stompBounce: -260,
    invulnerableMs: 1000,
    maxHealth: 3
};

const EYE = {
    minX: 400, // half of the screen
    maxX: 720, // spawn position
    speed: 100,
    speedPerKill: 25,
    respawnMs: 2500
};

class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TitleScene' });
    }

    create() {
        this.cameras.main.setBackgroundColor('#000000');

        this.add.text(WIDTH / 2, 200, 'PLOOMI AND THE COSMIC CORE', {
            fontSize: '50px',
            color: '#ffffff',
            fontFamily: FONT
        }).setOrigin(0.5);

        const startButton = this.add.text(WIDTH / 2, 350, 'Start Plooming!', {
            fontSize: '40px',
            color: '#ffffff',
            fontFamily: FONT
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.add.text(WIDTH / 2, 470, '← → move   ↑ jump   Z sprint\nStomp the eye, don\'t touch it!', {
            fontSize: '18px',
            color: '#8899bb',
            fontFamily: 'Courier New',
            align: 'center'
        }).setOrigin(0.5);

        const start = () => this.scene.start('GameScene');
        startButton.on('pointerdown', start);
        startButton.on('pointerover', () => startButton.setColor('#0055ff'));
        startButton.on('pointerout', () => startButton.setColor('#ffffff'));
        this.input.keyboard.once('keydown-ENTER', start);
        this.input.keyboard.once('keydown-SPACE', start);
    }
}

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // Textures survive scene restarts, so only generate them once
        if (this.textures.exists('ploomi_idle')) {
            return;
        }

        // Ploomi: dark green square, eyes shift with direction
        const ploomi = (key, eyeX) => {
            const g = this.add.graphics();
            g.fillStyle(0x006600);
            g.fillRect(0, 0, 32, 32);
            g.fillStyle(0x000000);
            g.fillRect(eyeX, 7, 6, 6);
            g.fillRect(eyeX + 12, 7, 6, 6);
            g.generateTexture(key, 32, 32);
            g.destroy();
        };
        ploomi('ploomi_idle', 7);
        ploomi('ploomi_left', 5);
        ploomi('ploomi_right', 9);

        // Heart
        let g = this.add.graphics();
        g.fillStyle(0xff0000);
        g.fillRect(6, 10, 4, 4);
        g.fillRect(4, 8, 8, 4);
        g.fillRect(2, 6, 12, 4);
        g.fillRect(0, 4, 16, 4);
        g.fillRect(2, 2, 12, 4);
        g.fillRect(4, 0, 8, 4);
        g.generateTexture('heart', 16, 16);
        g.destroy();

        // Angry eye, looking left
        g = this.add.graphics();
        g.fillStyle(0x000000);
        g.fillCircle(20, 20, 20);
        g.fillStyle(0xffffff);
        g.fillCircle(20, 20, 12);
        g.fillStyle(0x000000);
        g.fillRect(8, 8, 24, 12); // angry lid
        g.fillCircle(10, 20, 6); // pupil
        g.fillCircle(50, 20, 12);
        g.generateTexture('eye', 70, 40);
        g.destroy();

        // Trail particle
        g = this.add.graphics();
        g.fillStyle(0x00aa00);
        g.fillRect(0, 0, 8, 8);
        g.generateTexture('spark', 8, 8);
        g.destroy();
    }

    create() {
        this.cameras.main.setBackgroundColor('#001133');
        this.physics.world.setBounds(0, 0, WIDTH, HEIGHT);

        // Platforms
        this.platforms = this.physics.add.staticGroup();
        const ground = this.add.rectangle(WIDTH / 2, GROUND_Y + 10, WIDTH, 20, 0x444444);
        this.platforms.add(ground);

        // Player
        this.player = this.physics.add.sprite(PLAYER.startX, GROUND_Y - 16, 'ploomi_idle');
        this.player.setCollideWorldBounds(true);
        this.player.setBounce(0.2);
        this.player.setDragX(1000);
        this.player.setMaxVelocity(PLAYER.maxSpeed, 1000);
        this.invulnerableUntil = 0;

        // Dash trail
        this.emitter = this.add.particles('spark').createEmitter({
            speed: 0,
            scale: { start: 1, end: 0 },
            alpha: { start: 0.8, end: 0 },
            lifespan: 400,
            on: false
        });

        // Eye enemy
        this.eyeKills = 0;
        this.eye = this.physics.add.sprite(EYE.maxX, GROUND_Y, 'eye').setOrigin(0.5, 1);
        this.eye.body.setAllowGravity(false);
        this.eye.setImmovable(true);
        this.eye.setVelocityX(-EYE.speed);

        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.overlap(this.player, this.eye, this.touchEye, null, this);

        // HUD
        this.health = PLAYER.maxHealth;
        this.hearts = [];
        for (let i = 0; i < PLAYER.maxHealth; i++) {
            this.hearts.push(this.add.image(20 + i * 24, 20, 'heart').setScrollFactor(0).setDepth(100));
        }
        this.scoreText = this.add.text(WIDTH - 10, 10, 'Eyes: 0', {
            fontSize: '20px', color: '#ffffff', fontFamily: 'Courier New'
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(100);

        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.zKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
        this.gameOver = false;
    }

    update(time) {
        if (this.gameOver) {
            return;
        }

        const body = this.player.body;
        const sprinting = this.zKey.isDown;
        body.maxVelocity.x = sprinting ? PLAYER.sprintSpeed : PLAYER.maxSpeed;

        if (this.cursors.left.isDown) {
            this.player.setAccelerationX(-PLAYER.accel);
        } else if (this.cursors.right.isDown) {
            this.player.setAccelerationX(PLAYER.accel);
        } else {
            this.player.setAccelerationX(0);
        }

        if (this.cursors.up.isDown && (body.blocked.down || body.touching.down)) {
            this.player.setVelocityY(PLAYER.jump);
        }

        // Trail behind Ploomi while sprinting
        if (sprinting && Math.abs(body.velocity.x) > 10) {
            const behind = body.velocity.x > 0 ? -16 : 16;
            this.emitter.emitParticleAt(this.player.x + behind, this.player.y, 2);
        }

        if (body.velocity.x > 10) {
            this.player.setTexture('ploomi_right');
        } else if (body.velocity.x < -10) {
            this.player.setTexture('ploomi_left');
        } else {
            this.player.setTexture('ploomi_idle');
        }

        // Blink while invulnerable
        this.player.setAlpha(time < this.invulnerableUntil && Math.floor(time / 80) % 2 ? 0.3 : 1);

        // Eye patrols between minX and maxX, looking where it goes
        if (this.eye.active) {
            const speed = EYE.speed + this.eyeKills * EYE.speedPerKill;
            if (this.eye.x <= EYE.minX) {
                this.eye.setVelocityX(speed);
            } else if (this.eye.x >= EYE.maxX) {
                this.eye.setVelocityX(-speed);
            }
            this.eye.setFlipX(this.eye.body.velocity.x > 0);
        }
    }

    touchEye(player, eye) {
        if (!eye.active || this.gameOver) {
            return;
        }

        // Falling onto the top of the eye = stomp
        const stomp = player.body.velocity.y > 0 && player.body.bottom <= eye.body.top + 12;
        if (stomp) {
            this.killEye();
            player.setVelocityY(PLAYER.stompBounce);
        } else {
            this.hurtPlayer(eye);
        }
    }

    killEye() {
        this.eye.disableBody(false, false);
        this.eye.setActive(false);
        this.eyeKills++;
        this.scoreText.setText('Eyes: ' + this.eyeKills);
        this.cameras.main.shake(120, 0.005);

        this.tweens.add({
            targets: this.eye,
            scaleY: 0.2,
            alpha: 0,
            duration: 250,
            onComplete: () => this.eye.setVisible(false)
        });

        this.time.delayedCall(EYE.respawnMs, () => {
            if (this.gameOver) {
                return;
            }
            this.eye.enableBody(true, EYE.maxX, GROUND_Y, true, true);
            this.eye.setScale(1).setAlpha(1);
            this.eye.body.setAllowGravity(false);
            this.eye.setVelocityX(-(EYE.speed + this.eyeKills * EYE.speedPerKill));
        });
    }

    hurtPlayer(eye) {
        if (this.time.now < this.invulnerableUntil) {
            return;
        }

        this.health--;
        this.hearts.forEach((heart, i) => heart.setVisible(i < this.health));
        this.invulnerableUntil = this.time.now + PLAYER.invulnerableMs;
        this.cameras.main.flash(100, 120, 0, 0);

        // Knock Ploomi away from the eye
        const dir = this.player.x < eye.x ? -1 : 1;
        this.player.setVelocity(dir * 250, -200);

        if (this.health <= 0) {
            this.endGame();
        }
    }

    endGame() {
        this.gameOver = true;
        this.physics.pause();
        this.player.setAlpha(1).setTint(0xff0000);
        this.add.text(WIDTH / 2, HEIGHT / 2, 'GAME OVER', {
            fontSize: '64px', color: '#ffffff', fontFamily: FONT
        }).setOrigin(0.5).setDepth(100);
        this.time.delayedCall(1500, () => this.scene.start('TitleScene'));
    }
}

const config = {
    type: Phaser.AUTO,
    width: WIDTH,
    height: HEIGHT,
    parent: 'game-container',
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 600 },
            debug: false
        }
    },
    scene: [TitleScene, GameScene]
};

const game = new Phaser.Game(config);
