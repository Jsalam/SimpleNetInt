class VConnector extends Button {
    constructor(connector) {
        super(0, 0, 10, 0);
        this.connector = connector;
        this.color = '#d4d4d4';
        connector.subscribeVConnector(this);
    }

    // Observing to Canvas
    fromCanvas(data) {

        if (data.event instanceof MouseEvent) {
            if (data.type == "mouseup") {
                // do something
            }
            if (data.type == "mousedown") {
                this.mouseClickedEvents();
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
        builder.fill(this.color);
        builder.stroke(this.color);
        //builder.rect(this.pos.x, this.pos.y, this.width, this.height);
        builder.ellipse(this.pos.x + this.width / 2, this.pos.y + this.height / 2, this.width)
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


    workOnLastVEdge(edge) {

        let lastVEdge;
        if (document.getElementById("edit").checked) {

            // get the last edge in edges collection.
            lastVEdge = EdgeFactory.vEdges.slice(-1)[0];

            // If there is at least one edge
            if (lastVEdge) {
                if (lastVEdge.open) {

                    if (EdgeFactory.edges[EdgeFactory.edges.length - 1] == edge) {
                        lastVEdge.setVTarget(this);
                        lastVEdge.open = false;
                    } else {
                        EdgeFactory.vEdges.pop();
                    }
                    // if edge does not link nodes in the same cluster
                    if (edge.source.id.cluster != this.connector.id.cluster) {
                        // check connectors polarity
                        if (this.connector.polarity != edge.source.polarity) {
                            lastVEdge.setVTarget(this);
                            lastVEdge.open = false;
                        }
                    }

                } else {
                    lastVEdge = new VEdge(edge);
                    lastVEdge.setVSource(this);
                    lastVEdge.open = true;
                    Canvas.subscribe(lastVEdge);
                    EdgeFactory.vEdges.push(lastVEdge);

                }
            } else {
                // create the first edge
                lastVEdge = new VEdge(edge);
                lastVEdge.setVSource(this);
                lastVEdge.open = true;
                Canvas.subscribe(lastVEdge);
                EdgeFactory.vEdges.push(lastVEdge);
            }
        }
    }

    mouseClickedEvents() {
        if (this.mouseIsOver) {
            console.log("on connector");
            let edge = this.connector.workOnLastEdge();
            this.connector.notifyObserver(edge);
            this.workOnLastVEdge(edge);
        }
    }
}