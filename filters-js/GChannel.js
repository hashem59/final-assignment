import FilterControl from './FilterControl.js';
export default class GChannel extends FilterControl {
  constructor(...attrs) {
    super(...attrs);
  }

  applyFilters() {
    this.imgIn.loadPixels();
    this.imgOut.loadPixels();
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        let index = (x + y * this.w) * 4;
        const r = this.imgIn.pixels[index + 0];
        const g = this.imgIn.pixels[index + 1];
        const b = this.imgIn.pixels[index + 2];
        this.imgOut.pixels[index + 0] = 0;
        this.imgOut.pixels[index + 1] = g;
        this.imgOut.pixels[index + 2] = 0;
        this.imgOut.pixels[index + 3] = this.imgIn.pixels[index + 3];
      }
    }
    this.imgOut.updatePixels();
    return this.imgOut;
  }

  draw() {
    super.draw();
  }
}
