import p5, { Vector } from "p5";
import { gp5 } from "../main";
import { VConnector } from "./vConnector";
import { Canvas } from "../canvas/canvas";
import { Connector } from "../graphElements/connector";
import { Node } from "../graphElements/node";
import { DOM } from "../GUI/DOM/DOMManager";
import { Button } from "./button";
import { ClusterFactory } from "../factories/clusterFactory";
import { CustomEvent } from "../types";
import { Edge } from "../graphElements/edge";
import { TransFactory } from "../factories/transformerFactory";
import { ColorFactory } from "../factories/colorFactory";
import { Transformer } from "../canvas/transformer";
import { EdgeFactory } from "../factories/edgeFactory";
import { VEdge } from "./vEdge";
import { VirtualElementPool } from "./VirtualElementPool";
import { Item } from "../GUI/widgets/listWidget/item";
import { VCluster } from "./vCluster";
import { SettingsPanelFactory } from "../factories/settingsPanelFactory";
import { DataEntry } from "../utilities/injections";
import { formatVNodeDescription } from "../utilities/injections";

export interface VNodeInit {
  posX: number;
  posY: number;
  posZ: number;
  color: string;
}

export class VNode extends Button {
  shouldShowText = true;
  shouldShowButton = true;
  node: Node;
  color: string | undefined;
  strokeColor: string | p5.Color | undefined;
  paddingTop: number;
  diam: number;
  shiftPos: Vector;
  vConnectors: VConnector[];
  vConnectorsGap: number;
  keyP_Down: boolean;
  keyD_Down: boolean;
  tr: Transformer | undefined;
  labelEl: HTMLElement | undefined;
  descriptionEl: HTMLElement | undefined;
  propagated: boolean | undefined;
  observerListItems: Item[];

  constructor(
    node: Node,
    width: number,
    height: number,
    public parentVCluster: VCluster | null = null,
  ) {
    super(0, 0, width, height);
    this.node = node;
    this.color;
    this.paddingTop = 3;
    // for magnifying glass2
    this.diam = width;
    this.shiftPos = gp5.createVector(0, 0);
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
    const pal2 = ColorFactory.getCategoricalPalette("palette2");
    this.strokeColor = this._getStrokeColor(ColorFactory.getColor(pal2, Number(this.node.idCat.cluster)));
  }

  subscribe(obj: any) {
    if (obj instanceof VConnector) this.vConnectors.push(obj);
    if (obj instanceof Item) this.observerListItems.push(obj);
  }

