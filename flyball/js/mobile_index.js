
// start scene
class StartScene extends Phaser.Scene
{
    startButton;
    startButton_Text;

    startBall;
    startBallArea;

    constructor(){
        super('StartScene');
    }

    preload(){
        this.load.image('logo', 'assets/ui/Banner.png');
        this.load.image('button', 'assets/ui/Banner-2.png');
        this.load.image('startarea', 'assets/ui/Banner-3.png');
        this.load.bitmapFont('nokia', 'assets/fonts/bitmap/nokia16black.png', 'assets/fonts/bitmap/nokia16black.xml');
    }

    create(){

        const width = this.scale.gameSize.width;
        const height = this.scale.gameSize.height;

        var x = width / 2 - 150;
        var y = height / 2 + 50;
        var name = 'Start';

        this.add.image(x, y - 200,'logo').setOrigin(0, 0).setScale(3);

        this.startButton = this.add.image(x + 150, y - 30, 'button', 0).setInteractive();
        this.startButton.name = name;
        this.startButton.setScale(2.5);
    
        this.startButton_Text = this.add.bitmapText(x + 125, y - 48, 'nokia16').setScale(2.2).setTint(0x0000ff);
        this.startButton_Text.setText(name);
        this.startButton_Text.x += (this.startButton.width - this.startButton_Text.width) / 2;

        this.startBallArea = this.add.image(x + 150, y + 30, 'startarea').setScale(2);

        this.startBall = this.add.image(x + 150, y + 30, 'ball').setScale(1.5);

        this.startButton.on('pointerover', function(event){
            this.startButton.alpha = 0.5;
        }, this);

        this.startButton.on('pointerout', function(event){
            this.startButton.alpha = 1;
        }, this);

        this.startButton.once('pointerup', this.startGame, this);

        this.input.keyboard.on('keyup-SPACE', function (event) {

            this.startGame(null);
    
        },this);
    }

    startGame(event){
        this.scene.start('GameScene');
    }
}

//  This Scene has no aspect ratio lock, it will scale to fit the browser window, but will zoom to match the Game
class BackgroundScene extends Phaser.Scene
{
    SCORE_NUM = 6;

    sx = 0;
    map;
    text;
    mapWidth = 40;
    mapHeight = 60;
    distance = 0;
    tiles = [ 7, 7, 7, 6, 6, 6, 0, 0, 0, 1, 1, 2, 3, 4, 5 ];
    gameScene;

    score = 0;
    scoreText;

    bgMusic;

    constructor ()
    {
        super('BackgroundScene');
    }

    preload ()
    {
        this.load.image('tiles', 'assets/tilemaps/tiles/fly-ball-grass-16.png');

        // this.load.image('ball','assets/sprites/orb-red.png');

        this.load.spritesheet(
            'ball',
            'assets/sprites/ball_frame.png',
            {frameWidth:22, frameHeight:22}
        );

        this.load.image('block','assets/sprites/block-wall.png');
        this.load.image('wall','assets/sprites/red-pass-wall.png');
        this.load.image('icon', 'assets/ui/score-icon.png');
        
        this.load.audio('bg', 'assets/sounds/bg_loop.mp3');
        this.load.audio('ball_through', 'assets/sounds/ball_through.mp3');
        
        this.load.bitmapFont('nokia16', 'assets/fonts/bitmap/nokia16.png', 'assets/fonts/bitmap/nokia16.xml');
    }

    create ()
    {
        var mapData = [];

        for (var y = 0; y < this.mapHeight; y++)
        {
            var row = [];

            for (var x = 0; x < this.mapWidth; x++)
            {
                //  Scatter the tiles so we get more mud and less stones
                var tileIndex = Phaser.Math.RND.weightedPick(this.tiles);

                row.push(tileIndex);
            }

            mapData.push(row);
        }

        this.map = this.make.tilemap({ data: mapData, tileWidth: 16, tileHeight: 16 });

        var tileset = this.map.addTilesetImage('tiles');
        var layer = this.map.createDynamicLayer(0, tileset, 0, 0);

        this.text = this.add.bitmapText(35, 10, 'nokia16').setScale(1.5).setScrollFactor(0);
        
        this.add.image(10, 10, 'icon').setOrigin(0, 0).setScale(2).setScrollFactor(0);;

        this.updateScore(0);
        
        this.scene.launch('StartScene');

        // this.scene.launch('GameScene');

        this.gameScene = this.scene.get('GameScene');

        this.bgMusic = this.sound.add('bg', { loop: true });

        this.bgMusic.play({volume: 0.2});
    }

