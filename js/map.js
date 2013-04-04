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

  for(var n=0; n<4; n++) {
    this.addRobot();
    this.addHuman();
  }


  this.drawBoard();
}

/**
 * handle a game tick
 */
MainMap.prototype.handleTick = function() {
  numAnimations = 0;

  for(var n=0; n<this.robots.length; n++) {
    //move the robots
    this.robots[n].handleTick(this);
  }
  for(n=0; n<this.humans.length; n++) {
    //move the humans
    this.humans[n].handleTick(this);
  }

  //redraw the heatmaps at the end of the movement turns
  this.remapHeatMaps();
};

/**
 * handle animations at the end of a turn
 */
MainMap.prototype.handleAnimation = function() {
  this.drawBoard();
  for(var n=0; n<this.robots.length; n++) {
    //move the robots
    this.robots[n].handleAnimation(this);
  }
  for(n=0; n<this.humans.length; n++) {
    //move the humans
    this.humans[n].handleAnimation(this);
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

      //everything is tiles
      this.tiles[x][y] = 0;
      //a zero value on the overlay indicates a whole lot of nothing
      this.overlay[x][y] = 0;

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
  var newPos = this.returnValidCharacterCoordinates(9, 9, 8);
  this.robots.push(new Robot(newPos['x'], newPos['y'], this));
};

/**
 * add a single human to the map
 */
MainMap.prototype.addHuman = function() {
  var newPos = this.returnValidCharacterCoordinates(9, 9, 8);
  this.humans.push(new Human(newPos['x'], newPos['y'], this));
};

/**
 * return an array containing coordinates that do not contain other characters and are empty
 * @param centerX the x location to start random placement from
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
    } else {
      //if we're passing -100, we're just checking boundaries
      if(checkVal == -100) {
        return true;
      }
    }
  }

  return false;
};

/**
 * helper function to return a robot heatmap value
 * @param x
 * @param y
 * @returns {*}
 */
MainMap.prototype.returnRobotHeatMapValue = function(x, y) {
  if(x >= 0 && y >= 0 && x < this.mapWidth && y < this.mapHeight) {
    return this.attractRobots[x][y];
  }

  return -100;
};

/**
 * helper function to return a human heatmap value
 * @param x
 * @param y
 * @returns {*}
 */
MainMap.prototype.returnHumanHeatMapValue = function(x, y) {
  if(x >= 0 && y >= 0 && x < this.mapWidth && y < this.mapHeight) {
    return this.attractHumans[x][y];
  }

  return -100;
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
      return this.overlay[x][y] > 0;
    }
  }

  return true;
};

/**
 * returns true if there is no obstacle to movement on the tile, which includes overlay items that are not other people or robots
 * @param x
 * @param y
 * @returns {boolean}
 */
