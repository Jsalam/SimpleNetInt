/**
 * The idea here is to create a factory that generates and stores settings for each 
 * cluster in the application. These settings can include visual parameters, layout
 * options, and other configurations that define how each cluster and its nodes behave
 * and appear.
 * The settings are usually assembled into a user menu or panel, allowing users to
 * customize the appearance and behavior of clusters interactively.
 * 
 * This factory is closely tied to the ClusterSettings class.
 */

import { createElement } from "../GUI/ContextualGUIs/DOMUtils";
import { ClusterSettings } from "../GUI/widgets/ClusterSettings";
import { VCluster } from "../visualElements/vCluster";


export class ClusterSettingsFactory {

    private static _cSettingsMap = new Map<HTMLElement, ClusterSettings[]>();

    public static setSettings(el: HTMLElement, settings: ClusterSettings[]) {
        this._cSettingsMap.set(el, settings);
    }

    public static pushSettings(el: HTMLElement, settings: ClusterSettings) {
        const existingSettings: ClusterSettings[] | undefined = this._cSettingsMap.get(el);
        existingSettings!.push(settings)
    }

    public static cSettingsHasElement(el: HTMLElement) {
        return this._cSettingsMap.has(el);
    }

    public static getSettings(el: HTMLElement) {
        return this._cSettingsMap.get(el);
    }
    public static deleteSettings(el: HTMLElement) {
        this._cSettingsMap.delete(el);
    }

    //check if any HTMLElement key of the map has a given id
    public static getKeyById(id: string) {
        for (let key of this._cSettingsMap.keys()) {
            if (key.id === id) {
                return key;
            }
        }
        return undefined;
    }


    /**
       * Add a new ClusterSettings widget for the given VCluster. The widget is appended to 
       * the specified container element or to the default container.
       * @param vCluster the VCluster instance to create settings for
       * @param containerElement the container element to append the settings widget to (optional)
       */
    public static add(vCluster: VCluster, containerElement?: HTMLElement) {
        const settings = new ClusterSettings(vCluster);
        let containerTmp: HTMLElement;

        if (containerElement) {
            containerTmp = containerElement;
            containerTmp.append(settings.root);

        } else {
            let oldContainer = this.getKeyById("cSettingsMain");
            if (oldContainer) {
                oldContainer.append(settings.root);
                this.pushSettings(oldContainer, settings);
            } else {
                containerTmp = this.makeHTMLcontainer();
                containerTmp.append(settings.root);
                this.setSettings(containerTmp, [settings]);
            }
        }
    }

    /*  Public methods  */
    public static makeHTMLcontainer() {

        let tmp = createElement("div", {
            position: "absolute",
            left: "0",
            top: "10px",
            bottom: "0",
            width: "250px",
            overflowY: "scroll",
        });
        tmp.onwheel = (e) => {
            e.stopPropagation();
        };
        tmp.onmousedown = (e) => {
            e.stopPropagation();
        };
        // ad an id to this container
        tmp.id = "cSettingsMain";

        document.querySelector("#model")!.append(tmp);
        return tmp;
    }

    /**
     * See implementations in canvas.ts
     */
    public static reset() {
        // Delete children
        let node = document.getElementById('cSettingsMain')
        node?.replaceChildren();

        // remove main element
        node?.remove();

        // clear map
        this._cSettingsMap.clear();
    }
}

// Attach ClusterFactory to the global window object
(window as any).ClusterSettingsFactory = ClusterSettingsFactory;