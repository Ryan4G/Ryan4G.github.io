
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
    SPEED = 2;
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
    gameOver = false;

    constructor ()
    {
        super('BackgroundScene');
    }

    preload ()
    {
        // Start Scene Metirals
        this.load.image('logo', 'assets/ui/Banner.png');
        this.load.image('button', 'assets/ui/Banner-2.png');
        this.load.image('startarea', 'assets/ui/Banner-3.png');
 
        // Background Scene
        this.load.image('tiles', 'assets/tilemaps/tiles/fly-ball-grass-16.png');

        this.load.spritesheet(
            'ball',
            'assets/sprites/ball_frame.png',
            {frameWidth:22, frameHeight:22}
        );

        this.load.image('block','assets/sprites/block-wall.png');
        this.load.image('wall','assets/sprites/red-pass-wall.png');
        this.load.image('icon', 'assets/ui/score-icon.png');
        
        this.load.image('pause', 'assets/ui/pause-icon.png');

        this.load.bitmapFont('nokia16', 'assets/fonts/bitmap/nokia16.png', 'assets/fonts/bitmap/nokia16.xml');
        this.load.bitmapFont('nokia', 'assets/fonts/bitmap/nokia16black.png', 'assets/fonts/bitmap/nokia16black.xml');
    
        // Music
        this.load.audio('bg', 'assets/sounds/bg_loop.mp3');
        this.load.audio('block_crash', 'assets/sounds/block_crash.mp3');
        this.load.audio('knock_wall', 'assets/sounds/knock_wall.mp3');
        
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

        this.bgMusic = this.sound.add('bg', { loop: true });

        this.bgMusic.play({volume: 0.3});
    }

    update (time, delta){

        if (this.gameOver){
            return;
        }

        //  Any speed as long as 16 evenly divides by it
        this.sx -= this.SPEED;
        
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

    initScore(){
        this.gameOver = false;
        this.score = 0;
        this.updateScore(0);
    }
}


//  This Scene is aspect ratio locked at 640 x 960 (and scaled and centered accordingly)
class GameScene extends Phaser.Scene
{
    ADDBLOCK_SCORE = 50;
    GAME_WIDTH = 640;
    GAME_HEIGHT = 960;
    TIME_SPEED = 1200;

    ball;
    backgroundScene;
    parent;
    sizer;
    cursors;

    blocks;
    walls;

    debugText;
    debugEnable = false;

    timedEvent;

    ballPassMusic;
    blockCrashMusic;

    wallFlySpeed;

    changeColor;
    ballIndex = 0;

    pauseIcon;

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

        this.scale.on('resize', this.resize, this);

        //  -----------------------------------
        //  -----------------------------------
        //  -----------------------------------
        //  Normal game stuff from here on down
        //  -----------------------------------
        //  -----------------------------------
        //  -----------------------------------

        this.pauseIcon = this.add.image(width - 20, 20, 'pause').setInteractive();
        this.pauseIcon.on('pointerdown', this.pauseGame, this);


        //  Input Events
        this.cursors = this.input.keyboard.createCursorKeys();

        //this.input.mouse.disableContextMenu();

        this.ball = this.physics.add.sprite(width / 2, height / 2 + 80, 'ball').setScale(1.5);
        this.ball.setBounce(0.6);
        this.ball.setCollideWorldBounds(true);
        
        this.blocks = this.physics.add.staticGroup();
        
        var wallWidth = width / 4;
        for(var i = 0; i < 4; i++){
            for(var j = 0; j < 4; j++){
                this.blocks.create(i * wallWidth, height - (j + 1) * 24, 'block').setOrigin(0, 0).setScale(wallWidth / 128, 1).refreshBody();
            }
        }

        this.walls = this.physics.add.group({
            defaultKey: 'wall',
            maxSize: 20,
            createCallback: function (wall) {
                wall.setName('wall' + this.getLength());
                wall.body.setAllowGravity(false);
                console.log('Created', wall.name);
            },
            removeCallback: function (wall) {
                console.log('Removed', wall.name);
            }
        });

        this.physics.add.collider(this.ball, this.blocks);

        this.physics.add.overlap(this.ball, this.walls, this.throughWall, null, this);
        this.physics.add.collider(this.walls, this.blocks, this.crashBlock, null, this);
        
        this.timedEvent = this.time.addEvent({ delay: this.TIME_SPEED, callback: this.onEvent, callbackScope: this, loop: true });
        
        this.ballPassMusic = this.sound.add('knock_wall');
        this.blockCrashMusic = this.sound.add('block_crash');

        this.debugText = this.add.text(10, 50, '', {fontSize: '16px', fill: '#000'});
            
        this.wallFlySpeed = Phaser.Math.GetSpeed(600, 3);

        this.changeColor = this.add.sprite(width - 30, height - 150, 'ball').setScale(2).setInteractive();
        this.changeColor.alpha = 0.8;
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
        if (this.backgroundScene.gameOver){
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

        if ((p.isDown || this.cursors.up.isDown) && this.ball.body.blocked.down){

            this.ball.setVelocityY(-250);
        }

        if (this.parent.height - this.ball.y < 24){
            this.endGame();
        }
    }

