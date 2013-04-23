/**
 * Helper file to handle shared functions for humans and robots
 * 4/3/13 Mojiferous
 */

//constants
var kTOTAL_GAMES = 'totalGames';
var kTOTAL_TURNS = 'totalTurns';
var kHUMANS_KILLED = 'totalHumans';
var kROBOTS_KILLED = 'totalRobots';
var kTOTAL_WINS = 'totalWins';
var kMAX_LEVEL = 'maxLevel';

var kaKILL_ALL = 'killAll';
var kaCLEAN_WIN = 'cleanWin';

/**
 * handle the various variables associated with an object movement
 * @param obj
 * @param newVal
 */
function handleMoveVars(obj, newVal) {
  if(newVal != 0) {
    switch (newVal) {
      case 1:
        //moving on up
        obj.yLoc--;
        obj.yMove = -3;
        break;
      case 2:
        //up right
        obj.xLoc++;
        obj.yLoc--;
        obj.xMove = 4;
        obj.yMove = -4;
        break;
      case 3:
        //right
        obj.xLoc++;
        obj.xMove = 3;
        break;
      case 4:
        //down right
        obj.xLoc++;
        obj.yLoc++;
        obj.xMove = 4;
        obj.yMove = 4;
        break;
      case 5:
        //down
        obj.yLoc++;
        obj.yMove = 3;
        break;
      case 6:
        //down left
        obj.yLoc++;
        obj.xLoc--;
        obj.yMove = 4;
        obj.xMove = -4;
        break;
      case 7:
        //left
        obj.xLoc--;
        obj.xMove = -3;
        break;
      case 8:
        //up left
        obj.xLoc--;
        obj.yLoc--;
        obj.xMove = -4;
        obj.yMove = -4;
        break;
    }
  }
}

/**
 * resets object animation variables
 * @param obj
 */
function resetAnimationVariables(obj) {
  obj.animCount = 0;
  obj.curX = (obj.xLoc*obj.mainMap.tileSize);
  obj.curY = (obj.yLoc*obj.mainMap.tileSize);
  obj.xMove = 0;
  obj.yMove = 0;
}

/**
 * return an object's best move
 * @param obj
 * @param x
 * @param y
 * @param zeroVal
 * @returns {number}
 */
function returnBestMove(obj, x, y, zeroVal) {
  var bestLocation = 0;

  var nZero = obj.moveLocationChecker(x, y-1, zeroVal);
  if(nZero > zeroVal) {
    zeroVal = nZero;
    bestLocation = 1;
  }

  nZero = obj.moveLocationChecker(x+1, y-1, zeroVal);
  if(nZero > zeroVal) {
    zeroVal = nZero;
    bestLocation = 2;
  }

  nZero = obj.moveLocationChecker(x+1, y, zeroVal);
  if(nZero > zeroVal) {
    zeroVal = nZero;
    bestLocation = 3;
  }

  nZero = obj.moveLocationChecker(x+1, y+1, zeroVal);
  if(nZero > zeroVal) {
    zeroVal = nZero;
    bestLocation = 4;
  }

  nZero = obj.moveLocationChecker(x, y+1, zeroVal);
  if(nZero > zeroVal) {
    zeroVal = nZero;
    bestLocation = 5;
  }

  nZero = obj.moveLocationChecker(x-1, y+1, zeroVal);
  if(nZero > zeroVal) {
    zeroVal = nZero;
    bestLocation = 6;
  }

  nZero = obj.moveLocationChecker(x-1, y, zeroVal);
  if(nZero > zeroVal) {
    zeroVal = nZero;
    bestLocation = 7;
  }

  nZero = obj.moveLocationChecker(x-1, y-1, zeroVal);
  if(nZero > zeroVal) {
    bestLocation = 8;
  }

  return bestLocation;
}

/**
 * store a value into the local storage database
 * used for achievements
 * @param key
 * @param val
 */
function storeValue(key, val) {
  if(typeof(Storage) !== 'undefined') {
    //make sure we can access local storage first
    localStorage.setItem(key, val);
  }
}

/**
 * returns a value from the local storage database
 * @param key
 * @param defaultValue
 * @returns {string}
 */
function retreiveValue(key, defaultValue) {
  var retVal = defaultValue;

  if(typeof(Storage) !== 'undefinded') {
    //make sure we can access local storage
    retVal = localStorage.getItem(key);

    if(retVal == null) {
      retVal = defaultValue;
    }
  }

  return retVal;
}

/**
 * check the local storage to see if the player has the achievement
 * @param achName
 * @returns {boolean}
 */
function hasAchievement(achName) {
  var hasAch = false;
  if(retreiveValue(achName, 'false') != 'false') {
    hasAch = true;
  }

  return hasAch;
}

/**
 * set the achievement to true
 * @param achName
 */
function getAchievement(achName) {
  storeValue(achName, 'true');
}