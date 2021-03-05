class VNode extends Button {
    constructor(node, width, height) {
        super(0, 0, width, height);
        this.node = node;
        this.color;
        this.strokeColor;
        this.paddingTop = 3;
        // observers are vConnectors
        this.vConnectors = [];
        this.vConnectorsGap = 13;
        this.node.subscribe(this);
        // events
        this.keyP_Down = false; // propagation
        this.keyD_Down = false; // deletion
    }

    subscribe(obj) {
        if (obj instanceof VConnector) this.vConnectors.push(obj);
    }

    unsubscribe(obj) {
        this.vConnectors = this.vConnectors.filter(function(subscriber) {
            let rtn = true;
            // Filter vConnectors
            if (subscriber instanceof VConnector) {

                if (subscriber.connector.equals(obj.connector)) {
                    rtn = false;
                    // console.log('unsubscribed vConnector ' + JSON.stringify(subscriber.connector.id));
                }
            }
            return rtn;
        });
    }

    /**Delete this vNode, and node and all the vConnectors, connectors and vEdges and edges referencing it */
    delete() {
        ClusterFactory.deleteNode(this);
        // Call the static method from the cluster Factory
    }

    notifyObservers(data) {
        this.vConnectors.forEach(observer => observer.fromVNode(data))
    }

    removeVConnector(conn) {
        this.vConnectors = this.vConnectors.filter(function(vCnctr) {
            let rtn = true;
            if (vCnctr.connector.equals(conn)) {

                if (vCnctr.connector.edgeObservers.length < 1) {
                    rtn = false
                }
            }
            // removes connector if false
            return rtn;
        })
    }

    // Observing to Canvas
    fromCanvas(data) {

        // notify observers
        for (const vConn of this.vConnectors) {
            vConn.fromVNode(data);
        }

        // MouseEvents
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
                // update the canvas if the mouse is over a vNode
                if (this.mouseIsOver) {
                    Canvas.update();
                };
            }
            // Keyboard events
        } else if (data.event instanceof KeyboardEvent) {
            if (data.type == "keydown") {
                if (data.event.key == 'p' || data.event.key == 'P') {
                    this.keyP_Down = true;
                }
                if (data.event.key == 'd' || data.event.key == 'D') {
                    this.keyD_Down = true;
                }
            }
            if (data.type == "keyup") {
                if (data.event.key == 'p' || data.event.key == 'P') {
                    this.keyP_Down = false;
                }
                if (data.event.key == 'd' || data.event.key == 'D') {
                    this.keyD_Down = false;
                }
            }
        }
    }

    // Observer node
    fromNode(data) {
        if (data instanceof Connector) {
            this.addVConnector(data);
        }
    }

    addVConnector(connector) {
        //console.log('new V connector');
        let tmpVConnector = new VConnector(connector);
        tmpVConnector.setColor(this.color);
        this.subscribe(tmpVConnector);
        this.updateConnectorsCoords();
    }

    resetVConnectors() {
        this.vConnectors = [];
    }

    /**
     * Remove a connector by its kind only if it has one edge linked
     * @param {} kind 
     */
    popVConnector(kind) {
        // find the vConnector observer of the parameter and remove it from the collection
        let vConnector = this.vConnectors.filter((vCnctr) => {
            return vCnctr.connector.kind == kind;
        })[0];

        console.log(vConnector);
        if (vConnector) {

            // check if there are no other edges linked to this connector
            if (vConnector.connector.edgeObservers.length <= 1) {

                // popConnectors from nodes
                this.node.popConnector(kind);

                // unsubscribe connector
                this.unsubscribe(vConnector);
                this.updateConnectorsCoords();
            }
        }
    }

    /**
     * Remove a connector regardless of the number of linked edges
     * @param {} kind
     */
    destroyVConnector(edge) {
        this.node.disconnectEdge(edge);

        // find the vConnector observer of the parameter and remove it from the collection
        let vConnector = this.vConnectors.filter((vCnctr) => {
            return vCnctr.connector.kind == edge.kind;
        })[0];

        if (vConnector) {

            // check if there are no edges linked to this connector
            if (vConnector.connector.edgeObservers.length == 0) {

                // popConnectors from nodes
                this.node.popConnector(edge.kind);

                // unsubscribe connector
                this.unsubscribe(vConnector);
                this.updateConnectorsCoords();
            }
        }

    }

    setColor(color) {
        this.color = color;
        this.setColorConnectors(this.color);
    }

    setColorConnectors(color) {
        this.vConnectors.forEach(connector => {
            connector.setColor(color);
        });
    }

    updateCoords(pos, sequence) {
        this.setPos(gp5.createVector(pos.x, pos.y + (sequence * this.height) + (sequence * this.paddingTop)));
        this.updateConnectorsCoords();
    }

    updateConnectorsCoords() {
        let counter = 1;
        let angle = (Math.PI * 2) / this.node.connectors.length;

        this.vConnectors.forEach(vConnector => {
            //vConnector.updateCoords(this.pos, counter, this.vConnectorsGap);
            if (this.node.connectors.length < 2) {
                vConnector.updateCoordsByAngle(this.pos, 0, vConnector.width / 2);
            } else {
                vConnector.updateCoordsByAngle(this.pos, angle * counter, this.width / 3);
            }
            counter++;
        });
    }

    /*** SHOW FUNCTIONS */
    show(renderer) {

        // *** FILTER ***
        // Check if any of this Node connectors matches User GUI inputs
        this.node.filterConnectors();

        // get the visual properties
        let fillColors = this._getFillColor();
        this.strokeColor = this._getStrokeColor();
        let strokeWeight = this._getStrokeWeight();

        // assign colors
        //renderer.fill(fillColors.fill);
        renderer.fill(this.color.concat('00'));
        renderer.stroke(this.strokeColor);
        renderer.strokeWeight(strokeWeight);

        // draw shape
        renderer.ellipseMode(gp5.CENTER);
        renderer.ellipse(this.pos.x, this.pos.y, this.width);

        // draw label
        if (DOM.boxChecked('showTexts')) {
            this._showLabel(renderer, fillColors.label);

            // show node description
            if (this.mouseIsOver) {
                this._showDescription(renderer);
            }
        }

        // Show connectors 
        if (this.vConnectors.length > 0) {
            for (const vCnctr of this.vConnectors) {
                vCnctr.show(renderer, fillColors.fill);

            }
        }
    }

    _showLabel(renderer, color) {
        // draw the label
        renderer.fill(color);
        renderer.noStroke();
        renderer.textSize(5);
        if (this.propagated) {
            renderer.textStyle(renderer.BOLD);
        }
        renderer.textAlign(gp5.CENTER, gp5.CENTER);
        renderer.text(this.node.label, this.pos.x - 22.5, this.pos.y + 5 + this.height / 2, 45);
        renderer.textStyle(renderer.NORMAL);

    }

    _getFillColor(_baseColor) {

        let baseColor = _baseColor;
        if (!baseColor) {
            switch (this.node.attributes.Primary_ToI) {
                case 'Technology':
                    baseColor = ColorFactory.basic.r; //red
                    break;
                case 'Methodology':
                    baseColor = ColorFactory.basic.g; // green
                    break;
                case 'Process':
                    baseColor = ColorFactory.basic.b; // blue
                    break;
                case 'Knowledge Framework':
                    baseColor = ColorFactory.basic.y; // yellow
                    break;
                default:
                    baseColor = ColorFactory.basic.k; // black
                    break;
            }
        }

        // default color 
        let fillColor = baseColor;
        let labelColor = '#000000';
        let filtered = baseColor;

        // settings. see hex table https://gist.github.com/lopspower/03fb1cc0ac9f32ef38f4
        let normal = '40'; // 60%
        let accent = 'B3'; // 70%
        let dimmed = '33'; // 20%
        // attenuate
        if (this.mouseIsOver) {
            normal = 'E6'; // 90%
            accent = 'E6'; // 90%
        }

        // *** EMPHASIZE COLOR ***
        // *** Propagation
        if (this.node.inFwdPropagation && DOM.boxChecked("forward") &&
            this.node.inBkwPropagation && DOM.boxChecked("backward")) {
            // console.log("here 1 " + this.node.label);
            fillColor = baseColor.concat(accent);
        } else if (this.node.inFwdPropagation && DOM.boxChecked("forward")) {
            // console.log("here 2 " + this.node.label);
            fillColor = baseColor.concat(accent);
        } else if (this.node.inBkwPropagation && DOM.boxChecked("backward")) {
            // console.log("here 3 " + this.node.label);
            fillColor = baseColor.concat(accent);
            // if it has no linked edges
        } else {
            //console.log("last in prop " + this.node.label);
            fillColor = baseColor.concat(normal);
        }

        // *** DIM COLOR  ***
        // *** Linked FILTER
        if ((this.vConnectors.length < 1) && DOM.boxChecked("filterLinked")) {
            fillColor = baseColor.concat(dimmed);
            labelColor = labelColor.concat(dimmed);
        }

        //if (filteredConnectors.length > 0) fillColor = filtered;
        if (this.selected) fillColor = filtered;
        return { fill: fillColor, label: labelColor };
    }

    _getStrokeColor(_baseColor) {
        let baseColor = _baseColor;
        if (!baseColor) {
            switch (this.node.attributes.Primary_ToI) {
                case 'Technology':
                    baseColor = ColorFactory.basic.r; //red
                    break;
                case 'Methodology':
                    baseColor = ColorFactory.basic.g; // green
                    break;
                case 'Process':
                    baseColor = ColorFactory.basic.b; // blue
                    break;
                case 'Knowledge Framework':
                    baseColor = ColorFactory.basic.y; // yellow
                    break;
                default:
                    baseColor = ColorFactory.basic.k; // black
                    break;
            }
        }
        // default color 
        let strokeColor = baseColor;
        let inPropagation = '#FF0000';
        let dimmed = '#FFFFFF33'; // 20% white
        let filtered = '#b400b4';

        // in propagation 
        if (this.propagated) {
            strokeColor = inPropagation;
        }

        // *** Linked filter
        if ((this.vConnectors.length < 1) && DOM.boxChecked("filterLinked")) {
            strokeColor = dimmed;
        }

        // *** filter by edge category
        //let filteredConnectors = this.node.filterConnectors();

        if (this.selected) strokeColor = filtered;

        return strokeColor;
    }

    _getStrokeWeight() {
        let weight = 1;
        // Highlight 
        if (this.propagated) {
            weight = 2;
        } else if ((this.vConnectors.length > 0) && DOM.boxChecked("filterLinked")) {
            weight = 2;
        } else {
            weight = 1;
        }
        return weight;
    }


    _showDescription(renderer) {
        renderer.fill("#000000");
        renderer.textAlign(gp5.LEFT, gp5.TOP);
        renderer.strokeWeight(0.5);
        renderer.textSize(12);
        renderer.text(this.node.label, 95, gp5.height - 80, gp5.width - 200, 97);
        renderer.noStroke();
        renderer.textSize(11);
        renderer.text(this.node.attributes.Date_or_Decade, 100, gp5.height - 62, gp5.width - 200, 97);
    }

    getJSON() {
        let cnctrs = [];
        for (const vConnector of this.vConnectors) {
            cnctrs.push(vConnector.getJSON())
        }
        let rtn = {
            id: this.node.idCat.index,
            nodeLabel: this.node.label,
            nodeDescription: this.node.description,
            nodeAttributes: this.node.attributes,
            polarity: this.node.polarity,
            connectors: cnctrs,
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
         * this is imperceptible thus the click behavior of vNodes is not as 
         * responsive as it should, but it is highly accurate ;-)
         */
        if (this.mouseIsOver && !this.dragged) {

            if (this.keyP_Down) {
                this.propagated = !this.propagated;
                this.node.propagate(this.node, this.propagated);
            } else if (this.keyD_Down) {
                this.delete();
            } else {
                // *** BEGINIG OF EDGE CREATION ***
                // instantiate edge from node 
                let bufferEdge = this.node.workOnEdgeBuffer();

                // make vEdge
                let bufferVEdge = this.workOnVEdgeBuffer(bufferEdge);

                //Add buffered elements to collections
                if (!bufferEdge.open) {
                    EdgeFactory.pushEdge(bufferEdge);
                    EdgeFactory.pushVEdge(bufferVEdge);
                    EdgeFactory.clearBuffer();
                } else {
                    // EdgeFactory.resetBuffer();
                    // recall connectors
                    // unsubscribe elements from Canvas
                }
            }
        }
        this.dragged = false;
        this.delta = undefined;
    }

    /** If you get an open edge it is becuse it does not have a target yet. 
     * @param {Edge} edge might come open or closed  
     */

    workOnVEdgeBuffer(edge) {
        let vEdge;
        if (DOM.boxChecked("edit")) {

            // if the edge does not have a target
            if (edge.open) {
                vEdge = this.sproutVEdge(edge);

                // add to buffer
                EdgeFactory.setBufferVEdge(vEdge);

            } else {
                // If the edge is closed, close the current VEdge
                vEdge = this.closeBufferedVEdge();
            }
        }

        return vEdge;
    }

    sproutVEdge(edge) {
        // generate a new vEdge
        let lastVEdge = new VEdge(edge);

        // set the source
        lastVEdge.setVSource(this);

        return lastVEdge;
    }

    closeBufferedVEdge() {
        // take the current VEdge
        let currentVEdge = EdgeFactory.getBufferVEdge();

        // set the target
        currentVEdge.setVTarget(this);

        // add to the canvas elements to be rendered on screen
        Canvas.subscribe(currentVEdge);

        return currentVEdge;
    }
}