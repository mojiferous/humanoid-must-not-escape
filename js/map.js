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

  //arrays of robot and human objects
  this.robots = [];
  this.humans = [];

  //human and robot attraction arrays
  this.attractRobots = [];
  this.attractHumans = [];

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

    //init our attract arrays
    this.attractHumans[x] = [];
    this.attractRobots[x] = [];

    for(y=0; y<this.mapHeight; y++) {
      //our attractiveness starts at 0
      this.attractHumans[x][y] = 0;
      this.attractRobots[x][y] = 0;

      if(x == 0 || y == 0 || x == (this.mapWidth-1) || y == (this.mapHeight-1)) {
        //the edge is unbreakable blocks
        this.tiles[x][y] = 2;
        //nothing can penetrate the unbreakable blocks
        this.overlay[x][y] = -1;

        //the unbreakable blocks should never attract anyone
        this.attractHumans[x][y] = -1000;
        this.attractRobots[x][y] = -1000;

      } else {
        //the middle is tiles
        this.tiles[x][y] = 0;
        //a zero value on the overlay indicates a whole lot of nothing
        this.overlay[x][y] = 0;

      }

    }
  }

  //add some invisible holes
  this.initHoles();
};

/**
 * adds random holes to the map
 */
MainMap.prototype.initHoles = function() {
  var numHoles = Math.round(Math.random()*12)+1;

  for(var n=0; n<numHoles; n++) {
    //add holes to the map, but not on the leading edges where robots and human will be
    var thisX = Math.round(Math.random()*(this.mapWidth-5))+2;
    var thisY = Math.round(Math.random()*(this.mapHeight-5))+2;

    this.tiles[thisX][thisY] = -1;
  }
};

/**
 * adds a single robot to the map
 */
MainMap.prototype.addRobot = function() {
  var newPos = this.returnValidCharacterCoordinates(3, 3, 2);
  this.robots.push(new Robot(newPos['x'], newPos['y'], 2, this, 1));
};

/**
 * add a single human to the map
 */
MainMap.prototype.addHuman = function() {
  var newPos = this.returnValidCharacterCoordinates(15, 15, 2);
  this.humans.push(new Human(newPos['x'], newPos['y'], this));
};

/**
 * return an array containing coordinates that do not contain other characters and are empty
 * @param centerX the x location to start reandom placement from
 * @param centerY the y location to start random placement from
 * @param range the range +/- the centerX,centerY point to search
 * @returns {Array}
 */
