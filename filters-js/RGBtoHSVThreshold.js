import FilterControl from './FilterControl.js';
export default class RGBtoHSVThreshold extends FilterControl {
  constructor(...attrs) {
    super(...attrs);
  }

  applyFilters() {
    this.imgIn.loadPixels();
    this.imgOut.loadPixels();
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        let index = (x + y * this.w) * 4;
        const { h, s, v } = window.RGBtoHSV.rgbToHsv(
          this.imgIn.pixels[index + 0],
          this.imgIn.pixels[index + 1],
          this.imgIn.pixels[index + 2]
        );
        let ch1 = map(h, 0, 360, 0, 255);
        let ch2 = map(s, 0, 100, 0, 255);
        let ch3 = map(v, 0, 100, 0, 255);
        const avrg = (ch1 + ch2 + ch3) / 3;
        if (avrg > this.threshold.value()) {
          this.imgOut.pixels[index + 0] = 255;
          this.imgOut.pixels[index + 1] = 255;
          this.imgOut.pixels[index + 2] = 255;
        } else {
          this.imgOut.pixels[index + 0] = 0;
          this.imgOut.pixels[index + 1] = 0;
          this.imgOut.pixels[index + 2] = 0;
        }
        this.imgOut.pixels[index + 3] = 255;
      }
    }
    this.imgOut.updatePixels();
    return this.imgOut;
  }

  draw() {
    super.draw();
  }
}
