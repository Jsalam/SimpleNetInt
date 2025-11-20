"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.VNode = void 0;
var p5_1 = require("p5");
var main_1 = require("../main");
var vConnector_1 = require("./vConnector");
var canvas_1 = require("../canvas/canvas");
var connector_1 = require("../graphElements/connector");
var DOMManager_1 = require("../GUI/DOM/DOMManager");
var button_1 = require("./button");
var clusterFactory_1 = require("../factories/clusterFactory");
var transformerFactory_1 = require("../factories/transformerFactory");
var colorFactory_1 = require("../factories/colorFactory");
var edgeFactory_1 = require("../factories/edgeFactory");
var vEdge_1 = require("./vEdge");
var VirtualElementPool_1 = require("./VirtualElementPool");
var item_1 = require("../GUI/widgets/listWidget/item");
var VNode = /** @class */ (function (_super) {
    __extends(VNode, _super);
    function VNode(node, width, height, parentVCluster) {
        if (parentVCluster === void 0) { parentVCluster = null; }
        var _this = _super.call(this, 0, 0, width, height) || this;
        _this.parentVCluster = parentVCluster;
        _this.shouldShowText = true;
        _this.shouldShowButton = true;
        _this.node = node;
        _this.color;
        _this.strokeColor;
        _this.paddingTop = 3;
        // for magnifying glass2
        _this.diam = width;
        _this.shiftPos = main_1.gp5.createVector(0, 0);
        // observers are vConnectors
        _this.vConnectors = [];
        _this.vConnectorsGap = 11;
        _this.node.subscribe(_this);
        // events
        _this.keyP_Down = false;
        _this.keyD_Down = false; // deletion
        // *** TRANSFORMATIONS ***
        _this.tr;
        // *** SORTING LIST ***
        _this.observerListItems = [];
        return _this;
    }
    VNode.prototype.subscribe = function (obj) {
        if (obj instanceof vConnector_1.VConnector)
            this.vConnectors.push(obj);
        if (obj instanceof item_1.Item)
            this.observerListItems.push(obj);
    };
    VNode.prototype.unsubscribe = function (obj) {
        console.log(obj);
        this.vConnectors = this.vConnectors.filter(function (subscriber) {
            var rtn = true;
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
    };
    /**Delete this vNode, and node and all the vConnectors, connectors and vEdges and edges referencing it */
    VNode.prototype.delete = function () {
        clusterFactory_1.ClusterFactory.deleteNode(this);
        // Call the static method from the cluster Factory
    };
    VNode.prototype.notifyObservers = function (data) {
        this.vConnectors.forEach(function (observer) { return observer.fromVNode(data); });
        this.observerListItems.forEach(function (observer) { return observer.fromVNode(data); });
    };
    VNode.prototype.removeVConnector = function (conn) {
        this.vConnectors = this.vConnectors.filter(function (vCnctr) {
            var rtn = true;
            if (vCnctr.connector.equals(conn)) {
                if (vCnctr.connector.edgeObservers.length < 1) {
                    rtn = false;
                }
            }
            // removes connector if false
            return rtn;
        });
    };
    // Observing to Canvas
    VNode.prototype.fromCanvas = function (data) {
        // notify observers
        for (var _i = 0, _a = this.vConnectors; _i < _a.length; _i++) {
            var vConn = _a[_i];
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
    };
    // Observer node
    VNode.prototype.fromNode = function (data) {
        if (data instanceof connector_1.Connector) {
            this.addVConnector(data);
        }
    };
    VNode.prototype.addVConnector = function (connector) {
        //console.log('new V connector');
        var tmpVConnector = new vConnector_1.VConnector(connector);
        tmpVConnector.setColor(this.color);
        this.subscribe(tmpVConnector);
        this.updateConnectorsCoords();
        // return tmpVConnector;
    };
    VNode.prototype.resetVConnectors = function () {
        this.vConnectors = [];
    };
    /**
     * Remove a connector by its kind
     * @param {} kind
     */
    VNode.prototype.popVConnector = function (kind) {
        // find the vConnector observer of the parameter and remove it from the collection
        var vConnector = this.vConnectors.filter(function (vCnctr) {
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
    };
    /**
     * Remove a connector regardless of the number of linked edges
     * @param {} kind
     */
    VNode.prototype.destroyVConnector = function (edge) {
        this.node.disconnectEdge(edge);
        // find the vConnector observer of the parameter and remove it from the collection
        var vConnector = this.vConnectors.filter(function (vCnctr) {
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
    };
    VNode.prototype.setColor = function (color) {
        this.color = color;
        this.setColorConnectors(this.color);
    };
    VNode.prototype.setColorConnectors = function (color) {
        this.vConnectors.forEach(function (connector) {
            connector.setColor(color);
        });
    };
    VNode.prototype.updateCoords = function (pos, sequence) {
        this.setPos(main_1.gp5.createVector(pos.x, pos.y + sequence * this.height + sequence * this.paddingTop));
        this.updateConnectorsCoords();
    };
    VNode.prototype.updateConnectorsCoords = function (newPos, nodeSize) {
        var _this = this;
        var counter = 1;
        var angle = (Math.PI * 2) / this.node.connectors.length;
        this.vConnectors.forEach(function (vConnector) {
            vConnector.setWidth(nodeSize * Number(DOMManager_1.DOM.sliders.nodeSizeFactor.value));
            // When there is only one connector
            if (_this.node.connectors.length <= 1) {
                if (newPos) {
                    vConnector.updateCoordsByAngle(newPos, 0, vConnector.width / 2);
                }
                else {
                    vConnector.updateCoordsByAngle(_this.pos, 0, vConnector.width / 2);
                }
                // When there two or more connectors
            }
            else {
                if (newPos) {
                    vConnector.updateCoordsByAngle(newPos, angle * counter, vConnector.width + 1);
                }
                else {
                    vConnector.updateCoordsByAngle(_this.pos, angle * counter, vConnector.width + 1);
                }
            }
            counter++;
        });
    };
    VNode.prototype.highlight = function (on) {
        var _a;
        if (on === void 0) { on = true; }
        this.mouseIsOver = on;
        // this.shouldShowButton = on;
        this.shouldShowText = on;
        canvas_1.Canvas.renderGate = true;
        (_a = this.parentVCluster) === null || _a === void 0 ? void 0 : _a.highlight(this);
    };
    /*** SHOW FUNCTIONS */
    VNode.prototype.show = function (renderer) {
        var _a;
        // Do not show the nodes with no connectors if the user make that choice in the GUI
        if (this.vConnectors.length < Number(DOMManager_1.DOM.sliders.nodeConnectorFilter.value) ||
            this.node.getDegree() < Number(DOMManager_1.DOM.sliders.nodeDegreeFilter.value)) {
            this.visible = false;
        }
        else {
            this.visible = true;
        }
        if (this.visible && ((_a = this.parentVCluster) === null || _a === void 0 ? void 0 : _a.visible)) {
            // *** TRANSFORMATIONS ***
            this.tr = transformerFactory_1.TransFactory.getTransformerByVClusterID(this.node.idCat.cluster);
            // *** FILTER ***
            // Check if any of this Node's connectors matches User GUI Filters
            this.node.filterConnectors();
            // get the visual properties
            var fillColors = this._getFillColor(colorFactory_1.ColorFactory.getColorFor(this.node.idCat.cluster));
            this.strokeColor = this._getStrokeColor(colorFactory_1.ColorFactory.getColorFor(this.node.idCat.cluster));
            var strokeWeight = this._getStrokeWeight();
            // assign colors
            renderer.fill(fillColors.fill);
            renderer.stroke(this.strokeColor);
            renderer.strokeWeight(strokeWeight);
            // draw shape
            renderer.ellipseMode(main_1.gp5.CENTER);
            // set diameter
            this.diam =
                this.width *
                    this.localScale *
                    Number(DOMManager_1.DOM.sliders.nodeSizeFactor.value);
            // Ajust diameter to global transformation
            if (this.transformed) {
                this.diam = this.width * this.tr.scaleFactor * this.localScale;
            }
            var newPos = p5_1.default.Vector.add(this.pos, this.shiftPos);
            this.updateConnectorsCoords(newPos, this.width);
            if (this.shouldShowButton) {
                renderer.ellipse(newPos.x, newPos.y, this.diam + 7 + this.node.connectors.length * 3);
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
                    this._showDescription(newPos);
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
                for (var _i = 0, _b = this.vConnectors; _i < _b.length; _i++) {
                    var vCnctr = _b[_i];
                    // let strokeCnctrColor = ColorFactory.getColorFor(vCnctr.connector.kind);
                    var strokeCnctrColor = colorFactory_1.ColorFactory.dictionaries.connectors[vCnctr.connector.kind];
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
    };
    VNode.prototype._hideLabel = function () {
        if (this.labelEl) {
            this.labelEl.style.display = "none";
        }
    };
    VNode.prototype._showLabel = function (color, newPos) {
        // label dimensions
        var labelHeight = 20; // * this.localScale;
        var labelWidth = 65 * this.localScale;
        // get coordinates
        var x = this.pos.x;
        var y = this.pos.y;
        // if there is a new position
        if (newPos) {
            x = newPos.x;
            y = newPos.y;
        }
        // the translation - labelWidth serves to reposition the labels after they are rotated
        var translation = labelWidth;
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
            opacity: String(0.3 * this.localScale),
            color: color,
            fontSize: 10 + 2 * this.localScale + "px",
            fontStyle: this.propagated ? "bold" : "normal",
            transform: "\n                translate(".concat(canvas_1.Canvas._offset.x, "px, ").concat(canvas_1.Canvas._offset.y, "px)\n                scale(").concat(canvas_1.Canvas._zoom, ")\n                translate(").concat(x - translation, "px, ").concat(y, "px)\n                rotate(-45deg)\n            "),
        });
    };
    VNode.prototype._getFillColor = function (_baseColor) {
        var baseColor = _baseColor;
        if (this.color) {
            baseColor = this.color;
        }
        // default color
        var fillColor = baseColor;
        var labelColor = "#111111";
        if (canvas_1.Canvas.currentBackground < 150) {
            labelColor = "#EEEEEE";
        }
        var filtered = baseColor;
        // settings. see hex table https://gist.github.com/lopspower/03fb1cc0ac9f32ef38f4
        var normal = "40"; // 60%
        var accent = "B3"; // 70%
        var dimmed = "33"; // 20%
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
    };
    VNode.prototype._getStrokeColor = function (_baseColor) {
        var baseColor = _baseColor;
        // default color
        var strokeColor = baseColor;
        var inPropagation = "#FF0000";
        var dimmed = "#FFFFFF33"; // 20% white
        var filtered = "#b400b4";
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
    };
    VNode.prototype._getStrokeWeight = function () {
        var weight = 1;
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
    };
    VNode.prototype._hideDescription = function () {
        if (this.descriptionEl) {
            this.descriptionEl.style.opacity = "0";
        }
    };
    VNode.prototype._showDescription = function (newPos) {
        // Get coordinates
        var x = this.pos.x - 150;
        var y = this.pos.y;
        if (newPos) {
            x = newPos.x - 150;
            y = newPos.y;
        }
        // get attribute list
        var entryList = [];
        // This nested structure flattens the nested structure of attribute objects to filter out the keys with void value
        for (var _i = 0, _a = Object.entries(this.node.attributes); _i < _a.length; _i++) {
            var midLevel = _a[_i];
            for (var _b = 0, _c = Object.entries(midLevel[1]); _b < _c.length; _b++) {
                var innerLevel = _c[_b];
                entryList.push(innerLevel);
            }
        }
        // This filters remove empty value items from the list of attributes
        var filteredAttributes = entryList.filter(function (attr) { return attr[1] != ""; });
        // Show background
        // if (!this.descriptionEl) {
        //     this.descriptionEl = document.createElement('div');
        //     const canvasContainerEl = document.querySelector('#model');
        //     if (canvasContainerEl) {
        //         this.descriptionEl.style.position = 'absolute';
        //         this.descriptionEl.style.left = '10px';
        //         this.descriptionEl.style.top = '10px';
        //         this.descriptionEl.style.fontFamily = 'Roboto';
        //         this.descriptionEl.style.lineHeight = '15px';
        //         this.descriptionEl.style.overflow = 'hidden';
        //         this.descriptionEl.style.pointerEvents = 'none';
        //         canvasContainerEl.append(this.descriptionEl);
        //     }
        // }
        // this.descriptionEl.style.opacity = 1;
        // this.descriptionEl.style.background = '#00000066';
        // // this.descriptionEl.style.transform = `
        // //     translate(${Canvas._offset.x}px, ${Canvas._offset.y}px)
        // //     scale(${Canvas._zoom})
        // //     translate(${x}px, ${y + 5}px)
        // //     translateY(-100%)
        // // `;
        // this.descriptionEl.style.whiteSpace = 'pre-line';
        // this.descriptionEl.style.color = '#111111';
        // if (Canvas.currentBackground < 150) {
        //     this.descriptionEl.style.color = '#EEEEEE';
        // }
        // this.descriptionEl.style.fontSize = '11px';
        var clusterName = clusterFactory_1.ClusterFactory.getCluster(this.node.idCat.cluster).label;
        var connectorsDescription = "Connectors:\n";
        //trim the connector description string
        function trimText(textEntry, maxLength) {
            return textEntry; //.length > maxLength ? textEntry.slice(0, maxLength) + "..." : textEntry;
        }
        var _loop_1 = function (cnctr) {
            connectorsDescription += "   - " + cnctr.kind + ":\n";
            if (cnctr.edgeObservers.length > 0) {
                var edgeObserverOfTheKind = cnctr.edgeObservers.filter(function (tempEdge) { return tempEdge.kind == cnctr.kind; });
                var textRow = "";
                for (var i = 0; i < edgeObserverOfTheKind.length; i++) {
                    var edgeTmp = edgeObserverOfTheKind[i];
                    var otherCluster = { source: "", target: "" };
                    // Do not do these opeartions if the edge is open
                    if (!edgeTmp.open) {
                        if (this_1.node.idCat.cluster != edgeTmp.id.source.cluster) {
                            otherCluster.source =
                                "Cluster: " +
                                    clusterFactory_1.ClusterFactory.getCluster(edgeTmp.id.source.cluster).label;
                        }
                        if (this_1.node.idCat.cluster != edgeTmp.id.target.cluster) {
                            otherCluster.target =
                                "Cluster: " +
                                    clusterFactory_1.ClusterFactory.getCluster(edgeTmp.id.target.cluster).label;
                        }
                        //console.log(otherCluster['source']);
                        // out
                        if (edgeTmp.source.idCat.pajekIndex == this_1.node.idCat.pajekIndex) {
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
        };
        var this_1 = this;
        // connector description
        for (var _d = 0, _e = this.node.getConnectors(); _d < _e.length; _d++) {
            var cnctr = _e[_d];
            _loop_1(cnctr);
        }
        var textString = "Name: " +
            this.node.label +
            "\n" +
            "Description: " +
            this.node.description +
            "\nCluster: " +
            clusterName +
            "\n" +
            connectorsDescription;
        // renderer.text("Name: " + this.node.label, x + 5, y - 25, 650, 97);
        // renderer.text("Description: " + this.node.description, x + 5, y - 40, 650, 97);
        // this.descriptionEl.style.padding = '5px';
        // this.descriptionEl.textContent = '\n' + textString;
        // for (let i = 0; i < filteredAttributes.length; i++) {
        //     this.descriptionEl.description = filteredAttributes[i][0] + ": " + filteredAttributes[i][1] + '\n' + textString;
        // }
        VirtualElementPool_1.VirtualElementPool.show(this, "node-description", textString, {
            display: "block",
            fontFamily: "Roboto",
            lineHeight: "15px",
            overflow: "hidden",
            marginLeft: "10px",
            pointerEvents: "none",
            background: "#00000066",
            whiteSpace: "pre-line",
            fontSize: "11px",
            padding: "5px",
            width: "220px",
            color: canvas_1.Canvas.currentBackground < 150 ? "#EEEEEE" : "#111111",
            // transform: `
            //     translate(${Canvas._offset.x}px, ${Canvas._offset.y}px)
            //     scale(${Canvas._zoom})
            //     translate(${x}px, ${y + 5}px)
            //     translateY(-100%)
            // `,
        });
    };
    VNode.prototype.getJSON = function () {
        var cnctrs = [];
        for (var _i = 0, _a = this.vConnectors; _i < _a.length; _i++) {
            var vConnector = _a[_i];
            cnctrs.push(vConnector.getJSON());
        }
        var rtn = {
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
    };
    // **** EVENTS *****
    VNode.prototype.mouseDraggedEvents = function () {
        if (this.delta == undefined) {
            this.delta = this.getDeltaMouse();
        }
        if (this.mouseIsOver) {
            this.dragged = true;
            this.pos.x = canvas_1.Canvas._mouse.x - this.delta.x;
            this.pos.y = canvas_1.Canvas._mouse.y - this.delta.y;
            this.updateConnectorsCoords();
        }
    };
    VNode.prototype.mouseClickedEvents = function (data) {
        // FIXME
        if (clusterFactory_1.ClusterFactory.getCluster(this.node.idCat.cluster).type === "geo") {
            return;
        }
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
                var bufferEdge = this.node.workOnEdgeBuffer();
                // make vEdge
                if (bufferEdge) {
                    var bufferVEdge = this.workOnVEdgeBuffer(bufferEdge);
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
    };
    /** If you get an open edge it is becuse it does not have a target yet.
     * @param {Edge} edge might come open or closed
     */
    VNode.prototype.workOnVEdgeBuffer = function (edge) {
        var vEdge;
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
    };
    VNode.prototype.sproutVEdge = function (edge) {
        // generate a new vEdge
        var lastVEdge = new vEdge_1.VEdge(edge);
        // set the source
        lastVEdge.setVSource(this);
        return lastVEdge;
    };
    VNode.prototype.closeBufferedVEdge = function () {
        // take the current VEdge
        var currentVEdge = edgeFactory_1.EdgeFactory.getBufferVEdge();
        // set the target
        currentVEdge.setVTarget(this);
        // add to the canvas elements to be rendered on screen
        canvas_1.Canvas.subscribe(currentVEdge);
        return currentVEdge;
    };
    ///****** METHODS FOR MAGNIFYING GLASS ********/
    VNode.prototype.computeMagnifyingEffect = function () {
        var effectWidth = 150;
        var maxAmp = 3;
        var minAmp = 1;
        var factor;
        if (this.getDistToMouse() <= effectWidth) {
            //** GET SCALE CHANGE */
            var radians = main_1.gp5.map(this.getDistToMouse(), effectWidth, 0, Math.PI, 0);
            factor = (-Math.cos(radians) + 1) / 2;
            factor = main_1.gp5.map(factor, 1, 0, minAmp, maxAmp);
            //** GET POSITION CHANGE */
            //this.shiftPos.set(Math.sin(radians) * 20, 0);
            var xDist = canvas_1.Canvas._mouse.x - this.pos.x;
            var dNormalized = main_1.gp5.map(Math.abs(xDist), effectWidth, 0, 1, 0);
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
    };
    return VNode;
}(button_1.Button));
exports.VNode = VNode;
