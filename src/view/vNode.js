class VNode extends Button {
    constructor(node, width, height) {
        super(0, 0, width, height);
        this.node = node;
        this.color = '#adadad';
        this.categoryGap = 5;
        this.vPositives = [];
        this.vNegatives = [];
        this.node.subscribe(this);
    }

    addPositiveVConnector(connector) {
        let tmpVConnector = new VConnector(connector);
        tmpVConnector.setColor(this.color);
        this.vPositives.push(tmpVConnector);
        this.updateConnectorsCoords();
    }

    addNegativeVConnector(connector) {
        let tmpVConnector = new VConnector(connector);
        tmpVConnector.setColor(this.color);
        this.vNegatives.push(tmpVConnector);
        this.updateConnectorsCoords();
    }

    resetVConnectors() {
        this.vPositives = [];
        this.vNegatives = [];
        if (this.node.polarity == "RIGHT") {
            this.addPositiveVConnector(this.node.positives[0]);
        }
        if (this.node.polarity == "LEFT") {
            this.addNegativeVConnector(this.node.negatives[0]);
        }
        if (this.node.polarity == "BOTH") {
            this.addPositiveVConnector(this.node.positives[0]);
            this.addNegativeVConnector(this.node.negatives[0]);
        }
    }

    popLastVConnector(polarity) {
        if (polarity == true) {
            this.vPositives.shift();
        } else {
            this.vNegatives.shift();
        }
        this.updateConnectorsCoords();
    }

    setColor(color) {
        this.color = color;
        this.setColorConnectors(this.color);
    }

    setColorConnectors(color) {
        this.vPositives.forEach(connector => {
            connector.setColor(color);
        });
        this.vNegatives.forEach(connector => {
            connector.setColor(color);
        });
    }

    updateCoords(pos, sequence) {
        this.setPos(globalP5.createVector(pos.x, pos.y + (sequence * this.height) + (sequence * this.categoryGap)));
        this.updateConnectorsCoords();
    }

    updateConnectorsCoords() {
        // right
        let counter = 0;
        //let positives = this.getConnectors(true);
        this.vPositives.forEach(connector => {
            connector.updateCoords(this.pos, this.width, counter, this.height / this.vPositives.length);
            counter++;
        });
        // left
        counter = 0;
        //let negatives = this.getConnectors(false);
        this.vNegatives.forEach(connector => {
            connector.updateCoords(this.pos, this.width, counter, this.height / this.vNegatives.length);
            counter++;
        });
    }

    show(builder) {
        builder.strokeWeight(1);
        // in case the color palette runs out of colors
        if (!this.color) {
            this.color = '#d4d4d4';
        }
        let normal = 40;
        let accent = 80;
        let dimmed = 10;
        if (this.mouseIsOver) {
            accent += 19;
            normal += 19;
        }
        // if (this.node.inFwdPropagation && document.getElementById("forward").checked &&
        //     this.node.inBkwPropagation && document.getElementById("backward").checked) {
        //     // console.log("here 1 " + this.node.label);
        //     builder.fill(this.color.concat(accent));
        // } else if (this.node.inFwdPropagation && document.getElementById("forward").checked) {
        //     // console.log("here 2 " + this.node.label);
        //     builder.fill(this.color.concat(accent));
        // } else if (this.node.inBkwPropagation && document.getElementById("backward").checked) {
        //     // console.log("here 3 " + this.node.label);
        //     builder.fill(this.color.concat(accent));
        //     // if it has no linked edges
        // } else if (this.vPositives.length + this.vNegatives.length <= 2) {
        //     // console.log("here 4 " + this.node.label);
        //     builder.fill(this.color.concat(normal));
        // } else {
        // console.log("here last " + this.node.label);
        builder.fill(this.color.concat(normal));
        // }

        // Highlight rect
        if (this.clicked) {
            builder.strokeWeight(2);
            builder.stroke(200, 0, 0);
        } else {
            builder.strokeWeight(1);
            builder.stroke(250);
        }

        // Show linked only
        if (document.getElementById('filterLinked').checked) {
            // filter by edge number
            if ((this.node.polarity == "BOTH" && this.vPositives.length + this.vNegatives.length > 2) |
                (this.node.polarity != "BOTH" && this.vPositives.length + this.vNegatives.length > 1) &&
                document.getElementById('filterLinked').checked) {
                // draw the rect
                builder.strokeWeight(2);
                builder.stroke(this.color);
                //builder.rect(this.pos.x, this.pos.y, this.width, this.height);
                builder.ellipseMode(globalP5.CENTER)
                builder.ellipse(this.pos.x + this.width / 2, this.pos.y + this.height / 2, this.width);

                // draw the label
                builder.fill("#000000");
                builder.textAlign(globalP5.CENTER, globalP5.CENTER);
                builder.noStroke();
                builder.textSize(10);
                if (this.clicked) {
                    builder.textStyle(builder.BOLD);
                }
                builder.text(this.node.label, this.pos.x, this.pos.y, this.width, this.height);
                builder.textStyle(builder.NORMAL);

                //let positives = this.getConnectors(true);
                for (let index = 0; index < this.vPositives.length; index++) {
                    const element = this.vPositives[index];
                    if (index == this.vPositives.length - 1) {
                        element.showAsButton(builder);
                    } else {
                        element.show(builder)
                    }
                }
                //let negatives = this.getConnectors(false);
                for (let index = 0; index < this.vNegatives.length; index++) {
                    const element = this.vNegatives[index];
                    if (index == this.vNegatives.length - 1) {
                        element.showAsButton(builder);
                    } else {
                        element.show(builder)
                    }
                }

                if (this.mouseIsOver) {
                    this.showDescription(builder);
                }
            } else {
                // draw the rect
                builder.fill(this.color.concat(dimmed));
                //builder.rect(this.pos.x, this.pos.y, this.width, this.height);
                builder.ellipseMode(globalP5.CENTER)
                builder.ellipse(this.pos.x + this.width / 2, this.pos.y + this.height / 2, this.width);

                // draw the label
                builder.fill("#00000070");
                builder.textAlign(globalP5.CENTER, globalP5.CENTER);
                builder.noStroke();
                builder.textSize(10);
                builder.text(this.node.label, this.pos.x, this.pos.y, this.width, this.height);
                builder.textStyle(builder.NORMAL);
                if (this.mouseIsOver) {
                    this.showDescription(builder);
                }
            }
        } else {
            // draw the rect
            // builder.rect(this.pos.x, this.pos.y, this.width, this.height);
            builder.ellipseMode(globalP5.CENTER)
            builder.ellipse(this.pos.x + this.width / 2, this.pos.y + this.height / 2, this.width);

            // draw the label
            builder.fill("#000000");
            builder.textAlign(globalP5.CENTER, globalP5.CENTER);
            builder.noStroke();
            builder.textSize(10);
            if (this.clicked) {
                builder.textStyle(builder.BOLD);
            }
            builder.text(this.node.label, this.pos.x, this.pos.y, this.width, this.height);
            builder.textStyle(builder.NORMAL);

            //let positives = this.getConnectors(true);
            for (let index = 0; index < this.vPositives.length; index++) {
                const element = this.vPositives[index];
                if (index == this.vPositives.length - 1) {
                    element.showAsButton(builder);
                } else {
                    element.show(builder)
                }
            }
            //let negatives = this.getConnectors(false);
            for (let index = 0; index < this.vNegatives.length; index++) {
                const element = this.vNegatives[index];
                if (index == this.vNegatives.length - 1) {
                    element.showAsButton(builder);
                } else {
                    element.show(builder)
                }
            }

            if (this.mouseIsOver) {
                this.showDescription(builder);
            }

        }
    }

    showDescription(builder) {
        builder.fill("#000000");
        builder.textAlign(globalP5.LEFT, globalP5.TOP);
        builder.strokeWeight(0.5);
        builder.textSize(12);
        builder.text(this.node.label, 95, globalP5.height - 80, globalP5.width - 200, 97);
        builder.noStroke();
        builder.textSize(11);
        builder.text(this.node.description, 100, globalP5.height - 62, globalP5.width - 200, 97);

    }

    getJSON() {
        let rtn = {
            id: this.node.idCat.index,
            nodeLabel: this.node.label,
            nodeDescription: this.node.description,
            polarity: this.node.polarity,
            pajekIndex: this.node.idCat.pajekIndex,
            vNode: {
                posX: this.pos.x,
                posY: this.pos.y,
                posZ: this.pos.z,
                color: this.color
            }
        }
        return rtn;
    }

    // **** EVENTS *****

    mouseMovedEvents() {
        // if (this.clicked) {
        //     this.node.propagate(this.node, this.clicked);
        // }
    }

    mouseOverEvents() {

    }

    mouseDraggedEvents() {
        if (this.delta == undefined) {
            this.delta = this.getDeltaMouse();
        }
        if (this.mouseIsOver) {
            this.dragged = true;
            this.pos.x = globalP5.mouseX - this.delta.x;
            this.pos.y = globalP5.mouseY - this.delta.y;
            this.updateConnectorsCoords()
        }
    }

    mouseClickedEvents() {
        if (this.mouseIsOver && !this.dragged) {
            this.clicked = !this.clicked;
            this.node.propagate(this.node, this.clicked);
        }
        this.dragged = false;
        this.deltaMouse == undefined;
        this.vPositives.forEach(connector => {
            connector.mouseClickedEvents();
        });
        this.vNegatives.forEach(connector => {
            connector.mouseClickedEvents();
        });
    }

}