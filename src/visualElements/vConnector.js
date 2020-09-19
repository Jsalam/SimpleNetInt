class VConnector extends Button {
    constructor(connector) {
        super(0, 0, 10, 10);
        this.connector = connector;
        this.color = '#d4d4d4';
        connector.subscribeVConnector(this);
    }

    // Observing connector
    getData(data) {
        // do domething
    }

    // Observing to Canvas
    fromVNode(data) {

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
                this.mouseOver();
            }
            // do something
        } else if (data.event instanceof KeyboardEvent) {
            // do something
        } else {
            // do something
        }
    }

    setColor(color) {
        this.color = color;
    }

    updateCoords(pos, sequence, height) {
        this.setPos(gp5.createVector(pos.x - this.width, pos.y + (sequence * height)));
        this.setHeight(height);
    }

    updateCoordsByAngle(center, angle, radius) {

        let x = Math.cos(angle) * (radius - this.width / 2);
        let y = Math.sin(angle) * (radius - this.width / 2);

        this.setPos(gp5.createVector(center.x + x, center.y + y));
    }

    show(renderer, fillColor) {
        renderer.ellipseMode(gp5.CENTER);
        renderer.fill(fillColor);
        renderer.stroke(this.color);
        //renderer.rect(this.pos.x, this.pos.y, this.width, this.height);
        renderer.ellipse(this.pos.x, this.pos.y, this.width)
            // label
        renderer.textSize(5);
        renderer.textAlign(gp5.RIGHT, gp5.CENTER);
        renderer.fill('#000000');
        renderer.noStroke();
        renderer.text(this.connector.kind, this.pos.x - 2, this.pos.y);
    }

    showAsButton(renderer) {
        renderer.ellipseMode(gp5.CENTER);
        // in case the color palette runs out of colors
        if (!this.color) {
            this.color = '#d4d4d4';
        }
        renderer.fill(this.color.concat('ff'));
        renderer.stroke(200);
        if (this.mouseIsOver) {
            renderer.stroke("#333333")
        } else {
            renderer.stroke(this.color)
        }
        // renderer.rect(this.pos.x, this.pos.y, this.width, this.height);
        renderer.ellipse(this.pos.x + this.width / 2, this.pos.y, this.width)
        renderer.textAlign(gp5.CENTER, gp5.CENTER);
        renderer.fill('#000000');
        renderer.stroke('#000000');
        renderer.text('+', this.pos.x, this.pos.y);
    }

    getJSON() {
        return this.connector.kind;
    }
}