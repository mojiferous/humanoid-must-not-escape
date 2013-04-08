/**
 *
 * 3/5/13 Mojiferous
 *
 * jquery controls for the main app
 */

//these vars are for the main game canvas
var gCanvas;
var mainCanvas;

//these vars are for the lower, user interface canvas
var uiCanvas;
var gUICanvas;

//these are global variables that set the dimensions of the game board
var gTileSize = 32;
var gTotalWidth = 18;
var gTotalHeight = 18;

//this determines the current human/robot animations, preventing the UI firing while moves are animated
var numAnimations = 0;
//this determines the current background y position of the scanline
var scanTop = 0;

//the following variables affect gameplay

//these booleans will show or hide the heat maps
var showRobotHeatMap = false;
var showHumanHeatMap = false;
//this is the current active tool
var activeTool = 0;
//this determines which game type you are playing and whether the game should be running right now
var gameInPlay = false;
var setupStep = 0;
var gameType = 0;
var unlimitedResources = true;

//generic global timeout variable
var t;

(function ($, window, document, undefined) {

  $(window).load(function() {

    mainCanvas = document.getElementById('board-canvas');
    uiCanvas = document.getElementById('ui-canvas');

    if (mainCanvas.getContext) {
      if(!uiCanvas.getContext) {
        //we can't get the context of the ui canvas, should we do something here?
      } else {
        //we've got the context of the UI canvas, init it here
        gUICanvas = new UICanvas(uiCanvas, 'gCanvas.handleTick()');
      }

      gCanvas = new MainMap(mainCanvas, gTileSize, gTotalWidth, gTotalHeight);

      //handle clicks on the board
      $('#board-canvas').click(function(e) {
        if(numAnimations == 0 && gameInPlay) {
          gCanvas.handleClick(e.offsetX, e.offsetY, activeTool);
        }
      });
      //handle clicks on the UI
      $('#ui-canvas').click(function(e) {
        if(gameInPlay) {
          gUICanvas.handleClick(e.offsetX, (e.offsetY));
        }
      });

      $(window).keydown(function(event) {
        if(!gameInPlay) {
          //handle keyboard entry when the game is not running
          handleNewGameKey(event.keyCode);
        }

      });

      /**
       * click handlers for configuration controls
       */
      $('#kill-humans').click(function() {
        setNewGameType(1);
      });
      $('#kill-robots').click(function() {
        setNewGameType(2);
      });
      $('#kill-all').click(function() {
        setNewGameType(3);
      });


      //start the timer!
      handleTick();
    }
  });


})(jQuery, this, this.document);

/**
 * keyboard handler when the game has not yet begun
 * @param keyCode
 */
function handleNewGameKey(keyCode) {
  switch (keyCode) {
    case 49:
      //the 1 key
      if(setupStep == 0) {
        setNewGameType(1);
      } else {
        if(!unlimitedResources) {
          unlimitedResources = true;
          $('#unlimited-resources').addClass('active');
          $('#limited-resources').removeClass('active');
        }
      }
      break;

    case 50:
      //the 2 key
      if(setupStep == 0) {
        setNewGameType(2);
      } else {
        if(unlimitedResources) {
          unlimitedResources = false;
          $('#unlimited-resources').removeClass('active');
          $('#limited-resources').addClass('active');
        }
      }
      break;

    case 51:
      //the 3 key
      if(setupStep == 0) {
        setNewGameType(3);
      }
      break;
  }
}

/**
 * set a new game type
 * @param newGameType
 */
function setNewGameType(newGameType) {
  if(gameType == 0) {
    gameType = newGameType;
    gCanvas.initGame();
    setupStep = 1;
    $('#game-types').hide();
  }
}

/**
 * finish up the setup of the game, hide the controls and let the game begin
 */
function finishGameSetup() {
  $('#controls').hide();
  gameInPlay = true;
}

/**
 * game tick handler
 */
function handleTick() {
  if(numAnimations > 0) {
    gCanvas.handleAnimation();
  }

  //move the crt scanline every tick
  scanTop = scanTop-5;

  if(scanTop < -64) {
    scanTop = 690;
  }
  $('#scan').css('background-position', '0px '+scanTop+'px');
  t = setTimeout('handleTick()', 50);
}

/**
 * helper function to redraw the board from within other classes
 */
function redrawBoard() {
  gCanvas.drawBoard();
}