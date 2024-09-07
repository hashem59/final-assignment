export default class FilterControl {
  constructor({ x, y, w, h, title, hasSlider = false, imgIn, video }) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.title = title;
    this.imgOut = createImage(this.w, this.h);
    this.imgIn = imgIn;
    if (hasSlider) this.initSlider();
    document.addEventListener('keyPressed', this.keyPressed.bind(this));
  }

  disconnect() {
    document.removeEventListener('keyPressed', this.keyPressed.bind(this));
    // remove the slider if exists
    if (this.thresholdSlider) this.thresholdSlider.remove();
  }

  initSlider() {
    this.thresholdSlider = createSlider(0, 255, 127);
    this.thresholdSlider.position(this.x + this.w + 5, this.y + this.h);
    this.thresholdSlider.style('transform', 'rotate(270deg)');
    this.thresholdSlider.style('transform-origin', '0 0');
    this.threshold = this.thresholdSlider;
  }

  keyPressed(event) {}

  applyFilters() {
    return this.imgIn;
  }

  draw() {
    this.show();
  }

  show() {
    fill(0);
    rect(this.x, this.y, this.w, this.h);
    fill(0);
    textSize(12);
    stroke(255);
    image(this.applyFilters(), this.x, this.y, this.w, this.h);
    text(this.title, this.x + 0, this.y - 10);
  }

  convolution(x, y, matrix, matrixSize, img) {
    var totalRed = 0.0;
    var totalGreen = 0.0;
    var totalBlue = 0.0;
    var offset = floor(matrixSize / 2);

    // convolution matrix loop
    for (var i = 0; i < matrixSize; i++) {
      for (var j = 0; j < matrixSize; j++) {
        // Get pixel loc within convolution matrix
        var xloc = x + i - offset;
        var yloc = y + j - offset;
        var index = (xloc + img.width * yloc) * 4;
        // ensure we don't address a pixel that doesn't exist
        index = constrain(index, 0, img.pixels.length - 1);

        // multiply all values with the mask and sum up
        totalRed += img.pixels[index + 0] * matrix[i][j];
        totalGreen += img.pixels[index + 1] * matrix[i][j];
        totalBlue += img.pixels[index + 2] * matrix[i][j];
      }
    }
    // return the new color
    return [totalRed, totalGreen, totalBlue];
  }
}
