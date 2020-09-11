
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

        //this.add.image(x, y - 200,'logo').setOrigin(0, 0).setScale(1.5);

        this.startButton = this.add.image(x + 150, y - 30, 'button', 0).setInteractive();
        this.startButton.name = name;
        this.startButton.setScale(2.5);
    
        this.startButton_Text = this.add.bitmapText(x + 125, y - 48, 'nokia16').setScale(2.2).setTint(0x0000ff);
        this.startButton_Text.setText(name);
        this.startButton_Text.x += (this.startButton.width - this.startButton_Text.width) / 2;

        this.startBallArea = this.add.image(x + 150, y + 30, 'startarea').setScale(2.2);

        this.startBall = this.add.image(x + 150, y + 30, 'ball').setScale(0.8);

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
    //tiles = [ 7, 7, 7, 6, 6, 6, 0, 0, 0, 1, 1, 2, 3, 4, 5 ];
    gameScene;

    scoreText;

    bgMusic;
    gameOver = false;

    uibg;
    seawave_low;
    seawave_middle;
    seawave_high;

    constructor ()
    {
        super('BackgroundScene');
    }

    preload ()
    {
        // image
        this.load.image('logo', 'assets/ui/Banner256.png');
        this.load.image('button', 'assets/ui/Banner-2.png');
        this.load.image('startarea', 'assets/ui/Banner-3.png');
 
        this.load.image('block','assets/sprites/block-wall.png');
        this.load.image('icon', 'assets/ui/score-icon.png');
		  this.load.spritesheet(
            'wall',
            'assets/sprites/wall-all.png',
            {frameWidth:113, frameHeight:66}
        );
        
        
        this.load.image('pause', 'assets/ui/pause-icon.png');

        this.load.image('end-logo', 'assets/ui/ending.png');
        this.load.image('end-best', 'assets/ui/ending2.png');
        this.load.image('end-line', 'assets/ui/ending3.png');
        this.load.image('end-score', 'assets/ui/ending4.png');

        // sprite
        this.load.spritesheet(
            'ball',
            'assets/sprites/ball_new.png',
            {frameWidth:50, frameHeight:50}
        );

        // Font
        this.load.bitmapFont('nokia16', 'assets/fonts/bitmap/nokia16.png', 'assets/fonts/bitmap/nokia16.xml');
        this.load.bitmapFont('nokia', 'assets/fonts/bitmap/nokia16black.png', 'assets/fonts/bitmap/nokia16black.xml');
    
        // Music
        this.load.audio('bg', 'assets/sounds/bg-happy.mp3');
        this.load.audio('block_crash', 'assets/sounds/block_crash.mp3');
        this.load.audio('knock_wall', 'assets/sounds/knock_wall.mp3');
        this.load.audio('ball_rainbow', 'assets/sounds/ball_rainbow.mp3');
        

        // atlas
        this.load.atlas('newbg', 'assets/item/1080x1920-background.png', 'assets/item/1080x1920-background.json');

        this.load.atlas('shinyshell', 'assets/item/1080x1920-shine.png', 'assets/item/1080x1920-shine.json');

        this.load.atlas('seawave', 'assets/item/1080x360-water.png', 'assets/item/1080x360-water.json');
    }

    create ()
    {
        // var mapData = [];

        // for (var y = 0; y < this.mapHeight; y++)
        // {
        //     var row = [];

        //     for (var x = 0; x < this.mapWidth; x++)
        //     {
        //         //  Scatter the tiles so we get more mud and less stones
        //         var tileIndex = Phaser.Math.RND.weightedPick(this.tiles);

        //         row.push(tileIndex);
        //     }

        //     mapData.push(row);
        // }

        // this.map = this.make.tilemap({ data: mapData, tileWidth: 16, tileHeight: 16 });

        // var tileset = this.map.addTilesetImage('tiles');
        // var layer = this.map.createDynamicLayer(0, tileset, 0, 0);

        const width = this.scale.gameSize.width;
        const height = this.scale.gameSize.height;

        this.uibg = this.add.image(0, 0, 'newbg', 'normal').setOrigin(0, 0).setScale(width / 1080, height / 1920);

        this.seawave_high = this.add.image(width / 2, height - 10, 'seawave', 'high').setScale(width / 1080, 1);
        this.seawave_middle = this.add.image(width / 2, height - 10, 'seawave', 'middle').setScale(width / 1080, 1);
        this.seawave_low = this.add.image(width / 2, height - 10, 'seawave', 'low').setScale(width / 1080, 1);


        this.text = this.add.bitmapText(35, 10, 'nokia16').setScale(1.5).setScrollFactor(0);
        
        this.add.image(10, 10, 'icon').setOrigin(0, 0).setScale(2).setScrollFactor(0);;

        // data
        this.data.set({score: 0, bestScore: 0});

        
        this.updateScore(0);
        
        this.scene.launch('StartScene');

        this.bgMusic = this.sound.add('bg', { loop: true });

        this.bgMusic.play({volume: 0.5});
    }

    update (time, delta){

        if (this.gameOver){
            return;
        }

        //  Any speed as long as 16 evenly divides by it
        // this.sx -= this.SPEED;
        
        // if (this.sx === -16)
        // {
        //     //  Reset and create new strip

        //     var tile;
        //     var prev;

        //     for (var y = this.mapHeight - 2; y >= 0; y--)
        //     {
        //         for (var x = 0; x < this.mapWidth; x++)
        //         {
        //             tile = this.map.getTileAt(x, y);
        //             prev = this.map.getTileAt(x, y + 1);

        //             prev.index = tile.index;

        //             if (y === 0)
        //             {
        //                 tile.index = Phaser.Math.RND.weightedPick(this.tiles);
        //             }
        //         }
        //     }

        //     this.sx = 0;
        // }

        // this.updateScrollY(this.sx + 16);
    }

    updateScrollY(y){
    
        const camera = this.cameras.main;
  
        camera.scrollY = y;
    }

    updateScore(inc)
    {
        var score = this.data.get('score'); 
        
        if (!score){
            score = 0;
        }

        score += inc;

        this.scoreText = (Array(this.SCORE_NUM).join(0) + score).slice(-this.SCORE_NUM);
        this.text.setText(this.scoreText);
        
        this.data.set('score', score);

        var bestScore = this.data.get('bestScore');

        if (!bestScore){
            bestScore = 0;
        }

        bestScore = Math.max(score, bestScore);

        this.data.set('bestScore', bestScore);
    }

    initScore(){
        this.gameOver = false;

        var score = this.data.get('score');

        if (score){
            this.data.set('score', 0);
        }

        this.updateScore(0);
        this.bgMusic.setRate(1);
    }

    getScore(){

        var score = this.data.get('score');

        if (!score){
            score = 0;
        }

        return score;
    }

    getBestScore(){

        var bestScore = this.data.get('bestScore');

        if (!bestScore){
            bestScore = 0;
        }

        return bestScore;
    }
}


