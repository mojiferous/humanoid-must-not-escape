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
  //I'm not here any longer (or at least I shouldn't be), so clear the last overlay and redraw the tile
  this.mainMap.overlay[this.xLoc][this.yLoc] = 0;
  this.mainMap.redrawTile(this.xLoc, this.yLoc);

  switch (this.direction) {
    case 1:
      //moving up
      if(!this.mainMap.checkForObstacles(this.xLoc, (this.yLoc-1))) {
        //there is nothing above me, move up there
        this.yLoc = this.yLoc - 1;
      } else {
        if(this.mainMap.returnObstacleType(this.xLoc, (this.yLoc-1)) > 49) {
          //the value 50 or more indicates a human. move into it and destroy it!
          this.yLoc = this.yLoc - 1;
          this.mainMap.destroyHumanoid(this.xLoc, this.yLoc);
        } else {
          //otherwise, turn!
          this.handleTurn();
        }

      }
      break;

    case 2:
      //moving right
      if(!this.mainMap.checkForObstacles((this.xLoc+1), this.yLoc)) {
        //there is nothing to my right, move over there
        this.xLoc = this.xLoc + 1;
      } else {
        if(this.mainMap.returnObstacleType((this.xLoc+1), this.yLoc) > 49) {
          //the value 50 or more indicates a human. move into it and destroy it!
          this.xLoc = this.xLoc + 1;
          this.mainMap.destroyHumanoid(this.xLoc, this.yLoc);
        } else {
          //otherwise, turn!
          this.handleTurn();
        }
      }
      break;

    case 3:
      //moving down
      if(!this.mainMap.checkForObstacles(this.xLoc, (this.yLoc+1))) {
        //there is nothing below me, move down there
        this.yLoc = this.yLoc + 1;
      } else {
        if(this.mainMap.returnObstacleType(this.xLoc, (this.yLoc+1)) > 49) {
          //the value 50 or more indicates a human. move into it and destroy it!
          this.yLoc = this.yLoc + 1;
          this.mainMap.destroyHumanoid(this.xLoc, this.yLoc);
        } else {
          //otherwise, turn!
          this.handleTurn();
        }
      }
      break;

    case 4:
      //moving left
      if(!this.mainMap.checkForObstacles((this.xLoc-1), this.yLoc)) {
        //there is nothing to my left, move over there
        this.xLoc = this.xLoc - 1;
      } else {
        if(this.mainMap.returnObstacleType((this.xLoc-1), this.yLoc) > 49) {
          //the value 50 or more indicates a human. move into it and destroy it!
          this.xLoc = this.xLoc - 1;
          this.mainMap.destroyHumanoid(this.xLoc, this.yLoc);
        } else {
          //otherwise, turn!
          this.handleTurn();
        }
      }
      break;
  }

  this.mainMap.overlay[this.xLoc][this.yLoc] = this.type;
  this.mainMap.redrawTile(this.xLoc, this.yLoc);
};

/**
 * handle robot turns
 */
Robot.prototype.handleTurn = function() {
  switch (this.type) {
    case 1:
      //right turning robot
      this.direction++;
      break;
    case 2:
      //left turning robot
      this.direction--;
      break;
    case 3:
      //this is a random turning robot
      this.direction = Math.round((Math.random()*3)+1);
      break;
  }

  if(this.direction > 4) {
    this.direction = 1;
  }
  if(this.direction < 1) {
    this.direction = 4;
  }
};