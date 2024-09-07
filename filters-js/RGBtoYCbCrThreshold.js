import FilterControl from './FilterControl.js';
export default class RGBtoYCbCr extends FilterControl {
  constructor(...attrs) {
    super(...attrs);
  }

  applyFilters() {
    this.imgIn.loadPixels();
    this.imgOut.loadPixels();
    for (let i = 0; i < this.h; i++) {
      for (let j = 0; j < this.w; j++) {
        let index = (j + i * this.w) * 4;
        const r = this.imgIn.pixels[index + 0];
        const g = this.imgIn.pixels[index + 1];
        const b = this.imgIn.pixels[index + 2];
        const { y_, cb, cr } = window.RGBtoYCbCr.RGBtoYCbCr(r, g, b);
        const avrg = (y_ + cb + cr) / 3;
        if (avrg > this.threshold.value()) {
          this.imgOut.pixels[index + 0] = 255;
          this.imgOut.pixels[index + 1] = 255;
          this.imgOut.pixels[index + 2] = 255;
        } else {
          this.imgOut.pixels[index + 0] = 0;
          this.imgOut.pixels[index + 1] = 0;
          this.imgOut.pixels[index + 2] = 0;
        }
        this.imgOut.pixels[index + 3] = 255; //this.imgIn.pixels[index + 3];
      }
    }
    this.imgOut.updatePixels();
    return this.imgOut;
  }

  static RGBtoYCbCr(r, g, b) {
    const r_ = r / 255;
    const g_ = g / 255;
    const b_ = b / 255;
    let y_ = 0.299 * r_ + 0.587 * g_ + 0.114 * b_;
    let cb = 128 + 128 * (-0.169 * r_ - 0.33 * g_ + 0.5 * b_);
    let cr = 128 + 128 * (0.5 * r_ - 0.419 * g_ - 0.081 * b_);
    y_ = Math.round(y_ * 255);
    cb = Math.round(cb);
    cr = Math.round(cr);
    return { y_, cb, cr };
  }

  draw() {
    super.draw();
  }
}
window.RGBtoYCbCr = RGBtoYCbCr;
