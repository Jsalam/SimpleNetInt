class Button {
    constructor(posX, posY, width, height) {
        this.pos = globalP5.createVector(posX, posY);
        this.width = width;
        this.height = height;
        this.mouseIsOver = false;
        this.clicked = false;
        this.dragged = false;
        this.delta = undefined;
    }

    show() {
        if (!this.mouseIsOver) {
            globalP5.noFill();
        } else {
            globalP5.fill("#F0F0F080");
        }

        globalP5.rect(this.pos.x, this.pos.y, this.width, this.height);
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
        if (globalP5.mouseX > this.pos.x &&
            globalP5.mouseX < this.pos.x + this.width &&
            globalP5.mouseY > this.pos.y &&
            globalP5.mouseY < this.pos.y + this.height) {
            this.mouseIsOver = true;
        } else {
            this.mouseIsOver = false;
        }
    }

    getDeltaMouse() {
        let rtn = globalP5.createVector(0, 0);
        if (this.mouseIsOver) {
            rtn.x = globalP5.mouseX - this.pos.x;
            rtn.y = globalP5.mouseY - this.pos.y;
        }
        return rtn;
    }
}