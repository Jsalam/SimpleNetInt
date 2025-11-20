"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColorFactory = void 0;
var chroma_js_1 = require("chroma-js");
var main_1 = require("../main");
var canvas_1 = require("../canvas/canvas");
var ColorFactory = /** @class */ (function () {
    function ColorFactory() {
    }
    ColorFactory.loadPalettes = function (path, names, thenFunction) {
        // TODO: Create a promise-returning wrapper function for `loadStrings`
        return new Promise(function (resolve) {
            resolve(
            // First palette
            main_1.gp5.loadStrings(path + names[0], function (data) {
                ColorFactory.palettes.push(data);
                // console.log(0 + ", :" + ColorFactory.palettes.length);
                // Second palette
                main_1.gp5.loadStrings(path + names[1], function (data) {
                    ColorFactory.palettes.push(data);
                    // console.log(1 + ", :" + ColorFactory.palettes.length);
                    // Third palette
                    main_1.gp5.loadStrings(path + names[2], function (data) {
                        ColorFactory.palettes.push(data);
                        // console.log(2 + ", :" + ColorFactory.palettes.length);
                        // Fourth palette
                        main_1.gp5.loadStrings(path + names[3], function (data) {
                            ColorFactory.palettes.push(data);
                            // console.log(3 + ", :" + ColorFactory.palettes.length);
                            // Call the "then" function once all the palettes are completed
                            // NOTE: the whole code could be simplified using async/await
                            // if (thenFunction) {
                            console.log("Color palettes instantiated");
                            //thenFunction();
                            //  }
                        });
                    });
                });
            }));
        });
    };
    ColorFactory.getPalette = function (n) {
        // let tempIndex = n % ColorFactory.palettes.length;
        // return ColorFactory.palettes[tempIndex];
        if (typeof n === "number") {
            var tempIndex = n % ColorFactory.palettes.length;
            return ColorFactory.palettes[tempIndex];
        }
        else if (typeof n === "string") {
            return chroma_js_1.default.brewer[n];
        }
        else
            return ColorFactory.palettes[0];
    };
    ColorFactory.getColor = function (palette, index) {
        var tmpIndex = index % palette.length;
        return palette[tmpIndex];
    };
    ColorFactory.getColorFor = function (kind) {
        var rtn;
        if (typeof kind === "string") {
            kind = Number(kind);
        }
        switch (kind) {
            // Categories
            case 1:
                rtn = "#FA1374";
                break;
            case 2:
                rtn = "#FAFA74";
                break;
            case 3:
                rtn = "#74FAFA";
                break;
            default:
                if (canvas_1.Canvas.currentBackground < 150) {
                    rtn = "#EEEEEE";
                }
                else {
                    rtn = "#000000";
                }
        }
        return rtn;
    };
    ColorFactory.makeDictionary = function (list, palette, name) {
        var dic = {};
        var arr = [];
        if (list instanceof Array) {
            arr = list;
        }
        else {
            arr = list.split(",");
        }
        if (arr.length <= palette.length) {
            for (var i = 0; i < arr.length; i++) {
                // if the palete is a name of the colorBrewer insert the array of colors
                if (ColorFactory.brewerNames.includes(palette[i])) {
                    dic[arr[i]] = chroma_js_1.default.brewer[palette[i]];
                }
                else {
                    dic[arr[i]] = palette[i];
                }
            }
        }
        if (!Object.keys(ColorFactory.dictionaries).includes(name)) {
            ColorFactory.dictionaries[name] = dic;
        }
        else {
            ColorFactory.updateDictionary(name, dic);
            // console.log("TODO update dictionary")
        }
    };
    /**
     * This was intended to update the dictionary of colors. It is not working yet.
     * @param {*} name
     */
    ColorFactory.updateDictionary = function (name, dic) {
        ColorFactory.dictionaries[name] = dic;
    };
    /**
     * A public collection of colors stored in an object one or more key:value pairs.
     * The key is the name of the entry and the value is an object that contains either
     * a color or an array of colors. Colors are stored in hex format.
     * @param {*} key1 The key for the entry in the dictionary object
     * @param {*} key2 This is used when the dictionary entry contains an object of
     * key:array pairs. The key of the internal array of colors if any.
     * @param {*} index The index of the color in the dictionary entry. If key2 id provided,
     * this is the index in the array of colors.
     * @returns the color of the palete in the the index position. White if the color is
     * not defined or there is an error.
     */
    ColorFactory.getColorFromDictionary = function (key1, key2, index) {
        if (key2 === void 0) { key2 = ""; }
        if (index === void 0) { index = 0; }
        try {
            var entry = ColorFactory.dictionaries[key1];
            var rtn = void 0;
            // if the key2 is not empty, it means that the dictionary is a dictionary of arrays
            if (key2 !== "") {
                // get the color at the index position from the internal array named with key2
                rtn = entry[key2][index % entry[key2].length];
            }
            else {
                // get the color at the index position from the array of colors if the key2 is not provided
                rtn = entry[Object.keys(entry)[index % Object.keys(entry).length]];
            }
            // return white if the color is not defined
            if (rtn === undefined) {
                return "#FFFFFF";
            }
            else {
                return rtn;
            }
        }
        catch (error) {
            return "#FFFFFF";
        }
    };
    ColorFactory.convertP5ColorToHex = function (color) {
        var r = main_1.gp5.red(color);
        var g = main_1.gp5.green(color);
        var b = main_1.gp5.blue(color);
        var a = main_1.gp5.alpha(color);
        var hex = "#" +
            ((1 << 24) + (r << 16) + (g << 8) + b)
                .toString(16)
                .slice(1)
                .toUpperCase();
        if (a < 255) {
            hex += Math.round(a).toString(16).padStart(2, "0").toUpperCase();
        }
        return hex;
    };
    ColorFactory.dictionaries = {};
    ColorFactory.palettes = [];
    ColorFactory.basic = {
        r: "#cc0033",
        g: "#00cc99",
        b: "#0040ff",
        y: "#ffbf00",
        k: "#000000",
    };
    ColorFactory.brewerNames = Object.keys(chroma_js_1.default.brewer);
    ColorFactory.chroma = chroma_js_1.default;
    return ColorFactory;
}());
exports.ColorFactory = ColorFactory;
