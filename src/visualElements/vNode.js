"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VNode = void 0;
const p5_1 = __importDefault(require("p5"));
const main_1 = require("../main");
const vConnector_1 = require("./vConnector");
const canvas_1 = require("../canvas/canvas");
const connector_1 = require("../graphElements/connector");
const DOMManager_1 = require("../GUI/DOM/DOMManager");
const button_1 = require("./button");
const clusterFactory_1 = require("../factories/clusterFactory");
const transformerFactory_1 = require("../factories/transformerFactory");
const colorFactory_1 = require("../factories/colorFactory");
const edgeFactory_1 = require("../factories/edgeFactory");
const vEdge_1 = require("./vEdge");
const VirtualElementPool_1 = require("./VirtualElementPool");
const item_1 = require("../GUI/widgets/listWidget/item");
const injections_1 = require("../utilities/injections");
class VNode extends button_1.Button {
    parentVCluster;
    shouldShowText = true;
    shouldShowButton = true;
    node;
    color;
    strokeColor;
    paddingTop;
    diam;
    shiftPos;
    vConnectors;
    vConnectorsGap;
    keyP_Down;
    keyD_Down;
    tr;
    labelEl;
    descriptionEl;
    propagated;
    observerListItems;
    constructor(node, width, height, parentVCluster = null) {
        super(0, 0, width, height);
        this.parentVCluster = parentVCluster;
        this.node = node;
        this.color;
        this.strokeColor;
        this.paddingTop = 3;
        // for magnifying glass2
        this.diam = width;
        this.shiftPos = main_1.gp5.createVector(0, 0);
        // observers are vConnectors
        this.vConnectors = [];
        this.vConnectorsGap = 11;
        this.node.subscribe(this);
        // events
        this.keyP_Down = false;
        this.keyD_Down = false; // deletion
        // *** TRANSFORMATIONS ***
        this.tr;
        // *** SORTING LIST ***
        this.observerListItems = [];
    }
    subscribe(obj) {
        if (obj instanceof vConnector_1.VConnector)
            this.vConnectors.push(obj);
        if (obj instanceof item_1.Item)
            this.observerListItems.push(obj);
    }
    unsubscribe(obj) {
        console.log(obj);
        this.vConnectors = this.vConnectors.filter(function (subscriber) {
            let rtn = true;
            // Filter vConnectors
            if (subscriber instanceof vConnector_1.VConnector) {
                if (subscriber.connector.equals(obj.connector)) {
                    rtn = false;
                    console.log("unsubscribed vConnector " +
                        JSON.stringify(subscriber.connector.id));
                }
            }
            return rtn;
        });
    }
    /**Delete this vNode, and node and all the vConnectors, connectors and vEdges and edges referencing it */
    delete() {
        clusterFactory_1.ClusterFactory.deleteNode(this);
        // Call the static method from the cluster Factory
    }
    notifyObservers(data) {
        this.vConnectors.forEach((observer) => observer.fromVNode(data));
        this.observerListItems.forEach((observer) => observer.fromVNode(data));
    }
    removeVConnector(conn) {
        this.vConnectors = this.vConnectors.filter(function (vCnctr) {
            let rtn = true;
            if (vCnctr.connector.equals(conn)) {
                if (vCnctr.connector.edgeObservers.length < 1) {
                    rtn = false;
                }
            }
            // removes connector if false
            return rtn;
        });
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
                this.mouseClickedEvents(data);
            }
            if (data.type == "mouseup") {
            }
            if (data.type == "mousedown") {
            }
            if (data.type == "mousedrag") {
                this.mouseDraggedEvents();
            }
            if (data.type == "mousemove") {
                this.mouseOver(data);
                // // update the canvas if the mouse is over a vNode
                if (this.mouseIsOver) {
                    canvas_1.Canvas.update();
                }
                // MAGNIFYING EFFECT
                if (DOMManager_1.DOM.boxChecked("magnifyingEffect")) {
                    //&& this.getDistToMouse() < 200) {
                    this.computeMagnifyingEffect();
                    canvas_1.Canvas.update();
                }
            }
            if (data.type == "mousewheel") {
            }
            // Keyboard events
        }
        else if (data.event instanceof KeyboardEvent) {
            if (data.type == "keydown") {
                if (data.event.key == "p" || data.event.key == "P") {
                    this.keyP_Down = true;
                }
                if (data.event.key == "d" || data.event.key == "D") {
                    this.keyD_Down = true;
                }
            }
            if (data.type == "keyup") {
                if (data.event.key == "p" || data.event.key == "P") {
                    this.keyP_Down = false;
                }
                if (data.event.key == "d" || data.event.key == "D") {
                    this.keyD_Down = false;
                }
            }
        }
        // A VNode can handle a (mouse) event iff the mouse is over it
        return this.mouseIsOver;
    }
    // Observer node
    fromNode(data) {
        if (data instanceof connector_1.Connector) {
            this.addVConnector(data);
        }
    }
    addVConnector(connector) {
        //console.log('new V connector');
        let tmpVConnector = new vConnector_1.VConnector(connector);
        tmpVConnector.setColor(this.color);
        this.subscribe(tmpVConnector);
        this.updateConnectorsCoords();
        // return tmpVConnector;
    }
    resetVConnectors() {
        this.vConnectors = [];
    }
    /**
     * Remove a connector by its kind
     * @param {} kind
     */
    popVConnector(kind) {
        // find the vConnector observer of the parameter and remove it from the collection
        let vConnector = this.vConnectors.filter((vCnctr) => {
            return vCnctr.connector.kind == kind;
        })[0];
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
        this.vConnectors.forEach((connector) => {
            connector.setColor(color);
        });
    }
    updateCoords(pos, sequence) {
        this.setPos(main_1.gp5.createVector(pos.x, pos.y + sequence * this.height + sequence * this.paddingTop));
        this.updateConnectorsCoords();
    }
    updateConnectorsCoords(newPos, nodeSize) {
        let counter = 1;
        let angle = (Math.PI * 2) / this.node.connectors.length;
        this.vConnectors.forEach((vConnector) => {
            vConnector.setWidth(nodeSize * Number(DOMManager_1.DOM.sliders.nodeSizeFactor.value));
            // When there is only one connector
            if (this.node.connectors.length <= 1) {
                if (newPos) {
                    vConnector.updateCoordsByAngle(newPos, 0, vConnector.width / 2);
                }
                else {
                    vConnector.updateCoordsByAngle(this.pos, 0, vConnector.width / 2);
                }
                // When there two or more connectors
            }
            else {
                if (newPos) {
                    vConnector.updateCoordsByAngle(newPos, angle * counter, vConnector.width + 1);
                }
                else {
                    vConnector.updateCoordsByAngle(this.pos, angle * counter, vConnector.width + 1);
                }
            }
            counter++;
        });
    }
    highlight(on = true) {
        // this.mouseIsOver = on;
        this.shouldShowButton = on;
        this.shouldShowText = on;
        canvas_1.Canvas.renderGate = true;
        this.parentVCluster?.highlight(this);
    }
    /*** SHOW FUNCTIONS */
    show(renderer) {
        // Do not show the nodes with no connectors if the user make that choice in the GUI
        if (this.vConnectors.length < Number(DOMManager_1.DOM.sliders.nodeConnectorFilter.value) ||
            this.node.getDegree() < Number(DOMManager_1.DOM.sliders.nodeDegreeFilter.value)) {
            this.visible = false;
        }
        else {
            this.visible = true;
        }
        if (this.visible && this.parentVCluster?.visible) {
            // *** TRANSFORMATIONS ***
            this.tr = transformerFactory_1.TransFactory.getTransformerByVClusterID(this.node.idCat.cluster);
            // *** FILTER ***
            // Check if any of this Node's connectors matches User GUI Filters
            this.node.filterConnectors();
            // get the visual properties
            const pal2 = colorFactory_1.ColorFactory.getCategoricalPalette("palette2");
            let fillColors = this._getFillColor(colorFactory_1.ColorFactory.getColor(pal2, Number(this.node.idCat.cluster)));
            this.strokeColor = this._getStrokeColor(colorFactory_1.ColorFactory.getColor(pal2, Number(this.node.idCat.cluster)));
            let strokeWeight = this._getStrokeWeight();
            // assign colors
            renderer.fill(fillColors.fill);
            renderer.stroke(this.strokeColor);
            renderer.strokeWeight(strokeWeight);
            // draw shape
            renderer.ellipseMode(main_1.gp5.CENTER);
            // set diameter
            this.diam = this.width * this.localScale * Number(DOMManager_1.DOM.sliders.nodeSizeFactor.value);
            // Ajust diameter to global transformation
            if (this.transformed) {
                this.diam = this.width * this.tr.scaleFactor * this.localScale;
            }
            let newPos = p5_1.default.Vector.add(this.pos, this.shiftPos);
            this.updateConnectorsCoords(newPos, this.width);
            if (this.shouldShowButton) {
                renderer.circle(newPos.x, newPos.y, this.diam);
            }
            // draw label
            VirtualElementPool_1.VirtualElementPool.hide(this, "node-description");
            VirtualElementPool_1.VirtualElementPool.hide(this, "node-label");
            if (DOMManager_1.DOM.boxChecked("showTexts") && this.shouldShowText) {
                if (this.transformed) {
                    if (this.tr.scaleFactor > 0.57) {
                        this._showLabel(fillColors.label, newPos);
                    }
                }
                else {
                    this._showLabel(fillColors.label, newPos);
                }
                // show node description
                if (this.mouseIsOver) {
                    this._showDescription(newPos, injections_1.formatVNodeDescription); //
                    // this.notifyObservers({
                    //   event: new MouseEvent("mouseover"),
                    //   type: "mouseIsOver",
                    //   pos: newPos,
                    // } as CustomEvent);
                }
                else {
                    this._hideDescription();
                    // this.notifyObservers({
                    //   event: new MouseEvent("mouseout"),
                    //   type: "mouseIsOut",
                    //   pos: newPos,
                    // } as CustomEvent);
                }
            }
            else {
                this._hideLabel();
                // this.notifyObservers({
                //   event: new MouseEvent("mouseout"),
                //   type: "mouseIsOut",
                //   pos: newPos,
                // } as CustomEvent);
            }
            // Show connectors
            if (this.vConnectors.length > 0) {
                for (const vCnctr of this.vConnectors) {
                    // let strokeCnctrColor = ColorFactory.getColorFor(vCnctr.connector.kind);
                    let strokeCnctrColor = colorFactory_1.ColorFactory.getColor(colorFactory_1.ColorFactory.getCategoricalPalette("palette2"), colorFactory_1.ColorFactory.dictionaries.connectors[vCnctr.connector.kind]);
                    if (!strokeCnctrColor)
                        strokeCnctrColor = this.color;
                    if (typeof strokeCnctrColor == "string") {
                        strokeCnctrColor = main_1.gp5.color(strokeCnctrColor);
                    }
                    else if (Array.isArray(strokeCnctrColor)) {
                        strokeCnctrColor = main_1.gp5.color(Number(strokeCnctrColor[0]), Number(strokeCnctrColor[1]), Number(strokeCnctrColor[2]));
                    }
                    if (this.transformed) {
                        strokeCnctrColor.setAlpha(main_1.gp5.map(this.tr.scaleFactor, 0.8, 0.3, 255, 1));
                    }
                    vCnctr.show(renderer, fillColors.fill, strokeCnctrColor);
                }
            }
        }
    }
    _hideLabel() {
        if (this.labelEl) {
            this.labelEl.style.display = "none";
        }
    }
    _showLabel(color, newPos) {
        // label dimensions
        let labelHeight = 20; // * this.localScale;
        let labelWidth = 65 * this.localScale;
        // get coordinates
        let x = this.pos.x;
        let y = this.pos.y;
        // if there is a new position
        if (newPos) {
            x = newPos.x;
            y = newPos.y;
        }
        // the translation - labelWidth serves to reposition the labels after they are rotated
        let translation = labelWidth;
        // get the color in string format
        if (color instanceof p5_1.default.Color) {
            color = colorFactory_1.ColorFactory.convertP5ColorToHex(color);
        }
        // show label
        VirtualElementPool_1.VirtualElementPool.show(this, "node-label", this.node.label, {
            width: labelWidth + "px",
            height: labelHeight + "px",
            display: "flex",
            flexDirection: "row-reverse",
            outline: "1px, solid, blue",
            fontFamily: "Roboto",
            overflow: "hidden",
            textAlign: "right",
            paddingRight: "10px",
            transformOrigin: "bottom right",
            opacity: String(0.8 * this.localScale),
            color: color,
            fontSize: 10 + 2 * this.localScale + "px",
            fontStyle: this.propagated ? "bold" : "normal",
            transform: `
                translate(${canvas_1.Canvas._offset.x}px, ${canvas_1.Canvas._offset.y}px)
                scale(${canvas_1.Canvas._zoom})
                translate(${x - translation}px, ${y - (10 - 10 * Number(DOMManager_1.DOM.sliders.nodeSizeFactor.value))}px)
                rotate(-45deg)
            `,
        });
    }
    _getFillColor(_baseColor) {
        let baseColor = _baseColor;
        if (this.color) {
            baseColor = this.color;
        }
        // default color
        let fillColor = baseColor;
        let labelColor = "#111111";
        if (canvas_1.Canvas.currentBackground < 150) {
            labelColor = "#838282ff";
        }
        let filtered = baseColor;
        // settings. see hex table https://gist.github.com/lopspower/03fb1cc0ac9f32ef38f4
        let normal = "40"; // 60%
        let accent = "B3"; // 70%
        let dimmed = "11"; //
        //let dimmed = "33"; // 20%
        // attenuate
        if (this.mouseIsOver) {
            normal = "E6"; // 90%
            accent = "E6"; // 90%
        }
        // *** EMPHASIZE COLOR ***
        // *** Propagation
        if (this.node.inFwdPropagation &&
            DOMManager_1.DOM.boxChecked("forward") &&
            this.node.inBkwPropagation &&
            DOMManager_1.DOM.boxChecked("backward")) {
            // console.log("here 1 " + this.node.label);
            fillColor = baseColor.concat(accent);
        }
        else if (this.node.inFwdPropagation && DOMManager_1.DOM.boxChecked("forward")) {
            // console.log("here 2 " + this.node.label);
            fillColor = baseColor.concat(accent);
        }
        else if (this.node.inBkwPropagation && DOMManager_1.DOM.boxChecked("backward")) {
            // console.log("here 3 " + this.node.label);
            fillColor = baseColor.concat(accent);
            // if it has no linked edges
        }
        else {
            //console.log("last in prop " + this.node.label);
            fillColor = baseColor.concat(normal);
        }
        // *** DIM COLOR  ***
        // *** Linked FILTER
        if (this.vConnectors.length < 1 && this.visible) {
            fillColor = baseColor.concat(dimmed);
            labelColor = labelColor.concat(dimmed);
        }
        //if (filteredConnectors.length > 0) fillColor = filtered;
        if (this.selected)
            fillColor = filtered;
        fillColor = main_1.gp5.color(fillColor);
        labelColor = main_1.gp5.color(labelColor);
        labelColor.setAlpha(main_1.gp5.map(this.localScale, 2, 1, 255, 150));
        if (this.transformed) {
            fillColor.setAlpha(main_1.gp5.map(this.tr.scaleFactor, 3, 0.3, 255, 1));
            labelColor.setAlpha(main_1.gp5.map(this.tr.scaleFactor, 1, 0.5, 255, 1));
        }
        return { fill: fillColor, label: labelColor };
    }
    _getStrokeColor(_baseColor) {
        let baseColor = _baseColor;
        // default color
        let strokeColor = baseColor;
        let inPropagation = "#FF0000";
        let dimmed = "#FFFFFF33"; // 20% white
        let filtered = "#b400b4";
        // in propagation
        if (this.propagated) {
            strokeColor = inPropagation;
        }
        // *** Linked filter
        // if ((this.vConnectors.length < 1) && DOM.boxChecked("filterLinked")) {
        //     strokeColor = dimmed;
        // }
        // *** filter by edge category
        //let filteredConnectors = this.node.filterConnectors();
        if (this.selected)
            strokeColor = filtered;
        strokeColor = main_1.gp5.color(strokeColor);
        if (this.transformed) {
            strokeColor.setAlpha(main_1.gp5.map(this.tr.scaleFactor, 3, 0.1, 255, 1));
        }
        else {
            strokeColor.setAlpha(125);
        }
        return strokeColor;
    }
    _getStrokeWeight() {
        let weight = 1;
        // Highlight
        if (this.propagated) {
            weight = 2;
        }
        else if (this.vConnectors.length > 0 && this.visible) {
            weight = 1;
        }
        else {
            weight = 1;
        }
        return weight;
    }
    _hideDescription() {
        if (this.descriptionEl) {
            this.descriptionEl.style.opacity = "0";
        }
    }
    _showDescription(newPos, formatter) {
        // Get coordinates
        let x = this.pos.x - 150;
        let y = this.pos.y;
        if (newPos) {
            x = newPos.x - 150;
            y = newPos.y;
        }
        // Cluster name
        let cluster = clusterFactory_1.ClusterFactory.getCluster(this.node.idCat.cluster);
        let clusterName = cluster.label;
        // the attribute list in format key:value where value could be any dataType.
        // This is a flat structure, not nested
        let attributeList = [];
        // This nested structure flattens the nested structure of attribute objects to filter out the keys with void value
        for (const midLevel of Object.entries(this.node.attributes)) {
            for (const innerLevel of Object.entries(midLevel[1])) {
                // take each inner level attribute and insert it into the attributeList array
                attributeList.push({ key: innerLevel[0], value: innerLevel[1] });
            }
        }
        // console.log(attributeList);
        let complementaryTextString = "Attributes:\n";
        //******* Dependency Injection function
        if (formatter) {
            complementaryTextString = formatter(this, attributeList);
        }
        let connectorsDescription = "Connectors:\n";
        //trim the connector description string
        function trimText(textEntry, maxLength) {
            return textEntry; //.length > maxLength ? textEntry.slice(0, maxLength) + "..." : textEntry;
        }
        // connector description
        for (const cnctr of this.node.getConnectors()) {
            connectorsDescription += "   - " + cnctr.kind + ":\n";
            if (cnctr.edgeObservers.length > 0) {
                let edgeObserverOfTheKind = cnctr.edgeObservers.filter((tempEdge) => tempEdge.kind == cnctr.kind);
                let textRow = "";
                for (let i = 0; i < edgeObserverOfTheKind.length; i++) {
                    const edgeTmp = edgeObserverOfTheKind[i];
                    let otherCluster = { source: "", target: "" };
                    // Do not do these operations if the edge is open
                    if (!edgeTmp.open) {
                        if (this.node.idCat.cluster != edgeTmp.id.source.cluster) {
                            otherCluster.source =
                                "Cluster: " +
                                    clusterFactory_1.ClusterFactory.getCluster(edgeTmp.id.source.cluster).label;
                        }
                        if (this.node.idCat.cluster != edgeTmp.id.target.cluster) {
                            otherCluster.target =
                                "Cluster: " +
                                    clusterFactory_1.ClusterFactory.getCluster(edgeTmp.id.target.cluster).label;
                        }
                        // out
                        if (edgeTmp.source.idCat.pajekIndex == this.node.idCat.pajekIndex) {
                            textRow +=
                                "Out w " +
                                    edgeTmp.weight +
                                    " - TO " +
                                    trimText(edgeTmp.target.label, 25) +
                                    ". " +
                                    otherCluster.target +
                                    "\n";
                        }
                        else {
                            // in
                            textRow +=
                                "In w " +
                                    edgeTmp.weight +
                                    " - FROM " +
                                    trimText(edgeTmp.source.label, 25) +
                                    ". " +
                                    otherCluster.source +
                                    "\n";
                        }
                    }
                }
                connectorsDescription += textRow + "\n";
            }
        }
        // Default text string to show in the description box
        let textString = this.node.label +
            "\n" +
            "Description: " +
            this.node.description +
            "\nCluster: " +
            clusterName +
            "\n" +
            connectorsDescription +
            "\n" +
            complementaryTextString;
        VirtualElementPool_1.VirtualElementPool.show(this, "node-description", textString, {
            display: "block",
            fontFamily: "Roboto",
            lineHeight: "15px",
            overflow: "hidden",
            marginLeft: "10px",
            pointerEvents: "none",
            background: "#00000034",
            whiteSpace: "pre-line",
            fontSize: "11px",
            padding: "5px",
            width: "220px",
            borderRadius: "5px",
            color: canvas_1.Canvas.currentBackground < 150 ? "#EEEEEE" : "#111111",
            transform: `
          translate(${canvas_1.Canvas._offset.x}px, ${canvas_1.Canvas._offset.y}px)
          scale(${canvas_1.Canvas._zoom})
          translate(${x}px, ${y + 5}px)
          translateY(-100%)
      `,
        });
    }
    getJSON() {
        let cnctrs = [];
        for (const vConnector of this.vConnectors) {
            cnctrs.push(vConnector.getJSON());
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
                color: this.color,
            },
        };
        return rtn;
    }
    // **** EVENTS *****
    mouseDraggedEvents() {
        if (this.delta == undefined) {
            this.delta = this.getDeltaMouse();
        }
        if (this.mouseIsOver) {
            this.dragged = true;
            this.pos.x = canvas_1.Canvas._mouse.x - this.delta.x;
            this.pos.y = canvas_1.Canvas._mouse.y - this.delta.y;
            this.updateConnectorsCoords();
        }
    }
    mouseClickedEvents(data) {
        // FIXME
        // if (ClusterFactory.getCluster(this.node.idCat.cluster).type === "geo") {
        //   return;
        // }
        /** Note: this.dragged is true at the slightest drag motion. Sometimes
         * this is imperceptible thus the click behavior of vNodes is not as
         * responsive as it should, but it is highly accurate ;-)
         */
        if (this.mouseIsOver && !this.dragged) {
            if (this.keyP_Down) {
                this.propagated = !this.propagated;
                this.node.propagate(this.node, this.propagated);
            }
            else if (this.keyD_Down) {
                this.delete();
            }
            else {
                // *** BEGINIG OF EDGE CREATION ***
                // instantiate edge from node
                let bufferEdge = this.node.workOnEdgeBuffer();
                // make vEdge
                if (bufferEdge) {
                    let bufferVEdge = this.workOnVEdgeBuffer(bufferEdge);
                    //Add buffered elements to collections
                    if (!bufferEdge.open) {
                        edgeFactory_1.EdgeFactory.pushEdge(bufferEdge);
                        edgeFactory_1.EdgeFactory.pushVEdge(bufferVEdge);
                        edgeFactory_1.EdgeFactory.clearBuffer();
                    }
                    else {
                        // EdgeFactory.resetBuffer();
                        // recall connectors
                        // unsubscribe elements from Canvas
                    }
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
        if (DOMManager_1.DOM.boxChecked("edit")) {
            // if the edge does not have a target
            if (edge.open) {
                vEdge = this.sproutVEdge(edge);
                // add to buffer
                edgeFactory_1.EdgeFactory.setBufferVEdge(vEdge);
            }
            else {
                // If the edge is closed, close the current VEdge
                vEdge = this.closeBufferedVEdge();
            }
        }
        return vEdge;
    }
    sproutVEdge(edge) {
        // generate a new vEdge
        let lastVEdge = new vEdge_1.VEdge(edge);
        // set the source
        lastVEdge.setVSource(this);
        return lastVEdge;
    }
    closeBufferedVEdge() {
        // take the current VEdge
        let currentVEdge = edgeFactory_1.EdgeFactory.getBufferVEdge();
        // set the target
        currentVEdge.setVTarget(this);
        // add to the canvas elements to be rendered on screen
        canvas_1.Canvas.subscribe(currentVEdge);
        return currentVEdge;
    }
    ///****** METHODS FOR MAGNIFYING GLASS ********/
    computeMagnifyingEffect() {
        let effectWidth = 150;
        let maxAmp = 3;
        let minAmp = 1;
        let factor;
        if (this.getDistToMouse() <= effectWidth) {
            //** GET SCALE CHANGE */
            let radians = main_1.gp5.map(this.getDistToMouse(), effectWidth, 0, Math.PI, 0);
            factor = (-Math.cos(radians) + 1) / 2;
            factor = main_1.gp5.map(factor, 1, 0, minAmp, maxAmp);
            //** GET POSITION CHANGE */
            //this.shiftPos.set(Math.sin(radians) * 20, 0);
            let xDist = canvas_1.Canvas._mouse.x - this.pos.x;
            let dNormalized = main_1.gp5.map(Math.abs(xDist), effectWidth, 0, 1, 0);
            // Invert sign
            if (xDist < 0) {
                dNormalized *= -1;
            }
            // update values
            this.localScale = factor;
        }
        else {
            this.localScale = 1;
        }
    }
}
exports.VNode = VNode;
//# sourceMappingURL=vNode.js.map