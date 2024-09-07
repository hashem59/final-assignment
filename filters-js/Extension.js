import FilterControl from './FilterControl.js';
export default class GreyscaleImage extends FilterControl {
  constructor(...attrs) {
    super(...attrs);

    this.handRaisedStartTime = null;
    this.alertprintn = false;

    this.matrixX = [
      // in javascript format
      [-1, -2, -1],
      [0, 0, 0],
      [1, 2, 1],
    ];
    //vertical edge detection / horizontal lines
    this.matrixY = [
      [-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1],
    ];
    this.matrixSize = this.matrixX.length;
  }

  applyFilters() {
    let img = this.imgIn;
    return this.edgeDetectionFilter(img);
  }

  edgeDetectionFilter(img) {
    var imgOut = createImage(img.width, img.height);

    imgOut.loadPixels();
    img.loadPixels();

    // read every pixel
    for (var x = 0; x < imgOut.width; x++) {
      for (var y = 0; y < imgOut.height; y++) {
        var index = (x + y * imgOut.width) * 4;
        var cX = this.convolution(x, y, this.matrixX, this.matrixSize, img);
        var cY = this.convolution(x, y, this.matrixY, this.matrixSize, img);

        cX = map(abs(cX[0]), 0, 1020, 0, 255);
        cY = map(abs(cY[0]), 0, 1020, 0, 255);
        var combo = cX + cY;

        imgOut.pixels[index + 0] = combo;
        imgOut.pixels[index + 1] = combo;
        imgOut.pixels[index + 2] = combo;
        imgOut.pixels[index + 3] = 255;
      }
    }
    imgOut.updatePixels();
    return imgOut;
  }
}
