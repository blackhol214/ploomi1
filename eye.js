// Cosmic Eye sandbox: same art as the enemy in game.js, drawn big so it's easy to tweak.
// The eye flips to look toward the mouse.
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'eye-container',
    pixelArt: true,
    scene: {
        create: function() {
            this.cameras.main.setBackgroundColor('#001133');

            const g = this.add.graphics();
            g.fillStyle(0x000000);
            g.fillCircle(20, 20, 20); // outer circle
            g.fillStyle(0xffffff);
            g.fillCircle(20, 20, 12); // white
            g.fillStyle(0x000000);
            g.fillRect(8, 8, 24, 12); // angry lid
            g.fillCircle(10, 20, 6); // pupil, looking left
            g.fillCircle(50, 20, 12); // medium circle on the right
            g.generateTexture('eye', 70, 40);
            g.destroy();

            const eye = this.add.image(400, 300, 'eye').setScale(5);
            this.input.on('pointermove', pointer => eye.setFlipX(pointer.x > eye.x));
        }
    }
};

const game = new Phaser.Game(config);