    update (time, delta){

        //  Any speed as long as 16 evenly divides by it
        this.sx -= this.gameScene.SPEED;
        
        if (this.sx === -16)
        {
            //  Reset and create new strip

            var tile;
            var prev;

            for (var y = this.mapHeight - 2; y >= 0; y--)
            {
                for (var x = 0; x < this.mapWidth; x++)
                {
                    tile = this.map.getTileAt(x, y);
                    prev = this.map.getTileAt(x, y + 1);

                    prev.index = tile.index;

                    if (y === 0)
                    {
                        tile.index = Phaser.Math.RND.weightedPick(this.tiles);
                    }
                }
            }

            this.sx = 0;
        }

        this.updateScrollY(this.sx + 16);
    }

    updateCamera ()
    {
        const width = this.scale.gameSize.width;
        const height = this.scale.gameSize.height;

        const camera = this.cameras.main;

        //  There is 240px of extra padding below the game area in the background graphic
        //  so we account for it in the y offset (scaled by the game zoom factor)

        const zoom = this.gameScene.getZoom();
        const offset = 120 * zoom;

        //  We can either zoom and re-center the camera:

        camera.setZoom(zoom);
        camera.centerOn(1400 / 2, (1200 / 2) + 120);

        //  Or, if you want to put all of the Game Objects in this Scene into a layer,
        //  you can position and scale that:

        // this.layer.x = width / 2;
        // this.layer.y = (height / 2) + offset;
        // this.layer.setScale(zoom);
    }
  
    updateScrollY(y){
    
        const camera = this.cameras.main;
  
        camera.scrollY = y;
    }

    updateScore(inc)
    {
        this.score += inc;

        this.scoreText = (Array(this.SCORE_NUM).join(0) + this.score).slice(-this.SCORE_NUM);
        this.text.setText(this.scoreText);
        
    }

}


//  This Scene is aspect ratio locked at 640 x 960 (and scaled and centered accordingly)
class GameScene extends Phaser.Scene
{
    SPEED = 2;
    GAME_WIDTH = 640;
    GAME_HEIGHT = 960;
    TIME_SPEED = 300;

    ball;
    backgroundScene;
    parent;
    sizer;
    cursors;

    blocks;
    walls;

    last_wall;

    gameOver = false;

    debugText;
    debugEnable = false;

    timedEvent;

    ballPassMusic;

    wallFlySpeed;

    changeColor;
    ballIndex = 0;

    constructor ()
    {
        super('GameScene');
    }

    create(){
        const width = this.scale.gameSize.width;
        const height = this.scale.gameSize.height;

        this.parent = new Phaser.Structs.Size(width, height);
        this.sizer = new Phaser.Structs.Size(this.GAME_WIDTH, this.GAME_HEIGHT, Phaser.Structs.Size.FIT, this.parent);

        this.parent.setSize(width, height);
        this.sizer.setSize(width, height);

        this.backgroundScene = this.scene.get('BackgroundScene');

        this.updateCamera();

        this.scale.on('resize', this.resize, this);

        //  -----------------------------------
        //  -----------------------------------
        //  -----------------------------------
        //  Normal game stuff from here on down
        //  -----------------------------------
        //  -----------------------------------
        //  -----------------------------------

        //  Input Events
        this.cursors = this.input.keyboard.createCursorKeys();

        //this.input.mouse.disableContextMenu();

        this.ball = this.physics.add.sprite(width / 2, height / 2 + 80, 'ball').setScale(1.5);
        this.ball.setBounce(0.2);
        this.ball.setCollideWorldBounds(true);
        
        this.blocks = this.add.group();

        this.walls = this.physics.add.group({
            defaultKey: 'wall',
            maxSize: 50,
            createCallBack: function (wall){
                wall.setName('wall' + this.getLength());
                wall.body.setAllowGravity(false);

                console.log('Created', wall.name);
            },
            removeCallBack: function(wall){
                console.log('Removed', wall.name);
            }
        });

        // var randomX = Phaser.Math.Between(25, this.sizer.width - 25);

        //var wall = this.walls.create(randomX, 16, 'wall');

        this.physics.add.overlap(this.ball, this.walls, this.throughWall, null, this);
        this.physics.add.collider(this.ball, this.blocks, this.hitBlock, null, this);
        
        this.timedEvent = this.time.addEvent({ delay: this.TIME_SPEED, callback: this.onEvent, callbackScope: this, loop: true });
        
        this.ballPassMusic = this.sound.add('ball_through');
        
        this.debugText = this.add.text(10, 50, '', {fontSize: '16px', fill: '#000'});
            
        this.wallFlySpeed = Phaser.Math.GetSpeed(600, 3);

        this.changeColor = this.add.sprite(width - 30, height - 100, 'ball').setScale(2).setInteractive();
        
        this.changeColor.on('pointerdown', this.changeBallColor, this);

        this.input.keyboard.on('keyup-SPACE', function (event) {

            this.changeBallColor(null);
    
        },this);
    }
    
