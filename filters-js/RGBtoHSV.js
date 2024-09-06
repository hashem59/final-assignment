import FilterBase from "./FilterBase.js";
export default class RGBtoHSV extends FilterBase {
  constructor(...attrs) {
    super(...attrs);
  }

  applyFilters() {
    this.img.loadPixels();
    this.imgOut.loadPixels();
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        let index = (x + y * this.w) * 4;
        const { h, s, v } = this.rgbToHsv(
          this.img.pixels[index + 0],
          this.img.pixels[index + 1],
          this.img.pixels[index + 2]
        );
        this.imgOut.pixels[index + 0] = map(h, 0, 360, 0, 255);
        this.imgOut.pixels[index + 1] = map(s, 0, 100, 0, 255);
        this.imgOut.pixels[index + 2] = map(v, 0, 100, 0, 255);
        this.imgOut.pixels[index + 3] = this.img.pixels[index + 3];
      }
    }
    this.imgOut.updatePixels();
    return this.imgOut;
  }

  rgbToHsv(R, G, B) {
    // Normalize the RGB values to the range 0-1
    let r = R / 255;
    let g = G / 255;
    let b = B / 255;

    // Find the maximum and minimum values among r, g, b
    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);

    // Calculate the value (V)
    let v = max;

    // Calculate the saturation (S)
    let s = max === 0 ? 0 : (max - min) / max;

    // Calculate the hue (H)
    let h = 0;
    if (max === min) {
      h = 0; // Achromatic (grey)
    } else if (max === r) {
      h = (60 * ((g - b) / (max - min)) + 360) % 360;
    } else if (max === g) {
      h = (60 * ((b - r) / (max - min)) + 120) % 360;
    } else if (max === b) {
      h = (60 * ((r - g) / (max - min)) + 240) % 360;
    }

    // Return the HSV values
    return {
      h: h,
      s: s * 100, // Saturation in percentage
      v: v * 100, // Value in percentage
    };
  }

  draw() {
    super.draw();
  }
}
