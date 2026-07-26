import { ClusterLegend } from "../GUI/legends/ClusterLegend";
import { createElement } from "../GUI/DOM/DOMUtils";
import { VCluster } from "../visualElements/vCluster";

export class LegendFactory {
  // This is the container that stores insatnces of ClusterLegends
  private static _cLegendsMap = new Map<HTMLElement, ClusterLegend[]>();

  //check if any HTMLElement key of the map has a given id
  public static getContainerById(id: string) {
    for (let key of this._cLegendsMap.keys()) {
      if (key.id === id) {
        return key;
      }
    }
    return undefined;
  }

  public static pushLegend(el: HTMLElement, legend: ClusterLegend) {
    const existingSettings: ClusterLegend[] | undefined = this._cLegendsMap.get(el);
    existingSettings!.push(legend);
  }

  public static setLegend(el: HTMLElement, settings: ClusterLegend[]) {
    this._cLegendsMap.set(el, settings);
  }

  public static add(vCluster: VCluster, containerElement?: HTMLElement) {
    // instantiate a legend for this cluster
    const legend = new ClusterLegend(vCluster);
    legend.addVScale();
    legend.addScaleValues();
    

    // containerTmp will reference the DOM element where the legend should be placed.
    let containerTmp: HTMLElement;

    // If a containerElement is provided, use it; otherwise create/find a default container.
    if (containerElement) {
      containerTmp = containerElement;
      containerTmp.append(legend.container);
      let oldContainer = this.getContainerById(containerTmp.id);
      if (oldContainer) {
        oldContainer.append(legend.container);
        this.pushLegend(oldContainer, legend);
      } else {
        containerTmp.append(legend.container);
        this.setLegend(containerTmp, [legend]);
      }
    } else {
      let oldContainer = this.getContainerById("cLegendsMain");
      if (oldContainer) {
        oldContainer.append(legend.container);
        this.pushLegend(oldContainer, legend);
      } else {
        containerTmp = this.makeHTMLcontainer();
        containerTmp.append(legend.container);
        this.setLegend(containerTmp, [legend]);
      }
    }
    return legend;
  }

  private static makeHTMLcontainer() {
    let tmp = createElement("div", null, "cLegendsMain");
    // Add inline styles for WebKit browsers (Chrome, Edge, Safari)
    tmp.style.cssText += "::-webkit-scrollbar { display: none; }";

    tmp.onwheel = (e) => {
      e.stopPropagation();
    };
    tmp.onmousedown = (e) => {
      e.stopPropagation();
    };
    // add an id to this container
    tmp.id = "cLegendsMain";

    // Add a title
    let title = createElement("div", null, "CSControl");
    title.innerHTML = "Legend";
    tmp.append(title);

    document.querySelector("#model")!.append(tmp);
    return tmp;
  }

  public static getClusterLengendsAsArray(): ClusterLegend[] {
    const legends: ClusterLegend[] = [];
    for (const clusterLegends of this._cLegendsMap.values()) {
      legends.push(...clusterLegends);
    }
    return legends;
  }

  /**
   * See implementations in canvas.ts
   */
  public static reset() {
    // Delete children
    let node = document.getElementById("cLegendsMain");
    node?.replaceChildren();

    // remove main element
    node?.remove();

    // clear map
    this._cLegendsMap.clear();
  }
}

// Attach LegendFactory to the global window object
(window as any).LegendFactory = LegendFactory;
