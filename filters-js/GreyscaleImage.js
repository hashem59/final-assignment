import FilterBase from "./FilterBase.js";
export default class GreyscaleImage extends FilterBase {
  constructor(...attrs) {
    super(...attrs);
  }

  applyFilters() {
    this.img.loadPixels();
    this.imgOut.loadPixels();
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        let index = (x + y * this.w) * 4;
        let r = this.img.pixels[index + 0];
        let g = this.img.pixels[index + 1];
        let b = this.img.pixels[index + 2];

        // Calculate brightness (greyscale value)
        let brightness = ((r + g + b) / 3) * 1.2; // Increase brightness by 20%
        brightness = constrain(brightness, 0, 255); // Ensure brightness is within bounds

        // Apply the greyscale value to all color channels
        this.imgOut.pixels[index + 0] = brightness;
        this.imgOut.pixels[index + 1] = brightness;
        this.imgOut.pixels[index + 2] = brightness;
        this.imgOut.pixels[index + 3] = this.img.pixels[index + 3]; // Ensure alpha channel is maintained
      }
    }
    this.imgOut.updatePixels();
    return this.imgOut; // Return the filtered image
  }

  draw() {
    super.draw();
  }
}
