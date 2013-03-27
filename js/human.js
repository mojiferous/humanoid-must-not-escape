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

