"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColorFactory = void 0;
const chroma_js_1 = __importDefault(require("chroma-js"));
const main_1 = require("../main");
class ColorFactory {
    // The dictionaries are used to store objects with key:value pairs under a labeled entry. The values are HEX colors 
    static dictionaries = {};
    static palettes2 = { 'categorical': {}, 'sequential': {} };
    static colorsPath = "./files/colorPalettes/originalPalettes/";
    static palettes = [];
    static brewerNames = Object.keys(chroma_js_1.default.brewer);
    static chroma = chroma_js_1.default;
    // These are the tranformations applied to color mapping.
    static scalarTransforms = {
        linear: (v) => v,
        log: Math.log10,
        sqrt: Math.sqrt,
    };
    static init() {
        ColorFactory.addBasicPalette();
        ColorFactory.loadPalette(this.colorsPath, "palette1.txt", (data) => {
            ColorFactory.addCategoricalPalette('palette1', data);
        });
        ColorFactory.loadPalette(this.colorsPath, "palette2.txt", (data) => {
            ColorFactory.addCategoricalPalette('palette2', data);
        });
        ColorFactory.loadPalette(this.colorsPath, "palette3.txt", (data) => {
            ColorFactory.addCategoricalPalette('palette3', data);
        });
        ColorFactory.loadPalette(this.colorsPath, "palette4.txt", (data) => {
            ColorFactory.addCategoricalPalette('palette4', data);
        });
    }
    /**
    * Loads a list of HEX colors from a given path. The loaded color lists are stored in the
    * ColorFactory.palettes array.
    * @param path the path to the palette
    * @param name the palette file name
    * @param thenFunction
    * @returns
    */
    static loadPalette(path, name, thenFunction) {
        // TODO: Create a promise-returning wrapper function for `loadStrings`
        return new Promise((resolve) => {
            resolve(
            // First palette
            main_1.gp5.loadStrings(path + name, (data) => {
                ColorFactory.palettes.push(data);
                thenFunction(data);
            }));
        });
    }
    /**
     * Adds a palette to the dictionary of pallets under 'categorical' or 'sequential' depending of the value data type
     * @param key
     * @param val
     */
    static addCategoricalPalette(key, val) {
        if (Array.isArray(val)) {
            ColorFactory.palettes2['categorical'][key] = val;
        }
    }
    /**
   * Adds a palette to the dictionary of pallets under 'categorical' or 'sequential' depending of the value data type
   * @param key
   * @param val
   */
    static addSequentialPalette(key, val) {
        if (Array.isArray(val) && val.length >= 2 && val.length <= 3) {
            ColorFactory.palettes2['sequential'][key] = ColorFactory.chroma.scale(val);
        }
        else if (val) {
            ColorFactory.palettes2['sequential'][key] = val;
        }
    }
    static addBasicPalette() {
        const basic = ["#cc0033", "#00cc99", "#0040ff", "#ffbf00", "#000000"];
        ColorFactory.palettes2['categorical']['basic'] = basic;
    }
    static resetSequentialPalettes() {
        ColorFactory.palettes2['sequential'] = {};
    }
    /**
     *
     * Returns a palette of colors in hex format
     * @param {*} n If a number it retrieves the palette from the native list, if a string it retrieves the palette from chroma.brewer.
     * N can take these values: 'OrRd', 'PuBu', 'BuPu', 'Oranges', 'BuGn', 'YlOrBr', 'YlGn', 'Reds', 'RdPu', 'Greens', 'YlGnBu', 'Purples',
     * 'GnBu', 'Greys', 'YlOrRd', 'PuRd', 'Blues', 'PuBuGn', 'Viridis', 'Spectral', 'RdYlGn', 'RdBu', 'PiYG', 'PRGn', 'RdYlBu', 'BrBG',
     * 'RdGy', 'PuOr', 'Set2', 'Accent', 'Set1', 'Set3', 'Dark2', 'Paired', 'Pastel2', 'Pastel1'
     * @param n the name of the color palette stored in the palette2 dictionary or any of Brewer names
     * @returns an array of HEX colors. If the parameter does not match anly palete, it returns the Greys palete.
     */
    static getCategoricalPalette(n) {
        if (typeof n === "string") {
            if (this.brewerNames.includes(n)) {
                return chroma_js_1.default.brewer[n];
            }
            else {
                return ColorFactory.palettes2['categorical'][n];
            }
        }
        else {
            return chroma_js_1.default.brewer['Greys'];
        }
    }
    static getSequentialPalette(n) {
        return ColorFactory.palettes2['sequential'][n];
    }
    static getColor(palette, num) {
        if (Array.isArray(palette)) {
            let tmpIndex = num % palette.length;
            return palette[tmpIndex];
        }
        else {
            return palette(num).hex();
        }
    }
    /**
     * A Dictionary in the ColorFactory class is a lists of attribute:index pairs where attribute is an attribute of a vNode such as
     * a connector. The index is the index of the color of such attribute in an array of colors.
     * By default this code uses the color array 'palette2' stored ColorFactory.palettes2.
     * @param list
     * @param palette
     * @param name
     */
    static makeDictionary(list, palette, name) {
        let dic = {};
        let arr = [];
        if (list instanceof Array) {
            arr = list;
        }
        else {
            arr = list.split(",");
        }
        if (Array.isArray(palette) && arr.length <= palette.length) {
            for (let i = 0; i < arr.length; i++) {
                dic[arr[i]] = i;
            }
        }
        ColorFactory.dictionaries[name] = dic;
    }
    static convertP5ColorToHex(color) {
        let r = main_1.gp5.red(color);
        let g = main_1.gp5.green(color);
        let b = main_1.gp5.blue(color);
        let a = main_1.gp5.alpha(color);
        let hex = "#" +
            ((1 << 24) + (r << 16) + (g << 8) + b)
                .toString(16)
                .slice(1)
                .toUpperCase();
        if (a < 255) {
            hex += Math.round(a).toString(16).padStart(2, "0").toUpperCase();
        }
        return hex;
    }
}
exports.ColorFactory = ColorFactory;
// Attach ColorFactory to the global window object
window.ColorFactory = ColorFactory;
//# sourceMappingURL=colorFactory.js.map