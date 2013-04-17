/**
 *
 * 3/27/13 Mojiferous
 * UI canvas handlers
 */

/**
 * constructor for the UICanvas class
 * @param uicanvas
 * @param mainFunction
 * @constructor
 */
function UICanvas(uicanvas, mainFunction) {
  //get the canvas the UI will be drawn to and its context
  this.parentCanvas = uicanvas;
  this.drawCanvas = uicanvas.getContext('2d');

  //grab our tileset
  this.tileset = document.getElementById('tileset1');

  this.ticPart = 0;
  this.ticFunction = mainFunction;

  this.renderUI();
}

/**
 * tick handler for the uicanvas class
 */
UICanvas.prototype.handleTick = function() {
  this.ticPart++;
  if(this.ticPart > 6) {
    this.ticPart = 0;
    eval(this.ticFunction);
  }

  this.renderUI();
};

/**
 * render the ui
 */
UICanvas.prototype.renderUI = function() {
  //draw the background
  this.drawCanvas.fillStyle = "black";
  //fill the canvas to black
  this.drawCanvas.fillRect(0, 0, 600, 50);

  //render the fire control
  this.drawControlImage(1, 96, 0);

  //render the water control
  this.drawControlImage(2, 128, 0);

  //render the food control
  this.drawControlImage(3, 192, 0);

  //render the wall control
  this.drawControlImage(4, 256, 0);

  //render the money control
  this.drawControlImage(5, 288, 0);

  //render the electricity control
  this.drawControlImage(6, 320, 0);

  //render the gears control
  this.drawControlImage(7, 352, 0);

  //draw the humanOverlay control
  this.drawControlImage(9, 32, 0);

  //draw the robotOverlay control
  this.drawControlImage(10, 64, 0);

};

/**
 * handle clicks within the ui
 * @param xLoc
 * @param yLoc
 */
UICanvas.prototype.handleClick = function(xLoc, yLoc) {
  if(xLoc < 400 && gameType != 3) {
    //this falls within the resource controls portion of the UI and we're not on the "luck" game

    var newActive = Math.ceil(xLoc/50);
    if(newActive == activeTool) {
      //turn the tool off if clicked again
      activeTool = 0;
    } else {
      if(gameType == 1 && resourceSupply[newActive-1] == 0) {
        newActive = 0;
      }
      activeTool = newActive;
    }

  } else if(xLoc > 400 && xLoc < 450) {
    //this is the human overlay
    showHumanHeatMap = !showHumanHeatMap;
    showRobotHeatMap = false;
    redrawBoard();

  } else if(xLoc > 450 && xLoc < 500) {
    //and this would be the robot overlay
    showRobotHeatMap = !showRobotHeatMap;
    showHumanHeatMap = false;
    redrawBoard();

  }

  this.renderUI();
};

/**
 * draw one of the control images
 * @param toolNum
 * @param xLoc
 * @param yLoc
 */
UICanvas.prototype.drawControlImage = function(toolNum, xLoc, yLoc) {
  if(toolNum < 8) {
    if(activeTool != toolNum) {
      if(gameType == 1 && resourceSupply[toolNum-1] <= 0) {
        //we're in a limited resource situation and this resource is out
        this.drawCanvas.globalAlpha = .0;
      } else {
        this.drawCanvas.drawImage(document.getElementById('button-off'),((toolNum-1)*50), 0);
        this.drawCanvas.globalAlpha = .3;
      }
    } else {
      this.drawCanvas.drawImage(document.getElementById('button-on'),((toolNum-1)*50), 0);
      this.drawCanvas.globalAlpha = .8;
    }
  } else if(toolNum == 9 && showHumanHeatMap) {
    this.drawCanvas.drawImage(document.getElementById('button-on'),((toolNum-1)*50), 0);
    this.drawCanvas.globalAlpha = .8;
  } else if(toolNum == 10 && showRobotHeatMap) {
    this.drawCanvas.drawImage(document.getElementById('button-on'),((toolNum-1)*50), 0);
    this.drawCanvas.globalAlpha = .8;
  } else {
    this.drawCanvas.drawImage(document.getElementById('button-off'),((toolNum-1)*50), 0);
    this.drawCanvas.globalAlpha = .3;
  }

  this.drawCanvas.drawImage(this.tileset, xLoc, yLoc, 32, 32, ((toolNum - 1)*50)+9, 9, 32, 32);
  this.drawCanvas.globalAlpha = 1;

  if(toolNum < 8 && gameType == 1) {
    //add the resource counts for the classic game
    this.drawCanvas.font = "10px Press Start 2p";
    this.drawCanvas.fillStyle = "black";
    this.drawCanvas.fillText(resourceSupply[toolNum-1], ((toolNum - 1)*50)+9, 41);
  }
};