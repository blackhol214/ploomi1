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
        graphics.fillRect(8, 8, 4, 4);
        graphics.fillRect(20, 8, 4, 4);
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
        this.platforms.create(400, 580, null).setScale(8, 0.5).refreshBody();
        // Some platforms
        this.platforms.create(200, 450, null).setScale(2, 0.5).refreshBody();
        this.platforms.create(600, 350, null).setScale(2, 0.5).refreshBody();
        this.platforms.create(300, 250, null).setScale(1.5, 0.5).refreshBody();

        // Player
        this.player = this.physics.add.sprite(100, 450, 'ploomi');
        this.player.setCollideWorldBounds(true);
        this.player.setBounce(0.2);

        // Goal
        this.goal = this.add.rectangle(750, 200, 32, 32, 0xff0000);
        this.physics.add.overlap(this.player, this.goal, this.reachGoal, null, this);

        // Colliders
        this.physics.add.collider(this.player, this.platforms);

        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        // Controls
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
        } else {
            this.player.setVelocityX(0);
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