//  This Scene is aspect ratio locked at 640 x 960 (and scaled and centered accordingly)
class GameScene extends Phaser.Scene
{
    ADDBLOCK_SCORE = 50;
    GAME_WIDTH = 640;
    GAME_HEIGHT = 960;
    TIME_SPEED = 1200;

    BALL_MOVE_SPPED = 200;
    BALL_ROTATE_ANGLE = 15;
    BALL_BOUNCE_HEIGHT = 270;

    TIME_REDUCE_SPAN = 350;
    TIME_REDUCE_SCORE = 500;

    RAINBOW_DURING_TIMES = 12;
    HIGHSCORE_RATE = 1.4;

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
    ballRainbowMusic;
    blockCrashMusic;

    wallFlySpeed;

    changeColor;
    nextColor;

    changeColorCD = false;

    pauseIcon;

    rainbowExist;
    ballGotRainbow;
    rainbowCounterDown;
    rainbowBlingTime;

    rainbowBall;
    rainbowCDText;

    currentLevel = 0;

    constructor ()
    {
        super('GameScene');
    }

    create(){
 
        this.rainbowExist = false;
        this.ballGotRainbow = false;
        this.rainbowCounterDown = Phaser.Math.Between(10, 15);
        this.rainbowBlingTime = 0;
        this.currentLevel = 0;

        this.data.set('color', 0);

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
        this.input.addPointer(1);
        this.cursors = this.input.keyboard.createCursorKeys();

        //this.input.mouse.disableContextMenu();

        this.ball = this.physics.add.sprite(width / 2, height / 2 + 80, 'ball').setScale(0.8);
        this.ball.setBounce(0.8);
        this.ball.setCollideWorldBounds(true);
        
        this.rainbowBall= this.add.sprite(20, 50, 'ball').setScale(0.44);
        
        this.rainbowCDText = this.add.bitmapText(35, 40, 'nokia16').setScale(1.5);
        
        // animate
        this.anims.create({
            key: 'bling',
            frames: this.anims.generateFrameNumbers('ball', {start: 0, end: 2}),
            frameRate: 10,
            repeat: -1
        });
        
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
        this.ballRainbowMusic = this.sound.add('ball_rainbow');
        this.blockCrashMusic = this.sound.add('block_crash');

        this.debugText = this.add.text(10, 80, '', {fontSize: '16px', fill: '#000'});
            
        this.wallFlySpeed = Phaser.Math.GetSpeed(600, 3);

        this.changeColor = this.add.sprite(width - 30, height - 200, 'ball').setScale(1).setInteractive();
        this.changeColor.alpha = 0.9;
        this.changeColor.on('pointerdown', this.changeBallColor, this);

        var graphics = this.add.graphics({ lineStyle: { width: 1, color: 0xffffff } });
        graphics.clear();

        this.nextColor = this.add.sprite(width - 30, height - 150, 'ball').setScale(0.65);
        this.nextColor.alpha = 0.9;
        this.nextColor.setFrame(1);
        
        var nextRect = new Phaser.Geom.Rectangle();
        var nexrRectWidth = 35;
        nextRect.x = this.nextColor.x - nexrRectWidth / 2;
        nextRect.y = this.nextColor.y - nexrRectWidth / 2;
        nextRect.width = nextRect.height = nexrRectWidth;

        graphics.strokeRectShape(nextRect)

        this.input.keyboard.on('keyup-SPACE', function (event) {

            this.changeBallColor(null);
    
        },this);

        this.input.on('pointerup', function (pointer) {

            this.changeColorCD = false;
    
        }, this);
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
                'Ball IsDown:' + that.ball.body.blocked.down,
                'Ball Embedded:' + that.ball.body.embedded,
                'Speed:' + delta * that.wallFlySpeed,
                'Pointer1:' + that.input.pointer1.isDown,
                'Pointer2:' + that.input.pointer2.isDown,
                'Pointer1 Duration:' + that.input.pointer1.getDuration(),
                'Pointer2 Duration:' + that.input.pointer2.getDuration(),
            ]);
        }

        if (this.ballGotRainbow){
            var rainbowText = (Array(2).join(0) + (this.RAINBOW_DURING_TIMES - this.rainbowBlingTime)).slice(-2);
            this.rainbowCDText.setText(rainbowText);
        }
        else{
            this.rainbowCDText.visible = false;
            this.rainbowBall.visible = false;
            this.rainbowBall.anims.stop();
        }

        Phaser.Actions.IncY(this.walls.getChildren(), delta * this.wallFlySpeed);

        this.walls.children.iterate(function (wall) {
            if (wall.y > that.parent.height) {
                that.walls.killAndHide(wall);
            }
        });

        var p = this.input.activePointer;

        var deltaX = 0;
        var rollSpeed = this.ballGotRainbow ? this.BALL_MOVE_SPPED + 50 : this.BALL_MOVE_SPPED;
        var rollAngle = this.ballGotRainbow ? this.BALL_ROTATE_ANGLE + 3 : this.BALL_ROTATE_ANGLE;

        if (p.isDown && p.getDuration() > 100)
        {
            deltaX = p.x - this.parent.width / 2;
        }

        if (deltaX < 0 || this.cursors.left.isDown)
        {
            this.ball.setVelocityX(-rollSpeed);
            this.ball.angle -= rollAngle;
        }
        else if (deltaX > 0 || this.cursors.right.isDown)
        {
            this.ball.setVelocityX(rollSpeed);
            this.ball.angle += rollAngle;
        }
        else{
            this.ball.setVelocityX(0);
        }

        if ((p.isDown || this.cursors.up.isDown) && this.ball.body.blocked.down){

            this.ball.setVelocityY(-this.BALL_BOUNCE_HEIGHT);
        }

        // two pointer is down state to change color
        if (
            !this.changeColorCD &&
            this.input.pointer1.isDown &&
            this.input.pointer2.isDown &&
            this.input.pointer1.getDuration() > 80 &&
            this.input.pointer2.getDuration() > 80             
            ){
                this.changeColorCD = true;
                this.changeBallColor(null);
        }

        if (this.parent.height - this.ball.y < 24){
            this.endGame();
        }
    }

    // timer event
    onEvent (){
        
        var randomPart = Phaser.Math.Between(0, 3);
        var randomColor = Phaser.Math.Between(0, 2);

        var wallWidth = this.parent.width / 4;
        var wall = this.walls.get(randomPart * wallWidth, 0);

        if (!wall){
            return;
        }

        if (this.ballGotRainbow){
            if (this.rainbowBlingTime < this.RAINBOW_DURING_TIMES){
                this.rainbowBlingTime++;
            }
            else{
                this.ballGotRainbow = false;

                this.ball.anims.stop(); 
                
                var ballColor = this.data.get('color');
                this.ball.setFrame(ballColor);
            }
        }
        
        if (!this.rainbowExist && !this.ballGotRainbow){
            this.rainbowCounterDown--;            
        }

        if (wall.isTinted){
            wall.clearTint();
        }

        wall.setOrigin(0, 0).setScale(wallWidth / 113, wallWidth / 160);

        // show the rainbow
        if (this.rainbowCounterDown <= 0)
        {
            this.rainbowCounterDown = Phaser.Math.Between(20, 30);

            this.rainbowExist = true;

            wall.setFrame(3);
            
            wall.setData('color', 4);
            wall.setActive(true).setVisible(true);
            wall.body.setAllowGravity(false);
        }
        else
        {
            wall.setFrame(0);

            if (randomColor === 1){
                wall.setFrame(1);
            }
            else if (randomColor === 2){
                wall.setFrame(2);
            }
            else{
                wall.setFrame(0);
            }

            wall.setData('color', randomColor);
            wall.setActive(true).setVisible(true);
            wall.body.setAllowGravity(false);
        }
    }

    throughWall(ball, wall){
        if (wall.active && wall.visible){
            if (wall.getData('color') === this.data.get('color') || wall.getData('color') === 4 || this.ballGotRainbow)
            {
                if (wall.getData('color') === 4){
                    this.ballRainbowMusic.play( {volume: 0.8} );

                    this.ballGotRainbow = true;
                    this.rainbowExist = false;
                    this.rainbowBlingTime = 0;
                    
                    this.ball.anims.play('bling', true);
                    this.rainbowBall.anims.play('bling', true);

                    this.rainbowCDText.visible = true;
                    this.rainbowBall.visible = true;
                }
				else{
                    this.ballPassMusic.play( {volume: 0.8} );
                }

                this.backgroundScene.updateScore(10);

        
                this.walls.killAndHide(wall);

                // Every 100 points add 1 row block

                var currScore = this.backgroundScene.getScore();

                if (currScore % this.ADDBLOCK_SCORE == 0){
                    
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

                    if (ball.body.blocked.down || ball.body.embedded){
                        ball.y -= 24;
                    }

                }

                if (this.currentLevel === 0 && currScore >= this.TIME_REDUCE_SCORE)
                {
                    this.backgroundScene.bgMusic.setRate(this.HIGHSCORE_RATE);

                    this.currentLevel = 1;

                    this.wallFlySpeed = Phaser.Math.GetSpeed(600, 2.3);

                    this.timedEvent.remove(false);
        
                    this.timedEvent = this.time.addEvent({ delay: this.TIME_SPEED - this.TIME_REDUCE_SPAN, callback: this.onEvent, callbackScope: this, loop: true });
                }
            }
            else{
                this.endGame();
            }
        }
    }

    changeBallColor(event){
                
        if (this.ballGotRainbow){
            return;
        }

        var ballColor = this.data.get('color');
        
        var nextColor = ballColor < 1 ? 2 : ballColor - 1;

        ballColor = ballColor > 1 ? 0 : ballColor + 1;

        this.data.set('color', ballColor);
        
        this.changeColor.setFrame(ballColor);
        this.ball.setFrame(ballColor);
        this.nextColor.setFrame(nextColor);
    }

    crashBlock(wall, block){
        
        if (wall.active && wall.visible){

            if (wall.getData('color') === 4){
                this.rainbowExist = false;
            }

            this.blockCrashMusic.play( {volume: 0.6} );

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
    SCORE_NUM = 6;

    restartButton;
    restartButton_Text;

    bestScore_Text;
    currScore_Text;

    backgroundScene;

    constructor(){
        super('RestartScene');
    }

    create(){

        const width = this.scale.gameSize.width;
        const height = this.scale.gameSize.height;

        var x = width / 2;
        var y = height / 2;
        var name = 'Restart';

        this.add.image(x, y - 140,'end-logo').setScale(2.6);

        this.add.image(x - 80, y - 40,'end-best').setScale(2.2);

        this.add.image(x, y - 10,'end-line').setScale(2, 1);

        this.add.image(x, y + 35,'end-score').setScale(1.8, 2)

        this.restartButton = this.add.image(x, y + 100, 'button', 0).setInteractive();
        this.restartButton.name = name;
        this.restartButton.setScale(2.5);
    
        this.restartButton_Text = this.add.bitmapText(x - 25, y + 85, 'nokia16').setScale(2).setTint(0x0000ff);
        this.restartButton_Text.setText(name);
        this.restartButton_Text.x += (this.restartButton.width - this.restartButton_Text.width) / 2;

        this.bestScore_Text = this.add.bitmapText(x + 5, y - 55, 'nokia16').setScale(2.2);
        this.currScore_Text = this.add.bitmapText(x - 62, y + 18, 'nokia16').setScale(2.2);

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

        this.backgroundScene = this.scene.get('BackgroundScene');

        var bestScore = this.backgroundScene.getBestScore();
        var currScore = this.backgroundScene.getScore();

        this.bestScore_Text.setText((Array(this.SCORE_NUM).join(0) + bestScore).slice(-this.SCORE_NUM));
        this.currScore_Text.setText((Array(this.SCORE_NUM).join(0) + currScore).slice(-this.SCORE_NUM));
    }

    startGame(event){

        // var gameScene = this.scene.get('GameScene');
        // gameScene.stop();

        this.backgroundScene.initScore();

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
