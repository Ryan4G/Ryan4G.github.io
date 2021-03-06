class WaveScene extends Phaser.Scene{

    shinyShell;

    constructor(){
        super('WaveScene');
    }

    create(){
        
        const width = this.scale.gameSize.width;
        const height = this.scale.gameSize.height;

        const seawave_high = this.add.image(width / 2, height + 90, 'seawave', 'high').setScale(width / 800, 1);
        const seawave_middle = this.add.image(width / 2, height + 80, 'seawave', 'middle').setScale(width / 800, 1);
        const seawave_low = this.add.image(width / 2, height + 70, 'seawave', 'low').setScale(width / 800, 1);

        this.shinyShell = this.add.sprite(-1, -1, 'shinyshell').setOrigin(0, 0).setScale(width / 1075, height / 1920);
        this.shinyShell.setVisible(false);

        // amination

        this.tweens.add({
            targets: [seawave_low, seawave_high, seawave_middle],
            duration: 4000,
            x: '+=30',
            y: '-=15',
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
        
        this.anims.create({
            key: 'shell_shiny',
            frames: this.anims.generateFrameNumbers('shinyshell', { start: 0, end: 1 }),
            frameRate: 5,
            repeat: -1
        });

    }

    BringToTopScene(){
        this.scene.bringToTop();
    }

    changeShellShiny(enable){
        if (enable){
            this.shinyShell.anims.play('shell_shiny');
            this.shinyShell.setVisible(true);
        }
        else{            
            this.shinyShell.anims.stop();
            this.shinyShell.setVisible(false);
        }
    }
}

// start scene
class StartScene extends Phaser.Scene
{
    // startButton;
    // startButton_Text;

    constructor(){
        super('StartScene');
    }

    create(){

        const width = this.scale.gameSize.width;
        const height = this.scale.gameSize.height;

        var x = width / 2;
        var y = height / 2 - 120;

        this.add.image(x, y, 'logo-begin').setScale(width / 1100);

        const startButton = this.add.sprite(x, y + 150, 'button-begin').setScale(width / 1100).setInteractive();

        startButton.setFrame(0);

        const exitButton = this.add.sprite(x, y + 210, 'button-begin').setScale(width / 1100).setInteractive();

        exitButton.setFrame(2);

        startButton.on('pointerover', function(event){
            startButton.setFrame(1);
        }, this);

        startButton.on('pointerout', function(event){
            startButton.setFrame(0);
        }, this);

        startButton.once('pointerup', this.startGame, this);

        exitButton.on('pointerover', function(event){
            exitButton.setFrame(3);
        }, this);

        exitButton.on('pointerout', function(event){
            exitButton.setFrame(2);
        }, this);

        // exitButton.once('pointerup', function(){
        //     window.close();
        // }, this);

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
    
    gameScene;

    scoreText;

    bgMusic;
    gameOver = false;


    bgCover;
    bgFrame;

    constructor ()
    {
        super('BackgroundScene');
    }

    preload ()
    {
        
        // Music
        this.load.audio('bg', 'assets/sounds/bg.mp3');
        this.load.audio('sharktime', 'assets/sounds/sharktime.mp3');
        

        // atlas

        this.load.atlas('seawave', 'assets/item/1080x360-water.png', 'assets/item/1080x360-water.json');
        
        this.load.atlas('newui', 'assets/item/154x50-UI.png', 'assets/item/154x50-UI.json');
        
        this.load.atlas('fishui', 'assets/item/322x110-fish.png', 'assets/item/322x110-fish.json');
        
        this.load.image('iceblock', 'assets/item/322x110-iceblock.png');
        
        this.load.spritesheet(
            'shinyshell',
            'assets/item/1080x1920-shine.png',
            {frameWidth:1084, frameHeight: 1925 }
          );

        this.load.spritesheet(
            'newbg',
            'assets/item/1080x1920-background.png',
            {frameWidth:1084, frameHeight: 1925 }
          );

        this.load.spritesheet(
            'fish',
            'assets/item/182x110-fish.png',
            {frameWidth:182, frameHeight: 110 }
          );

        this.load.spritesheet(
          'cat',
          'assets/item/304x312-mix.png',
          {frameWidth:304, frameHeight: 312 }
        );

        this.load.spritesheet(
            'nextcat',
            'assets/item/200x200-minipoi.png',
            {frameWidth:204, frameHeight: 205}
        );

        this.load.spritesheet(
            'shark',
            'assets/item/322x110-shark.png',
            {frameWidth:322, frameHeight: 110}
        );

        this.load.spritesheet(
            'logo-anim',
            'assets/item/1002x614-begananim.png',
            {frameWidth:1002, frameHeight: 615}
        );

        // logo
        this.load.image('logo-begin', 'assets/ui/998x610-began.png');

        this.load.image('logo-end', 'assets/ui/846x502-overgame.png');
    
    
        this.load.image('clock-ui', 'assets/ui/52x52-clock.png');

        this.load.spritesheet(
            'button-begin',
            'assets/ui/430x152-button.png',
            {frameWidth:434, frameHeight: 157}
        );

    }

    create ()
    {
        const width = this.scale.gameSize.width;
        const height = this.scale.gameSize.height;

        this.bgCover = this.add.sprite(-2, -2, 'newbg').setOrigin(0, 0).setScale(width / 1050, height / 1900);
        this.bgFrame = 0;

        // data
        this.data.set({score: 0, bestScore: 0});
        
        this.updateScore(0);
        
        this.scene.launch('WaveScene');

        this.scene.launch('StartScene');

        this.bgMusic = this.sound.add('bg', { loop: true });

        this.bgMusic.play({volume: 0.5});
    }

    update (time, delta){

        if (this.gameOver){
            return;
        }
    }

    updateScrollY(y){
    
        const camera = this.cameras.main;
  
        camera.scrollY = y;
    }

    updateScore(inc)
    {

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

    changeBackground(){

        const waveScene = this.scene.get('WaveScene');

        if (this.bgFrame == 0){
            this.bgFrame = 1;
            waveScene.changeShellShiny(true);
        }
        else{
            this.bgFrame = 0;
            waveScene.changeShellShiny(false);
        }
        
        this.bgCover.setFrame(this.bgFrame);
    }
}


//  This Scene is aspect ratio locked at 640 x 960 (and scaled and centered accordingly)
class GameScene extends Phaser.Scene
{
    RAINBOW_INTERVAL = 20000;

    ADDBLOCK_SCORE = 50;
    GAME_WIDTH = 640;
    GAME_HEIGHT = 960;
    TIME_SPEED = 900;

    FISH_MOVE_X_SPPED = 200;
    BALL_ROTATE_ANGLE = 15;
    BALL_BOUNCE_HEIGHT = 120;

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

    fishDropSpeed;

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

    //
    
    cat;
    fishGroup;
    shark;
    nextCat;

    randomPart;

    sharkTimeEvent;
    secondsTimeEvent;

    // data
    fishGoalMap;
    pinkGoalText;
    blueGoalText;
    yellowGoalText;
    clockTimeText;

    // music
    sharkMusic;

    constructor ()
    {
        super('GameScene');
    }

    create(){
 
        // initial data
        this.rainbowExist = false;
        this.ballGotRainbow = false;
        this.rainbowCounterDown = Phaser.Math.Between(10, 15);
        this.rainbowBlingTime = 0;
        this.currentLevel = 0;

        this.data.set('color', 0);

        this.fishGoalMap = {
            pink : 2,
            blue : 2,
            yellow : 2,
            level : 1,
            clockTime: 15,
        };
        // 

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

        // ui

        const clockicon = this.add.image(20,20, 'clock-ui').setScale(0.5);
        // const fishicon = this.add.image(30, 20, 'newui', 'fishicon').setScale(0.25);
        const pinkGoal = this.add.image(width - 180, 20, 'fishui', 'pinkfish').setScale(0.15);
        const blueGoal = this.add.image(width - 120, 20, 'fishui', 'bluefish').setScale(0.15);
        const yellowGoal = this.add.image(width - 60, 20, 'fishui', 'yellowfish').setScale(0.15);

        this.pinkGoalText = this.add.text(width - 160, 13, '00', { fontFamily: 'Arial', fontSize: 16, color: '#00ff00' });
        this.blueGoalText = this.add.text(width - 100, 13, '00', { fontFamily: 'Arial', fontSize: 16, color: '#00ff00' });
        this.yellowGoalText = this.add.text(width - 40, 13, '00', { fontFamily: 'Arial', fontSize: 16, color: '#00ff00' });
        this.clockTimeText = this.add.text(40, 13, '00', { fontFamily: 'Arial', fontSize: 16, color: '#00ff00' });

        // music
        this.sharkMusic = this.sound.add('sharktime', { loop: true });

        // block
        const iceblock = this.physics.add.staticGroup();
        
        var dropWidth = width / 4;

        for(var i = 0; i < 4; i++)
        {
            iceblock.create(dropWidth * (i + 0.5), height - 100, 'iceblock').setScale(dropWidth / 320).refreshBody();
        }
        
        // sprite
        
        this.anims.create(
            {
                key: 'shark_shine',
                frames: this.anims.generateFrameNumbers('shark', { start: 0, end: 2 }),
                frameRate: 5,
                repeat: -1
            }
        );

        this.anims.create(
            {
                key: 'cat_blue',
                frames: this.anims.generateFrameNumbers('cat', { start: 0, end: 8 }),
                frameRate: 8,
                repeat: -1
            }
        );

        this.anims.create(
            {
                key: 'cat_yellow',
                frames: this.anims.generateFrameNumbers('cat', { start: 9, end: 17 }),
                frameRate: 8,
                repeat: -1
            }
        );

        this.anims.create(
            {
                key: 'cat_pink',
                frames: this.anims.generateFrameNumbers('cat', { start: 18, end: 26 }),
                frameRate: 8,
                repeat: -1
            }
        );

        this.cat = this.physics.add.sprite(width/2, height - 205, 'cat').setScale(0.3);
        this.cat.setBounce(0.8);
        this.cat.setCollideWorldBounds(true);

        this.cat.play('cat_blue');

        this.nextCat = this.add.sprite(width - 30, height - 200, 'nextcat').setScale(0.2);
        this.nextCat.setAlpha(0.9);
        //this.nextCat.setSize(50, 50);
        this.nextCat.setInteractive();        
        this.nextCat.on('pointerdown', this.changeBallColor, this);

        // fish 

        this.fishGroup = this.physics.add.group({            
            defaultKey: 'fish',
            maxSize: 10,
            createCallback: function (fish) {
                fish.setName('fish' + this.getLength());
                fish.body.setAllowGravity(false);
                console.log('Created', fish.name);
            },
            removeCallback: function (fish) {
                console.log('Removed', fish.name);
            }
        });


        // shark

        this.shark = this.physics.add.sprite(0,height,'shark').setScale(0.3);
        this.shark.body.setAllowGravity(false);
        this.shark.setActive(false).setVisible(false);
        
        this.anims.create(
            {
                key: 'shark_shine',
                frames: this.anims.generateFrameNumbers('shark', { start: 0, end: 2 }),
                frameRate: 8,
                repeat: -1
            }
        );


        this.physics.add.collider(this.cat, iceblock);
        this.physics.add.overlap(this.cat, this.fishGroup, this.catchFish, null, this);
        this.physics.add.overlap(this.cat, this.shark, this.getShark, null, this);
        // this.pauseIcon = this.add.image(width - 20, 20, 'pause').setInteractive();
        // this.pauseIcon.on('pointerdown', this.pauseGame, this);


        //  Input Events
        this.input.addPointer(1);
        this.cursors = this.input.keyboard.createCursorKeys();

        this.timedEvent = this.time.addEvent({ delay: this.TIME_SPEED, callback: this.onEvent, callbackScope: this, loop: true });
        
        this.sharkTimeEvent = this.time.addEvent({ delay: this.RAINBOW_INTERVAL, callback: this.onRainbowEvent, callbackScope: this, loop: true });
       
        this.secondsTimeEvent = this.time.addEvent({ delay: 1000, callback: this.onSecondsEvent, callbackScope: this, loop: true });
        // this.ballPassMusic = this.sound.add('knock_wall');
        // this.ballRainbowMusic = this.sound.add('ball_rainbow');
        // this.blockCrashMusic = this.sound.add('block_crash');

        this.debugText = this.add.text(10, 80, '', {fontSize: '16px', fill: '#000'});
            
        this.fishDropSpeed = Phaser.Math.GetSpeed(600, 3);

        // this.changeColor = this.add.sprite(width - 30, height - 200, 'ball').setScale(1).setInteractive();
        // this.changeColor.alpha = 0.9;
        // this.changeColor.on('pointerdown', this.changeBallColor, this);

        // var graphics = this.add.graphics({ lineStyle: { width: 1, color: 0xffffff } });
        // graphics.clear();

        // this.nextColor = this.add.sprite(width - 30, height - 150, 'ball').setScale(0.65);
        // this.nextColor.alpha = 0.9;
        // this.nextColor.setFrame(1);
        
        // var nextRect = new Phaser.Geom.Rectangle();
        // var nexrRectWidth = 35;
        // nextRect.x = this.nextColor.x - nexrRectWidth / 2;
        // nextRect.y = this.nextColor.y - nexrRectWidth / 2;
        // nextRect.width = nextRect.height = nexrRectWidth;

        // graphics.strokeRectShape(nextRect)

        this.input.keyboard.on('keyup-SPACE', function (event) {

            this.changeBallColor(null);
    
        },this);

        const waveScene = this.scene.get('WaveScene');
        waveScene.BringToTopScene();


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
                'Speed:' + delta * that.fishDropSpeed,
                'Pointer1:' + that.input.pointer1.isDown,
                'Pointer2:' + that.input.pointer2.isDown,
                'Pointer1 Duration:' + that.input.pointer1.getDuration(),
                'Pointer2 Duration:' + that.input.pointer2.getDuration(),
            ]);
        }

        this.renderFishGoal();
        // if (this.ballGotRainbow){
        //     var rainbowText = (Array(2).join(0) + (this.RAINBOW_DURING_TIMES - this.rainbowBlingTime)).slice(-2);
        //     this.rainbowCDText.setText(rainbowText);
        // }
        // else{
        //     this.rainbowCDText.visible = false;
        //     this.rainbowBall.visible = false;
        //     this.rainbowBall.anims.stop();
        // }

        Phaser.Actions.IncY(this.fishGroup.getChildren(), delta * this.fishDropSpeed);

        this.shark.y += delta * this.fishDropSpeed;

        this.fishGroup.children.iterate(function (wall) {
            if (wall.y > that.parent.height) {
                that.fishGroup.killAndHide(wall);
            }
        });

        if (this.shark.active && this.shark.visible && this.shark.y > that.parent.height){
            this.shark.setActive(false).setVisible(false);
            this.rainbowExist = false;
        }

        var p = this.input.activePointer;

        var deltaX = 0;
        var fishXSpeed = this.FISH_MOVE_X_SPPED;
        // var rollAngle = this.ballGotRainbow ? this.BALL_ROTATE_ANGLE + 3 : this.BALL_ROTATE_ANGLE;

        if (p.isDown && p.getDuration() > 100)
        {
            deltaX = p.x - this.parent.width / 2;
        }

        if (deltaX < 0 || this.cursors.left.isDown)
        {
            this.cat.setVelocityX(-fishXSpeed);
        }
        else if (deltaX > 0 || this.cursors.right.isDown)
        {
            this.cat.setVelocityX(fishXSpeed);
        }
        else{
            this.cat.setVelocityX(0);
        }

        if ((p.isDown || this.cursors.up.isDown) && this.cat.body.blocked.down){

            this.cat.setVelocityY(-this.BALL_BOUNCE_HEIGHT);
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

        // if (this.parent.height - this.ball.y < 24){
        //     this.endGame();
        // }
    }

    // timer event
    onEvent (){
        
        this.randomPart = Phaser.Math.Between(0, 3);
        var randomColor = Phaser.Math.Between(0, 2);

        var wallWidth = this.parent.width / 4;
        var wall = this.fishGroup.get((this.randomPart + 0.5) * wallWidth, 20);

        if (!wall){
            return;
        }

        wall.setScale(wallWidth / 250);
        
        if (randomColor === 1){
            wall.setFrame(2);
        }
        else if (randomColor === 2){
            wall.setFrame(0);
        }
        else{
            wall.setFrame(1);
        }

        wall.setData('color', randomColor);
        wall.setActive(true).setVisible(true);
        wall.body.setAllowGravity(false);
    }

    onRainbowEvent(){

        if (this.backgroundScene.gameOver){
            return;
        }

        var wallWidth = this.parent.width / 4;

        var sharkpart = this.randomPart - 1;
        sharkpart = sharkpart < 0 ? 3 : sharkpart;

        this.shark.x = (sharkpart + 0.5) * wallWidth;
        this.shark.y = 0;

        this.shark.setActive(true).setVisible(true);
        this.rainbowExist = true;
    }

    onSecondsEvent(){

        if (this.backgroundScene.gameOver){
            return;
        }

        this.fishGoalMap.clockTime--;

        if (this.fishGoalMap.clockTime == 0)
        {
            this.endGame();
        }

        if (this.ballGotRainbow){
            if (this.rainbowBlingTime < this.RAINBOW_DURING_TIMES){
                this.rainbowBlingTime++;
            }
            else{
                this.ballGotRainbow = false;

                this.backgroundScene.changeBackground();

                this.rainbowBlingTime = 0;
                
                this.backgroundScene.bgMusic.mute = false;

                this.sharkMusic.stop();
            }
        }
        
        if (!this.rainbowExist && !this.ballGotRainbow){
            this.rainbowCounterDown--;            
        }
    }

    catchFish(cat, fish){
        if (fish.active && fish.visible){
            if (fish.getData('color') === this.data.get('color') || this.ballGotRainbow)
            {
                var fishColor = fish.getData('color');

                switch(fishColor){
                    case 0: {
                        this.fishGoalMap.blue = this.fishGoalMap.blue > 0 ? this.fishGoalMap.blue - 1 : 0;
                        break;
                    }
                    case 1: {
                        this.fishGoalMap.yellow = this.fishGoalMap.yellow > 0 ? this.fishGoalMap.yellow - 1 : 0;
                        break;
                    }
                    case 2: {
                        this.fishGoalMap.pink = this.fishGoalMap.pink > 0 ? this.fishGoalMap.pink - 1 : 0;
                        break;
                    }
                    default:
                        break;
                }

                this.backgroundScene.updateScore(10);
        
                this.fishGroup.killAndHide(fish);

                // Every 100 points add 1 row block

                var currScore = this.backgroundScene.getScore();

                // if (currScore % this.ADDBLOCK_SCORE == 0){
                    
                //     this.blocks.children.iterate(function(block){
                //         if (block.active && block.visible){
                //             block.y -= block.height;
                //             block.refreshBody();
                //         }
                //     });

                //     var wallWidth = this.parent.width / 4;
                //     var height = this.parent.height;
                //     for(var i = 0; i < 4; i++){
                //         this.blocks.create(i * wallWidth, height - 24, 'block').setOrigin(0, 0).setScale(wallWidth / 128, 1).refreshBody();
                //     }

                //     if (ball.body.blocked.down || ball.body.embedded){
                //         ball.y -= 24;
                //     }

                // }

                // if (this.currentLevel === 0 && currScore >= this.TIME_REDUCE_SCORE)
                // {
                //     this.backgroundScene.bgMusic.setRate(this.HIGHSCORE_RATE);

                //     this.currentLevel = 1;

                //     this.wallFlySpeed = Phaser.Math.GetSpeed(600, 2.3);

                //     this.timedEvent.remove(false);
        
                //     this.timedEvent = this.time.addEvent({ delay: this.TIME_SPEED - this.TIME_REDUCE_SPAN, callback: this.onEvent, callbackScope: this, loop: true });
                // }

                if (this.fishGoalMap.pink == 0 && this.fishGoalMap.blue == 0 && this.fishGoalMap.yellow == 0){
                    // next level
                    this.fishGoalMap.level += 1;

                    this.fishGoalMap.level = Math.min(this.fishGoalMap.level, 3);

                    var goalMin = 5 * this.fishGoalMap.level;
                    var goalMax = 7 * this.fishGoalMap.level;

                    this.fishGoalMap.pink = Phaser.Math.Between(goalMin, goalMax);
                    this.fishGoalMap.blue = Phaser.Math.Between(goalMin, goalMax);
                    this.fishGoalMap.yellow = Phaser.Math.Between(goalMin, goalMax);

                    this.fishGoalMap.clockTime += (30 * (1 + this.fishGoalMap.level));
                }
            }
            else{
                // this.endGame();
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
        
        if (ballColor == 0){
            this.cat.play('cat_blue');
        }
        else if (ballColor == 1){

            this.cat.play('cat_yellow');
        }
        else {
            this.cat.play('cat_pink');
        }

        this.nextCat.setFrame(ballColor);
        // this.changeColor.setFrame(ballColor);
        // this.ball.setFrame(ballColor);
        // this.nextColor.setFrame(nextColor);
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

    getShark(){

        if (this.shark.active && this.shark.visible)
        {
            this.shark.setActive(false).setVisible(false);

            this.ballGotRainbow = true;
            this.rainbowExist = false;
            this.rainbowBlingTime = 0;
            
            // this.ball.anims.play('bling', true);
            // this.rainbowBall.anims.play('bling', true);

            // this.rainbowCDText.visible = true;
            // this.rainbowBall.visible = true;

            this.backgroundScene.changeBackground();
            this.backgroundScene.bgMusic.mute = true;

            this.sharkMusic.play({volume: 1});
        }
    }

    renderFishGoal(){

        this.pinkGoalText.setText((Array(2).join(0) + this.fishGoalMap.pink).slice(-2));
        this.blueGoalText.setText((Array(2).join(0) + this.fishGoalMap.blue).slice(-2));
        this.yellowGoalText.setText((Array(2).join(0) + this.fishGoalMap.yellow).slice(-2));
        this.clockTimeText.setText((Array(3).join(0) + this.fishGoalMap.clockTime).slice(-3));

    }

    pauseGame (){        
        this.scene.switch('PauseScene');
    }

    endGame(){

        this.backgroundScene.gameOver = true;

        this.physics.pause();

        this.timedEvent.remove(false);
        this.sharkTimeEvent.remove(false);
        this.secondsTimeEvent.remove(false);

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

        const endlogo = this.add.image(x, y - 120, 'logo-end').setScale(width / 1100);
        // var name = 'Restart';

        // this.add.image(x, y - 140,'end-logo').setScale(2.6);

        // this.add.image(x - 80, y - 40,'end-best').setScale(2.2);

        // this.add.image(x, y - 10,'end-line').setScale(2, 1);

        // this.add.image(x, y + 35,'end-score').setScale(1.8, 2)

        
        const startButton = this.add.sprite(x, y + 30, 'button-begin').setScale(width / 1100).setInteractive();

        startButton.setFrame(0);

        // this.restartButton = this.add.image(x, y - 30, 'button', 0).setInteractive();
        // this.restartButton.name = name;
        // this.restartButton.setScale(2.5);
    
        // this.restartButton_Text = this.add.bitmapText(x - 25, y + 85, 'nokia16').setScale(2).setTint(0x0000ff);
        // this.restartButton_Text.setText(name);
        // this.restartButton_Text.x += (this.restartButton.width - this.restartButton_Text.width) / 2;

        // this.bestScore_Text = this.add.bitmapText(x + 5, y - 55, 'nokia16').setScale(2.2);
        // this.currScore_Text = this.add.bitmapText(x - 62, y + 18, 'nokia16').setScale(2.2);

        startButton.on('pointerover', function(event){
            startButton.alpha = 0.5;
        }, this);

        startButton.on('pointerout', function(event){
            startButton.alpha = 1;
        }, this);

        startButton.once('pointerup', this.startGame, this);

        this.input.keyboard.on('keyup-ENTER', function (event) {

            this.startGame(null);
    
        },this);

        this.backgroundScene = this.scene.get('BackgroundScene');

        // var bestScore = this.backgroundScene.getBestScore();
        // var currScore = this.backgroundScene.getScore();

        // this.bestScore_Text.setText((Array(this.SCORE_NUM).join(0) + bestScore).slice(-this.SCORE_NUM));
        // this.currScore_Text.setText((Array(this.SCORE_NUM).join(0) + currScore).slice(-this.SCORE_NUM));
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
    scene: [ BackgroundScene, WaveScene, StartScene, GameScene, RestartScene, PauseScene ]
};

const game = new Phaser.Game(config);
