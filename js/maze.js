/**
 *
 * 3/13/13 Mojiferous
 */

var DEFAULT_MAX_BRANCHES = 5;
var DEFAULT_MIN_BRANCHES = 5;

/**
 * constructor for the Maze class
 * @param x
 * @param y
 * @param map
 * @constructor
 */
function Maze(x, y, map) {
  this.xLoc = x;
  this.yLoc = y;
  this.map = map;

  this.goalX = 0;
  this.goalY = 0;
  this.branchDir = 0;

  this.maxBranches = this.setMaxBranches();
  for(var n=0; n<this.maxBranches; n++) {
    //set our goal
    this.setNextGoal();
    //set the first direction of movement
    this.setNextDirection();
    this.handleBranch();
    this.setNextDirection();
    this.handleBranch();
    this.buildRoom();
  }
}

/**
 * sets the number of max branches (hallways) the maze can have
 * @returns {number}
 */
Maze.prototype.setMaxBranches = function() {
  return Math.round(Math.random()*DEFAULT_MAX_BRANCHES+DEFAULT_MIN_BRANCHES);
};

/**
 * sets a new goal for the hallway
 */
Maze.prototype.setNextGoal = function() {
  var isDone = false;

  while(!isDone) {
    //loop until we find a reliable goal
    var tempX = Math.round(Math.random()*(this.map.mapWidth-4))+2;
    var tempY = Math.round(Math.random()*(this.map.mapHeight-4))+2;

    if(this.map.checkTile(tempX, tempY, 1)) {
      //is the tile a 1?
      this.goalX = tempX;
      this.goalY = tempY;

      isDone = true;
    }
  }
};

Maze.prototype.buildRoom = function() {
  var roomWidth = Math.round(Math.random()*1)+1;

  for(var x=this.xLoc-roomWidth; x<this.xLoc+(roomWidth+1); x++) {
    for(var y=this.yLoc-roomWidth; y<this.yLoc+(roomWidth+1); y++) {
      if(x >= 0 && y >= 0 && x < this.map.mapWidth && y < this.map.mapHeight) {
        this.map.tiles[x][y] = 2;
      }
    }
  }
};

/**
 * handles rendering of the hallway
 */
Maze.prototype.handleBranch = function() {
  var isDone = false;

  while(!isDone) {
    if(this.map.tiles[this.xLoc][this.yLoc] == 1) {
      this.map.tiles[this.xLoc][this.yLoc] = 0;
    }

    switch(this.branchDir) {
      case 0:
        //no direction
        isDone = true;
        break;
      case 1:
        //going up
        this.yLoc = this.yLoc - 1;
        if(this.yLoc == this.goalY) {
          isDone = true;
        }
        break;
      case 2:
        //going right
        this.xLoc = this.xLoc + 1;
        if(this.xLoc == this.goalX) {
          isDone = true;
        }
        break;
      case 3:
        //going down
        this.yLoc = this.yLoc + 1;
        if(this.yLoc == this.goalY) {
          isDone = true;
        }
        break;
      case 4:
        //going left
        this.xLoc = this.xLoc - 1;
        if(this.xLoc == this.goalX) {
          isDone = true;
        }
        break;
    }
  }
};

/**
 * sets the next direction the hallway will proceed
 */
Maze.prototype.setNextDirection = function() {
  var newDir = 0;
  var randVal = Math.round(Math.random()*100);

  if(this.xLoc == this.goalX) {
    //the x is equal to the goal
    if(this.yLoc < this.goalY) {
      newDir = 3;
    } else {
      newDir = 1;
    }
  }
  if(this.yLoc == this.goalY) {
    //the y is equal to the goal
    if(this.xLoc < this.goalX) {
      newDir = 2;
    } else {
      newDir = 4;
    }
  }

  if(newDir == 0) {
    if(this.xLoc < this.goalX) {
      //the x is less than the goal
      if(this.yLoc < this.goalY) {
        //the y location is less than the goal
        if(this.branchDir == 4) {
          newDir = 2;
        }
        if(this.branchDir == 1) {
          newDir = 3;
        }

        if(newDir == 0) {
          if(randVal > 50) {
            newDir = 2;
          } else {
            newDir = 3;
          }
        }

      } else {
        //the y location is greater than the goal

        if(this.branchDir == 4) {
          newDir = 2;
        }
        if(this.branchDir == 3) {
          newDir = 1;
        }

        if(newDir == 0) {
          if(randVal > 50) {
            newDir = 2;
          } else {
            newDir = 1;
          }
        }

      }
    } else {
      //the x is greater than the goal
      if(this.yLoc < this.goalY) {
        //the y location is less than the goal

        if(this.branchDir == 2) {
          newDir = 4;
        }
        if(this.branchDir == 1) {
          newDir = 3;
        }

        if(newDir == 0) {
          if(randVal > 50) {
            newDir = 4;
          } else {
            newDir = 3;
          }
        }

      } else {
        //the y location is greater than the goal

        if(this.branchDir == 2) {
          newDir = 4;
        }
        if(this.branchDir == 3) {
          newDir = 1;
        }

        if(newDir == 0) {
          if(randVal > 50) {
            newDir = 4;
          } else {
            newDir = 1;
          }
        }

      }
    }
  }

  if(this.xLoc == this.goalX && this.yLoc == this.goalY) {
    newDir = 0;
  }

  this.branchDir = newDir;
};