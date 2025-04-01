/**
 * This static class manages all the GUI elements displayed in the browser and serves as an interface between the DOM and the JavaScript code.
 */
import { gp5 } from "../../main";
import {
  getDataImport,
  importNetworkModalForm,
} from "../forms/importModalForm";
import { EdgeFactory } from "../../factories/edgeFactory";
import { getDataCluster } from "../forms/addClusterModalForm";
import { Canvas } from "../../canvas/canvas";
import { getData } from "../forms/addNodeModalForm";
import { saveJSON } from "../forms/exportModalForm";
import { getTextBoxContent } from "../forms/addEdgeCategoriesModalForm";
import { ClusterFactory, ClusterInit } from "../../factories/clusterFactory";
import { ContextualGUI } from "../ContextualGUIs/ContextualGUI";
import { TransFactory } from "../../factories/transformerFactory";
import { ColorFactory } from "../../factories/colorFactory";
import { Edge } from "../../graphElements/edge";
import { VirtualElementPool } from "../../visualElements/VirtualElementPool";

interface NetworkData {
  nodes: ClusterInit[];
  edges: Edge[];
}

export class DOM {
  public static pathNetworks = "";
  static event: UIEvent | boolean | undefined = false;
  static buttons: Record<string, HTMLElement> = {};
  // the DOM input elements
  static checkboxes: Record<string, HTMLInputElement> = {};
  static sliders: Record<string, HTMLInputElement> = {};
  // the objects storing the current boolean condition
  static currentCheckboxes: Array<{
    key: unknown;
    value: unknown;
    native: boolean;
  }> = [];
  static textboxes: Record<string, HTMLInputElement> = {};
  static dropdowns: Record<string, HTMLInputElement> = {};
  static labels: Record<string, HTMLElement> = {};
  // the collection of lists of elements in the Filters dropdown in the GUI bar
  static lists: Record<string, HTMLElement> = {};
  static showLegend = true;
  static elements: Record<string, HTMLElement> = {};

  // This constructor is not needed, but it is here because the documentation generatior requires it to format the documentation
  constructor() {}

