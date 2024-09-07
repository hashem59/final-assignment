import FilterControl from './FilterControl.js';

export default class FaceDetectionAndBlur extends FilterControl {
  constructor(...attrs) {
    super(...attrs);
    this.detections = [];
    const faceOptions = {
      withLandmarks: true,
      withExpressions: false,
      withDescriptors: false,
    };
    this.options = ['Greyscale', 'Blur', 'RGBtoHSV', 'Pixelate', 'None'];
    this.isReady = false;

    this.isVideo = this.imgIn?.elt?.tagName === 'VIDEO'; // check weather the this.imgIn is a video or image
    this.faceapi = this.isVideo
      ? ml5.faceApi(this.imgIn, faceOptions, this.modelReady.bind(this))
      : ml5.faceApi(faceOptions, this.modelReady.bind(this));

    this.drawOptions();
  }

  // Start detecting faces
  modelReady() {
    this.isReady = true;
    if (this.isVideo) {
      this.faceapi.detect(this.gotFaces.bind(this));
    } else {
      this.faceapi.detect(this.imgIn, this.gotFaces.bind(this));
    }
  }

  // Got faces
  gotFaces(error, result) {
    if (error) {
      console.log(error);
      return;
    }

    this.detections = result;
    if (this.isVideo) this.faceapi.detect(this.gotFaces.bind(this)); // Recursively call to continue detecting faces
  }

  drawOptions() {
    this.select = createSelect();
    this.select.position(this.x + this.w + 5, this.y + this.h);
    this.select.style('transform', 'rotate(270deg)');
    this.select.style('transform-origin', '0 0');
    this.options.forEach((option) => this.select.option(option));
  }

  drawBoxs(detections) {
    if (detections.length > 0) {
      //If at least 1 face is detected: もし1つ以上の顔が検知されていたら
      for (let f = 0; f < detections.length; f++) {
        let { _x, _y, _width, _height } = detections[f].alignedRect._box;
        stroke(44, 169, 225);
        strokeWeight(1);
        noFill();
        const offset = 4;
        rect(_x + this.x - offset / 2, _y + this.y - offset / 2, _width + offset, _height + offset);
      }
    }
  }

  applyFilters() {
    return this.imgIn;
  }

  keyPressed(event) {
    let { key } = event.detail.event;
    key = Number(key);
    // check if it's a number
    if (!isNaN(key)) {
      const index = key - 1;
      if (this.options[index]) {
        this.select.value(this.options[index]);
      }
    }
  }

  draw() {
    text(this.title, this.x + 0, this.y - 10);
    image(this.imgIn, this.x, this.y, this.w, this.h);
    this.show();
    if (!this.isReady) {
      fill(0, 150);
      rect(this.x, this.y, this.w, this.h);
      fill(255);
      textSize(12);
      text('Loading...', this.x + this.w / 2 - 30, this.y + this.h / 2 + 10);
    }
  }

  show() {
    if (this.detections.length > 0) {
      /* let points = this.detections[0].landmarks.positions;
      for (let i = 0; i < points.length; i++) {
        stroke(161, 95, 251);
        strokeWeight(4);
        point(points[i]._x + this.x, points[i]._y + this.y);
      } */
      let { _x, _y, _width, _height } = this.detections[0].alignedRect._box;

      // Round the dimensions to ensure they are integers
      _x = Math.floor(_x);
      _y = Math.floor(_y);
      _width = Math.floor(_width);
      _height = Math.floor(_height);
      const face = this.imgIn.get(_x, _y, _width, _height);
      const filterConfig = { face, _x, _y, _width, _height };
      if (this.select.value() === 'Greyscale') return this.grayscale(filterConfig);
      if (this.select.value() === 'Blur') return this.blurFilter(filterConfig);
      if (this.select.value() === 'RGBtoHSV') return this.RGBtoHSV(filterConfig);
      if (this.select.value() === 'Pixelate') return this.pixelateFilter(filterConfig);
    }
    this.drawBoxs(this.detections);
  }

