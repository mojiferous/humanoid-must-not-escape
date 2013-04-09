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
var resourceType = 0;
var timeType = 0;

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
      $('span').click(function(e) {
        handleSpanClick(e);
      });


      //start the timer!
      handleTick();
    }
  });


})(jQuery, this, this.document);

/**
 * all green screen navigation and option buttons are spans, handle clicks on them here
 * @param obj
 */
function handleSpanClick(obj) {
  switch (obj.currentTarget.id) {
    case 'kill-humans':
      setNewGameType(1);
      break;

    case 'kill-robots':
      setNewGameType(2);
      break;

    case 'kill-all':
      setNewGameType(3);
      break;

    case 'unlimited-resources':
      setGameOption(1);
      break;

    case 'limited-resources':
      setGameOption(2);
      break;

    case 'only-fire':
      setGameOption(3);
      break;

    case 'only-water':
      setGameOption(4);
      break;

    case 'unlimited-time':
      setGameOption(5);
      break;

    case 'one-min-time':
      setGameOption(6);
      break;

    case 'twenty-turns':
      setGameOption(7);
      break;

    case 'start-game':
      finishGameSetup();
      break;
  }

}

/**
 * keyboard handler when the game has not yet begun
 * @param keyCode
 */
function handleNewGameKey(keyCode) {
  var passedCode = 0;
  if(keyCode > 48 && keyCode < 59) {
    //set the code if a number was pressed
    passedCode = keyCode - 48;
  }
  if(keyCode > 64 && keyCode < 90) {
    //a letter was pressed, start the numbering at 10
    passedCode = keyCode-63+9;
  }

  if(setupStep == 0) {
    if(passedCode > 0 && passedCode < 4) {
      setNewGameType(passedCode);
    }
  } else {
    if (passedCode != 0) {
      setGameOption(passedCode);
    }
  }
}

/**
 * set a new game type
 * @param newGameType
 */
function setNewGameType(newGameType) {
  if(gameType == 0 && newGameType != 0) {
    gameType = newGameType;
    gCanvas.initGame();
    setupStep = 1;
    resourceType = 1;
    timeType = 1;
    $('#game-types').hide();
  }
}

/**
 * set game options from selections
 * @param optionVal
 */
function setGameOption(optionVal) {
  switch (optionVal) {
    case 1:
      if(resourceType != 1) {
        resourceType = 1;
        $('#unlimited-resources').addClass('active');
        removeActiveClassFromArray(['#limited-resources', '#only-fire', '#only-water']);
      }
      break;

    case 2:
      if(resourceType != 2) {
        resourceType = 2;
        $('#limited-resources').addClass('active');
        removeActiveClassFromArray(['#unlimited-resources', '#only-fire', '#only-water']);
      }
      break;

    case 3:
      if(resourceType != 3) {
        resourceType = 3;
        $('#only-fire').addClass('active');
        removeActiveClassFromArray(['#unlimited-resources', '#limited-resources', '#only-water']);
      }
      break;

    case 4:
      if(resourceType != 4) {
        resourceType = 4;
        $('#only-water').addClass('active');
        removeActiveClassFromArray(['#unlimited-resources', '#limited-resources', '#only-fire']);
      }
      break;

    case 5:
      if(timeType != 1) {
        timeType = 1;
        $('#unlimited-time').addClass('active');
        removeActiveClassFromArray(['#one-min-time', '#twenty-turns']);
      }
      break;

    case 6:
      if(timeType != 2) {
        timeType = 2;
        $('#one-min-time').addClass('active');
        removeActiveClassFromArray(['#unlimited-time', '#twenty-turns']);
      }
      break;

    case 7:
      if(timeType != 3) {
        timeType = 3;
        $('#twenty-turns').addClass('active');
        removeActiveClassFromArray(['#unlimited-time', '#one-min-time']);
      }
      break;

    case 11:
    //'a' button:
      finishGameSetup();
      break;
  }
}

/**
 * removes the active class from every id or class passed
 * @param vals
 */
function removeActiveClassFromArray(vals) {
  for(var n=0; n<vals.length; n++) {
    $(vals[n]).removeClass('active');
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