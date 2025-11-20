"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Button = void 0;
var main_1 = require("../main");
var canvas_1 = require("../canvas/canvas");
/**
 * Base class for nodes, connectors or any other visual element with an area.
 */
var Button = /** @class */ (function () {
    function Button(posX, posY, width, height) {
        this.pos = main_1.gp5.createVector(posX, posY, 0);
        this.width = width;
        this.height = height;
        this.mouseIsOver = false;
        this.clicked = false;
        this.dragged = false;
        this.delta = undefined;
        this.selected = false;
        // this is true when the Transformer has affected the coordinates of this object. It turns to false when the Tranformer has been reset.
        this.transformed = false;
        this.localScale = 1;
        this.visible = true;
    }
    Button.prototype.show = function (renderer, fillColor, strokeColor) {
        if (!this.mouseIsOver) {
            main_1.gp5.noFill();
        }
        else {
            main_1.gp5.fill("#F0F0F080");
        }
        main_1.gp5.rect(this.pos.x, this.pos.y, this.width, this.height);
    };
    Button.prototype.setPos = function (pos) {
        this.pos = pos;
    };
    Button.prototype.setX = function (xpos) {
        this.pos.x = xpos;
    };
    Button.prototype.setY = function (ypos) {
        this.pos.y = ypos;
    };
    Button.prototype.setHeight = function (h) {
        this.height = h;
    };
    Button.prototype.setWidth = function (w) {
        this.width = w;
    };
    Button.prototype.mouseOver = function (data) {
        var mousWasOver = this.mouseIsOver;
        if (this.visible) {
            this.mouseIsOver = false;
            if (canvas_1.Canvas._mouse.x > this.pos.x - (this.width * this.localScale) / 2 &&
                canvas_1.Canvas._mouse.x < this.pos.x + (this.width * this.localScale) / 2 &&
                canvas_1.Canvas._mouse.y > this.pos.y - (this.height * this.localScale) / 2 &&
                canvas_1.Canvas._mouse.y < this.pos.y + (this.height * this.localScale) / 2) {
                this.mouseIsOver = true;
            }
        }
        else {
            this.mouseIsOver = false;
        }
        if (mousWasOver !== this.mouseIsOver) {
            if (this.mouseIsOver) {
                this.notifyObservers({
                    event: new MouseEvent("mouseover"),
                    type: "mouseIsOver",
                    pos: data.pos,
                });
            }
            else {
                this.notifyObservers({
                    event: new MouseEvent("mouseout"),
                    type: "mouseIsOut",
                    pos: data.pos,
                });
            }
        }
    };
    Button.prototype.notifyObservers = function (data) { };
    Button.prototype.getDeltaMouse = function () {
        var rtn = main_1.gp5.createVector(0, 0);
        if (this.mouseIsOver) {
            rtn.x = canvas_1.Canvas._mouse.x - this.pos.x;
            rtn.y = canvas_1.Canvas._mouse.y - this.pos.y;
        }
        return rtn;
    };
    Button.prototype.getDistToMouse = function () {
        return main_1.gp5.dist(canvas_1.Canvas._mouse.x, canvas_1.Canvas._mouse.y, this.pos.x, this.pos.y);
    };
    return Button;
}());
exports.Button = Button;