  /** Initializes all the GUI elements created in the HTML
   */
  static init() {
    // Add GUI Forms
    importNetworkModalForm();

    // Buttons
    DOM.buttons.clearEdges = document.getElementById("clearEdges")!;
    DOM.buttons.submitAddClusterModal = document.getElementById(
      "SubmitAddClusterModal",
    )!;
    DOM.buttons.submitAddNodeModal =
      document.getElementById("SubmitAddNodeModal")!;
    DOM.buttons.exportNetwork = document.getElementById("exportNetwork")!;
    DOM.buttons.importNetwork = document.getElementById("importNetwork")!;
    DOM.buttons.submitEdgeKinds = document.getElementById("submitEdgeKinds")!;
    DOM.buttons.toggle_instructions = document.getElementById(
      "toggle_instructions",
    )!;

    DOM.buttons.clearEdges.onclick = (evt) => DOM.clearEdges(evt);
    DOM.buttons.submitAddClusterModal.onclick = getDataCluster;
    DOM.buttons.submitAddNodeModal.onclick = getData;
    DOM.buttons.exportNetwork.onclick = saveJSON;
    DOM.buttons.importNetwork.onclick = getDataImport;
    DOM.buttons.submitEdgeKinds.onclick = getTextBoxContent;
    DOM.buttons.toggle_instructions.onclick = DOM.toggleInstructions;

    // Checkboxes
    DOM.checkboxes.edit = document.getElementById("edit") as HTMLInputElement;
    DOM.checkboxes.forward = document.getElementById(
      "forward",
    ) as HTMLInputElement;
    DOM.checkboxes.backward = document.getElementById(
      "backward",
    ) as HTMLInputElement;
    DOM.checkboxes.backgroundContrast = document.getElementById(
      "backgroundContrast",
    ) as HTMLInputElement;
    DOM.checkboxes.grid = document.getElementById("grid") as HTMLInputElement;
    DOM.checkboxes.showTexts = document.getElementById(
      "showTexts",
    ) as HTMLInputElement;
    DOM.checkboxes.showEdges = document.getElementById(
      "showEdges",
    ) as HTMLInputElement;
    DOM.checkboxes.showInEdges = document.getElementById(
      "showInEdges",
    ) as HTMLInputElement;
    DOM.checkboxes.showOutEdges = document.getElementById(
      "showOutEdges",
    ) as HTMLInputElement;
    DOM.checkboxes.magnifyingEffect = document.getElementById(
      "magnifyingEffect",
    ) as HTMLInputElement;
    DOM.checkboxes.spacesMenu = document.getElementById(
      "spaces",
    ) as HTMLInputElement;

    DOM.checkboxes.edit.onclick = (evt) => DOM.toggleContextualEdgeMenu(evt);
    DOM.checkboxes.forward.onclick = (evt) => DOM.checkPropagation(evt);
    DOM.checkboxes.backward.onclick = (evt) => DOM.checkPropagation(evt);
    DOM.checkboxes.backgroundContrast.onclick = (evt) => DOM.switchBkgnd(evt);
    DOM.checkboxes.grid.onclick = (evt) => DOM.switchGrid(evt);
    DOM.checkboxes.showTexts.onclick = (evt) => DOM.eventTriggered(evt);
    DOM.checkboxes.showEdges.onclick = (evt) => DOM.eventTriggered(evt);
    DOM.checkboxes.showInEdges.onclick = (evt) => DOM.eventTriggered(evt);
    DOM.checkboxes.showOutEdges.onclick = (evt) => DOM.eventTriggered(evt);
    DOM.checkboxes.magnifyingEffect.onclick = (evt) =>
      DOM.toggleMagnifyingEffect(evt);
    DOM.checkboxes.spacesMenu.onclick = (evt) =>
      DOM.toggleContextualSpacesMenu(evt);

    // Sliders
    DOM.sliders.nodeConnectorFilter = document.getElementById(
      "nodeConnectorFilter",
    ) as HTMLInputElement;
    DOM.sliders.nodeDegreeFilter = document.getElementById(
      "nodeDegreeFilter",
    ) as HTMLInputElement;
    DOM.sliders.nodeSizeFactor = document.getElementById(
      "nodeSizeFactor",
    ) as HTMLInputElement;
    DOM.sliders.edgeTickness = document.getElementById(
      "edgeTickness",
    ) as HTMLInputElement;

    DOM.sliders.nodeConnectorFilter.oninput = (evt) =>
      DOM.eventTriggered(evt as InputEvent);
    DOM.sliders.nodeDegreeFilter.oninput = (evt) =>
      DOM.eventTriggered(evt as InputEvent);
    DOM.sliders.nodeSizeFactor.oninput = (evt) =>
      DOM.eventTriggered(evt as InputEvent);
    DOM.sliders.edgeTickness.oninput = (evt) =>
      DOM.eventTriggered(evt as InputEvent);

    // Dropdowns
    DOM.dropdowns.modelChoice = document.getElementById(
      "modelChoice",
    ) as HTMLInputElement;
    DOM.dropdowns.modelChoice.addEventListener("change", (evt) => {
      DOM.switchModel(DOM.dropdowns.modelChoice.value, evt as InputEvent);
    });

    // TextBoxes
    DOM.textboxes.edgeKinds = document.getElementById(
      "edgeKinds",
    ) as HTMLInputElement;

    // lists
    DOM.lists.filtersA = document.getElementById("filtersA")!;
    DOM.lists.filtersB = document.getElementById("filtersB")!;

    // Elements
    DOM.elements.screenMessage = document.getElementById("screenMessage")!;

    // Get the current status of checkboxes
    DOM.createNativeCurrentCheckboxes();
    DOM.updateCheckboxes();

    // update sliders
    DOM.updateSliders();
  }

  /**
   * Used to export edges from user interaction on the GUI
   * @param {Event} evt
   */
  static exportEdges(evt: UIEvent) {
    // Export edges
    EdgeFactory.recordJSON();
  }

  /**
   * Invoked everytime a DOM element changes to refresh the renderer in draw()
   *
   */
  static eventTriggered(evt: UIEvent) {
    DOM.updateCheckboxes(evt);
    DOM.updateSliders(evt);
    DOM.event = evt;
  }

  /**
   * Returns the value of a checkbox
   * @param {String} id checkbox id
   */
  static boxChecked(id: string) {
    let box = DOM.currentCheckboxes.filter((elm) => elm.key == id)[0];
    return box.value;
  }

  /**
   * Displays a message on the screen
   * @param {*} message
   */
  static showMessage(message: string) {
    DOM.elements.screenMessage.innerText = message;
    DOM.elements.screenMessage.style.left =
      (window.innerWidth - DOM.elements.screenMessage.offsetWidth) / 2 + "px";
    DOM.elements.screenMessage.style.display = "block";
  }

