/**
 * defines the random humans on the board
 * 3/25/13 Mojiferous
 */

/**
 * constructor for the Human object
 * @param x
 * @param y
 * @param map
 * @constructor
 */
function Human(x, y, map) {
  this.xLoc = x;
  this.yLoc = y;
  this.mainMap = map;

  this.mainMap.overlay[x][y] = 50;
}

/**
 * handle a game tick for this human, must receive new updated map object
 * @param newMap
 */
Human.prototype.handleTick = function(newMap) {
  this.mainMap = newMap;

  this.handleMove();
};

/**
 * handle the movement of the human
 */
Human.prototype.handleMove = function() {
  //I may not be here any longer, so clear the last overlay and redraw the tile
  this.mainMap.overlay[this.xLoc][this.yLoc] = 0;
  this.mainMap.redrawTile(this.xLoc, this.yLoc);

  var currentVal = this.mainMap.returnHumanHeatMapValue(this.xLoc, this.yLoc);

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



  if(!this.mainMap.checkForHumanDeath(this.xLoc, this.yLoc)) {
    //yay! I'm still alive
    this.mainMap.overlay[this.xLoc][this.yLoc] = 50;
    this.mainMap.redrawTile(this.xLoc, this.yLoc);
  }

};

/**
 * checks the human heat map value and looks for obstacles at the passed location
 * @param x
 * @param y
 * @param zeroVal
 * @returns {*}
 */
Human.prototype.moveLocationChecker = function(x, y, zeroVal) {
  var newVal = this.mainMap.returnHumanHeatMapValue(x, y);
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
 * check all around the human and return the best possible place to move
 * @param x
 * @param y
 * @param zeroVal
 * @returns {number}
 */
Human.prototype.returnBestMove = function(x, y, zeroVal) {
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