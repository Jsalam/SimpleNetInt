"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VSelectionCluster = void 0;
const main_1 = require("../main");
const vCluster_1 = require("./vCluster");
class VSelectionCluster extends vCluster_1.VCluster {
    constructor(cluster, x, y, width, height, palette) {
        super(cluster, x, y, width, height, palette);
    }
    show(renderer) {
        super.show(renderer);
        main_1.gp5.push();
        main_1.gp5.stroke(255);
        main_1.gp5.strokeWeight(4);
        main_1.gp5.noFill();
        main_1.gp5.rect(this.boundingBox[0], this.boundingBox[1], this.boundingBox[2], this.boundingBox[3]);
        main_1.gp5.pop();
    }
}
exports.VSelectionCluster = VSelectionCluster;
//# sourceMappingURL=vSelectionCluster.js.map