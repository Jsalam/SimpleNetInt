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

    // Observing to Canvas
    fromCanvas(data) {

        if (data.event instanceof MouseEvent) {
            if (data.type == "mouseclick") {
                this.mouseClickedEvents();
            }
            if (data.type == "mouseup") {

            }
            if (data.type == "mousedown") {

            }
            if (data.type == "mousedrag") {
                this.mouseDraggedEvents();
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

    addPositiveVConnector(connector) {
        let tmpVConnector = new VConnector(connector);
        tmpVConnector.setColor(this.color);
        this.vPositives.push(tmpVConnector);
        Canvas.subscribe(tmpVConnector);
        this.updateConnectorsCoords();
    }

    addNegativeVConnector(connector) {
        let tmpVConnector = new VConnector(connector);
        tmpVConnector.setColor(this.color);
        this.vNegatives.push(tmpVConnector);
        Canvas.subscribe(tmpVConnector);
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
            Canvas.unsubscribe(this.vPositives[this.vPositives.length - 1]);
            this.vPositives.shift();
        } else {
            Canvas.unsubscribe(this.vNegatives[this.vNegatives.length - 1]);
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
        this.setPos(gp5.createVector(pos.x, pos.y + (sequence * this.height) + (sequence * this.categoryGap)));
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

    show(renderer) {
        renderer.strokeWeight(1);
        renderer.fill(0, 255, 0)
        renderer.ellipse(this.pos.x + this.width / 2, this.pos.y + this.height / 2, 2);
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
        //     renderer.fill(this.color.concat(accent));
        // } else if (this.node.inFwdPropagation && document.getElementById("forward").checked) {
        //     // console.log("here 2 " + this.node.label);
        //     renderer.fill(this.color.concat(accent));
        // } else if (this.node.inBkwPropagation && document.getElementById("backward").checked) {
        //     // console.log("here 3 " + this.node.label);
        //     renderer.fill(this.color.concat(accent));
        //     // if it has no linked edges
        // } else if (this.vPositives.length + this.vNegatives.length <= 2) {
        //     // console.log("here 4 " + this.node.label);
        //     renderer.fill(this.color.concat(normal));
        // } else {
        // console.log("here last " + this.node.label);
        renderer.fill(this.color.concat(normal));
        // }

        // Highlight rect
        if (this.clicked) {
            renderer.strokeWeight(2);
            renderer.stroke(200, 0, 0);
        } else {
            renderer.strokeWeight(1);
            renderer.stroke(250);
        }



        // Show linked only
        if (document.getElementById('filterLinked').checked) {
            // filter by edge number
            if ((this.node.polarity == "BOTH" && this.vPositives.length + this.vNegatives.length > 2) |
                (this.node.polarity != "BOTH" && this.vPositives.length + this.vNegatives.length > 1) &&
                document.getElementById('filterLinked').checked) {
                // draw the rect
                renderer.strokeWeight(2);
                renderer.stroke(this.color);
                //renderer.rect(this.pos.x, this.pos.y, this.width, this.height);
                renderer.ellipseMode(gp5.CENTER)
                renderer.ellipse(this.pos.x + this.width / 2, this.pos.y + this.height / 2, this.width);

                // draw the label
                renderer.fill("#000000");
                renderer.textAlign(gp5.CENTER, gp5.CENTER);
                renderer.noStroke();
                renderer.textSize(10);
                if (this.clicked) {
                    renderer.textStyle(renderer.BOLD);
                }
                renderer.text(this.node.label, this.pos.x, this.pos.y, this.width, this.height);
                renderer.textStyle(renderer.NORMAL);

                //let positives = this.getConnectors(true);
                for (let index = 0; index < this.vPositives.length; index++) {
                    const element = this.vPositives[index];
                    if (index == this.vPositives.length - 1) {
                        element.showAsButton(renderer);
                    } else {
                        element.show(renderer)
                    }
                }
                //let negatives = this.getConnectors(false);
                for (let index = 0; index < this.vNegatives.length; index++) {
                    const element = this.vNegatives[index];
                    if (index == this.vNegatives.length - 1) {
                        element.showAsButton(renderer);
                    } else {
                        element.show(renderer)
                    }
                }

                if (this.mouseIsOver) {
                    this.showDescription(renderer);
                }
            } else {
                // draw the rect
                renderer.fill(this.color.concat(dimmed));
                //renderer.rect(this.pos.x, this.pos.y, this.width, this.height);
                renderer.ellipseMode(gp5.CENTER)
                renderer.ellipse(this.pos.x + this.width / 2, this.pos.y + this.height / 2, this.width);

                // draw the label
                renderer.fill("#00000070");
                renderer.textAlign(gp5.CENTER, gp5.CENTER);
                renderer.noStroke();
                renderer.textSize(10);
                renderer.text(this.node.label, this.pos.x, this.pos.y, this.width, this.height);
                renderer.textStyle(renderer.NORMAL);
                if (this.mouseIsOver) {
                    this.showDescription(renderer);
                }
            }
        } else {
            // draw the rect
            // renderer.rect(this.pos.x, this.pos.y, this.width, this.height);
            renderer.ellipseMode(gp5.CENTER)
            renderer.ellipse(this.pos.x + this.width / 2, this.pos.y + this.height / 2, this.width);

            // draw the label
            renderer.fill("#000000");
            renderer.textAlign(gp5.CENTER, gp5.CENTER);
            renderer.noStroke();
            renderer.textSize(10);
            if (this.clicked) {
                renderer.textStyle(renderer.BOLD);
            }
            renderer.text(this.node.label, this.pos.x, this.pos.y, this.width, this.height);
            renderer.textStyle(renderer.NORMAL);

            //let positives = this.getConnectors(true);
            for (let index = 0; index < this.vPositives.length; index++) {
                const element = this.vPositives[index];
                if (index == this.vPositives.length - 1) {
                    element.showAsButton(renderer);
                } else {
                    element.show(renderer)
                }
            }
            //let negatives = this.getConnectors(false);
            for (let index = 0; index < this.vNegatives.length; index++) {
                const element = this.vNegatives[index];
                if (index == this.vNegatives.length - 1) {
                    element.showAsButton(renderer);
                } else {
                    element.show(renderer)
                }
            }

            if (this.mouseIsOver) {
                this.showDescription(renderer);
            }

        }
    }

    showDescription(renderer) {
        renderer.fill("#000000");
        renderer.textAlign(gp5.LEFT, gp5.TOP);
        renderer.strokeWeight(0.5);
        renderer.textSize(12);
        renderer.text(this.node.label, 95, gp5.height - 80, gp5.width - 200, 97);
        renderer.noStroke();
        renderer.textSize(11);
        renderer.text(this.node.description, 100, gp5.height - 62, gp5.width - 200, 97);

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

    mouseDraggedEvents() {
        if (this.delta == undefined) {
            this.delta = this.getDeltaMouse();
        }
        if (this.mouseIsOver) {
            this.dragged = true;
            this.pos.x = Canvas._mouse.x - this.delta.x;
            this.pos.y = Canvas._mouse.y - this.delta.y;
            this.updateConnectorsCoords()
        }
    }

    mouseClickedEvents() {
        /** Note: this.dragged is true at the slightest drag motion. Sometimes 
         * this is imperceptible thus the behavior is not as responsive as it should 
         */
        if (this.mouseIsOver && !this.dragged) {
            this.clicked = !this.clicked;
            this.node.propagate(this.node, this.clicked);
        }
        this.dragged = false;
        this.delta = undefined;

        // this.vPositives.forEach(connector => {
        //     connector.mouseClickedEvents();
        // });
        // this.vNegatives.forEach(connector => {
        //     connector.mouseClickedEvents();
        // });
    }

}