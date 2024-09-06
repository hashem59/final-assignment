import FilterBase from "./FilterBase.js";
export default class RChannelThreshold extends FilterBase {
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
