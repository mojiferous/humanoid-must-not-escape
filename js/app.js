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
        //gCanvas.changeTile(obj.offsetX, obj.offsetY);

        showRobotHeatMap = !showRobotHeatMap;
        gCanvas.drawBoard();
      });

      //start the timer!
      handleTick();
    }
  });


})(jQuery, this, this.document);

function handleTick() {
//  gUICanvas.handleTick();
  t = setTimeout('handleTick()', 50);
}