MainMap.prototype.returnValidCharacterCoordinates = function(centerX, centerY, range) {
  var retVal = [];
  var isDone = false;
  var posX = -1;
  var posY = -1;

  //set the maxmin vars for the random placement
  var minX = ((centerX - range) < 0) ? 0 : (centerX - range);
  var minY = ((centerY - range) < 0) ? 0 : (centerY - range);
  minX = (minX > this.mapWidth) ? this.mapWidth : minX;
  minY = (minY > this.mapHeight) ? this.mapHeight : minY;

  var maxRange = range*2;

  do {
    posX = Math.round(Math.random()*maxRange)+minX;
    posY = Math.round(Math.random()*maxRange)+minY;

    isDone = !this.checkForObstacles(posX, posY);
  } while (!isDone);

  retVal['x'] = posX;
  retVal['y'] = posY;

  return retVal;
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
 * returns a value for the obstacle type of the passed block
 * @param x
 * @param y
 * @returns int
 */
MainMap.prototype.returnObstacleType = function(x, y) {
  if(x >= 0 && y >= 0 && x < this.mapWidth && y < this.mapHeight) {
    if(this.tiles[x][y] != 0) {
      //the obstacle is on the tile layer, return 0 to indicate that this obstacle should just be avoided
      return 0;
    } else {
      //return the overlay value, which should be the value of the block for human/robot/etc.
      return this.overlay[x][y];
    }
  }
};

/**
 * redraw the entire board
 */
MainMap.prototype.drawBoard = function() {
  var x; var y;
  for(x=0; x<this.mapWidth; x++) {
    for(y=0; y<this.mapHeight; y++) {
      this.drawTile(x, y);
      this.drawOverlay(x, y);

      //show the heat maps if applicable
      if(showRobotHeatMap) {
        this.drawRobotHeatMap(x, y);
      }
      if(showHumanHeatMap) {
        this.drawHumanHeatMap(x, y);
      }

    }
  }
};

/**
 * re-render a specific tile
 * @param x
 * @param y
 */
MainMap.prototype.redrawTile = function(x, y) {
  this.drawTile(x, y);
  this.drawOverlay(x, y);

  //show the heat maps if applicable
  if(showRobotHeatMap) {
    this.drawRobotHeatMap(x, y);
  }
  if(showHumanHeatMap) {
    this.drawHumanHeatMap(x, y);
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
    case -1:
      //a hole in the floor
      startX = 128;
      startY = 64;
      break;
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

};

/**
 * handles the rendering of the "overlay" blocks, players and the like
 * @param x
 * @param y
 */
MainMap.prototype.drawOverlay = function(x, y) {
  var startX = 0;
  var startY = 0;
  var useDefault = false;

  //now we will render the overlay blocks, such as robots etc.
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
 * render the robot heat map on the board
 * @param x
 * @param y
 */
MainMap.prototype.drawRobotHeatMap = function(x, y) {
  if(this.attractRobots[x][y] != 0) {
    //only draw a value if the attract does not equal 0

    var transVal = this.attractRobots[x][y] * .1;

    if(this.attractRobots[x][y] > 0) {
      //this is an attractive spot
      this.drawCanvas.fillStyle = "green";

      if(transVal > .9) {
        transVal = .9;
      }

    } else {
      //this is an unattractive spot
      this.drawCanvas.fillStyle = "red";

      transVal = transVal*-1;
      if(transVal > .9) {
        transVal = .9;
      }

    }

    this.drawCanvas.globalAlpha = transVal;
    this.drawCanvas.fillRect((this.tileSize*x), (this.tileSize*y), this.tileSize, this.tileSize);
    this.drawCanvas.globalAlpha = 1;

  }
};

/**
 * render the human heat map on the board
 * @param x
 * @param y
 */
MainMap.prototype.drawHumanHeatMap = function(x, y) {
  if(this.attractHumans[x][y] != 0) {
    //only draw a value if the attract does not equal 0

    var transVal = this.attractHumans[x][y] * .1;

    if(this.attractHumans[x][y] > 0) {
      //this is an attractive spot
      this.drawCanvas.fillStyle = "green";

      if(transVal > .9) {
        transVal = .9;
      }

    } else {
      //this is an unattractive spot
      this.drawCanvas.fillStyle = "red";

      transVal = transVal*-1;
      if(transVal > .9) {
        transVal = .9;
      }

    }

    this.drawCanvas.globalAlpha = transVal;
    this.drawCanvas.fillRect((this.tileSize*x), (this.tileSize*y), this.tileSize, this.tileSize);
    this.drawCanvas.globalAlpha = 1;

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
  this.redrawTile(locX, locY);
};

/**
 * kill the humanoid at x,y
 * @param x
 * @param y
 */
MainMap.prototype.destroyHumanoid = function(x, y) {
  var destroyedHuman = -1;

  for(var n=0; n<this.humans.length; n++) {
    if(this.humans[n].xLoc == x && this.humans[n].yLoc == y) {
      //destroy the humanoid at this location
      destroyedHuman = n;
    }
  }

  //remove the value from the array
  if(destroyedHuman > -1) {
    this.humans.splice(destroyedHuman, 1);
  }
};

/**
 * same as above, but kills the robot at x,y
 * @param x
 * @param y
 */
MainMap.prototype.destroyRobot = function(x, y) {
  var destroyedRobot = -1;

  for(var n=0; n<this.robots.length; n++) {
    if(this.robots[n].xLoc == x && this.robots[n].yLoc == y) {
      //destroy the robot at this location
      destroyedRobot = n;
    }
  }

  //remove the value from the array
  if(destroyedRobot > -1) {
    this.robots.splice(destroyedRobot, 1);
  }
};
