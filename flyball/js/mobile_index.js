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
        this.load.image('tiles', 'assets/tilemaps/tiles/muddy-ground.png');
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

        this.text = this.add.bitmapText(0, 0, 'nokia16').setScrollFactor(0);
        
        
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

    backgroundScene;
    parent;
    sizer;
    sx = 0;
    
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
        //  Any speed as long as 16 evenly divides by it
        this.sx -= 1;

        this.backgroundScene.distance += this.sx;

        this.backgroundScene.text.setText("Distance: " + this.backgroundScene.distance + '');

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
    scene: [ BackgroundScene, GameScene ]
};

const game = new Phaser.Game(config);