    //  ------------------------
    //  ------------------------
    //  ------------------------
    //  Resize related functions
    //  ------------------------
    //  ------------------------
    //  ------------------------

    resize (gameSize)
    {
        const width = gameSize.width;
        const height = gameSize.height;

        this.parent.setSize(width, height);
        this.sizer.setSize(width, height);

        this.updateCamera();
    }

    updateCamera ()
    {
        /*
        const camera = this.cameras.main;

        const x = Math.ceil((this.parent.width - this.sizer.width) * 0.5);
        const y = 0;
        const scaleX = this.sizer.width / this.GAME_WIDTH;
        const scaleY = this.sizer.height / this.GAME_HEIGHT;

        camera.setViewport(x, y, this.sizer.width, this.sizer.height);
        camera.setZoom(Math.max(scaleX, scaleY));
        camera.centerOn(this.GAME_WIDTH / 2, this.GAME_HEIGHT / 2);

        this.backgroundScene.updateCamera();
        */
    }

    getZoom ()
    {
        return this.cameras.main.zoom;
    }

    //  ------------------------
    //  ------------------------
    //  ------------------------
    //  Game related functions
    //  ------------------------
    //  ------------------------
    //  ------------------------

    update (time, delta)
    {
        if (this.gameOver){
            return;
        }

        var that = this;

        if (this.debugEnable){
            this.debugText.setText([
                'Sizer Height:' + that.sizer.height,
                'Sizer Width:' + that.sizer.width,
                'Ball X:' + that.ball.x,
                'Ball Y:' + that.ball.y,
                'Window Height:' + that.parent.height,
                'Window Width:' + that.parent.width,
                'Speed:' + delta * this.wallFlySpeed,
            ]);
        }

        if (that.parent.height - that.ball.y < 18){
            that.ball.setBounce(1);
        }

        Phaser.Actions.IncY(this.walls.getChildren(), delta * this.wallFlySpeed);

        this.walls.children.iterate(function (wall) {
            if (wall.y > that.parent.height) {
                that.walls.killAndHide(wall);
            }
        });

        var p = this.input.activePointer;

        var deltaX = 0;

        if (p.isDown)
        {
            deltaX = p.x - this.ball.x;
        }

        if (deltaX < 0 || this.cursors.left.isDown)
        {
            this.ball.setVelocityX(-160);
            this.ball.angle -= 10;
            //player.anims.play('left', true);
        }
        else if (deltaX > 0 || this.cursors.right.isDown)
        {
            this.ball.setVelocityX(160);
            this.ball.angle += 10;

            //player.anims.play('right', true);
        }
        else{
            this.ball.setVelocityX(0);
        }

    }

    // timer event
    onEvent (){

        var randomX = Phaser.Math.Between(25, this.sizer.width - 25);
        var randomColor = Phaser.Math.Between(0, 2);

        var wall = this.walls.get(randomX, 16);

        if (!wall){
            return;
        }

        if (wall.isTinted){
            wall.clearTint();
        }

        if (randomColor === 1){
            wall.setTint(0x00ff00);
        }
        else if (randomColor === 2){
            wall.setTint(0x0000ff);
        }
        else{
            wall.setTint(0xff0000);
        }

        wall.data = randomColor;
        wall.setActive(true).setVisible(true);
        wall.body.setAllowGravity(false);
    }

    hitBlock (ball, block){
        
        this.physics.pause();

        this.gameOver = true;
    }

    throughWall(ball, wall){
        
        if (this.last_wall && this.last_wall === wall){
            return;
        }
        //wall.disableBody(true, true);

        if (wall.data === this.ballIndex)
        {

            this.backgroundScene.updateScore(10);

            this.ballPassMusic.play();
    
        }
        else{
            
        }

        this.last_wall = wall;
    }

    changeBallColor(event){
        this.ballIndex = this.ballIndex > 1 ? 0 : this.ballIndex + 1;
        
        this.changeColor.setFrame(this.ballIndex);
        this.ball.setFrame(this.ballIndex);
    }
}

const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.RESIZE,
        parent: 'phaser-main',
        width: 640,
        height: 960,
        min: {
            width: 320,
            height: 480
        },
        max: {
            width: 1400,
            height: 1200
        }
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: [ BackgroundScene, StartScene, GameScene ]
};

const game = new Phaser.Game(config);
