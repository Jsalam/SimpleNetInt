class Button {
    constructor(posX, posY, width, height) {
        this.pos = gp5.createVector(posX, posY);
        this.width = width;
        this.height = height;
        this.mouseIsOver = false;
        this.clicked = false;
        this.dragged = false;
        this.delta = undefined;
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
        this.pos.y = ypos
    }

    setHeight(h) {
        this.height = h;
    }

    setWidth(w) {
        this.width = w;
    }

    mouseOver() {
        if (Canvas._mouse.x > this.pos.x &&
            Canvas._mouse.x < this.pos.x + this.width &&
            Canvas._mouse.y > this.pos.y &&
            Canvas._mouse.y < this.pos.y + this.height) {
            this.mouseIsOver = true;
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
}