  /**
   * Hides the message displayed on the screen
   */
  static hideMessage() {
    DOM.elements.screenMessage.innerText = "";
    DOM.elements.screenMessage.style.display = "none";
  }

  /**
   * The checkboxes originally designed in the HTML file.
   */
  static createNativeCurrentCheckboxes() {
    for (const checkBox of Object.values(DOM.checkboxes)) {
      let obj = { key: checkBox.id, value: checkBox.checked, native: true };
      DOM.currentCheckboxes.push(obj);
    }
  }

  static updateCheckboxes(evt?: UIEvent) {
    for (const checkBox of Object.values(DOM.checkboxes)) {
      let exists = DOM.currentCheckboxes.filter(
        (elm) => elm.key == checkBox.id,
      )[0];
      if (exists) {
        exists.value = checkBox.checked;
      } else {
        let obj = { key: checkBox.id, value: checkBox.checked, native: false };
        DOM.currentCheckboxes.push(obj);
      }
    }
  }

  static updateSliders(evt?: UIEvent) {
    for (const key of Object.keys(DOM.sliders)) {
      let element = DOM.sliders[key];
      if (element.labels![1]) element.labels![1]!.innerText = element.value;
    }
  }

  /**
   * Invoked everytime a DOM element changes to refresh the renderer in draw()
   */
  static checkPropagation(evt: UIEvent) {
    DOM.updateCheckboxes(evt);
    if (DOM.boxChecked("forward") || DOM.boxChecked("backward")) {
      ClusterFactory.checkPropagation();
    }
    DOM.event = evt;
  }

  /**
   * Changes the background color
   * @param {Event} evt
   */
  static switchBkgnd(evt: UIEvent) {
    DOM.updateCheckboxes(evt);
    if (DOM.boxChecked("backgroundContrast")) {
      Canvas.currentBackground = 50;
    } else {
      Canvas.currentBackground = 250;
    }

    DOM.event = evt;
  }

  /**
   * Switch background visibility
   * @param {Event} evt
   */
  static switchGrid(evt: UIEvent) {
    DOM.updateCheckboxes(evt);
    Canvas.showGrid = !Canvas.showGrid;
    DOM.event = evt;
  }

  /**
   * Delete edges and re-initialize nodes
   */
  static clearEdges(evt: UIEvent) {
    EdgeFactory.reset();
    Canvas.resetVEdges();
    Canvas.resetVConnectors();
    ClusterFactory.resetAllConnectors();
    VirtualElementPool.clear();
    DOM.event = evt;
  }

  /**
   * Loads the network file from the DOM.pathNetworks
   * @param {String} value prefix of the file. Usually a digit.
   */
  static switchModel(value: string, evt?: UIEvent) {
    // Discard the DOM elements in the pool
    VirtualElementPool.clear();
    // reposition canvas to the origin
    Canvas.reset();

    console.log("Switching to " + value + " network");

    gp5.loadJSON(
      DOM.pathNetworks + value + "_network.json",
      (data: NetworkData) => {
        DOM.onLoadNetwork(data, evt);
      },
    );
  }

  /**
   * Callback for loadJSON
   * @param {Object} data { nodes: nodes data, edges: edges data }
   */
  static onLoadNetwork(data: NetworkData, evt?: UIEvent) {
    // Reset canvas, factories and GUI
    Canvas.resetObservers();

    ClusterFactory.reset();
    EdgeFactory.reset();

    // Reset TransFactory After reseting the clusters
    TransFactory.reset();
    TransFactory.init();

    // reset the list of edge kinds
    DOM.reset();

    // get nodes and edges
    let nodesTemp = data.nodes;
    let edgesTemp = data.edges;

    if (nodesTemp.length == 0) {
      ClusterFactory.makeCluster({
        clusterID: "1",
        clusterType: "default",
        clusterLabel: "main space",
        clusterDescription: "The default space built on initialization",
      });
    } else {
      // build clusters and edges
      DOM.buildClusters(nodesTemp);
      DOM.buildEdges(edgesTemp);
    }

    // Get all the kinds of connectors added to the nodes from all clusters
    const connectorKinds = ClusterFactory.getAllConnectorKinds();

    if (connectorKinds.length == 0) connectorKinds.push("default");

    // Add checkboxes to Filters list B in the DOM
    DOM.createCheckboxFor(connectorKinds, DOM.lists.filtersB);

    DOM.resetEdgeContextualMenuInputContent(connectorKinds);

    // Initialize the list of Edge Menu contextual GUI. Contextual menu created in ContextualGUI.init()
    ContextualGUI.init(connectorKinds);

    // Add checkboxes to Space Menu contextual GUI. Contextual menu created in ContextualGUI.init()
    for (const cluster of ClusterFactory.clusters) {
      let transformerTemp = TransFactory.getTransformerByVClusterID(cluster.id);
      ContextualGUI.spacesMenu.addBoolean(cluster.label!, false, (val) => {
        transformerTemp.setActive(val);
      });
    }

    // Create color dictionary for connectors
    ColorFactory.makeDictionary(
      connectorKinds,
      ColorFactory.getPalette(1)!,
      "connectors",
    );

    DOM.updateCheckboxes(evt);
    DOM.event = evt;
  }

