"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsPanelFactory = void 0;
const DOMUtils_1 = require("../GUI/ContextualGUIs/DOMUtils");
const ClusterSettings_1 = require("../GUI/widgets/ClusterSettings");
class SettingsPanelFactory {
    static _cSettingsMap = new Map();
    static setSettings(el, settings) {
        this._cSettingsMap.set(el, settings);
    }
    static pushSettings(el, settings) {
        const existingSettings = this._cSettingsMap.get(el);
        existingSettings.push(settings);
    }
    static cSettingsHasElement(el) {
        return this._cSettingsMap.has(el);
    }
    static getSettings(el) {
        return this._cSettingsMap.get(el);
    }
    static deleteSettings(el) {
        this._cSettingsMap.delete(el);
    }
    //check if any HTMLElement key of the map has a given id
    static getKeyById(id) {
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
       * @param updateVCluster true if the instance of ClusterSettings needs to update the vCluster visualization
       * @param containerElement the container element to append the settings widget to (optional)
       */
    static add(vCluster, updateVCluster, containerElement) {
        const settings = new ClusterSettings_1.ClusterSettings(vCluster, updateVCluster);
        let containerTmp;
        if (containerElement) {
            containerTmp = containerElement;
            containerTmp.append(settings.root);
            let oldContainer = this.getKeyById(containerTmp.id);
            if (oldContainer) {
                oldContainer.append(settings.root);
                this.pushSettings(oldContainer, settings);
            }
            else {
                containerTmp.append(settings.root);
                this.setSettings(containerTmp, [settings]);
            }
        }
        else {
            let oldContainer = this.getKeyById("cSettingsMain");
            if (oldContainer) {
                oldContainer.append(settings.root);
                this.pushSettings(oldContainer, settings);
            }
            else {
                containerTmp = this.makeHTMLcontainer();
                containerTmp.append(settings.root);
                this.setSettings(containerTmp, [settings]);
            }
        }
        return settings;
    }
    /*  Public methods  */
    static makeHTMLcontainer() {
        let tmp = (0, DOMUtils_1.createElement)("div", {
            position: "absolute",
            left: "0",
            top: "10px",
            // bottom: "0",
            width: "250px",
            overflowY: "scroll",
            scrollbarWidth: "none",
            height: 'fitContent'
        });
        // Add inline styles for WebKit browsers (Chrome, Edge, Safari)
        tmp.style.cssText += "::-webkit-scrollbar { display: none; }";
        tmp.onwheel = (e) => {
            e.stopPropagation();
        };
        tmp.onmousedown = (e) => {
            e.stopPropagation();
        };
        // add an id to this container
        tmp.id = "cSettingsMain";
        document.querySelector("#model").append(tmp);
        return tmp;
    }
    /**
     * See implementations in canvas.ts
     */
    static reset() {
        // Delete children
        let node = document.getElementById('cSettingsMain');
        node?.replaceChildren();
        // remove main element
        node?.remove();
        // clear map
        this._cSettingsMap.clear();
    }
}
exports.SettingsPanelFactory = SettingsPanelFactory;
// Attach ClusterFactory to the global window object
window.SettingsPanelFactory = SettingsPanelFactory;
//# sourceMappingURL=settingsPanelFactory.js.map