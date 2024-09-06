import FilterBase from "./FilterBase.js";
export default class BChannelThreshold extends FilterBase {
  constructor(...attrs) {
    super(...attrs);
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
