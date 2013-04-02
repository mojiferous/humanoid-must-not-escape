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
  this.tileset = document.getElementById('tileset2');

  this.ticPart = 0;
  this.fullTic = 0;
  this.ticFunction = mainFunction;

  this.renderUI();
}

/**
 * tick handler for the uicanvas class, also calls the graphics canvas tick handler
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
  if(xLoc < 224) {
    //this falls within the controls portion of the UI

    var newActive = Math.ceil(xLoc/32);
    if(newActive == activeTool) {
      //turn the tool off if clicked again
      activeTool = 0;
    } else {
      activeTool = newActive;
    }

  } else if(xLoc > 256 && xLoc < 288) {
    //this is the human overlay
    showHumanHeatMap = !showHumanHeatMap;
    showRobotHeatMap = false;
    redrawBoard();

  } else if(xLoc > 288 && xLoc < 320) {
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
      this.drawCanvas.globalAlpha = .5;
    } else {
      this.drawCanvas.globalAlpha = .8;
    }
  } else if(toolNum == 9 && showHumanHeatMap) {
    this.drawCanvas.globalAlpha = .8;
  } else if(toolNum == 10 && showRobotHeatMap) {
    this.drawCanvas.globalAlpha = .8;
  } else {
    this.drawCanvas.globalAlpha = .5;
  }

  this.drawCanvas.drawImage(this.tileset, xLoc, yLoc, 32, 32, ((toolNum - 1)*32), 0, 32, 32);
  this.drawCanvas.globalAlpha = 1;
};