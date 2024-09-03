/* Task/steps
1. Load an image using the webcam: you can either take a snapshot, save it to disk and
load it back or you can use this snapshot as a buffer image and use it without saving
it to disk. Use key/mouse interaction to take the snapshot or save the image.
2. Scale that image to 160 x 120 pixels (i.e minimum resolution).
3. Display the webcam image in the grid at the position titled “Webcam image”. Then
using this webcam image complete all tasks 4 – 11.
4. Convert image to grayscale and increase the brightness by 20%. This should happen
within the same nested for loop that you use to convert the image to greyscale.
Display the image at the appropriate position as seen in the grid.
5. Increasing the brightness can cause the pixel intensity to get beyond the 255 levels.
Write code to prevent this from happening.
6. Using the original webcam image: split into three colour channels (R, G, B) and show
each channel. Again, use the appropriate positions as seen in the grid.
7. Perform image thresholding with a slider for each channel separately. Similarly,
display the results using the appropriate positions as seen in the grid.
8. What can you say about the result of thresholding for each channel – is it different
and why? Explain this in the commentary section.
9. Using the original webcam image again and assuming your camera’s colour model is
using an RGB colour model, perform colour space conversion. Select two algorithms
from the resource attached in the submission page. See examples of how the
converted images should look like at the bottom of this file. Display the images at the
correct position in the grid again.
10. Using the colour converted images perform image thresholding using either a static
threshold or a slider to control the threshold. If using a static threshold value, make
sure the thresholded image shows an expected result (see 1st image at the bottom of
this page). There’s no need to split into channels here. Display the images at the
correct position in the grid again.
11. What can you say about the thresholding results above when compared to step 7 i.e.
is the thresholded image noisier etc? Can you use a different colour space to improve
results? Discuss the above in the commentary.
12. Perform face detection as described in the lecture videos. Here you have two options:
you could use the approach shown in the course (see Week 19) or the face api from
here: https://learn.ml5js.org/#/reference/face-api.
13. Display the detected face at the correct position in the grid - then by using keystrokes
(i.e. 1, 2, 3, 4 etc.) - replace the detected face image (see 2nd and 3rd images below)
with:
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
v. Loop through all blocks repeating steps iii and iv. */

/* 
Coding style
1. Code presentation: use appropriate syntax, comments, consistent indentation and
leftover code blocks
2. Code competency: use of object orientation, code reusability, use of functions,
variables global vs local
*/

// blob code from modified example by daniel shiffman
// https://www.youtube.com/watch?v=ce-2l2wRqO8
// ported from processing

/* const scalledWidth = 160;
const scalledHeight = 120; */

var imgIn;

function preload() {
  imgIn = loadImage("/test.png");
}
const framesData = {
  width: 160,
  height: 120,
  colls: 3,
  hPadding: 55,
  vPadding: 40,
  items: [
    {
      title: "Webcam image",
      id: "webcam-image",
      className: "CameraStremBlob",
    },
    {
      title: "Greyscale image",
      id: "greyscale-image",
      className: "GreyscaleImage",
    },
    {},
    {
      title: "R Channel",
      id: "r-channel",
      className: "RChannel",
    },
    {
      title: "G Channel",
      id: "g-channel",
      className: "GChannel",
    },
    {
      title: "B Channel",
      id: "b-channel",
      className: "BChannel",
    },
    {
      title: "R Channel Threshold",
      id: "r-channel-threshold",
      className: "RChannelThreshold",
    },
    {
      title: "G Channel Threshold",
      id: "g-channel-threshold",
      className: "GChannelThreshold",
    },
    {
      title: "B Channel Threshold",
      id: "b-channel-threshold",
      className: "BChannelThreshold",
    },
    {
      title: "Webcam image",
      id: "webcam-image",
      className: "CameraStremBlob",
    },
    {
      title: "RGB to YCbCr",
      id: "rgb-to-ycbcr",
      className: "RGBtoYCbCr",
    },
    {
      title: "RGB to HSV",
      id: "rgb-to-hsv",
      className: "RGBtoHSV",
    },
    {
      title: "RGB to YCbCr Threshold",
      id: "rgb-to-ycbcr-threshold",
      className: "RGBtoYCbCrThreshold",
    },
    {
      title: "RGB to HSV Threshold",
      id: "rgb-to-hsv-threshold",
      className: "RGBtoHSVThreshold",
    },
  ],
};

