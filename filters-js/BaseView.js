import FilterBase from "./FilterBase.js";
export default class BaseView extends FilterBase {
  constructor(...attrs) {
    console.log("BaseView", ...attrs);
    super(...attrs);
  }

  draw() {
    super.draw();
  }
}