  /**
   * Builds clusters with nodes data from JSON file
   * @param {Object} result
   */
  static buildClusters(result: ClusterInit[]) {
    ClusterFactory.reset();
    ClusterFactory.makeClusters(result);
  }

  /**
   * Builds edges with data from JSON file
   * @param {*} result
   */
  static buildEdges(result: Edge[]) {
    EdgeFactory.reset();
    EdgeFactory.buildEdges(result, ClusterFactory.clusters);
  }

  /**
   * Add a checkbox to a DOM element
   * @param {string} names  comma separated names
   * @param {object} list the element to which the checkbox will be appended
   */
  static createCheckboxFor(names: string | string[], list: HTMLElement) {
    let items;
    if (names instanceof Array) {
      items = names;
    } else {
      items = names.split(",");
    }

    for (let index = 0; index < items.length; index++) {
      const name = items[index];

      // div
      let div = document.createElement("div");
      div.classList.add("checkboxItem");

      // checkbox
      let checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.name = name;
      checkbox.value = "value";
      checkbox.id = name;
      checkbox.onclick = DOM.eventTriggered; // event listener

      // label
      var label = document.createElement("label");
      label.classList.add("labelCheckbox");
      label.htmlFor = name;
      label.appendChild(document.createTextNode("\u00A0")); // &nbsp
      label.appendChild(document.createTextNode(name));

      div.appendChild(checkbox);
      div.appendChild(label);

      // prevent duplicate filters in menu
      if (!DOM.childrenExists(name, list)) {
        DOM.checkboxes[name] = checkbox;
        list.appendChild(div);
      }
    }
  }

  /**
   * Remove all the children from a DOM element
   * @param {object} parent the element to which the checkbox will be appended
   */
  static removeChildrenOf(parent: HTMLElement) {
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
    }
  }

  /**
   * Adds a children with a given id into a DOM element
   * @param {string} id the id of the new element
   * @param {object} list a DOM element
   */
  static childrenExists(id: string, list: HTMLElement) {
    for (let index = 0; index < list.children.length; index++) {
      // get the children in the list
      const child = list.children[index];
      // get the input un the case of checkboxes
      const childInput = child.children[0];
      if (childInput.id === id) {
        return true;
      }
    }
    return false;
  }

  static toggleContextualEdgeMenu(evt: UIEvent) {
    ContextualGUI.edgeMenu.toggleVisibility();
    DOM.eventTriggered(evt);
  }

  static toggleContextualSpacesMenu(evt: UIEvent) {
    ContextualGUI.spacesMenu.toggleVisibility();
    DOM.eventTriggered(evt);
  }

  static toggleMagnifyingEffect(evt: UIEvent) {
    DOM.updateCheckboxes(evt);
    DOM.eventTriggered(evt);
  }

  static toggleInstructions() {
    DOM.showLegend = !DOM.showLegend;
  }

  static toggle_visibility(id: string) {
    let e = document.getElementById(id)!;
    if (window.getComputedStyle(e).opacity == "1") {
      e.style.opacity = "0.3";
    } else e.style.opacity = "1";
  }

  static resetEdgeContextualMenuInputContent(val: { toString(): string }) {
    DOM.textboxes.edgeKinds.value = val.toString();
  }

  /**
   * keep only the GUI native object in the currentCheckboxes array
   */
  static resetCheckboxes() {
    DOM.currentCheckboxes = DOM.currentCheckboxes.filter(
      (elm) => elm.native == true,
    );
  }

  static reset() {
    // keep only the GUI native object in the currentCheckboxes array
    DOM.resetCheckboxes();
    // clear the list of edge kinds from the DOM contextual menu
    DOM.resetEdgeContextualMenuInputContent("default");
    // remove all children from Filters dropdown in the GUI bar
    DOM.removeChildrenOf(DOM.lists.filtersB);
  }
}
