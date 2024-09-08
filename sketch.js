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
  RGBtoHSVThreshold,
  RGBtoYCbCrThreshold,
  Extension,
} from './filters-js/index.js';

let debugImg,
  video,
  snapshot = null;
const snapshotNamePrefix = 'snapshot';
let snapshotName = `${snapshotNamePrefix}.png`;
let snapshotCheckbox,
  debug = false;

const framesData = {
  width: 160,
  height: 120,
  colls: 3,
  hPadding: 55,
  vPadding: 40,
  marginTop: 100,
  marginLeft: 0,
  items: [
    { title: 'Webcam image', component: BaseView },
    { title: 'Greyscale image', component: GreyscaleImage },
    {},
    { title: 'R Channel', component: RChannel },
    { title: 'G Channel', component: GChannel },
    { title: 'B Channel', component: BChannel },
    { title: 'R Channel Threshold', component: RChannelThreshold },
    { title: 'G Channel Threshold', component: GChannelThreshold },
    { title: 'B Channel Threshold', component: BChannelThreshold },
    { title: 'Webcam image', component: BaseView },
    { title: 'RGB to YCbCr', component: RGBtoYCbCr },
    { title: 'RGB to HSV', component: RGBtoHSV },
    { title: 'Face detection', component: FaceDetectionAndBlur },
    { title: 'RGB to YCbCr Threshold', component: RGBtoYCbCrThreshold },
    { title: 'RGB to HSV Threshold', component: RGBtoHSVThreshold },
    { title: 'Extension', component: Extension },
  ],
};

const runningFrames = [];

window.preload = function preload() {
  debugImg = loadImage('/test.png');
};

window.setup = function setup() {
  createCanvas(1200, 4900);
  pixelDensity(1);
  video = createCapture(VIDEO);
  video.size(framesData.width, framesData.height);
  video.hide();

  initFrames();
  setupUI();
  colorMode(RGB);
};

function setupUI() {
  // Debug mode checkbox
  createCheckbox('Debug', debug)
    .position(20, 10)
    .changed(() => toggleDebugMode());

  // Snapshot button
  createButton('Take snapshot').position(20, 40).mousePressed(takeSnapshot);

  // Snapshot mode checkbox
  snapshotCheckbox = createCheckbox('Use snapshot', false).position(200, 75).hide().changed(initFrames);

  // Save snapshot button
  createButton('Save snapshot').position(150, 40).mousePressed(saveSnapshot);

  // Upload snapshot button
  createFileInput(handleFileUpload).position(290, 40).style('display', 'none');

  createButton('Upload snapshot')
    .position(290, 40)
    .mousePressed(() => document.querySelector('input[type="file"]').click());
}

function toggleDebugMode() {
  debug = !debug;
  initFrames();
}

function takeSnapshot() {
  snapshot = createImage(video.width, video.height);
  snapshot.copy(video.get(), 0, 0, video.width, video.height, 0, 0, video.width, video.height);
  snapshotName = `${snapshotNamePrefix}-${Date.now()}.png`;
}

function saveSnapshot() {
  if (!snapshot) takeSnapshot();
  save(snapshot, snapshotName);
}

function handleFileUpload(file) {
  if (file.type === 'image') {
    snapshot = loadImage(file.data);
    snapshotName = file.name;
    initFrames();
  }
}

window.draw = function () {
  background(255);

  if (snapshot) {
    fill(0);
    textSize(12);
    text(snapshotName, 20, 90);
    snapshotCheckbox.print();
  }

  runningFrames.forEach((frame) => frame.draw());
};

window.keyPressed = function (event) {
  document.dispatchEvent(new CustomEvent('keyPressed', { detail: { event } }));
};