MainMap.prototype.checkForMovementObstacles = function(x, y) {
  if(x >= 0 && y >= 0 && x < this.mapWidth && y < this.mapHeight) {
    if(this.tiles[x][y] > 0) {
      //this is not a free tile, which means that this tile must be a block of some sort
      return false;
    } else {
      if(this.overlay[x][y] > 0 && this.overlay[x][y] < 100) {
        //this is a human or robot
        return false;
      } else if(this.overlay[x][y] == -2000) {
        //this is a temporary marker so multiple humans or robots don't move to the same square
        return false;
      }

      //only return true if the tile is something we can step on, either intentionally or accidentally
      return true;
    }
  }

  return false;
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

  return -1;
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
  //draw the background
  this.drawCanvas.drawImage(this.tileset, 0, 0, 32, 32, (this.tileSize*x), (this.tileSize*y), this.tileSize, this.tileSize);

  var startX = 0;
  var startY = 0;
  var useDefault = true;

  //figure out what tile is at this location and render its contents
  switch (this.tiles[x][y]) {
    case -1:
      //a hole in the floor
      startX = 160;
      break;
    case 0:
      //block tiles
      useDefault = false;
      break;
    case 1:
      //walls
      startX = 256;
      break;
    case 2:
      //unbreakable blocks
      startX = 256;
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
  var useDefault = true;

  //now we will render the overlay blocks, such as robots etc.
  switch (this.overlay[x][y]) {
    case 1:
      //robot
      startX = 64;
      break;

    case 50:
      //a human
      startX = 32;
      break;

    case -1:
      //a skull
      startX = 224;
      break;

    case 101:
      //fire
      startX = 96;
      break;
    case 102:
      //water
      startX = 128;
      break;
    case 103:
      //food
      startX = 192;
      break;
    case 105:
      //gold
      startX = 288;
      break;
    case 106:
      //electricity
      startX = 320;
      break;
    case 107:
      //gears
      startX = 352;
      break;

    default:
      useDefault = false;
      break;
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
 * returns a boolean value if the value is a valid change value for the tile
 * @param locX
 * @param locY
 * @param value
 * @returns {boolean}
 */
MainMap.prototype.canChangeTile = function(locX, locY, value) {
  var retVal = false;

  if(this.checkForObstacles(locX, locY)) {

    //there is something here, possibly a block or an overlay -- check below
    if(this.tiles[locX][locY] == 0) {
      //this is not a hole, a block, or something else placed by the computer and can't be changed by a click
      switch (this.returnObstacleType(locX, locY)) {
        case 101:
          //fire
          if(value == 2 || value == 4) {
            //water and walls can be placed on fire
            retVal = true;
          }
          break;
        case 102:
          //water
          if(value == 4) {
            //walls may be placed on fire
            retVal = true;
          }
          break;
        case 103:
          //food
          break;
        case 105:
          //gold
          break;
        case 106:
          //electricity
          break;
        case 107:
          //gears
          break;

      }

    }

  } else {
    //there is nothing here!
    retVal = true;

  }

  return retVal;
};

/**
 * check and change a tile if there is a value passed
 * @param locX
 * @param locY
 * @param value
 */
MainMap.prototype.checkTileforChange = function(locX, locY, value) {
  if(this.checkTile(locX, locY, -100)) {
    //make sure this tile is in bounds first

    if(this.canChangeTile(locX, locY, value)) {
      if(value == 4) {
        //this is a wall
        this.tiles[locX][locY] = 1;
        //make sure the overlay is cleared
        this.overlay[locX][locY] = 0;
      } else {
        this.overlay[locX][locY] = value+100;
      }

      this.remapHeatMaps();
      this.handleTick();
    }

  }
};

/**
 * handle tile clicks on the map
 * @param rawX
 * @param rawY
 * @param value
 */
MainMap.prototype.handleClick = function(rawX, rawY, value) {
  var locX = Math.floor(rawX/this.tileSize);
  var locY = Math.floor(rawY/this.tileSize);

  if(value > 0 && value < 8) {
    //this is a block type
    this.checkTileforChange(locX, locY, value);
  }


  this.redrawTile(locX, locY);
};

/**
 * remaps all the heatmaps
 */
MainMap.prototype.remapHeatMaps = function() {
  for(var x=0; x<this.mapWidth; x++) {
    for(var y=0; y<this.mapHeight; y++) {
      //first, clear out the current heatmap
      this.attractHumans[x][y] = 0;
      this.attractRobots[x][y] = 0;
    }
  }

  for(x=0; x<this.mapWidth; x++) {
    for(y=0; y<this.mapHeight; y++) {
      switch (this.overlay[x][y]) {
        case 101:
          //fire
          this.heatMapChanger(x, y, -4, -4);
          break;
        case 102:
          //water
          this.heatMapChanger(x, y, 4, -4);
          break;
        case 103:
          //food
          this.heatMapChanger(x, y, 4, 0);
          break;
        case 105:
          //gold
          this.heatMapChanger(x, y, 4, 4);
          break;
        case 106:
          //electricity
          this.heatMapChanger(x, y, -4, 4);
          break;
        case 107:
          //gears
          this.heatMapChanger(x, y, 0, 4);
          break;
      }

    }
  }

  //redraw the entire board after re-mapping the heatmaps
  this.drawBoard();
};

/**
 * change the heatmap values in a cross shape outwards from the target
 * @param x
 * @param y
 * @param humanValue
 * @param robotValue
 */
MainMap.prototype.heatMapChanger = function(x, y, humanValue, robotValue) {
  this.changeHumanHeatMapValue(x, y, humanValue);
  humanValue = humanValue/2;
  this.changeHumanHeatMapValue(x-1, y, humanValue);
  this.changeHumanHeatMapValue(x, y-1, humanValue);
  this.changeHumanHeatMapValue(x+1, y, humanValue);
  this.changeHumanHeatMapValue(x, y+1, humanValue);
  humanValue = humanValue/2;
  this.changeHumanHeatMapValue(x-2, y, humanValue);
  this.changeHumanHeatMapValue(x-1,y-1, humanValue);
  this.changeHumanHeatMapValue(x, y-2, humanValue);
  this.changeHumanHeatMapValue(x+1, y-1, humanValue);
  this.changeHumanHeatMapValue(x+2, y, humanValue);
  this.changeHumanHeatMapValue(x+1, y+1, humanValue);
  this.changeHumanHeatMapValue(x, y+2, humanValue);
  this.changeHumanHeatMapValue(x-1, y+1, humanValue);

  this.changeRobotHeatMapValue(x, y, robotValue);
  robotValue = robotValue/2;
  this.changeRobotHeatMapValue(x-1, y, robotValue);
  this.changeRobotHeatMapValue(x, y-1, robotValue);
  this.changeRobotHeatMapValue(x+1, y, robotValue);
  this.changeRobotHeatMapValue(x, y+1, robotValue);
  robotValue = robotValue/2;
  this.changeRobotHeatMapValue(x-2, y, robotValue);
  this.changeRobotHeatMapValue(x-1,y-1, robotValue);
  this.changeRobotHeatMapValue(x, y-2, robotValue);
  this.changeRobotHeatMapValue(x+1, y-1, robotValue);
  this.changeRobotHeatMapValue(x+2, y, robotValue);
  this.changeRobotHeatMapValue(x+1, y+1, robotValue);
  this.changeRobotHeatMapValue(x, y+2, robotValue);
  this.changeRobotHeatMapValue(x-1, y+1, robotValue);

};

/**
 * change the human heat map value
 * @param x
 * @param y
 * @param value
 */
MainMap.prototype.changeHumanHeatMapValue = function(x, y, value) {
  if(x >= 0 && x < this.mapWidth && y >= 0 && y < this.mapHeight) {
    this.attractHumans[x][y] += value;
  }
};

/**
 * change the robot heat map value
 * @param x
 * @param y
 * @param value
 */
MainMap.prototype.changeRobotHeatMapValue = function(x, y, value) {
  if(x >= 0 && x < this.mapWidth && y >= 0 && y < this.mapHeight) {
    this.attractRobots[x][y] += value;
  }
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

  //add the skull
  this.overlay[x][y] = -1;
  this.redrawTile(x, y);
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

  //add the skull
  this.overlay[x][y] = -1;
  this.redrawTile(x, y);
};

/**
 * kill our friendly robot if they have stepped on something bad
 * @param x
 * @param y
 * @return {boolean}
 */
MainMap.prototype.checkForRobotDeath = function(x, y) {
  var isDead = false;

  if(this.checkForObstacles(x, y)) {
    var obsType = this.returnObstacleType(x, y);
    if(obsType > 100) {
      //there is a legit obstacle here
      switch (obsType) {
        case 101:
          //fire. kill
          this.destroyRobot(x, y);
          isDead = true;
          break;
        case 102:
          //water. kill
          this.destroyRobot(x, y);
          isDead = true;
          break;
        case 103:
          //food. meh
          break;
        case 105:
          //gold, meh
          break;
        case 106:
          //electricity. yes.
          break;
        case 107:
          //gears. meh
          break;
      }

    } else if(obsType == 0) {
      //is this a hole?
      if(this.tiles[x][y] == -1) {
        //yep. kill the robot
        this.destroyRobot(x, y);
        isDead = true;
      }

    }
  }

  return isDead;

};

/**
 * same as above, just with people
 * @param x
 * @param y
 * @returns {boolean}
 */
MainMap.prototype.checkForHumanDeath = function(x, y) {
  var isDead = false;

  if(this.checkForObstacles(x, y)) {
    var obsType = this.returnObstacleType(x, y);
    if(obsType > 100) {
      //there is a legit obstacle here
      switch (obsType) {
        case 101:
          //fire. kill
          this.destroyHumanoid(x, y);
          isDead = true;
          break;
        case 102:
          //water. meh
          break;
        case 103:
          //food. meh
          break;
        case 105:
          //gold, meh
          break;
        case 106:
          //electricity. kill!
          this.destroyHumanoid(x, y);
          isDead = true;
          break;
        case 107:
          //gears. meh
          break;
      }

    } else if(obsType == 0) {
      //is this a hole?
      if(this.tiles[x][y] == -1) {
        //yep. kill the human
        this.destroyHumanoid(x, y);
        isDead = true;
      }

    }
  }

  return isDead;
};