var video;
var debug = false;
///var blobs = [];
const runningFrames = [];

function setup() {
  createCanvas(1200, 4900);
  pixelDensity(1);
  video = createCapture(VIDEO);
  video.size(160, 120);
  video.hide();
  runFrames();
  // use rgb  color mode
  //colorMode(RGB, 255);
}

function draw() {
  background(255);
  video.loadPixels();
  runningFrames.forEach((blob) => {
    blob.draw();
  });
  // draw frames
}

function runFrames() {
  const { width, height, colls, vPadding, hPadding, items } = framesData;
  const rows = Math.ceil(items.length / colls);

  for (let i = 0; i < items.length; i++) {
    if (!items[i].className) continue;
    const item = items[i];
    const x = (i % colls) * (width + hPadding) + hPadding / 2;
    const y = Math.floor(i / colls) * (height + vPadding) + vPadding;
    let className;
    switch (item.className) {
      case "CameraStremBlob":
        className = CameraStremBlob;
        break;
      case "GreyscaleImage":
        className = GreyscaleImage;
        break;
      case "RChannel":
        className = RChannel;
        break;
      case "GChannel":
        className = GChannel;
        break;
      case "BChannel":
        className = BChannel;
        break;
      case "RChannelThreshold":
        className = RChannelThreshold;
        break;
      case "GChannelThreshold":
        className = GChannelThreshold;
        break;
      case "BChannelThreshold":
        className = BChannelThreshold;
        break;
      case "RGBtoHSV":
        className = RGBtoHSV;
        break;
      case "RGBtoYCbCr":
        className = RGBtoYCbCr;
        break;
      case "RGBtoHSVThreshold":
        className = RGBtoHSVThreshold;
        break;
      case "RGBtoYCbCrThreshold":
        className = RGBtoYCbCrThreshold;
        break;
    }

    const hasSlider = item.className.includes("Threshold");
    console.log("hasSlider", hasSlider);
    const blob = new className(x, y, width, height, item.title, hasSlider);
    runningFrames.push(blob);
    if (i > 9) break;
  }
}

function drawFrames() {}
class CustomBlob {
  constructor(x, y, w, h, title, hasSlider = false) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.title = title;
    this.img = createImage(this.w, this.h);
    this.imgOut = createImage(this.w, this.h);
    console.log("imgIn", imgIn);
    this.img.copy(imgIn, 0, 0, 355, 355, 0, 0, this.w, this.h);
    if (hasSlider) this.initSlider();
  }

  initSlider() {
    this.thresholdSlider = createSlider(0, 255, 127);
    this.thresholdSlider.position(this.x + this.w + 5, this.y + this.h);
    this.thresholdSlider.style("transform", "rotate(270deg)");
    this.thresholdSlider.style("transform-origin", "0 0");
    this.threshold = this.thresholdSlider;
  }

  applyFilters() {
    return this.img;
  }

  draw() {
    this.show();
  }

  show() {
    fill(0);
    rect(this.x, this.y, this.w, this.h);
    fill(0);
    textSize(12);
    image(this.applyFilters(), this.x, this.y, this.w, this.h);
    text(this.title, this.x + 0, this.y - 10);
  }
}

class CameraStremBlob extends CustomBlob {
  constructor(x, y, w, h, title) {
    super(x, y, w, h, title);
  }

  draw() {
    super.draw();
  }
}

class GreyscaleImage extends CustomBlob {
  constructor(...atrrs) {
    super(...atrrs);
  }

