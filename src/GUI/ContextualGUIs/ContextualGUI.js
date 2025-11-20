"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextualGUI = void 0;
var quicksettings_1 = require("quicksettings");
var DOMManager_1 = require("../DOM/DOMManager");
require("../../../node_modules/quicksettings/quicksettings.css");
/**
 * This class uses the library Quicksettings. See http://bit101.github.io/quicksettings/
 */
var ContextualGUI = /** @class */ (function () {
    // This constructor is not needed, but it is here because the documentation generator requires it to format the documentation
    function ContextualGUI() {
    }
    ContextualGUI.subscribe = function (obj) {
        ContextualGUI.observers.push(obj);
    };
    ContextualGUI.unsubscribe = function (obj) { };
    ContextualGUI.notifyObservers = function (data) {
        var _a;
        for (var _i = 0, _b = ContextualGUI.observers; _i < _b.length; _i++) {
            var obs = _b[_i];
            (_a = obs.getDataFromContextualGUI) === null || _a === void 0 ? void 0 : _a.call(obs, data);
        }
    };
    /**x
     * Init from string
     * @param {string} kinds comma separated names
     */
    ContextualGUI.init = function (kinds) {
        // Destroy the menu if it exists
        if (ContextualGUI.edgeMenu) {
            ContextualGUI.edgeMenu.destroy();
            ContextualGUI.edgeCategories = [];
        }
        // Create Contextual GUIs edges
        ContextualGUI.createEdgeMenu().then(function () {
            // populate contextual menu
            if (kinds instanceof Array)
                ContextualGUI.edgeCategories = kinds;
            else
                ContextualGUI.edgeCategories = kinds.split(",");
            ContextualGUI.addEdgeCheckboxes("Categories", ContextualGUI.edgeCategories);
        });
        // Create Contextual GUI spaces
        ContextualGUI.createSpacesMenu();
    };
    /**
     * This function is not being used.
     *
     * Init from collection of strings
     * param {*} collection collection of strings
     */
    // static init2(collection: string[]) {
    //   // Destroy the menu if it exists
    //   if (ContextualGUI.edgeMenu) {
    //     ContextualGUI.edgeMenu.destroy();
    //   }
    //   // Create Contextual GUI edges
    //   ContextualGUI.createEdgeMenu();
    //   ContextualGUI.addEdgeCheckboxes("Categories", collection);
    // }
    /**
     * The menu to choose edge kinds
     */
    ContextualGUI.createEdgeMenu = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        console.log("Creating edge menu");
                        ContextualGUI.edgeMenu = quicksettings_1.default.create(window.innerWidth - 240, window.innerHeight - 240, "Edge Menu", document.getElementById("model"));
                        // Switch it off if the checkbox is off
                        if (!DOMManager_1.DOM.checkboxes.edit.checked) {
                            ContextualGUI.edgeMenu.toggleVisibility();
                        }
                        resolve();
                    })];
            });
        });
    };
    /**
     * The menu to toggle individual transformation spaces
     */
    ContextualGUI.createSpacesMenu = function () {
        console.log("Creating spaces menu");
        // Check first if this already exists
        if (!ContextualGUI.spacesMenu) {
            ContextualGUI.spacesMenu = quicksettings_1.default.create(window.innerWidth - 540, window.innerHeight - 240, "Spaces Menu", document.getElementById("model"));
        }
        else {
            ContextualGUI.clearFloatingMenu(ContextualGUI.spacesMenu);
            //  ContextualGUI.spacesMenu.destroy();
        }
        //Switch it off is the checkbox is off
        if (!DOMManager_1.DOM.checkboxes.spacesMenu.checked) {
            ContextualGUI.spacesMenu.toggleVisibility();
        }
    };
    ContextualGUI.addEdgeCheckboxes = function (label, items) {
        // the callback here is used when a new option is chosen
        ContextualGUI.edgeMenu.addDropDown(label, items, function (val) {
            ContextualGUI.edgeMenuChoice = val.value;
            ContextualGUI.notifyObservers(val.value);
        });
        // get the value of first selected item in the dropdown at the moment of adding new checkboxes
        var tmp = ContextualGUI.edgeMenu.getValue("Categories").value;
        ContextualGUI.notifyObservers(tmp);
        ContextualGUI.edgeMenuChoice = tmp;
    };
    ContextualGUI.getValue = function (val) {
        ContextualGUI._edgeMenuValue = val.value;
        console.log("value changed");
    };
    ContextualGUI.setEdgeMenuValue = function (val) {
        ContextualGUI._edgeMenuValue = val;
    };
    ContextualGUI.addEdgeCategory = function (cat) {
        var rtn = false;
        if (!ContextualGUI.edgeCategories.includes(cat)) {
            ContextualGUI.edgeCategories.push(cat);
            rtn = true;
        }
        return rtn;
    };
    ContextualGUI.clearFloatingMenu = function (menu) {
        var values = menu.getValuesAsJSON(false);
        for (var _i = 0, _a = Object.keys(values); _i < _a.length; _i++) {
            var controlName = _a[_i];
            menu.removeControl(controlName);
        }
    };
    ContextualGUI.observers = [];
    ContextualGUI.edgeCategories = [];
    return ContextualGUI;
}());
exports.ContextualGUI = ContextualGUI;
// Attach ContextualGUI to the global window object
window.ContextualGUI = ContextualGUI;