  grayscale({ face, _x, _y, _width, _height }) {
    // apply custom gray filter by looping through each pixel
    face.loadPixels();
    for (let i = 0; i < face.pixels.length; i += 4) {
      let r = face.pixels[i];
      let g = face.pixels[i + 1];
      let b = face.pixels[i + 2];
      let gray = (r + g + b) / 3;
      face.pixels[i] = gray;
      face.pixels[i + 1] = gray;
      face.pixels[i + 2] = gray;
    }
    face.updatePixels();
    image(face, _x + this.x, _y + this.y);
  }

  blurFilter({ face, _x, _y, _width, _height }) {
    var matrix = [
      [1 / 9, 1 / 9, 1 / 9],
      [1 / 9, 1 / 9, 1 / 9],
      [1 / 9, 1 / 9, 1 / 9],
    ];
    // apply custom gray filter by looping through each pixel
    face.loadPixels();

    var matrixSize = matrix.length;
    var blurPasses = 8;
    for (let i = 0; i < blurPasses; i++) {
      // read every pixel
      for (var x = 3; x < face.width - 3; x++) {
        for (var y = 3; y < face.height - 3; y++) {
          var index = (x + y * face.width) * 4;
          var c = convolution(x, y, matrix, matrixSize, face);

          face.pixels[index + 0] = c[0];
          face.pixels[index + 1] = c[1];
          face.pixels[index + 2] = c[2];
          face.pixels[index + 3] = 255;
        }
      }
    }
    face.updatePixels();
    image(face, _x + this.x, _y + this.y);
    //image(face, _x + this.x, _y + this.y + this.h);
  }

  pixelateFilter({ face, _x, _y, _width, _height }) {
    let blockSize = 5; // Set the size of each block for pixelation

    // Load the pixel data from the face image
    face.loadPixels();

    for (let x = 0; x < face.width; x += blockSize) {
      for (let y = 0; y < face.height; y += blockSize) {
        // Get the average color of the current block
        let avgColor = this.getAverageColor(face, x, y, blockSize, blockSize);

        // Set the color of all pixels in this block to the average color
        for (let i = 0; i < blockSize; i++) {
          for (let j = 0; j < blockSize; j++) {
            let pixelX = x + i;
            let pixelY = y + j;

            // Ensure we don't go out of bounds
            if (pixelX < face.width && pixelY < face.height) {
              let index = (pixelX + pixelY * face.width) * 4;
              face.pixels[index + 0] = avgColor[0]; // Red
              face.pixels[index + 1] = avgColor[1]; // Green
              face.pixels[index + 2] = avgColor[2]; // Blue
              face.pixels[index + 3] = 255; // Alpha (fully opaque)
            }
          }
        }
      }
    }

    // Update the pixel data after modifying it
    face.updatePixels();

    // Draw the pixelated face back on the main canvas
    image(face, _x + this.x, _y + this.y);
  }

  getAverageColor(img, startX, startY, blockWidth, blockHeight) {
    let totalRed = 0,
      totalGreen = 0,
      totalBlue = 0;
    let count = 0;

    // Loop through the block of pixels
    for (let x = startX; x < startX + blockWidth; x++) {
      for (let y = startY; y < startY + blockHeight; y++) {
        // Ensure we stay within image bounds
        if (x < img.width && y < img.height) {
          let index = (x + y * img.width) * 4;
          totalRed += img.pixels[index + 0];
          totalGreen += img.pixels[index + 1];
          totalBlue += img.pixels[index + 2];
          count++;
        }
      }
    }

    // Calculate the average color
    return [Math.floor(totalRed / count), Math.floor(totalGreen / count), Math.floor(totalBlue / count)];
  }

  RGBtoHSV({ face, _x, _y, _width, _height }) {
    // apply custom gray filter by looping through each pixel
    face.loadPixels();
    for (let i = 0; i < face.pixels.length; i += 4) {
      let r = face.pixels[i];
      let g = face.pixels[i + 1];
      let b = face.pixels[i + 2];
      let gray = (r + g + b) / 3;
      face.pixels[i] = gray;
      face.pixels[i + 1] = gray;
      face.pixels[i + 2] = gray;
    }
    face.updatePixels();
    image(face, _x + this.x, _y + this.y);
  }
}
function convolution(x, y, matrix, matrixSize, img) {
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
