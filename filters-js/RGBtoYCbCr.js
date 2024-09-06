import FilterBase from "./FilterBase.js";
export default class RGBtoYCbCr extends FilterBase {
  constructor(...attrs) {
    super(...attrs);
  }

  applyFilters() {
    this.img.loadPixels();
    this.imgOut.loadPixels();
    for (let i = 0; i < this.h; i++) {
      for (let j = 0; j < this.w; j++) {
        let index = (j + i * this.w) * 4;
        const r = this.img.pixels[index + 0];
        const g = this.img.pixels[index + 1];
        const b = this.img.pixels[index + 2];
        const r_ = r / 255;
        const g_ = g / 255;
        const b_ = b / 255;

        let y_ = 0.299 * r_ + 0.587 * g_ + 0.114 * b_;
        let cb = 128 + 128 * (-0.169 * r_ - 0.33 * g_ + 0.5 * b_);
        let cr = 128 + 128 * (0.5 * r_ - 0.419 * g_ - 0.081 * b_);

        y_ = Math.round(y_ * 255);
        cb = Math.round(cb);
        cr = Math.round(cr);
        //console.log("y_, cb, cr", y_, cb, cr);

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
