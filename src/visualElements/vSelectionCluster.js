"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.VSelectionCluster = void 0;
var main_1 = require("../main");
var vCluster_1 = require("./vCluster");
var VSelectionCluster = /** @class */ (function (_super) {
    __extends(VSelectionCluster, _super);
    function VSelectionCluster(cluster, x, y, width, height, palette) {
        return _super.call(this, cluster, x, y, width, height, palette) || this;
    }
    VSelectionCluster.prototype.show = function (renderer) {
        _super.prototype.show.call(this, renderer);
        main_1.gp5.push();
        main_1.gp5.stroke(255);
        main_1.gp5.strokeWeight(4);
        main_1.gp5.noFill();
        main_1.gp5.rect(this.boundingBox[0], this.boundingBox[1], this.boundingBox[2], this.boundingBox[3]);
        main_1.gp5.pop();
    };
    return VSelectionCluster;
}(vCluster_1.VCluster));
exports.VSelectionCluster = VSelectionCluster;
