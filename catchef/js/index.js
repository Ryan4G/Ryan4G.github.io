// 背景层
class BackgroundScene extends Phaser.Scene
{
    constructor ()
    {
        super('BackgroundScene');
    }

    preload ()
    {
        // images

        this.load.image('bg', 'assets/ui/bg.png');

    }

    create ()
    {
        const width = this.scale.gameSize.width;
        const height = this.scale.gameSize.height;

        console.log(this.scale.gameSize);
        // const bg = this.add.image(0, 0, 'bg').setOrigin(0).setScale(width/800, height/600);
        const bg = this.add.image(0, 0, 'bg').setOrigin(0).setScale(0.2);

        this.checkOriention(this.scale.orientation);

        this.scale.on('orientationchange', this.checkOriention, this);
        this.scale.on('resize', this.resize, this);
    }

    update (time, delta){

    }

    checkOriention (orientation)
    {
        const camera = this.cameras.main;

        if (orientation === Phaser.Scale.PORTRAIT)
        {
            let rotation = Phaser.Math.DegToRad(90);
            camera.rotation = rotation;
            camera.setScale(0.2);
        }
        else if (orientation === Phaser.Scale.LANDSCAPE)
        {
            // this.rotation = 0;
            camera.rotation = 0;
        }
    }

    resize(size){
        console.log(size);   

        // const camera = this.cameras.main;

        // this.layer.setPosition(size.width / 2, size.height / 2);
        // // this.layer.setScale(this.gameScene.getZoom());

        // camera.setViewport(0, 0, width, height);
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
        width: 667,
        height: 375,
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
