import FilterBase from './FilterBase.js';
export default class FaceDetectionAndBlur extends FilterBase {
  /* 
    a. A greyscale image
    b. A blurred image – adjust blurring so your face is not recognisable
    c. A colour converted image – reuse code from task 9
    d. A pixelate image. To perform pixelation use the following approach
      i. Run step a – so that your image is greyscale
      ii. Split the detected face image into 5x5 pixel blocks
      iii. Calculate the average pixel intensity of each block using image.get(x,
      y); or use the pixel array (to access each pixel’s intensity)
      iv. Paint the entire block using the average pixel intensity. Utilise this
      command: outimage.set(x, y, avePixInt); or use the pixel array
      v. Loop through all blocks repeating steps iii and iv.
  */
  /* 
  [2 points]: Face detection works using a bounding box
  [1 point]: Replace the detected face image with a greyscale converted image
  [1 point]: Replace the detected face image with a blurred image
  [2 points]: Replace the detected face image with a colour converted image (check if task 9 is revisited)
  [6 points]: Pixelate filter (check for nested loops, correct use of average)
 */
  constructor(...attrs) {
    super(...attrs);
    this.detections = [];
    const faceOptions = {
      withLandmarks: true,
      withExpressions: false,
      withDescriptors: false,
    };

    this.faceapi = ml5.faceApi(this.video, faceOptions, this.faceReady.bind(this));
    this.ready = false;

    this.faceapi.ready.then((res) => {
      this.ready = true;
    });
    // add drop down selector for filters

    const options = ['Blur', 'Greyscale', 'RGBtoHSV', 'Pixelate'];
    this.select = createSelect();
    this.select.position(this.x, this.y + this.h + 10);
    options.forEach((option) => this.select.option(option));
  }

  applyFilters() {
    return this.img;
  }

  draw() {
    image(this.video, this.x, this.y, this.w, this.h);
    this.show();
    if (!this.ready) {
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
      let face = this.video.get(_x, _y, _width, _height);
      const filterConfig = {
        face,
        _x,
        _y,
        _width,
        _height,
      };
      // call the grayscale function, is the select value is grayscale
      console.log('face', face);
      if (this.select.value() === 'Greyscale') return this.grayscale(filterConfig);
      if (this.select.value() === 'Blur') return this.blurFilter(filterConfig);
    }
    //this.drawBoxs(this.detections);
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
    face.loadPixels();

    // Define a 3x3 Gaussian blur kernel
    const blurMatrix = [
      [1, 1, 2, 2, 2, 1, 1],
      [1, 2, 2, 12, 2, 2, 1],
      [2, 2, 12, 24, 12, 2, 2],
      [2, 12, 24, 48, 24, 12, 2],
      [2, 2, 12, 24, 12, 2, 2],
      [1, 2, 2, 12, 2, 2, 1],
      [1, 1, 2, 2, 2, 1, 1],
    ];
    const matrixSize = blurMatrix.length;
    const matrixSum = blurMatrix.reduce((acc, row) => acc + row.reduce((acc, val) => acc + val, 0), 0);
    console.log('matrixSum', matrixSum);

    // Create a copy of the original pixels to avoid modifying them while processing

    // Loop through each pixel, excluding the edges
    const originalPixels = [...face.pixels]; // Copy the original pixels to avoid modifying them during convolution
    for (let k = 1; k < 15; k++) {
      for (let x = 3; x < face.width - 3; x++) {
        for (let y = 3; y < face.height - 3; y++) {
          const [redSum, greenSum, blueSum] = this.convolution(x, y, blurMatrix, matrixSize, face, originalPixels);
          // Average the colors and assign them to the pixel
          const blurIndex = (x + y * face.width) * 4;
          originalPixels[blurIndex] = redSum;
          originalPixels[blurIndex + 1] = greenSum;
          originalPixels[blurIndex + 2] = blueSum;
        }
      }
    }
    face.pixels = originalPixels;

    face.updatePixels();
    image(face, _x + this.x, _y + this.y);
  }

  // Start detecting faces
  faceReady() {
    this.faceapi.detect(this.gotFaces.bind(this));
  }

  // Got faces
  gotFaces(error, result) {
    if (error) {
      console.log(error);
      return;
    }
    this.detections = result;
    this.faceapi.detect(this.gotFaces.bind(this)); // Recursively call to continue detecting faces
  }

  drawBoxs(detections) {
    if (detections.length > 0) {
      //If at least 1 face is detected: もし1つ以上の顔が検知されていたら
      for (let f = 0; f < detections.length; f++) {
        let { _x, _y, _width, _height } = detections[f].alignedRect._box;
        stroke(44, 169, 225);
        strokeWeight(1);
        noFill();
        rect(_x + this.x, _y + this.y, _width, _height);
      }
    }
  }

  /*   blurFilter({ face, _x, _y, _width, _height }) {
    // Draw the face to an off-screen graphics buffer
    const faceGraphics = createGraphics(_width, _height);
    faceGraphics.image(face, 0, 0, _width, _height);

    // Apply the built-in p5.js blur filter, set blur amount as needed
    faceGraphics.filter(BLUR, 3); // Adjust the second parameter for stronger or weaker blur

    // Render the blurred face back to the main canvas
    image(faceGraphics, _x + this.x, _y + this.y);
  } */

  convolution(x, y, matrix, matrixSize, img, originalPixels) {
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
        index = constrain(index, 0, originalPixels.length - 1);

        // multiply all values with the mask and sum up
        totalRed += originalPixels[index + 0] * matrix[i][j];
        totalGreen += originalPixels[index + 1] * matrix[i][j];
        totalBlue += originalPixels[index + 2] * matrix[i][j];
      }
    }
    // return the new color
    return [totalRed, totalGreen, totalBlue];
  }
}