  unsubscribe(obj: any) {
    console.log(obj);
    this.vConnectors = this.vConnectors.filter(function (subscriber) {
      let rtn = true;
      // Filter vConnectors
      if (subscriber instanceof VConnector) {
        if (subscriber.connector.equals(obj.connector)) {
          rtn = false;
          console.log("unsubscribed vConnector " + JSON.stringify(subscriber.connector.id));
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

  notifyObservers(data: CustomEvent) {
    this.vConnectors.forEach((observer) => observer.fromVNode(data));
    this.observerListItems.forEach((observer) => observer.fromVNode(data));
  }

  removeVConnector(conn: Connector) {
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
  fromCanvas(data: CustomEvent) {
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
          Canvas.update();
        }
        // MAGNIFYING EFFECT
        if (DOM.boxChecked("magnifyingEffect")) {
          //&& this.getDistToMouse() < 200) {
          this.computeMagnifyingEffect();
          Canvas.update();
        }
      }

      if (data.type == "mousewheel") {
      }
      // Keyboard events
    } else if (data.event instanceof KeyboardEvent) {
      if (data.type == "keydown") {
        if (data.event.key == "p" || data.event.key == "P") {
          this.keyP_Down = true;
        }
        if (data.event.key == "d" || data.event.key == "D") {
          this.keyD_Down = true;
        }
        if (data.event.key == "=" || data.event.key == "+") {
          // update mouseOver variable after applying magnifying glass
          this.mouseOver(data);
          this.computeMagnifyingEffect();
        }
        if (data.event.key == "-" || data.event.key == "_") {
          // update mouseOver variable after applying magnifying glass
          this.mouseOver(data);
          this.computeMagnifyingEffect();
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
  fromNode(data: Connector) {
    if (data instanceof Connector) {
      this.addVConnector(data);
    }
  }

  addVConnector(connector: Connector) {
    //console.log('new V connector');
    let tmpVConnector = new VConnector(connector);
    tmpVConnector.setColor(this.color!);
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
  popVConnector(kind: string) {
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
  destroyVConnector(edge: Edge) {
    this.node.disconnectEdge(edge);

    // find the vConnector observer of the parameter and remove it from the collection
    let vConnector = this.vConnectors.filter((vCnctr) => {
      return vCnctr.connector.kind == edge.kind;
    })[0];

    if (vConnector) {
      // check if there are no edges linked to this connector
      if (vConnector.connector.edgeObservers.length == 0) {
        // popConnectors from nodes
        this.node.popConnector(edge.kind!);

        // unsubscribe connector
        this.unsubscribe(vConnector);
        this.updateConnectorsCoords();
      }
    }
  }

  setColor(color: string) {
    this.color = color;
    this.setColorConnectors(this.color);
  }

  setColorConnectors(color: string) {
    this.vConnectors.forEach((connector) => {
      connector.setColor(color);
    });
  }

  updateCoords(pos: Vector, sequence: number) {
    this.setPos(gp5.createVector(pos.x, pos.y + sequence * this.height + sequence * this.paddingTop));
    this.updateConnectorsCoords();
  }

  updateConnectorsCoords(newPos?: Vector, nodeSize?: number) {
    let counter = 1;
    let angle = (Math.PI * 2) / this.node.connectors.length;

    this.vConnectors.forEach((vConnector) => {
      vConnector.setWidth(nodeSize! * Number(DOM.sliders.nodeSizeFactor.value));

      // When there is only one connector
      if (this.node.connectors.length <= 1) {
        if (newPos) {
          vConnector.updateCoordsByAngle(newPos, 0, vConnector.width / 2);
        } else {
          vConnector.updateCoordsByAngle(this.pos!, 0, vConnector.width / 2);
        }
        // When there two or more connectors
      } else {
        if (newPos) {
          vConnector.updateCoordsByAngle(newPos, angle * counter, vConnector.width + 1);
        } else {
          vConnector.updateCoordsByAngle(this.pos!, angle * counter, vConnector.width + 1);
        }
      }
      counter++;
    });
  }

  highlight(on = true) {
    // this.mouseIsOver = on;
    this.shouldShowButton = on;
    this.shouldShowText = on;
    Canvas.renderGate = true;
    this.parentVCluster?.highlight(this);
  }

  /*** SHOW FUNCTIONS */
  show(renderer: p5) {
    // Do not show the nodes with no connectors if the user make that choice in the GUI
    if (this.vConnectors.length < Number(DOM.sliders.nodeConnectorFilter.value) || this.node.getDegree() < Number(DOM.sliders.nodeDegreeFilter.value)) {
      this.visible = false;
    } else {
      this.visible = true;
    }

    if (this.visible && this.parentVCluster?.visible) {
      // *** TRANSFORMATIONS ***
      this.tr = TransFactory.getTransformerByVClusterID(this.node.idCat.cluster);

      // *** FILTER ***
      // Check if any of this Node's connectors matches User GUI Filters
      this.node.filterConnectors();

      // get the visual properties
      const pal2 = ColorFactory.getCategoricalPalette("palette2");
      let fillColors = this._getFillColor(this.color!);//this._getFillColor(ColorFactory.getColor(pal2, Number(this.node.idCat.cluster)));
      this.strokeColor = this._getStrokeColor(this.color!);
      let strokeWeight = this._getStrokeWeight();

      // assign colors
      renderer.fill(fillColors.fill);
      if (typeof this.strokeColor === "string") {
        renderer.stroke(gp5.color(this.strokeColor));
      } else if (this.strokeColor) {
        renderer.stroke(this.strokeColor);
      }
      renderer.strokeWeight(strokeWeight);

      // draw shape
      renderer.ellipseMode(gp5.CENTER);

      // set diameter
      this.diam = this.width * this.localScale! * Number(DOM.sliders.nodeSizeFactor.value);

      // Ajust diameter to global transformation
      if (this.transformed) {
        this.diam = this.width * this.tr.scaleFactor * this.localScale!;
      }
      let newPos = p5.Vector.add(this.pos!, this.shiftPos);

      this.updateConnectorsCoords(newPos, this.width);

      if (this.shouldShowButton) {
        renderer.circle(
          newPos.x,
          newPos.y,
          this.diam, //+ this.node.connectors.length * 3
        );
      }

      // draw label
      VirtualElementPool.hide(this, "node-description");
      VirtualElementPool.hide(this, "node-label");

      if (DOM.boxChecked("showTexts") && this.shouldShowText) {
        if (this.transformed) {
          if (this.tr.scaleFactor > 0.57) {
            this._showLabel(fillColors.label, newPos);
          }
        } else {
          this._showLabel(fillColors.label, newPos);
        }

        // show node description
        if (this.mouseIsOver) {
          this._showDescription(newPos, formatVNodeDescription as (vNode: VNode, data: DataEntry[], params?: string[]) => string); //
          // this.notifyObservers({
          //   event: new MouseEvent("mouseover"),
          //   type: "mouseIsOver",
          //   pos: newPos,
          // } as CustomEvent);
        } else {
          this._hideDescription();
          // this.notifyObservers({
          //   event: new MouseEvent("mouseout"),
          //   type: "mouseIsOut",
          //   pos: newPos,
          // } as CustomEvent);
        }
      } else {
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
          let strokeCnctrColor: string | string[] | p5.Color = ColorFactory.getColor(ColorFactory.getCategoricalPalette("palette2"), ColorFactory.dictionaries.connectors[vCnctr.connector.kind]);

          if (!strokeCnctrColor) strokeCnctrColor = this.color!;

          if (typeof strokeCnctrColor == "string") {
            strokeCnctrColor = gp5.color(strokeCnctrColor);
          } else if (Array.isArray(strokeCnctrColor)) {
            strokeCnctrColor = gp5.color(Number(strokeCnctrColor[0]), Number(strokeCnctrColor[1]), Number(strokeCnctrColor[2]));
          }

          if (this.transformed) {
            strokeCnctrColor.setAlpha(gp5.map(this.tr.scaleFactor, 0.8, 0.3, 255, 1));
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

  _showLabel(color: string | p5.Color, newPos: p5.Vector) {
    // label dimensions
    let labelHeight = 20; // * this.localScale;
    let labelWidth = 65 * this.localScale!;

    // get coordinates
    let x = this.pos!.x;
    let y = this.pos!.y;

    // if there is a new position
    if (newPos) {
      x = newPos.x;
      y = newPos.y;
    }

    // the translation - labelWidth serves to reposition the labels after they are rotated
    let translation = labelWidth;

    // get the color in string format
    if (color instanceof p5.Color) {
      color = ColorFactory.convertP5ColorToHex(color);
    }

    // show label
    VirtualElementPool.show(this, "node-label", this.node.label, {
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
      opacity: String(0.8 * this.localScale!),
      color: color,
      fontSize: 10 + 2 * this.localScale! + "px",
      fontStyle: this.propagated ? "bold" : "normal",
      transform: `
                translate(${Canvas._offset.x}px, ${Canvas._offset.y}px)
                scale(${Canvas._zoom})
                translate(${x - translation}px, ${y - (10 - 10 * Number(DOM.sliders.nodeSizeFactor.value))}px)
                rotate(-45deg)
            `,
    });
  }

  _getFillColor(_baseColor: string) {
    let baseColor = _baseColor;

    if (this.color) {
      baseColor = this.color;
    }

    // default color
    let fillColor: string = baseColor;
    let labelColor: string = "#111111";
    if (Canvas.currentBackground < 150) {
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
    if (this.node.inFwdPropagation && DOM.boxChecked("forward") && this.node.inBkwPropagation && DOM.boxChecked("backward")) {
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
    if (this.vConnectors.length < 1 && this.visible) {
      fillColor = baseColor.concat(dimmed);
      labelColor = labelColor.concat(dimmed);
    }

    //if (filteredConnectors.length > 0) fillColor = filtered;
    if (this.selected) fillColor = filtered;

    let p5FillColor: p5.Color = gp5.color(fillColor);
    let p5LabelColor: p5.Color = gp5.color(labelColor);

    p5LabelColor.setAlpha(gp5.map(this.localScale!, 2, 1, 255, 150));

    if (this.transformed) {
      p5FillColor.setAlpha(gp5.map(this.tr!.scaleFactor, 3, 0.3, 255, 1));
      p5LabelColor.setAlpha(gp5.map(this.tr!.scaleFactor, 1, 0.5, 255, 1));
    }

    return { fill: p5FillColor, label: p5LabelColor };
  }

  _getStrokeColor(_baseColor: string) {
    let baseColor = _baseColor;

    // default color
    let strokeColor: string | p5.Color = baseColor;
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

    if (this.selected) strokeColor = filtered;

    strokeColor = gp5.color(strokeColor);

    if (this.transformed) {
      strokeColor.setAlpha(gp5.map(this.tr!.scaleFactor, 3, 0.1, 255, 1));
    } else {
      strokeColor.setAlpha(125);
    }
    return strokeColor;
  }

  _getStrokeWeight() {
    let weight = 1;
    // Highlight
    if (this.propagated) {
      weight = 2;
    } else if (this.vConnectors.length > 0 && this.visible) {
      weight = 1;
    } else {
      weight = 1;
    }
    return weight;
  }

  _hideDescription() {
    if (this.descriptionEl) {
      this.descriptionEl.style.opacity = "0";
    }
  }

  _showDescription(newPos: p5.Vector, formatter?: (vNode: VNode, data: DataEntry[], params?: string[]) => string) {
    // Get coordinates
    let x = this.pos!.x - 150;
    let y = this.pos!.y;

    if (newPos) {
      x = newPos.x - 150;
      y = newPos.y;
    }

    // Cluster name
    let cluster = ClusterFactory.getCluster(this.node.idCat.cluster);
    let clusterName = cluster.label;

    // the attribute list in format key:value where value could be any dataType.
    // This is a flat structure, not nested
    let attributeList: DataEntry[] = [];

    // This nested structure flattens the nested structure of attribute objects to filter out the keys with void value
    for (const midLevel of Object.entries(this.node.attributes!)) {
      for (const innerLevel of Object.entries(midLevel[1])) {
        // take each inner level attribute and insert it into the attributeList array
        attributeList.push({ key: innerLevel[0], value: innerLevel[1] });
      }
    }

    // console.log(attributeList);

    let complementaryTextString: string = "Attributes:\n";

    //******* Dependency Injection function
    if (formatter) {
      complementaryTextString = formatter(this, attributeList);
    }

    let connectorsDescription = "Connectors:\n";

    //trim the connector description string
    function trimText(textEntry: string, maxLength: number) {
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
            if (this.node.idCat.cluster != edgeTmp.id!.source.cluster) {
              otherCluster.source = "Cluster: " + ClusterFactory.getCluster(edgeTmp.id!.source.cluster).label;
            }

            if (this.node.idCat.cluster != edgeTmp.id!.target.cluster) {
              otherCluster.target = "Cluster: " + ClusterFactory.getCluster(edgeTmp.id!.target.cluster).label;
            }

            // out
            if (edgeTmp.source.idCat.pajekIndex == this.node.idCat.pajekIndex) {
              textRow += "Out w " + edgeTmp.weight + " - TO " + trimText(edgeTmp.target!.label, 25) + ". " + otherCluster.target + "\n";
            } else {
              // in
              textRow += "In w " + edgeTmp.weight + " - FROM " + trimText(edgeTmp.source.label, 25) + ". " + otherCluster.source + "\n";
            }
          }
        }

        connectorsDescription += textRow + "\n";
      }
    }

    // Default text string to show in the description box
    let textString = this.node.label + "\n" + "Description: " + this.node.description + "\nCluster: " + clusterName + "\n" + connectorsDescription + "\n" + complementaryTextString;

    VirtualElementPool.show(this, "node-description", textString, {
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
      color: Canvas.currentBackground < 150 ? "#EEEEEE" : "#111111",
      transform: `
          translate(${Canvas._offset.x}px, ${Canvas._offset.y}px)
          scale(${Canvas._zoom})
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
        posX: this.pos!.x,
        posY: this.pos!.y,
        posZ: this.pos!.z,
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
      this.pos!.x = Canvas._mouse.x - this.delta.x;
      this.pos!.y = Canvas._mouse.y - this.delta.y;
      this.updateConnectorsCoords();
    }
  }

  mouseClickedEvents(data: CustomEvent) {
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
      } else if (this.keyD_Down) {
        this.delete();
      } else {
        // *** BEGINIG OF EDGE CREATION ***

        // instantiate edge from node
        let bufferEdge = this.node.workOnEdgeBuffer();

        // make vEdge
        if (bufferEdge) {
          let bufferVEdge = this.workOnVEdgeBuffer(bufferEdge);

          //Add buffered elements to collections
          if (!bufferEdge.open) {
            EdgeFactory.pushEdge(bufferEdge);
            EdgeFactory.pushVEdge(bufferVEdge!);
            EdgeFactory.clearBuffer();
          } else {
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

  workOnVEdgeBuffer(edge: Edge) {
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

  sproutVEdge(edge: Edge) {
    // generate a new vEdge
    let lastVEdge = new VEdge(edge);

    // set the source
    lastVEdge.setVSource(this);

    return lastVEdge;
  }

  closeBufferedVEdge() {
    // take the current VEdge
    let currentVEdge = EdgeFactory.getBufferVEdge()!;

    // set the target
    currentVEdge.setVTarget(this);

    // add to the canvas elements to be rendered on screen
    Canvas.subscribe(currentVEdge);

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
      let radians = gp5.map(this.getDistToMouse(), effectWidth, 0, Math.PI, 0);
      factor = (-Math.cos(radians) + 1) / 2;
      factor = gp5.map(factor, 1, 0, minAmp, maxAmp);

      //** GET POSITION CHANGE */
      //this.shiftPos.set(Math.sin(radians) * 20, 0);
      let xDist = Canvas._mouse.x - this.pos!.x;
      let dNormalized = gp5.map(Math.abs(xDist), effectWidth, 0, 1, 0);

      // Invert sign
      if (xDist < 0) {
        dNormalized *= -1;
      }

      // update values
      this.localScale = factor;
    } else {
      this.localScale = 1;
    }
  }
}
