class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TitleScene' });
    }

    create() {
        // Pitch black background
        this.cameras.main.setBackgroundColor('#000000');

        // White title text
        this.add.text(400, 200, 'PLOOMI AND THE COSMIC CORE', {
            fontSize: '50px',
            color: '#ffffff',
            fontFamily: 'Futura Condensed ExtraBold'
        }).setOrigin(0.5);

        // Start button
        const startButton = this.add.text(400, 350, 'Start Plooming!', {
            fontSize: '40px',
            color: '#ffffffff',
            fontFamily: 'Futura Condensed ExtraBold'
        }).setOrigin(0.5).setInteractive();

        startButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });

        startButton.on('pointerover', () => {
            startButton.setColor('#0055ffff'); // Yellow on hover
        });

        startButton.on('pointerout', () => {
            startButton.setColor('#ffffff');
        });
    }
}

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // Generate Ploomi textures
        // Idle
        let graphics = this.add.graphics();
        graphics.fillStyle(0x006600); // dark green
        graphics.fillRect(0, 0, 32, 32);
        graphics.fillStyle(0x000000);
        graphics.fillRect(7, 7, 6, 6);
        graphics.fillRect(19, 7, 6, 6);
        graphics.generateTexture('ploomi_idle', 32, 32);
        graphics.destroy();

        // Left
        graphics = this.add.graphics();
        graphics.fillStyle(0x006600);
        graphics.fillRect(0, 0, 32, 32);
        graphics.fillStyle(0x000000);
        graphics.fillRect(5, 7, 6, 6);
        graphics.fillRect(17, 7, 6, 6);
        graphics.generateTexture('ploomi_left', 32, 32);
        graphics.destroy();

        // Right
        graphics = this.add.graphics();
        graphics.fillStyle(0x006600);
        graphics.fillRect(0, 0, 32, 32);
        graphics.fillStyle(0x000000);
        graphics.fillRect(9, 7, 6, 6);
        graphics.fillRect(21, 7, 6, 6);
        graphics.generateTexture('ploomi_right', 32, 32);
        graphics.destroy();

        // Heart texture
        graphics = this.add.graphics();
        graphics.fillStyle(0xff0000);
        // Simple heart shape
        graphics.fillRect(6, 10, 4, 4);
        graphics.fillRect(4, 8, 8, 4);
        graphics.fillRect(2, 6, 12, 4);
        graphics.fillRect(0, 4, 16, 4);
        graphics.fillRect(2, 2, 12, 4);
        graphics.fillRect(4, 0, 8, 4);
        graphics.generateTexture('heart', 16, 16);
        graphics.destroy();
    }

    create() {
        // Background
        this.cameras.main.setBackgroundColor('#0a008fff');

        // Create a night sky backdrop with clouds
        let sky = this.add.rectangle(50000, 300, 100000, 2000, 0x001133);
        sky.setScrollFactor(1);
        sky.setDepth(-10);

        // Create eye as physics sprite
        let eyeGraphics = this.add.graphics();
        eyeGraphics.fillStyle(0x000000);
        eyeGraphics.fillCircle(20, 20, 20);
        eyeGraphics.fillStyle(0xffffff);
        eyeGraphics.fillCircle(20, 20, 12);
        eyeGraphics.fillStyle(0x000000);
        eyeGraphics.fillRect(8, 8, 24, 12);
        eyeGraphics.fillCircle(10, 20, 6);
        eyeGraphics.fillCircle(50, 20, 12);
        eyeGraphics.generateTexture('eye', 70, 40);
        eyeGraphics.destroy();

        this.eye = this.physics.add.sprite(720, 555, 'eye');
        this.eye.setCollideWorldBounds(false);
        this.eye.setBounce(1);
        this.eye.setVelocityX(-100);
        this.eye.setGravityY(-300);
        this.eye.setDisplaySize(80, 50);
        this.eye.body.setSize(80, 50);
        this.eye.body.setOffset(0, -50);
        
        // Crear una zona de daño adicional en el cuerpo del ojo
        this.eyeDamageZone = this.physics.add.sprite(720, 555, null);
        this.eyeDamageZone.body.setSize(80, 30);
        this.eyeDamageZone.body.setOffset(0, 10);
        this.eyeDamageZone.setActive(false);
        this.eyeDamageZone.setVisible(false);
        this.eyeMinX = 400; // Mitad de la pantalla
        this.eyeMaxX = 720; // Posición inicial

        // Set physics world
        this.physics.world.setBounds(0, 0, 800, 2000);

        // Health
        this.health = 3;
        this.healthText = this.add.text(10, 10, 'Health: 3', { fontSize: '20px', color: '#ffffff', fontFamily: 'Courier New' });
        this.healthText.setScrollFactor(0);
        this.healthText.setDepth(100);

        // Create platforms
        this.platforms = this.physics.add.staticGroup();
        
        // Ground platform
        let ground = this.add.rectangle(50000, 590, 100000, 20, 0x444444);
        this.physics.add.existing(ground, true);
        this.platforms.add(ground);

        // Invisible walls to prevent falling off
        let leftWall = this.add.rectangle(-50, 300, 100, 2000, 0x001a4d);
        this.physics.add.existing(leftWall, true);
        this.platforms.add(leftWall);
        leftWall.setDepth(-8);
        
        let rightWall = this.add.rectangle(850, 300, 100, 2000, 0x001a4d);
        this.physics.add.existing(rightWall, true);
        this.platforms.add(rightWall);
        rightWall.setDepth(-8);

        // Player
        this.player = this.physics.add.sprite(100, 540, 'ploomi_idle');
        this.player.setBounce(0.2);
        this.player.setDragX(1000);

        // Create particle emitter for dash trail
        this.particles = this.add.particles(0x00aa00);
        this.emitter = this.particles.createEmitter({
            speed: 0,
            scale: { start: 0.5, end: 0 },
            alpha: { start: 0.8, end: 0 },
            lifespan: 400,
            gravityY: 0,
            emitting: false
        });

        // Colliders
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.eye, this.platforms);
        this.physics.add.overlap(this.player, this.eye, this.hitEyeTop, null, this);
        this.physics.add.overlap(this.player, this.eyeDamageZone, this.hitEyeBody, null, this);

        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.zKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    }

    update() {
        // Controls
        if (this.cursors.left.isDown) {
            this.player.setAccelerationX(-350);
        } else if (this.cursors.right.isDown) {
            let speed = 350;
            if (this.zKey.isDown) {
                speed = 350;
            }
            this.player.setAccelerationX(speed);
        } else {
            this.player.setAccelerationX(0);
        }

        // Emit particles only when Z key is pressed
        if (this.zKey.isDown) {
            // Emit behind Ploomi based on last movement direction
            if (this.player.body.velocity.x > 10) {
                // Moving right, emit from left side (back)
                this.emitter.emitParticleAt(this.player.x - 20, this.player.y, 3);
            } else if (this.player.body.velocity.x < -10) {
                // Moving left, emit from right side (back)
                this.emitter.emitParticleAt(this.player.x + 20, this.player.y, 3);
            }
        }

        // Update eye direction
        if (this.player.body.velocity.x > 10) {
            this.player.setTexture('ploomi_right');
        } else if (this.player.body.velocity.x < -10) {
            this.player.setTexture('ploomi_left');
        } else {
            this.player.setTexture('ploomi_idle');
        }

        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-290);
        }

        // Eye movement bounds - rebota entre eyeMinX y eyeMaxX
        if (this.eye.x <= this.eyeMinX) {
            this.eye.setVelocityX(100);
        } else if (this.eye.x >= this.eyeMaxX) {
            this.eye.setVelocityX(-100);
        }
        
        // Mantener la zona de daño en la misma posición que el ojo
        if (this.eyeDamageZone.active) {
            this.eyeDamageZone.x = this.eye.x;
            this.eyeDamageZone.y = this.eye.y;
        }

        // Check if player falls off the world
        if (this.player.y > 2000) {
            this.player.setPosition(100, 540);
            this.health--;
            this.healthText.setText('Health: ' + this.health);
            if (this.health <= 0) {
                this.scene.start('TitleScene');
            }
        }
    }

    hitEyeTop() {
        // Hitbox superior - destruir el ojo si Ploomi salta desde arriba
        if (this.player.body.velocity.y < -10) {
            this.eye.destroy();
            this.eyeDamageZone.destroy();
            return;
        }
    }
    
    hitEyeBody() {
        // Hitbox del cuerpo - dañar a Ploomi
        this.health--;
        this.healthText.setText('Health: ' + this.health);
        if (this.health <= 0) {
            this.scene.start('TitleScene');
        }
    }

    reachGoal() {
        // For now, restart the level
        this.scene.restart();
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: [TitleScene, GameScene]
};

const game = new Phaser.Game(config);
