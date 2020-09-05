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
        if (gp5.mouseX > this.pos.x &&
            gp5.mouseX < this.pos.x + this.width &&
            gp5.mouseY > this.pos.y &&
            gp5.mouseY < this.pos.y + this.height) {
            this.mouseIsOver = true;
        } else {
            this.mouseIsOver = false;
        }
    }

    getDeltaMouse() {
        let rtn = gp5.createVector(0, 0);
        if (this.mouseIsOver) {
            rtn.x = gp5.mouseX - this.pos.x;
            rtn.y = gp5.mouseY - this.pos.y;
            console.log(rtn);
        }
        return rtn;
    }
}