/**
 * handles the robot class
 * 3/25/13 Mojiferous
 *
 * robot types:
 * 1: turns right
 * 2: turns left
 * 3: random turns, unpleasant and unstable
 */

/**
 * robot class constructor
 * @param x the x location of the robot
 * @param y the y location of the robot
 * @param dir direction the robot is facing
 * @param map the mainMap object
 * @param type the type of robot this is
 * @constructor
 */
function Robot(x, y, dir, map, type) {
  this.xLoc = x;
  this.yLoc = y;
  this.mainMap = map;

  //set the robot type
  this.type = type;
  //set the main map overlay square
  this.mainMap.overlay[x][y] = this.type;

  this.direction = dir;
}

/**
 * handle a game tick for this robot, must receive new updated map object
 * @param newMap
 */
Robot.prototype.handleTick = function(newMap) {
  this.mainMap = newMap;

  this.handleMove();
};

/**
 * handle the movement of the robot
 */
Robot.prototype.handleMove = function() {
  //I may not be here any longer, so clear the last overlay and redraw the tile
  this.mainMap.overlay[this.xLoc][this.yLoc] = 0;
  this.mainMap.redrawTile(this.xLoc, this.yLoc);

  var currentVal = this.mainMap.returnRobotHeatMapValue(this.xLoc, this.yLoc);

  var newVal = this.returnBestMove(this.xLoc, this.yLoc, currentVal);
  if(newVal != 0) {
    switch (newVal) {
      case 1:
        //moving on up
        this.yLoc--;
        break;
      case 2:
        //up right
        this.xLoc++;
        this.yLoc--;
        break;
      case 3:
        //right
        this.xLoc++;
        break;
      case 4:
        //down right
        this.xLoc++;
        this.yLoc++;
        break;
      case 5:
        //down
        this.yLoc++;
        break;
      case 6:
        //down left
        this.yLoc++;
        this.xLoc--;
        break;
      case 7:
        //left
        this.xLoc--;
        break;
      case 8:
        //up left
        this.xLoc--;
        this.yLoc--;
        break;
    }
  }



  if(!this.mainMap.checkForRobotDeath(this.xLoc, this.yLoc)) {
    //yay! I'm still alive
    this.mainMap.overlay[this.xLoc][this.yLoc] = this.type;
    this.mainMap.redrawTile(this.xLoc, this.yLoc);
  }

};

/**
 * checks the robot heat map value and looks for obstacles at the passed location
 * @param x
 * @param y
 * @param zeroVal
 * @returns {*}
 */
Robot.prototype.moveLocationChecker = function(x, y, zeroVal) {
  var newVal = this.mainMap.returnRobotHeatMapValue(x, y);
  if(newVal > zeroVal) {
    if(this.mainMap.checkForMovementObstacles(x, y)) {
      //there is no obstacle here
      return newVal;
    } else {
      //avoid any obstacles, whether on the overlay or not
      return -1000;
    }

  }

  return zeroVal;
};

/**
 * check all around the robot and return the best possible place to move
 * @param x
 * @param y
 * @param zeroVal
 * @returns {number}
 */
Robot.prototype.returnBestMove = function(x, y, zeroVal) {
  var bestLocation = 0;

  var nZero = this.moveLocationChecker(x, y-1, zeroVal);
  if(nZero > zeroVal) {
    zeroVal = nZero;
    bestLocation = 1;
  }

  nZero = this.moveLocationChecker(x+1, y-1, zeroVal);
  if(nZero > zeroVal) {
    zeroVal = nZero;
    bestLocation = 2;
  }

  nZero = this.moveLocationChecker(x+1, y, zeroVal);
  if(nZero > zeroVal) {
    zeroVal = nZero;
    bestLocation = 3;
  }

  nZero = this.moveLocationChecker(x+1, y+1, zeroVal);
  if(nZero > zeroVal) {
    zeroVal = nZero;
    bestLocation = 4;
  }

  nZero = this.moveLocationChecker(x, y+1, zeroVal);
  if(nZero > zeroVal) {
    zeroVal = nZero;
    bestLocation = 5;
  }

  nZero = this.moveLocationChecker(x-1, y+1, zeroVal);
  if(nZero > zeroVal) {
    zeroVal = nZero;
    bestLocation = 6;
  }

  nZero = this.moveLocationChecker(x-1, y, zeroVal);
  if(nZero > zeroVal) {
    zeroVal = nZero;
    bestLocation = 7;
  }

  nZero = this.moveLocationChecker(x-1, y-1, zeroVal);
  if(nZero > zeroVal) {
    bestLocation = 8;
  }

  return bestLocation;
};