    // timer event
    onEvent (){
        // console.log('time...');
        var randomPart = Phaser.Math.Between(0, 3);
        var randomColor = Phaser.Math.Between(0, 2);

        var wallWidth = this.parent.width / 4;
        var wall = this.walls.get(randomPart * wallWidth, 0);

        if (!wall){
            return;
        }

        wall.setOrigin(0, 0).setScale(wallWidth / 51, 1);

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

        wall.setData('color', randomColor);
        wall.setActive(true).setVisible(true);
        wall.body.setAllowGravity(false);
    }

    throughWall(ball, wall){
        if (wall.active && wall.visible){
            if (wall.getData('color') === this.ballIndex)
            {
                this.backgroundScene.updateScore(10);

                this.ballPassMusic.play( {volume: 0.8} );
        
                this.walls.killAndHide(wall);

                // Every 100 points add 1 row block
                if (this.backgroundScene.score % this.ADDBLOCK_SCORE == 0){
                    this.blocks.children.iterate(function(block){
                        if (block.active && block.visible){
                            block.y -= block.height;
                            block.refreshBody();
                        }
                    });

                    var wallWidth = this.parent.width / 4;
                    var height = this.parent.height;
                    for(var i = 0; i < 4; i++){
                        this.blocks.create(i * wallWidth, height - 24, 'block').setOrigin(0, 0).setScale(wallWidth / 128, 1).refreshBody();
                    }

                    if (ball.body.blocked.isDown){
                        ball.y -= 24;
                    }
                }
            }
            else{
                this.endGame();
            }
        }
    }

    changeBallColor(event){
        this.ballIndex = this.ballIndex > 1 ? 0 : this.ballIndex + 1;
        
        this.changeColor.setFrame(this.ballIndex);
        this.ball.setFrame(this.ballIndex);
    }

    crashBlock(wall, block){
        
        if (wall.active && wall.visible){

            this.blockCrashMusic.play( {volume: 0.8} );

            block.disableBody(true, true);

            this.walls.killAndHide(wall);
        }
    }

    pauseGame (){        
        this.scene.switch('PauseScene');
    }

    endGame(){

        this.backgroundScene.gameOver = true;

        this.physics.pause();

        this.timedEvent.remove(false);

        this.scene.start('RestartScene');
             
    }
}


// restart scene
class RestartScene extends Phaser.Scene
{
    restartButton;
    restartButton_Text;

    constructor(){
        super('RestartScene');
    }

    create(){

        const width = this.scale.gameSize.width;
        const height = this.scale.gameSize.height;

        var x = width / 2 - 150;
        var y = height / 2 + 50;
        var name = 'Restart';

        // this.add.image(x, y - 200,'logo').setOrigin(0, 0).setScale(3);

        this.restartButton = this.add.image(x + 150, y - 30, 'button', 0).setInteractive();
        this.restartButton.name = name;
        this.restartButton.setScale(2.5);
    
        this.restartButton_Text = this.add.bitmapText(x + 125, y - 48, 'nokia16').setScale(2).setTint(0x0000ff);
        this.restartButton_Text.setText(name);
        this.restartButton_Text.x += (this.restartButton.width - this.restartButton_Text.width) / 2;

        this.restartButton.on('pointerover', function(event){
            this.restartButton.alpha = 0.5;
        }, this);

        this.restartButton.on('pointerout', function(event){
            this.restartButton.alpha = 1;
        }, this);

        this.restartButton.once('pointerup', this.startGame, this);

        this.input.keyboard.on('keyup-ENTER', function (event) {

            this.startGame(null);
    
        },this);
    }

    startGame(event){

        // var gameScene = this.scene.get('GameScene');
        // gameScene.stop();

        var bgScene = this.scene.get('BackgroundScene');
        bgScene.initScore();

        this.scene.start('StartScene');
        
    }
}

// pause scene
class PauseScene extends Phaser.Scene
{
    pauseButton;
    pauseButton_Text;

    constructor(){
        super('PauseScene');
    }

    create(){

        const width = this.scale.gameSize.width;
        const height = this.scale.gameSize.height;

        var x = width / 2 - 150;
        var y = height / 2 + 50;
        var name = 'Resume';

        // this.add.image(x, y - 200,'logo').setOrigin(0, 0).setScale(3);

        this.pauseButton = this.add.image(x + 150, y - 30, 'button', 0).setInteractive();
        this.pauseButton.name = name;
        this.pauseButton.setScale(2.5);
    
        this.pauseButton_Text = this.add.bitmapText(x + 125, y - 48, 'nokia16').setScale(2).setTint(0x0000ff);
        this.pauseButton_Text.setText(name);
        this.pauseButton_Text.x += (this.pauseButton.width - this.pauseButton_Text.width) / 2;

        this.pauseButton.on('pointerover', function(event){
            this.pauseButton.alpha = 0.5;
        }, this);

        this.pauseButton.on('pointerout', function(event){
            this.pauseButton.alpha = 1;
        }, this);

        this.pauseButton.once('pointerup', this.resumeGame, this);

        this.input.keyboard.on('keyup-SPACE', function (event) {

            this.resumeGame(null);
    
        },this);
    }

    resumeGame(event){

        this.scene.stop();

        this.scene.wake('GameScene');
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
    scene: [ BackgroundScene, StartScene, GameScene, RestartScene, PauseScene ]
};

const game = new Phaser.Game(config);
