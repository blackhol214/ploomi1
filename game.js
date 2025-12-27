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

        // Health
        this.health = 3;
        this.healthText = this.add.text(10, 10, 'Health: 3', { fontSize: '20px', color: '#ffffff', fontFamily: 'Courier New' });

        // Platforms
        this.platforms = this.physics.add.staticGroup();
        // Ground
        let ground = this.add.rectangle(400, 590, 800, 20, 0xffffff);
        this.physics.add.existing(ground, true);
        this.platforms.add(ground);
        // Some platforms
        let plat1 = this.add.rectangle(200, 450, 128, 16, 0xffffff);
        this.physics.add.existing(plat1, true);
        this.platforms.add(plat1);
        let plat2 = this.add.rectangle(600, 350, 128, 16, 0xffffff);
        this.physics.add.existing(plat2, true);
        this.platforms.add(plat2);
        let plat3 = this.add.rectangle(300, 250, 96, 16, 0xffffff);
        this.physics.add.existing(plat3, true);
        this.platforms.add(plat3);

        // Player
        this.player = this.physics.add.sprite(100, 450, 'ploomi_idle');
        this.player.setCollideWorldBounds(true);
        this.player.setBounce(0.2);
        this.player.setDragX(350);

        // Goal
        this.goal = this.add.rectangle(750, 200, 32, 32, 0xff0000);
        this.physics.add.existing(this.goal, true);
        this.physics.add.overlap(this.player, this.goal, this.reachGoal, null, this);

        // Colliders
        this.physics.add.collider(this.player, this.platforms);

        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.zKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    }

    update() {
        // Controls
        this.player.setAccelerationX(0);
        if (this.cursors.left.isDown) {
            this.player.setAccelerationX(-350);
        } else if (this.cursors.right.isDown) {
            let speed = 350;
            if (this.zKey.isDown) {
                speed = 700;
            }
            this.player.setAccelerationX(speed);
        }

        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-330);
        }

        // Update eye direction
        if (this.player.body.velocity.x > 10) {
            this.player.setTexture('ploomi_right');
        } else if (this.player.body.velocity.x < -10) {
            this.player.setTexture('ploomi_left');
        } else {
            this.player.setTexture('ploomi_idle');
        }

        // Check if player falls off
        if (this.player.y > 600) {
            this.player.setPosition(100, 450);
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
