/**
 *
 * 3/5/13 Mojiferous
 *
 * jquery controls for the main app
 */

var gCanvas;
var mainCanvas;

var uiCanvas;
var gUICanvas;

var gTileSize = 32;
var gTotalWidth = 18;
var gTotalHeight = 18;

var showRobotHeatMap = false;
var showHumanHeatMap = false;

var activeTool = 0;

var numAnimations = 0;

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

      $(mainCanvas).click(function(obj) {
        //handle clicks on the main canvas
        if(numAnimations == 0) {
          gCanvas.handleClick(obj.offsetX, obj.offsetY, activeTool);
        }


//        showRobotHeatMap = !showRobotHeatMap;
//        gCanvas.drawBoard();
      });

      $(uiCanvas).click(function(obj) {
        //handle clicks on the UI canvas
        gUICanvas.handleClick(obj.offsetX, obj.offsetY);
      });

      //start the timer!
      handleTick();
    }
  });


})(jQuery, this, this.document);

/**
 * game tick handler
 */
function handleTick() {
  if(numAnimations > 0) {
    gCanvas.handleAnimation();
  }
  t = setTimeout('handleTick()', 50);
}

/**
 * helper function to redraw the board from within other classes
 */
function redrawBoard() {
  gCanvas.drawBoard();
}