function initFrames() {
  runningFrames.forEach((frame) => frame.disconnect());
  runningFrames.length = 0;

  if (debug) {
    debugImg.resize(160, 120);
    debugImg = debugImg.get(0, 0, framesData.width, framesData.height);
  }

  const { width, height, colls, vPadding, hPadding, items, marginLeft, marginTop } = framesData;

  items.forEach((item, i) => {
    if (!item.component) return;

    const x = marginLeft + (i % colls) * (width + hPadding) + hPadding / 2;
    const y = marginTop + Math.floor(i / colls) * (height + vPadding) + vPadding;
    const input = debug ? debugImg : snapshotCheckbox?.checked() && snapshot ? snapshot : video;
    const hasSlider = item.title.includes('Threshold');

    const frame = new item.component({
      x,
      y,
      w: width,
      h: height,
      title: item.title,
      hasSlider,
      imgIn: input,
    });
    runningFrames.push(frame);
  });
}
/* Commentary:
Findings:
We implemented multiple image filters, including the red, green, and blue (RGB) channels, as well as greyscale conversion and face detection. 
Each filter offers unique insights into different image components. For instance, when applying a threshold to the red channel (RChannelThreshold.js), 
the result highlights the areas with higher red values. Similarly, the GreyscaleImage.js filter converts colored images to greyscale 
by averaging the RGB values, which proved useful for creating a cleaner output for subsequent image processing techniques like face detection.
Especially, the RGBtoYCbCrThreshold filter which seems powerful in detecting main object and clearing all surrounded noise.

Challenges and Solutions:
Flipping the Video Horizontally: One of the main challenges was ensuring that the video feed appeared correctly, especially when applying transformations. 
This was solved by using a combination of the push() and pop() methods in p5.js to manage the transformations for the video (such as flipping and scaling) 
and text rendering separately. Here is the solution:

push();
translate(width - (width - (this.x + this.w)), 0);
scale(-1, 1);
this.drawImg();
pop();
this.drawText();
Frame Organization: To streamline the process of applying multiple filters across different frames, a FilterControl class was created. 
This allowed for efficient management of the frames and ensured that the filters could be applied consistently. 
This was crucial when handling multiple filters like RGB channels, thresholds, and face detection. 
by building predefined methods within the FilterControl Class which outlines the functionality for all frames.

Face Detection Box Precision: During face detection, the bounding box around the detected face occasionally produced decimal numbers, 
making pixel manipulation difficult. To overcome this, we used Math.floor() to round the dimensions to ensure integer values, 
allowing accurate pixel selection within the pixel array.

Project Target:
The project aimed to develop a modular filter control system capable of applying different filters to a video stream in real-time. 
This was achieved by creating the FilterControl class, which contains methods to apply filters and manage frames. 
Each filter was then built as a subclass of FilterControl, making it easy to extend and manage new filters.

Extension:
The unique extension added to the project was a real-time hand gesture detection feature. 
This feature allows the program to detect a hand gesture and trigger an action, 
such as displaying an alert when the hand is raised for more than five seconds. 
The uniqueness of this extension lies in its integration with the MediaPipe framework, 
which provided robust hand landmark detection. The decision to use MediaPipe over alternatives 
like OpenCV js and ml5.js was based on its superior performance, accuracy and simplicity as it provide us we just the methods 
and data required for implementing this gesture.

The logic for detecting whether a hand is raised was built around three criteria:

All fingers must be open (not collapsed).
The fingers must be in order, ensuring the hand is fully extended.
The hand must be positioned at a near 90-degree angle to the horizontal line.
This extension is relevant in modern video applications, allowing for intuitive gesture-based controls, 
such as triggering actions in video players or sending alerts based on gestures. The integration of this feature was 
smooth and made the project more interactive. It was implemented by adding a class called Extension, 
which extends the FilterControl class, maintaining the overall modularity and flexibility of the system. 
Unlike other frames in this project this gesture works only with VIDEO stream as it does nt make sense to get it working with static images.

Conclusion:
Our implementation for the project met its objectives by building a flexible framework for applying filters to video streams in real time. 
The inclusion of hand gesture detection extended the project’s scope beyond basic filters, offering an interactive experience. 
We did overcome technical challenges through methodical problem-solving, ultimately delivering a robust and expandable solution.
*/
