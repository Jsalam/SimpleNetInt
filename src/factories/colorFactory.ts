// This class makes use of chroma.js to generate some color palettes
import p5 from "p5";
import chroma from "chroma-js";
import { gp5 } from "../main";
import { Canvas } from "../canvas/canvas";
import BrewerPaletteName = chroma.BrewerPaletteName;

export class ColorFactory {
  static dictionaries: Record<string, Record<string, string | string[]>> = {};
  static palettes: string[][] = [];
  static basic = {
    r: "#cc0033",
    g: "#00cc99",
    b: "#0040ff",
    y: "#ffbf00",
    k: "#000000",
  };
  static brewerNames = Object.keys(chroma.brewer);
  static chroma = chroma;

  static loadPalettes(path: string, names: string[], thenFunction: () => void) {
    // TODO: Create a promise-returning wrapper function for `loadStrings`
    return new Promise((resolve) => {
      resolve(
        // First palette
        gp5.loadStrings(path + names[0], (data) => {
          ColorFactory.palettes.push(data);
          // console.log(0 + ", :" + ColorFactory.palettes.length);
          // Second palette
          gp5.loadStrings(path + names[1], (data) => {
            ColorFactory.palettes.push(data);
            // console.log(1 + ", :" + ColorFactory.palettes.length);
            // Third palette
            gp5.loadStrings(path + names[2], (data) => {
              ColorFactory.palettes.push(data);
              // console.log(2 + ", :" + ColorFactory.palettes.length);
              // Fourth palette
              gp5.loadStrings(path + names[3], (data) => {
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
        }),
      );
    });
  }

  /**
   * Returns a palette of colors in hex format
   * @param {*} n If a number it retrieves the palette from the native list, if a string it retrieves the palette from chroma.brewer.
   * N can take these values: 'OrRd', 'PuBu', 'BuPu', 'Oranges', 'BuGn', 'YlOrBr', 'YlGn', 'Reds', 'RdPu', 'Greens', 'YlGnBu', 'Purples',
   * 'GnBu', 'Greys', 'YlOrRd', 'PuRd', 'Blues', 'PuBuGn', 'Viridis', 'Spectral', 'RdYlGn', 'RdBu', 'PiYG', 'PRGn', 'RdYlBu', 'BrBG',
   * 'RdGy', 'PuOr', 'Set2', 'Accent', 'Set1', 'Set3', 'Dark2', 'Paired', 'Pastel2', 'Pastel1'
   * @returns the color palette. If the parameter does not match anly palete, it returns the default palete (first of the native ones).
   */
  static getPalette(n: string): string[];
  static getPalette(n: number): string[];
  static getPalette(n: any): string[] {
    // let tempIndex = n % ColorFactory.palettes.length;
    // return ColorFactory.palettes[tempIndex];
    if (typeof n === "number") {
      let tempIndex = n % ColorFactory.palettes.length;
      return ColorFactory.palettes[tempIndex];
    } else if (typeof n === "string") {
      return chroma.brewer[n as BrewerPaletteName];
    } else return ColorFactory.palettes[0];
  }

  static getColor(palette: string[], index: number) {
    let tmpIndex = index % palette.length;
    return palette[tmpIndex];
  }

  static getColorFor(kind: string | number) {
    let rtn;
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
        if (Canvas.currentBackground < 150) {
          rtn = "#EEEEEE";
        } else {
          rtn = "#000000";
        }
    }

    return rtn;
  }

  static makeDictionary(
    list: string | string[],
    palette: string[],
    name: string,
  ) {
    let dic: Record<string, string | string[]> = {};
    let arr = [];
    if (list instanceof Array) {
      arr = list;
    } else {
      arr = list.split(",");
    }

    if (arr.length <= palette.length) {
      for (let i = 0; i < arr.length; i++) {
        // if the palete is a name of the colorBrewer insert the array of colors
        if (ColorFactory.brewerNames.includes(palette[i])) {
          dic[arr[i]] = chroma.brewer[palette[i] as BrewerPaletteName];
        } else {
          dic[arr[i]] = palette[i];
        }
      }
    }
    if (!Object.keys(ColorFactory.dictionaries).includes(name)) {
      ColorFactory.dictionaries[name] = dic;
    } else {
      ColorFactory.updateDictionary(name, dic);
      // console.log("TODO update dictionary")
    }
  }

  /**
   * This was intended to update the dictionary of colors. It is not working yet.
   * @param {*} name
   */
  static updateDictionary(
    name: string,
    dic: Record<string, string | string[]>,
  ) {
    ColorFactory.dictionaries[name] = dic;
  }

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
  static getColorFromDictionary(
    key1: string,
    key2: string = "",
    index: number = 0,
  ) {
    try {
      let entry = ColorFactory.dictionaries[key1];
      let rtn;
      // if the key2 is not empty, it means that the dictionary is a dictionary of arrays
      if (key2 !== "") {
        // get the color at the index position from the internal array named with key2
        rtn = entry[key2][index % entry[key2].length];
      } else {
        // get the color at the index position from the array of colors if the key2 is not provided
        rtn = entry[Object.keys(entry)[index % Object.keys(entry).length]];
      }

      // return white if the color is not defined
      if (rtn === undefined) {
        return "#FFFFFF";
      } else {
        return rtn;
      }
    } catch (error) {
      return "#FFFFFF";
    }
  }

  static convertP5ColorToHex(color: p5.Color): string {
    let r = gp5.red(color);
    let g = gp5.green(color);
    let b = gp5.blue(color);
    let hex =
      "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    return hex;
  }
}
