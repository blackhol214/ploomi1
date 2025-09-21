class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TitleScene' });
    }

    create() {
        // Pitch black background
        this.cameras.main.setBackgroundColor('#000000');

        // White title text
        this.add.text(400, 200, 'Ploomi and The Cosmic Core', {
            fontSize: '32px',
            color: '#ffffff',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);

        // Start button
        const startButton = this.add.text(400, 350, 'Start Plooming!', {
            fontSize: '24px',
            color: '#ffffff',
            fontFamily: 'Courier New'
        }).setOrigin(0.5).setInteractive();

        startButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });

        startButton.on('pointerover', () => {
            startButton.setColor('#ffff00'); // Yellow on hover
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
        // Generate Ploomi texture
        let graphics = this.add.graphics();
        graphics.fillStyle(0x0000ff); // blue
        graphics.fillRect(0, 0, 32, 32);
        // eyes
        graphics.fillStyle(0x000000);
        graphics.fillRect(7, 7, 5, 5);
        graphics.fillRect(20, 7, 5, 5);
        graphics.generateTexture('ploomi', 32, 32);
        graphics.destroy();
    }

    create() {
        // Background
        this.cameras.main.setBackgroundColor('#000000');

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
        this.player = this.physics.add.sprite(100, 450, 'ploomi');
        this.player.setCollideWorldBounds(true);
        this.player.setBounce(0.2);
        this.player.setDragX(300);

        // Goal
        this.goal = this.add.rectangle(750, 200, 32, 32, 0xff0000);
        this.physics.add.existing(this.goal, true);
        this.physics.add.overlap(this.player, this.goal, this.reachGoal, null, this);

        // Colliders
        this.physics.add.collider(this.player, this.platforms);

        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        // Controls
        this.player.setAccelerationX(0);
        if (this.cursors.left.isDown) {
            this.player.setAccelerationX(-200);
        } else if (this.cursors.right.isDown) {
            this.player.setAccelerationX(200);
        }

        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-330);
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
