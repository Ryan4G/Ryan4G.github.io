// 背景层
class BackgroundScene extends Phaser.Scene
{
    bg;
    text;

    flag;
    startDeg;
    endDeg;

    timeEvent;

    layer;

    constructor ()
    {
        super('BackgroundScene');
    }

    preload ()
    {
        // images

        // this.load.image('bg', 'assets/ui/bg.png');
        this.load.image('bg-main', 'assets/ui/1136x640_background.png');
        this.load.image('brick', 'assets/ui/286x83_brick.png');
        this.load.image('brick2', 'assets/ui/233x241columu.png');
        this.load.image('grass', 'assets/ui/198x67_grass.png');
        this.load.image('grass2', 'assets/ui/386x141_grass2.png');
        this.load.image('cannon', 'assets/ui/180x201_cannon.png');
        this.load.image('basket', 'assets/ui/170x97_basket.png');
        this.load.image('pot', 'assets/ui/378x187pot.png');
        this.load.image('cloud', 'assets/ui/443x185_cloud.png');
        this.load.image('cloud2', 'assets/ui/443x185_cloud2.png');
        this.load.image('cat', 'assets/ui/151x172CAT.png');
        this.load.image('vegetable1', 'assets/ui/151x151-1.png');
        this.load.image('vegetable2', 'assets/ui/151x151-2.png');
        this.load.image('vegetable3', 'assets/ui/151x151-3.png');
        this.load.image('menu', 'assets/ui/164x215_list.png');
    }

    create ()
    {
        this.flag = 0;
        this.startDeg = this.endDeg = 0;

        let {width, height} = this.scale.gameSize;
        
        const orient = this.scale.orientation;

        this.layer = this.add.container();
        
        // console.log(this.scale.gameSize);

        if (orient == Phaser.Scale.PORTRAIT){
            height = this.scale.gameSize.width;
            width = this.scale.gameSize.height; 
        }
        
        this.bg = this.add.image(-1, -1, 'bg-main').setOrigin(0).setScale(width / 800, height / 600);
  
        this.text = this.add.text(width / 2, height / 2, '', { fontFamily: 'Arial', fontSize: 16, color: '#000000' });


        this.checkOriention(orient);

        this.scale.on('orientationchange', this.checkOriention, this);
        this.scale.on('resize', this.resize, this);

        // this.timeEvent = this.time.addEvent({ delay: 50, callback: this.onEvent, callbackScope: this, loop: true });

        this.layer.add(this.bg);
        this.layer.add(this.text);

        
        const stdbrick = this.add.image(0, height - 40, 'brick').setOrigin(0).setScale(0.5);
        const stdbrickW = stdbrick.width * 0.5;
        let brickIndex = Math.ceil(width / stdbrickW);
        
        while(brickIndex > 0){
            let brick = this.add.image(stdbrickW * brickIndex, height - 40, 'brick').setOrigin(0).setScale(0.5);
            brickIndex--;
            this.layer.add(brick);
        }

        this.layer.add(stdbrick);
        
        const grass = this.add.image(width - 100, height - 73, 'grass').setOrigin(0).setScale(0.5);
        const grass2 = this.add.image(100, height - 80, 'grass2').setOrigin(0).setScale(0.3);
        
        const cannon = this.add.image(20, height - 140, 'cannon').setOrigin(0).setScale(0.5);
        const pot = this.add.image(260, height - 114, 'pot').setOrigin(0).setScale(0.4);

        this.layer.add(grass);
        this.layer.add(grass2);
        this.layer.add(cannon);
        this.layer.add(pot);

        const vegetables = [
            this.add.image(80, height - 200, 'vegetable1').setOrigin(0).setScale(0.5),
            this.add.image(180, height - 300, 'vegetable2').setOrigin(0).setScale(0.5),
            this.add.image(280, height - 280, 'vegetable3').setOrigin(0).setScale(0.5),
        ]
        
        this.layer.add(vegetables);

        const menu = this.add.image(20, 20, 'menu').setOrigin(0).setScale(0.5);
        const platform = this.add.image(width - 250, height - 160, 'brick2').setOrigin(0).setScale(0.5);
        const cat = this.add.image(width - 250, height - 260, 'cat').setOrigin(0).setScale(0.6);

        this.layer.add(menu);
        this.layer.add(platform);
        this.layer.add(cat);
    }

    update (time, delta){

        var pointer = this.input.activePointer;

        this.text.setText([
            'x: ' + pointer.worldX,
            'y: ' + pointer.worldY,
        ]);
    }

    checkOriention (orientation)
    {
        const { width, height } = this.scale.gameSize;

        // const camera = this.cameras.main;

        if (orientation === Phaser.Scale.PORTRAIT)
        {
            let rotation = Phaser.Math.DegToRad(90);
            this.layer.setPosition(width, 0);
            this.layer.rotation = rotation;
            // this.layer.setScale(width / 600, height / 800);

            this.flag = 0;
            this.endDeg = 90;

            // camera.setViewport(-125, 125, width, height);
            // let rotation = Phaser.Math.DegToRad(90);
            // camera.rotation = rotation;

            //camera.x = camera.y = 0;
            // camera.setPosition(0, 100);

            // this.layer.setPosition(-125, 125);

        }
        else if (orientation === Phaser.Scale.LANDSCAPE)
        {
            this.layer.setPosition(0, 0);
            this.layer.rotation = 0;
            // this.layer.setScale(width / 800, height / 600);

            this.flag = 1;
            this.endDeg = 0;
            // camera.setViewport(0, 0, width, height);
            // this.rotation = 0;
            // camera.rotation = 0;
            // camera.setPosition(0, 0);
            // this.scale.setGameSize(width, height);
        }
    }

    resize(size){
       // console.log(size);   

        // const camera = this.cameras.main;

        // // this.layer.setPosition(size.width / 2, size.height / 2);
        // // // this.layer.setScale(this.gameScene.getZoom());

        // // camera.setViewport(0, 0, width, width);

        
        // camera.setViewport(-125, -125, width, height);
    }
}


// 开始界面层
class StartScene extends Phaser.Scene
{
    constructor(){
        super('StartScene');
    }

    create(){

        const width = this.scale.gameSize.width;
        const height = this.scale.gameSize.height;

        var x = width / 2;
        var y = height / 2 - 120;

    }

    startGame(event){

    }
}

// 游戏层
class GameScene extends Phaser.Scene
{
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

        this.scale.on('resize', this.resize, this);

        //  -----------------------------------
        //  -----------------------------------
        //  -----------------------------------
        //  Normal game stuff from here on down
        //  -----------------------------------
        //  -----------------------------------
        //  -----------------------------------

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
    }

}

// 重新开始层
class RestartScene extends Phaser.Scene
{
    constructor(){
        super('RestartScene');
    }

    create(){

        const width = this.scale.gameSize.width;
        const height = this.scale.gameSize.height;

        var x = width / 2;
        var y = height / 2;
    }

    startGame(event){

        this.scene.start('StartScene');
        
    }
}

// 暂停层
class PauseScene extends Phaser.Scene
{
    constructor(){
        super('PauseScene');
    }

    create(){

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
        width: 800,
        height: 600,
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: true
        }
    },
    scene: [ BackgroundScene, StartScene, GameScene, RestartScene, PauseScene ]
};

const game = new Phaser.Game(config);
