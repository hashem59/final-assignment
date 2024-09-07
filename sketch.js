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
    snapshotCheckbox.show();
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
