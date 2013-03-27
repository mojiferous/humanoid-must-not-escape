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
  //draw the tick countdown, which is essentially just an 8x8 icon from the tileset rendered at 0,0 on the UI canvas
  this.drawCanvas.drawImage(this.tileset, this.ticPart*8, 784, 8, 8, 0, 0, 8, 8);
};
