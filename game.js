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
        graphics.fillStyle(0x0000ff); // blue
        graphics.fillRect(0, 0, 32, 32);
        graphics.fillStyle(0x000000);
        graphics.fillRect(7, 7, 6, 6);
        graphics.fillRect(19, 7, 6, 6);
        graphics.generateTexture('ploomi_idle', 32, 32);
        graphics.destroy();

        // Left
        graphics = this.add.graphics();
        graphics.fillStyle(0x0000ff);
        graphics.fillRect(0, 0, 32, 32);
        graphics.fillStyle(0x000000);
        graphics.fillRect(5, 7, 6, 6);
        graphics.fillRect(17, 7, 6, 6);
        graphics.generateTexture('ploomi_left', 32, 32);
        graphics.destroy();

        // Right
        graphics = this.add.graphics();
        graphics.fillStyle(0x0000ff);
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

        // Create a night sky backdrop with stars
        let sky = this.add.rectangle(50000, 300, 100000, 2000, 0x001a4d);
        sky.setScrollFactor(1);
        sky.setDepth(-10);

        // Add stars to the sky
        for (let i = 0; i < 500; i++) {
            let x = Phaser.Math.Between(0, 100000);
            let y = Phaser.Math.Between(0, 2000);
            let star = this.add.circle(x, y, 2, 0xffffff);
            star.setScrollFactor(1);
            star.setDepth(-9);
        }

        // Set larger physics world for scrolling
        this.physics.world.setBounds(0, 0, 100000, 2000);

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
        
        let rightWall = this.add.rectangle(100050, 300, 100, 2000, 0x001a4d);
        this.physics.add.existing(rightWall, true);
        this.platforms.add(rightWall);
        rightWall.setDepth(-8);

        // Player
        this.player = this.physics.add.sprite(100, 540, 'ploomi_idle');
        this.player.setBounce(0.2);
        this.player.setDragX(500);

        // Colliders
        this.physics.add.collider(this.player, this.platforms);

        // Camera follows player
        this.cameras.main.startFollow(this.player);

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

        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-290);
        }

        // Update eye direction
        if (this.player.body.velocity.x > 10) {
            this.player.setTexture('ploomi_right');
        } else if (this.player.body.velocity.x < -10) {
            this.player.setTexture('ploomi_left');
        } else {
            this.player.setTexture('ploomi_idle');
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