  applyFilters() {
    this.img.loadPixels();
    this.imgOut.loadPixels();
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        let index = (x + y * this.w) * 4;
        let r = this.img.pixels[index + 0];
        let g = this.img.pixels[index + 1];
        let b = this.img.pixels[index + 2];

        // Calculate brightness (greyscale value)
        let brightness = ((r + g + b) / 3) * 1.2; // Increase brightness by 20%
        brightness = constrain(brightness, 0, 255); // Ensure brightness is within bounds

        // Apply the greyscale value to all color channels
        this.imgOut.pixels[index + 0] = brightness;
        this.imgOut.pixels[index + 1] = brightness;
        this.imgOut.pixels[index + 2] = brightness;
        this.imgOut.pixels[index + 3] = this.img.pixels[index + 3]; // Ensure alpha channel is maintained
      }
    }
    this.imgOut.updatePixels();
    return this.imgOut; // Return the filtered image
  }

  draw() {
    super.draw();
  }
}

class RChannel extends CustomBlob {
  constructor(...atrrs) {
    super(...atrrs);
  }

  applyFilters() {
    this.img.loadPixels();
    this.imgOut.loadPixels();
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        let index = (x + y * this.w) * 4;
        const r = this.img.pixels[index + 0];
        const g = this.img.pixels[index + 1];
        const b = this.img.pixels[index + 2];
        this.imgOut.pixels[index + 0] = r;
        this.imgOut.pixels[index + 1] = 0;
        this.imgOut.pixels[index + 2] = 0;
        this.imgOut.pixels[index + 3] = this.img.pixels[index + 3];
      }
    }
    this.imgOut.updatePixels();
    return this.imgOut;
  }

  draw() {
    super.draw();
  }
}

class GChannel extends CustomBlob {
  constructor(...atrrs) {
    super(...atrrs);
  }

  applyFilters() {
    this.img.loadPixels();
    this.imgOut.loadPixels();
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        let index = (x + y * this.w) * 4;
        const r = this.img.pixels[index + 0];
        const g = this.img.pixels[index + 1];
        const b = this.img.pixels[index + 2];
        this.imgOut.pixels[index + 0] = 0;
        this.imgOut.pixels[index + 1] = g;
        this.imgOut.pixels[index + 2] = 0;
        this.imgOut.pixels[index + 3] = this.img.pixels[index + 3];
      }
    }
    this.imgOut.updatePixels();
    return this.imgOut;
  }

  draw() {
    super.draw();
  }
}

class BChannel extends CustomBlob {
  constructor(...atrrs) {
    super(...atrrs);
  }

  applyFilters() {
    this.img.loadPixels();
    this.imgOut.loadPixels();
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        let index = (x + y * this.w) * 4;
        const r = this.img.pixels[index + 0];
        const g = this.img.pixels[index + 1];
        const b = this.img.pixels[index + 2];
        this.imgOut.pixels[index + 0] = 0;
        this.imgOut.pixels[index + 1] = 0;
        this.imgOut.pixels[index + 2] = b;
        this.imgOut.pixels[index + 3] = this.img.pixels[index + 3];
      }
    }
    this.imgOut.updatePixels();
    return this.imgOut;
  }

  draw() {
    super.draw();
  }
}

class RChannelThreshold extends CustomBlob {
  constructor(...atrrs) {
    super(...atrrs);
  }

  applyFilters() {
    this.img.loadPixels();
    this.imgOut.loadPixels();
    const threshold = this.threshold.value();
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        let index = (x + y * this.w) * 4;
        const r = this.img.pixels[index + 0];
        if (r > threshold) {
          this.imgOut.pixels[index + 0] = 255;
        } else {
          this.imgOut.pixels[index + 0] = 0;
        }
        this.imgOut.pixels[index + 1] = 0;
        this.imgOut.pixels[index + 2] = 0;
        this.imgOut.pixels[index + 3] = this.img.pixels[index + 3];
      }
    }
    this.imgOut.updatePixels();
    return this.imgOut;
  }

  draw() {
    super.draw();
  }
}

class GChannelThreshold extends CustomBlob {
  constructor(...atrrs) {
    super(...atrrs);
  }

