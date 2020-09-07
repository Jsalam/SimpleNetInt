class VConnector extends Button {
    constructor(connector) {
        super(0, 0, 10, 0);
        this.connector = connector;
        this.color = '#d4d4d4';
        connector.subscribeVConnector(this);
    }

    // Observing connector
    getData(data) {
        // do domething
    }

    // Observing to Canvas
    fromCanvas(data) {

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

    updateCoords(pos, catWidth, sequence, height) {
        if (this.connector.polarity == true) {
            // right
            this.setPos(gp5.createVector(pos.x + catWidth, pos.y + (sequence * height)));
        } else {
            // left
            this.setPos(gp5.createVector(pos.x - this.width, pos.y + (sequence * height)));
        }
        this.setHeight(height);
    }

    show(builder) {
        builder.noFill();
        builder.stroke(this.color);
        //builder.rect(this.pos.x, this.pos.y, this.width, this.height);
        builder.ellipse(this.pos.x + this.width / 2, this.pos.y + this.height / 2, this.width)
            // label
        builder.textAlign(gp5.RIGHT, gp5.CENTER);
        builder.fill('#000000');
        builder.stroke('#000000');
        builder.text(this.connector.kind, this.pos.x - 2, this.pos.y + this.height / 2);
    }

    showAsButton(builder) {
        // in case the color palette runs out of colors
        if (!this.color) {
            this.color = '#d4d4d4';
        }
        builder.fill(this.color.concat('ff'));
        builder.stroke(200);
        if (this.mouseIsOver) {
            builder.stroke("#333333")
        } else {
            builder.stroke(this.color)
        }
        // builder.rect(this.pos.x, this.pos.y, this.width, this.height);
        builder.ellipse(this.pos.x + this.width / 2, this.pos.y + this.height / 2, this.width)
        builder.textAlign(gp5.CENTER, gp5.CENTER);
        builder.fill('#000000');
        builder.stroke('#000000');
        builder.text('+', this.pos.x + this.width / 2, this.pos.y + this.height / 2);
    }
}