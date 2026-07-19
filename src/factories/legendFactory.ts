import { ClusterLegend } from "../GUI/legends/ClusterLegend";
import { createElement } from "../GUI/DOM/DOMUtils";
import { VCluster } from "../visualElements/vCluster";

export class LegendFactory {
  private static _cLegendsMap = new Map<HTMLElement, ClusterLegend[]>();

  //check if any HTMLElement key of the map has a given id
  public static getKeyById(id: string) {
    for (let key of this._cLegendsMap.keys()) {
      if (key.id === id) {
        return key;
      }
    }
    return undefined;
  }

  public static pushLegend(el: HTMLElement, legend: ClusterLegend) {
    const existingSettings: ClusterLegend[] | undefined =
      this._cLegendsMap.get(el);
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

    let containerTmp: HTMLElement;

    if (containerElement) {
      containerTmp = containerElement;
      containerTmp.append(legend.container);
      let oldContainer = this.getKeyById(containerTmp.id);
      if (oldContainer) {
        oldContainer.append(legend.container);
        this.pushLegend(oldContainer, legend);
      } else {
        containerTmp.append(legend.container);
        this.setLegend(containerTmp, [legend]);
      }
    } else {
      let oldContainer = this.getKeyById("cLegendsMain");
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

  public static makeHTMLcontainer() {
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
    let title = createElement("div", null, "CSTitle");
    title.innerHTML = "Legend";
    tmp.append(title);

    document.querySelector("#model")!.append(tmp);
    return tmp;
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

// Attach ClusterFactory to the global window object
(window as any).LegendFactory = LegendFactory;
