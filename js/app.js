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
var scanTop = [0, 500];

//the following variables affect gameplay

//these booleans will show or hide the heat maps
var showRobotHeatMap = false;
var showHumanHeatMap = false;
//this is the current active tool
var activeTool = 0;
//this determines which game type you are playing and whether the game should be running right now
var gameInPlay = false;
var gameType = 0;
var resourceSupply = [];
var currentTurn = 0;
var currentLevel = 0;

//number of humans and robots in the level
var numHumans = 4;
var numRobots = 4;

//generic global timeout variable
var t;

(function ($, window, document) {

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
          //make sure we aren't animating and that the game is actually playing

          //iterate the turn
          currentTurn++;

          //handle the turn
          gCanvas.handleClick((e.offsetX || e.clientX - $(e.target).offset().left), (e.offsetY || e.clientY - $(e.target).offset().top), activeTool);

          switch (gameType) {
            case 1:
              //this is a limited resource game, reduce the resource supply
              resourceSupply[activeTool-1]--;
              if(resourceSupply[activeTool-1] == 0) {
                //deactivate this tool if we reach the end
                activeTool = 0;
              }
              break;

            case 2:
              break;

            case 3:
              //this is a "luck" game, select a new random resource
              activeTool = Math.ceil(Math.random()*7);
              break;
          }

          gUICanvas.renderUI();

        }
      });
      //handle clicks on the UI
      $('#ui-canvas').click(function(e) {
        if(gameInPlay) {
          //only handle clicks on the ui when the game is running
          gUICanvas.handleClick((e.offsetX || e.clientX - $(e.target).offset().left), (e.offsetY || e.clientY - $(e.target).offset().top));
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
        if(!gameInPlay) {
          handleSpanClick(e);
        }
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
    case 'classic-game':
      setNewGameType(1);
      break;

    case 'arcade-game':
      setNewGameType(2);
      break;

    case 'arcade-one-hole':
      setNewGameType(10);
      break;

    case 'luck-game':
      activeTool = Math.ceil(Math.random()*7);
      setNewGameType(3);
      break;

    case 'new-game':
      $('#game-over').hide();
      $('#game-types').show();
      gameType = 0;
      break;

    case 'next-level':
      startNewLevel();
      break;

    case 'statistics':
      processStatistics();
      $('#game-stats').show();
      break;

    case 'close-stats':
      $('#game-stats').hide();
      break;
  }

}

/**
 * retrieve statistics from the local storage and set the stats spans to the results
 */
function processStatistics() {
  var totalGames = retreiveValue(kTOTAL_GAMES, 0);
  $('#total-games-span').html(totalGames);

  var totalTurns = retreiveValue(kTOTAL_TURNS, 0);
  $('#total-turns-span').html(totalTurns);
  $('#total-humans-killed-span').html(retreiveValue(kHUMANS_KILLED, 0));
  $('#total-robots-killed-span').html(retreiveValue(kROBOTS_KILLED, 0));

  var totalWins = retreiveValue(kTOTAL_WINS, 0);
  $('#total-wins-span').html(totalWins);

  var winPerc = 0;
  if(totalGames > 0 && totalWins > 0) {
    winPerc = (totalWins/totalGames)*100;
  }
  $('#total-win-percentage-span').html(winPerc+'%');

  var gameLength = 0;
  if(totalGames > 0 && totalTurns > 0) {
    gameLength = totalTurns/totalGames;
  }
  $('#total-avg-game-length-span').html(gameLength + ' turns');

  $('#total-max-level').html(retreiveValue(kMAX_LEVEL, 0));
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
    passedCode = keyCode-55;
  }

  if(passedCode > 0 && passedCode < 4 || passedCode == 10) {
    setNewGameType(passedCode);
  }
}

/**
 * set a new game type
 * @param newGameType
 */
function setNewGameType(newGameType) {
  if(gameType == 0 && newGameType != 0) {

    //display the appropriate "how to play" block and set up time and resource limits
    switch (newGameType) {
      case 1:
        $('#play-classic').show();
        setResources(1);
        break;
      case 2:
      case 10:
        $('#play-arcade').show();
        setResources(-1);
        break;

      case 3:
        $('#play-luck').show();
        setResources(-1);
        break;
    }

    currentTurn = 0;
    currentLevel = 1;

    numHumans = 4;
    numRobots = 4;

    gameType = newGameType;
    gCanvas.initGame();
    //hide the explanatory game displays
    $('#game-explanations').hide();
    $('#controls').hide();
    gameInPlay = true;

    redrawBoard();
  }
}

//start a new level
function startNewLevel() {
  currentTurn = 0;
  //iterate the level counter
  currentLevel++;

  //add a new human and a new robot
  if(numHumans < 15) {
    //limit the maximum number of humans and robots, to prevent infinite looping
    numHumans++;
    numRobots++;
  }

  if(gameType == 1) {
    //if we're in "classic" mode, reset the resource allocation
    setResources(1);
  }

  gCanvas.initGame();
  $('#controls').hide();
  gameInPlay = true;

  redrawBoard();
}

/**
 * set resource levels
 */
function setResources(resLevel) {
  resourceSupply = [];

  for(var n=0; n<7; n++) {
    if(resLevel == -1) {
      //set the resources to unlimited
      resourceSupply[n] = -1;
    } else {
      //set the resource level to a random level
      resourceSupply[n] = Math.round(Math.random()*20);
    }

  }
}

/**
 * game tick handler
 */
function handleTick() {
  if(numAnimations > 0) {
    gCanvas.handleAnimation();
  }

  //move the crt scanline every tick
  $('.scan').each(function(index){
    scanTop[index] = scanTop[index] - 5;

    if(scanTop[index] < -64) {
      scanTop[index] = 640;
    }

    var backgroundPos = $(this).css('background-position').split(' ');
    if(index == 0 && navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
      //because firefox has issues with background-position compared to webkit, break the background position here, so the scan line looks alright.
      backgroundPos[0] = '50px';
    }
    $(this).css('background-position', backgroundPos[0] + ' ' + scanTop[index]+'px');
  });

  t = setTimeout('handleTick()', 50);
}

/**
 * helper function to redraw the board from within other classes
 */
function redrawBoard() {
  gCanvas.drawBoard();
  gUICanvas.renderUI();

}