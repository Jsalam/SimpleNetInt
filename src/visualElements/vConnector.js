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
exports.VConnector = void 0;
var button_1 = require("./button");
var main_1 = require("../main");
var VConnector = /** @class */ (function (_super) {
    __extends(VConnector, _super);
    function VConnector(connector) {
        var _this = _super.call(this, 0, 0, 10, 10) || this;
        _this.connector = connector;
        _this.color = "#d4d4d4";
        connector.subscribeVConnector(_this);
        return _this;
    }
    // Observing connector
    VConnector.prototype.getData = function (data) {
        // do domething
    };
    // Observing to Canvas
    VConnector.prototype.fromVNode = function (data) {
        if (data.event instanceof MouseEvent) {
            if (data.type == "mouseup") {
                // do something
            }
            if (data.type == "mousedown") {
                // do something
            }
            if (data.type == "mousedrag") {
                // do something
            }
            if (data.type == "mousemove") {
                this.mouseOver(data);
            }
            if (data.type == "mousewheel") {
            }
            // do something
        }
        else if (data.event instanceof KeyboardEvent) {
            // do something
        }
        else {
            // do something
        }
    };
    VConnector.prototype.setColor = function (color) {
        this.color = color;
    };
    VConnector.prototype.updateCoords = function (pos, sequence, height) {
        this.setPos(main_1.gp5.createVector(pos.x - this.width, pos.y + sequence * height));
        this.setHeight(height);
        this.setWidth(height);
    };
    VConnector.prototype.updateCoordsByAngle = function (center, angle, radius) {
        var x = Math.cos(angle) * (radius - this.width / 2);
        var y = Math.sin(angle) * (radius - this.width / 2);
        this.setPos(main_1.gp5.createVector(center.x + x, center.y + y));
    };
    VConnector.prototype.show = function (renderer, fillColor, strokeColor) {
        renderer.ellipseMode(main_1.gp5.CENTER);
        // Fill color
        if (typeof fillColor === "string") {
            fillColor = renderer.color(fillColor);
        }
        renderer.fill(fillColor);
        renderer.stroke(fillColor);
        // Stroke color
        if (typeof strokeColor === "string") {
            strokeColor = renderer.color(strokeColor);
        }
        if (strokeColor)
            renderer.stroke(strokeColor);
        //renderer.rect(this.pos.x, this.pos.y, this.width, this.height);
        // let radius =  * Number(DOM.sliders.nodeSizeFactor.value);
        // if (radius < 3) radius = 3;
        renderer.ellipse(this.pos.x, this.pos.y, this.width);
        // label
        // renderer.textSize(5);
        // renderer.textAlign(gp5.RIGHT, gp5.CENTER);
        // renderer.fill('#000000');
        // renderer.noStroke();
        //renderer.text(this.connector.kind, this.pos.x - 2, this.pos.y);
    };
    VConnector.prototype.getJSON = function () {
        return this.connector.kind;
    };
    return VConnector;
}(button_1.Button));
exports.VConnector = VConnector;
