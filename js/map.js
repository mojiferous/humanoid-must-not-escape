/**
 *
 * 3/5/13 Mojiferous
 * map class and handlers
 */

/**
 * map object
 * @param mainCanvas
 * @param tileSize
 * @param mapWidth
 * @param mapHeight
 * @constructor
 */
function MainMap(mainCanvas, tileSize, mapWidth, mapHeight) {

  //get the canvas the map will be drawn to and its context
  this.parentCanvas = mainCanvas;
  this.drawCanvas = mainCanvas.getContext('2d');

  //set dimensions
  this.tileSize = tileSize;
  this.mapWidth = mapWidth;
  this.mapHeight = mapHeight;

  //the map itself
  this.tiles = [];
  //the overlay map, where robots and such live
  this.overlay = [];

  //grab our tileset
  this.tileset = document.getElementById('tileset2');

  this.robots = [];
  this.humans = [];

  //these commands are for the unused maze setup
//  this.mazeNodes = [];
//  this.mazeCount = 0;

  //initialize the board, including the overlay, all placement of blocks and characters must occur after this call
  this.initBoard();

  this.addRobot();
  this.addHuman();

  this.drawBoard();
}

/**
 * handle a game tick
 */
MainMap.prototype.handleTick = function() {
  for(var n=0; n<this.robots.length; n++) {
    this.robots[n].handleTick(this);
  }
};

/**
 * set up the initial board
 */
MainMap.prototype.initBoard = function() {
  var x; var y;
  for(x=0; x<this.mapWidth; x++) {
    //init the second level of the array
    this.tiles[x] = [];
    this.overlay[x] = [];

    for(y=0; y<this.mapHeight; y++) {

      if(x == 0 || y == 0 || x == (this.mapWidth-1) || y == (this.mapHeight-1)) {
        //the edge is unbreakable blocks
        this.tiles[x][y] = 2;
        //nothing can penetrate the unbreakable blocks
        this.overlay[x][y] = -1;
      } else {
        //the middle is tiles
        this.tiles[x][y] = 0;
        //a zero value on the overlay indicates a whole lot of nothing
        this.overlay[x][y] = 0;
      }

    }
  }

  //no longer used call to set up rooms and mazes on the map
//  this.setupMazes();
};

/**
 * adds a single robot to the map
 */
MainMap.prototype.addRobot = function() {
  this.robots.push(new Robot(1, 1, 2, this, 1));
};

MainMap.prototype.addHuman = function() {
  this.humans.push(new Human(10, 10, this));
};

/**
 * checks a tile for a value, returns true is the tile is of that value,
 * used for bounds checking
 * @param x
 * @param y
 * @param checkVal value to check against
 * @returns {boolean}
 */
MainMap.prototype.checkTile = function(x, y, checkVal) {
  if(x >= 0 && y >= 0 && x < this.mapWidth && y < this.mapHeight) {
    if(this.tiles[x][y] == checkVal) {
      return true;
    }
  }

  return false;
};

/**
 * checks for obstacles on the passed block xy, and returns true if there is an obstacle
 * @param x
 * @param y
 * @returns {boolean}
 */
MainMap.prototype.checkForObstacles = function(x, y) {
  if(x >= 0 && y >= 0 && x < this.mapWidth && y < this.mapHeight) {
    if(this.tiles[x][y] != 0) {
      //this is not a free tile, which means that this tile must be a block of some sort
      return true;
    } else {
      if(this.overlay[x][y] != 0) {
        //there may be a free tile, but there is something on this block, like another robot
        return true;
      } else {
        //not only is the tile free, but there is nothing else on the block
        return false;
      }
    }
  }

  return true;
};

/**
 * @todo deprecated
 * start drawing mazes through the walls of the level
 */
MainMap.prototype.setupMazes = function() {
//  var startingX = Math.round(Math.random()*this.mapWidth);

//  this.mazeNodes.push(new Maze(startingX, this.mapHeight, this));
};

/**
 * redraw the entire board
 */
MainMap.prototype.drawBoard = function() {
  var x; var y;
  for(x=0; x<this.mapWidth; x++) {
    for(y=0; y<this.mapHeight; y++) {
      this.drawTile(x, y);
    }
  }
};

/**
 * render a single tile on the board
 * @param x
 * @param y
 */
MainMap.prototype.drawTile = function(x, y) {
  var startX = 0;
  var startY = 0;
  var useDefault = true;

  //figure out what tile is at this location and render its contents
  switch (this.tiles[x][y]) {
    case 0:
      //block tiles
      startX = 96;
      startY = 64;
      break;
    case 1:
      //walls
      startX = 32;
      startY = 32;
      break;
    case 2:
      //unbreakable blocks
      startX = 32;
      startY = 64;
      break;
  }

  if(useDefault) {
    this.drawCanvas.drawImage(this.tileset, startX, startY, 32, 32, (this.tileSize*x), (this.tileSize*y), this.tileSize, this.tileSize);
  }

  //now we will render the overlay blocks, such as robots etc.
  useDefault = false;
  switch (this.overlay[x][y]) {
    case 1:
      //robot, right turning
      startX = 160;
      startY = 544;
      useDefault = true;
      break;
    case 2:
      //robot, left turning
      startX = 128;
      startY = 544;
      useDefault = true;
      break;
    case 3:
      //random turning robot
      startX = 96;
      startY = 544;
      useDefault = true;
      break;

    case 50:
      //a human
      startX = 32;
      startY = 672;
      useDefault = true;
  }

  if(useDefault) {
    this.drawCanvas.drawImage(this.tileset, startX, startY, 32, 32, (this.tileSize*x), (this.tileSize*y), this.tileSize, this.tileSize);
  }

};

/**
 * handle tile clicks on the map
 * @param rawX
 * @param rawY
 */
MainMap.prototype.changeTile = function(rawX, rawY) {
  var locX = Math.floor(rawX/this.tileSize);
  var locY = Math.floor(rawY/this.tileSize);

  if(this.tiles[locX][locY] == 0) {
    this.tiles[locX][locY] = 1;
  } else {
    this.tiles[locX][locY] = 0;
  }
  this.drawTile(locX, locY);
};