  applyFilters() {
    this.img.loadPixels();
    this.imgOut.loadPixels();
    const threshold = this.threshold.value();
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        let index = (x + y * this.w) * 4;
        const g = this.img.pixels[index + 1];
        if (g > threshold) {
          this.imgOut.pixels[index + 1] = 255;
        } else {
          this.imgOut.pixels[index + 1] = 0;
        }
        this.imgOut.pixels[index + 0] = 0;
        this.imgOut.pixels[index + 2] = 0;
        this.imgOut.pixels[index + 3] = this.img.pixels[index + 3];
      }
    }
    this.imgOut.updatePixels();
    return this.imgOut;
  }

  draw() {
    super.draw();
  }
}

class BChannelThreshold extends CustomBlob {
  constructor(...atrrs) {
    super(...atrrs);
  }

  applyFilters() {
    this.img.loadPixels();
    this.imgOut.loadPixels();
    const threshold = this.threshold.value();
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        let index = (x + y * this.w) * 4;
        const b = this.img.pixels[index + 2];
        if (b > threshold) {
          this.imgOut.pixels[index + 2] = 255;
        } else {
          this.imgOut.pixels[index + 2] = 0;
        }
        this.imgOut.pixels[index + 1] = 0;
        this.imgOut.pixels[index + 0] = 0;
        this.imgOut.pixels[index + 3] = this.img.pixels[index + 3];
      }
    }
    this.imgOut.updatePixels();
    return this.imgOut;
  }

  draw() {
    super.draw();
  }
}

class RGBtoYCbCr extends CustomBlob {
  constructor(...atrrs) {
    super(...atrrs);
  }

  applyFilters() {
    this.img.loadPixels();
    this.imgOut.loadPixels();
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        let index = (x + y * this.w) * 4;
        const r = this.img.pixels[index + 0];
        const g = this.img.pixels[index + 1];
        const b = this.img.pixels[index + 2];

        /* 
          Y0 = 0.299 ∗ R0 + 0.587 ∗ G0 + 0.114 ∗ B0
          Cb = −0.169 ∗ R0 − 0.331 ∗ G0 + 0.500 ∗ B0
          Cr = 0.500 ∗ R0 − 0.419 ∗ G0 − 0.081 ∗ B0 
        */
        /*         const y_ = 0.299 * r + 0.587 * g + 0.114 * b;
        const cb = -0.169 * r - 0.331 * g + 0.5 * b;
        const cr = 0.5 * r - 0.419 * g - 0.081 * b; */
        let y_ = 0.299 * r + 0.587 * g + 0.114 * b;
        let cb = -0.169 * r - 0.331 * g + 0.5 * b + 128;
        let cr = 0.5 * r - 0.419 * g - 0.081 * b + 128;

        this.imgOut.pixels[index + 0] = y_;
        this.imgOut.pixels[index + 1] = cb;
        this.imgOut.pixels[index + 2] = cr;
        this.imgOut.pixels[index + 3] = this.img.pixels[index + 3];
      }
    }
    this.imgOut.updatePixels();
    return this.imgOut;
  }

  draw() {
    super.draw();
  }
}

class RGBtoHSV extends CustomBlob {
  constructor(...atrrs) {
    super(...atrrs);
  }

  applyFilters() {
    this.img.loadPixels();
    this.imgOut.loadPixels();
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        let index = (x + y * this.w) * 4;
        const r = this.img.pixels[index + 0];
        const g = this.img.pixels[index + 1];
        const b = this.img.pixels[index + 2];
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const v = max;
        const delta = max - min;
        let h = 0;
        let s = 0;
        if (max != 0) {
          s = delta / max;
          if (r == max) {
            h = (g - b) / delta;
          } else if (g == max) {
            h = 2 + (b - r) / delta;
          } else {
            h = 4 + (r - g) / delta;
          }
        }
        h *= 60;
        if (h < 0) {
          h += 360;
        }
        this.imgOut.pixels[index + 0] = h;
        this.imgOut.pixels[index + 1] = s;
        this.imgOut.pixels[index + 2] = v;
        this.imgOut.pixels[index + 3] = this.img.pixels[index + 3];
      }
    }
    this.imgOut.updatePixels();
    return this.imgOut;
  }

  draw() {
    super.draw();
  }
}
