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

  //animation coordinates
  resetAnimationVariables(this);
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

  resetAnimationVariables(this);

  var newVal = returnBestMove(this, this.xLoc, this.yLoc, currentVal);
  handleMoveVars(this, newVal);

  //by setting the overlay to -2000, we prevent other robots or humans from moving into our target square
  this.mainMap.overlay[this.xLoc][this.yLoc] = -2000;
  if(this.xMove == 0 && this.yMove == 0){
    //we're not moving anywhere, just set the tile -- animations run using a full refresh of the screen and then incremental drawing of human/robot movement
    this.finalizeMove();
  } else {
    numAnimations++;
  }

};

/**
 * handle movement animation for the human
 * @param newMap
 */
Human.prototype.handleAnimation = function(newMap) {
  this.mainMap = newMap;

  this.animCount++;
  if(this.animCount < 10) {
    this.curX = this.curX + this.xMove;
    this.curY = this.curY + this.yMove;
    this.mainMap.drawCanvas.drawImage(this.mainMap.tileset, 32, 0, 32, 32, this.curX, this.curY, this.mainMap.tileSize, this.mainMap.tileSize);
  } else {
    this.finalizeMove();
    if(this.xMove != 0 || this.yMove != 0) {
      this.xMove = 0;
      this.yMove = 0;
      numAnimations--;
    }

  }

};

/**
 * finalize human movement, setting the overlay tile and redrawing it, done here since the movement animation uses a full redraw before each tick
 */
Human.prototype.finalizeMove = function() {
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