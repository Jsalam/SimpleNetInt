/**
 * Base class for nodes, connectors or any other visual element with an area.
 */
class Button {
  constructor(posX, posY, width, height) {
    this.pos = gp5.createVector(posX, posY, 0);
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

  show() {
    if (!this.mouseIsOver) {
      gp5.noFill();
    } else {
      gp5.fill("#F0F0F080");
    }

    gp5.rect(this.pos.x, this.pos.y, this.width, this.height);
  }

  setPos(pos) {
    this.pos = pos;
  }

  setX(xpos) {
    this.pos.x = xpos;
  }

  setY(ypos) {
    this.pos.y = ypos;
  }

  setHeight(h) {
    this.height = h;
  }

  setWidth(w) {
    this.width = w;
  }

  mouseOver() {
    if (this.visible) {
      this.mouseIsOver = false;
      if (
        Canvas._mouse.x > this.pos.x - (this.width * this.localScale) / 2 &&
        Canvas._mouse.x < this.pos.x + (this.width * this.localScale) / 2 &&
        Canvas._mouse.y > this.pos.y - (this.height * this.localScale) / 2 &&
        Canvas._mouse.y < this.pos.y + (this.height * this.localScale) / 2
      ) {
        this.mouseIsOver = true;
      }
    } else {
      this.mouseIsOver = false;
    }
  }

  getDeltaMouse() {
    let rtn = gp5.createVector(0, 0);
    if (this.mouseIsOver) {
      rtn.x = Canvas._mouse.x - this.pos.x;
      rtn.y = Canvas._mouse.y - this.pos.y;
    }
    return rtn;
  }

  getDistToMouse() {
    return gp5.dist(Canvas._mouse.x, Canvas._mouse.y, this.pos.x, this.pos.y);
  }
}
