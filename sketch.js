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
import {
  BaseView,
  GreyscaleImage,
  RChannel,
  GChannel,
  BChannel,
  RChannelThreshold,
  GChannelThreshold,
  BChannelThreshold,
  RGBtoYCbCr,
  RGBtoHSV,
  FaceDetectionAndBlur,
  RGBtoYCbCrThreshold,
} from "./filters-js/index.js";

var imgIn;

function preload() {
  imgIn = loadImage("/test.png");
}
window.preload = preload; // export preload function

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
      className: "BaseView",
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
      className: "BaseView",
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
      title: "face detection",
      id: "face-detection",
      className: "FaceDetectionAndBlur",
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
const runningFrames = [];

function setup() {
  createCanvas(1200, 4900);
  pixelDensity(1);
  video = createCapture(VIDEO);
  video.size(160, 120);
  //video.hide();
  runFrames();
  // use rgb  color mode
  //colorMode(RGB, 255);
}
window.setup = setup; // export setup function

function draw() {
  background(255);
  //video.loadPixels();
  runningFrames.forEach((blob) => {
    blob.draw();
  });
  // draw frames
}

window.draw = draw; // export draw function

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
      case "BaseView":
        className = BaseView;
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
      case "FaceDetectionAndBlur":
        className = FaceDetectionAndBlur;
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
    const blob = new className({
      x,
      y,
      w: width,
      h: height,
      title: item.title,
      hasSlider,
      imgIn,
      video,
    });
    runningFrames.push(blob);
    if (i > 11) break;
  }
}
