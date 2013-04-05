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
var scanTop = 0;

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

      $('#crt').click(function(e) {
        //handle clicks on the crt div and pass them through to the underlying canvases
        if(e.offsetY > 576) {
          gUICanvas.handleClick(e.offsetX, (e.offsetY-576));
        } else {
          if(numAnimations ==0) {
            gCanvas.handleClick(e.offsetX, e.offsetY, activeTool);
          }

        }
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