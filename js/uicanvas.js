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
  this.buttonImages = document.getElementById('button-images');

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
  this.drawCanvas.fillRect(0, 0, 1000, 105);

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

  if(gameType == 2) {
    //add the game turn limit counter
    this.drawStatusImage('yellow', 600, 0, true, 'turn', currentTurn);
  }

};

/**
 * handle clicks within the ui
 * @param xLoc
 * @param yLoc
 */
UICanvas.prototype.handleClick = function(xLoc, yLoc) {
  if(xLoc < 400 && gameType != 3 && yLoc < 51) {
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

  } else if(xLoc > 400 && xLoc < 450 && yLoc < 51) {
    //this is the human overlay
    showHumanHeatMap = !showHumanHeatMap;
    showRobotHeatMap = false;
    redrawBoard();

  } else if(xLoc > 450 && xLoc < 500 && yLoc < 51) {
    //and this would be the robot overlay
    showRobotHeatMap = !showRobotHeatMap;
    showHumanHeatMap = false;
    redrawBoard();

  }

  this.renderUI();
};

/**
 * draw one of the control button images
 * @param toolNum
 * @param xLoc
 * @param yLoc
 */
UICanvas.prototype.drawControlImage = function(toolNum, xLoc, yLoc) {
  this.drawCanvas.fillStyle = "#000000";

  if(toolNum < 8) {
    if(activeTool != toolNum) {
      if(gameType == 1 && resourceSupply[toolNum-1] <= 0) {
        //we're in a limited resource situation and this resource is out
        this.drawCanvas.globalAlpha = .0;
      } else {
        this.drawButtonImage('white', ((toolNum-1)*50), 0, false);
        this.drawCanvas.fillStyle = "#222222";
        this.drawCanvas.globalAlpha = .2;
      }
    } else {
      this.drawButtonImage('white', ((toolNum-1)*50), 0, true);
      this.drawCanvas.globalAlpha = .8;
    }
  } else if(toolNum == 9 && showHumanHeatMap) {
    this.drawButtonImage('white', ((toolNum-1)*50), 0, true);
    this.drawCanvas.globalAlpha = .8;
  } else if(toolNum == 10 && showRobotHeatMap) {
    this.drawButtonImage('white', ((toolNum-1)*50), 0, true);
    this.drawCanvas.globalAlpha = .8;
  } else {
    this.drawButtonImage('white', ((toolNum-1)*50), 0, false);
    this.drawCanvas.globalAlpha = .2;
  }

  this.drawCanvas.drawImage(this.tileset, xLoc, yLoc, 32, 32, ((toolNum - 1)*50)+9, 9, 32, 32);
  this.drawCanvas.globalAlpha = 1;

  if(toolNum < 8 && gameType == 1) {
    //add the resource counts for the classic game
    this.drawCanvas.font = "10px 'Press Start 2p'";

    this.drawCanvas.fillText(resourceSupply[toolNum-1], ((toolNum - 1)*50)+9, 41);
  }
};

/**
 * render a non-control button
 * @param buttonType
 * @param xLoc
 * @param yLoc
 * @param isOn
 * @param firstLine
 * @param secondLine
 */
UICanvas.prototype.drawStatusImage = function(buttonType, xLoc, yLoc, isOn, firstLine, secondLine) {
  this.drawButtonImage(buttonType, xLoc, yLoc, isOn);
  if(!isOn) {
    this.drawCanvas.fillStyle = "#333333";
    this.drawCanvas.globalAlpha = .2;
  } else {
    this.drawCanvas.fillStyle = "#000000";
    this.drawCanvas.globalAlpha = .8;
  }

  this.drawCanvas.font = "10px 'Press Start 2p'";
  var leftVal = this.drawCanvas.measureText(firstLine).width;
  leftVal = (50 - leftVal)/2;
  this.drawCanvas.fillText(firstLine, xLoc+leftVal, yLoc+15);

  this.drawCanvas.font = "14px 'Press Start 2p'";
  leftVal = this.drawCanvas.measureText(secondLine).width;
  leftVal = (50 - leftVal)/2;
  this.drawCanvas.fillText(secondLine, xLoc+leftVal, yLoc+35);

  this.drawCanvas.globalAlpha = 1;
};

/**
 * draws a button image of buttonType, isOn, at xLoc yLoc
 * @param buttonType
 * @param xLoc
 * @param yLoc
 * @param isOn
 */
UICanvas.prototype.drawButtonImage = function(buttonType, xLoc, yLoc, isOn) {
  var xCopyLoc = 0;
  if(isOn) {
    xCopyLoc = 200;
  }

  switch (buttonType) {
    case 'white':
      this.drawCanvas.drawImage(this.buttonImages, xCopyLoc+100, 0, 50, 50, xLoc, yLoc, 50, 50);
      break;
    case 'yellow':
      this.drawCanvas.drawImage(this.buttonImages, xCopyLoc+150, 0, 50, 50, xLoc, yLoc, 50, 50);
      break;
    case 'green':
      this.drawCanvas.drawImage(this.buttonImages, xCopyLoc, 0, 50, 50, xLoc, yLoc, 50, 50);
      break;
    case 'red':
      this.drawCanvas.drawImage(this.buttonImages, xCopyLoc+50, 0, 50, 50, xLoc, yLoc, 50, 50);
      break;
  }
};