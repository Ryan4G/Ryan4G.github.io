//  This Scene has no aspect ratio lock, it will scale to fit the browser window, but will zoom to match the Game
class BackgroundScene extends Phaser.Scene
{
    map;
    text;
    mapWidth = 40;
    mapHeight = 60;
    distance = 0;
    tiles = [ 7, 7, 7, 6, 6, 6, 0, 0, 0, 1, 1, 2, 3, 4, 5 ];
    gameScene;
    
    constructor ()
    {
        super('BackgroundScene');
    }

    preload ()
    {
        this.load.image('tiles', 'assets/tilemaps/tiles/fly-ball-grass-16.png');
        this.load.bitmapFont('nokia16', 'assets/fonts/bitmap/nokia16.png', 'assets/fonts/bitmap/nokia16.xml');

        this.load.image('ball','assets/sprites/orb-red.png');
        this.load.image('block','assets/sprites/block-wall.png');
        this.load.image('wall','assets/sprites/red-pass-wall.png');
        this.load.image('icon', 'assets/ui/score-icon.png');
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

        this.text = this.add.bitmapText(20, 10, 'nokia16').setScrollFactor(0);
        
        this.add.image(0, 10, 'icon').setOrigin(0, 0).setScale(1.5).setScrollFactor(0);;

        this.scene.launch('GameScene');

        this.gameScene = this.scene.get('GameScene');
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
}


//  This Scene is aspect ratio locked at 640 x 960 (and scaled and centered accordingly)
class GameScene extends Phaser.Scene
{
    GAME_WIDTH = 640;
    GAME_HEIGHT = 960;

    ball;
    backgroundScene;
    parent;
    sizer;
    sx = 0;
    cursors;

    blocks;
    walls;

    last_wall;

    gameOver = false;
    score = 0;
    scoreText;

    timedEvent;

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


        this.input.mouse.disableContextMenu();


        this.ball = this.physics.add.sprite(width/2, height - 10, 'ball');
        this.ball.setBounce(0);
        this.ball.setCollideWorldBounds(true);
        
        this.blocks = this.add.group();

        this.walls = this.physics.add.group({
            defaultKey: 'wall',
            maxSize: 10,
            createCallBack: function (wall){
                wall.setName('wall' + this.getLength());
                wall.body.setAllowGravity(false);

                console.log('Created', wall.name);
            },
            removeCallBack: function(wall){
                console.log('Removed', wall.name);
            }
        });

        var randomX = Phaser.Math.Between(25, this.sizer.width - 25);

        //var wall = this.walls.create(randomX, 16, 'wall');

        this.physics.add.overlap(this.ball, this.walls, this.throughWall, null, this);
        this.physics.add.collider(this.ball, this.blocks, this.hitBlock, null, this);
        
        this.scoreText = (Array(3).join(0) + this.score).slice(-3);
        this.backgroundScene.text.setText(this.scoreText);

        this.timedEvent = this.time.addEvent({ delay: 1000, callback: this.onEvent, callbackScope: this, loop: true });
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

        Phaser.Actions.IncY(this.walls.getChildren(), 1);

        var that = this;
        this.walls.children.iterate(function (wall) {
            if (wall.y > 600) {
                that.walls.killAndHide(wall);
            }
        });

        //  Any speed as long as 16 evenly divides by it
        this.sx -= 1;
        
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

        if (this.sx === -16)
        {
            //  Reset and create new strip

            var tile;
            var prev;

            for (var y = this.backgroundScene.mapHeight - 2; y >= 0; y--)
            {
                for (var x = 0; x < this.backgroundScene.mapWidth; x++)
                {
                    tile = this.backgroundScene.map.getTileAt(x, y);
                    prev = this.backgroundScene.map.getTileAt(x, y + 1);

                    prev.index = tile.index;

                    if (y === 0)
                    {
                        tile.index = Phaser.Math.RND.weightedPick(this.backgroundScene.tiles);
                    }
                }
            }

            this.sx = 0;
        }

        //this.cameras.main.scrollX = 16;
        this.backgroundScene.updateScrollY(this.sx + 16);
    }

    // timer event
    onEvent (){

        var randomX = Phaser.Math.Between(25, this.sizer.width - 25);

        var wall = this.walls.get(randomX, 16);

        if (!wall){
            return;
        }

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

        this.score += 10;

        this.scoreText = (Array(3).join(0) + this.score).slice(-3);
        this.backgroundScene.text.setText(this.scoreText);
        
        this.last_wall = wall;
    }
}

const config = {
    type: Phaser.AUTO,
    backgroundColor: '#000000',
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
    scene: [ BackgroundScene, GameScene ]
};

const game = new Phaser.Game(config);
