import FilterControl from './FilterControl.js';
import { HandLandmarker, FilesetResolver } from '../libraries/@mediapipe-tasks-vision@0.10.0.js';

export default class GreyscaleImage extends FilterControl {
  constructor(...attrs) {
    super(...attrs);
    this.initializeProperties();
    this.setupVideo();
    this.initializeHandLandmarker();
  }

  initializeProperties() {
    this.w = this.w * 3;
    this.h = this.h * 3;
    this.secsBeforeTrigger = 3;
    this.runningMode = 'VIDEO';
    this.lastVideoTime = -1;
    this.results = undefined;
    this.isReady = false;
    this.handWasRaisedAt = null;
    this.isHandUp = false;
    this.handIconHeight = 30;
    this.handIcon = loadImage('./hand.svg');
    this.handIconFilled = loadImage('./hand-filled.svg');
    this.connections = [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4], // Thumb
      [5, 6],
      [6, 7],
      [7, 8], // Index finger
      [9, 10],
      [10, 11],
      [11, 12], // Middle finger
      [13, 14],
      [14, 15],
      [15, 16], // Ring finger
      [17, 18],
      [18, 19],
      [19, 20], // Pinky finger
      [0, 5],
      [5, 9],
      [9, 13],
      [13, 17],
      [0, 17], // Palm
    ];
  }

  setupVideo() {
    this.video = createCapture(VIDEO);
    this.video.size(640, 480);
    this.video.position(0, 0);
    this.video.hide();
  }

  async initializeHandLandmarker() {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
    );
    this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: './libraries/hand_landmarker.task',
        delegate: 'GPU',
      },
      runningMode: this.runningMode,
      numHands: 2,
    });
    this.isReady = true;
  }

  drawImg() {
    image(this.video, 0, this.y, this.w, this.h);
    this.drawHandIcon();

    if (this.isReady) {
      this.processHandDetection();
    }
  }

  drawHandIcon() {
    image(this.handIcon, 20, this.y + 20, 30, this.handIconHeight);
    if (!this.isReady) {
      fill(0, 150);
      rect(0, this.y, this.w, this.h);
    }
  }

  drawText() {
    super.drawText();
    if (!this.isReady) {
      fill(255);
      textSize(12);
      text('Loading...', this.x + this.w / 2 - 30, this.y + this.h / 2 + 10);
    }
    // add text to explian the hand gesture
    fill(0);
    textSize(12);
    text('Raise your hand for 5 seconds to trigger an alert', this.x + 10, this.y + this.h + 20);
  }

  processHandDetection() {
    this.detectHands();
    if (this.results && this.results?.landmarks?.length > 0) {
      for (const landmarks of this.results.landmarks) {
        this.drawHandLandmarks(landmarks);
      }
    } else {
      this.resetHandDetection();
    }
  }

  resetHandDetection() {
    this.isHandUp = false;
    this.handWasRaisedAt = null;
  }

  async detectHands() {
    const startTimeMs = performance.now();
    if (this.lastVideoTime !== this.video.elt.currentTime) {
      this.lastVideoTime = this.video.elt.currentTime;
      this.results = await this.handLandmarker.detectForVideo(this.video.elt, startTimeMs);
    }
  }

  drawHandLandmarks(landmarks) {
    const isRightHand = this.isRightHand(landmarks);
    const isOpen = this.areFingersOpen(landmarks);
    const areFingersInOrder = this.areFingersInOrder(landmarks, isRightHand);
    const angleIsCloseTo90 = this.isAngleCloseTo90(landmarks[0], landmarks[12]);

    this.updateHandStatus(isOpen, areFingersInOrder && angleIsCloseTo90);
    this.checkHandRaisedDuration();

    if (isOpen && areFingersInOrder && angleIsCloseTo90) {
      this.drawLandmarkPoints(landmarks);
      this.drawLandmarkConnections(landmarks);
    }
  }

  // Check if the angle between points 0 and 12 is close to 90 degrees
  isAngleCloseTo90(point0, point12) {
    // Calculate the difference between x and y
    let deltaX = point12.x - point0.x;
    let deltaY = point12.y - point0.y;

    // Calculate the angle in radians
    let angle = atan2(deltaY, deltaX);

    // Convert radians to degrees
    let angleInDegrees = degrees(angle);

    // Normalize the angle to 0-180 range
    angleInDegrees = abs(angleInDegrees);
    // Check if the angle is close to 90 degrees (with a tolerance of 10 degrees)
    return abs(90 - angleInDegrees) < 20;
  }

  isRightHand(landmarks) {
    return landmarks[0].x < landmarks[9].x;
  }

  areFingersOpen(landmarks) {
    return (
      landmarks[8].y < landmarks[7].y &&
      landmarks[12].y < landmarks[11].y &&
      landmarks[16].y < landmarks[15].y &&
      landmarks[20].y < landmarks[19].y
    );
  }

  areFingersInOrder(landmarks, isRightHand) {
    if (isRightHand) {
      return landmarks[4].x > landmarks[5].x && landmarks[5].x > landmarks[9].x && landmarks[9].x > landmarks[13].x;
    } else {
      return landmarks[4].x < landmarks[5].x && landmarks[5].x < landmarks[9].x && landmarks[9].x < landmarks[13].x;
    }
  }

  updateHandStatus(isOpen, areFingersInOrder) {
    if (isOpen && areFingersInOrder && !this.isHandUp) {
      this.handWasRaisedAt = performance.now();
      this.isHandUp = true;
      console.log('Hand is up');
    } else if (this.isHandUp && !(isOpen && areFingersInOrder)) {
      console.log('Hand is down');
      this.isHandUp = false;
      this.handWasRaisedAt = null;
    }
  }

  checkHandRaisedDuration() {
    if (this.isHandUp && performance.now() - this.handWasRaisedAt > this.secsBeforeTrigger * 1000) {
      alert('Hand was raised');
      this.handWasRaisedAt = null;
      this.isHandUp = false;
    } else if (this.isHandUp) {
      this.drawFilledHandIcon();
    }
  }

  drawFilledHandIcon() {
    const percentage = (performance.now() - this.handWasRaisedAt) / (this.secsBeforeTrigger * 1000);
    const filledHeight = this.handIconHeight * percentage + 2;

    this.handIconFilled.resize(30, 30);
    const croppedImage = this.handIconFilled.get(0, this.handIconHeight - filledHeight, 30, filledHeight);
    image(croppedImage, 20, this.y + 20 + this.handIconHeight - filledHeight, 30, filledHeight);
  }

  drawLandmarkPoints(landmarks) {
    stroke(0, 255, 0);
    strokeWeight(2);

    for (let i = 0; i < landmarks.length; i++) {
      let x = landmarks[i].x * this.w;
      let y = landmarks[i].y * this.h;
      fill(255, 0, 0);
      ellipse(x, y + this.y, 8, 8);
    }
  }

  drawLandmarkConnections(landmarks) {
    stroke(0, 0, 255);
    strokeWeight(3);

    for (let connection of this.connections) {
      let startIdx = connection[0];
      let endIdx = connection[1];
      let startX = landmarks[startIdx].x * this.w;
      let startY = landmarks[startIdx].y * this.h;
      let endX = landmarks[endIdx].x * this.w;
      let endY = landmarks[endIdx].y * this.h;
      line(startX, startY + this.y, endX, endY + this.y);
    }
  }
}
