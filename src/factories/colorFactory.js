class ColorFactory {

    static loadPalettes(path, names, thenFunction) {
        return new Promise(resolve => {
            resolve(
                // First palette
                gp5.loadStrings(path + names[0], data => {
                    ColorFactory.palettes.push(data);
                    // console.log(0 + ", :" + ColorFactory.palettes.length);
                    // Second palette
                    gp5.loadStrings(path + names[1], data => {
                        ColorFactory.palettes.push(data);
                        // console.log(1 + ", :" + ColorFactory.palettes.length);
                        // Third palette
                        gp5.loadStrings(path + names[2], data => {
                            ColorFactory.palettes.push(data);
                            // console.log(2 + ", :" + ColorFactory.palettes.length);
                            // Fourth palette
                            gp5.loadStrings(path + names[3], data => {
                                ColorFactory.palettes.push(data);
                                // console.log(3 + ", :" + ColorFactory.palettes.length);
                                // Call the "then" function once all the palettes are completed
                                if (thenFunction) {
                                    console.log("Color palettes instantiated")
                                    //thenFunction();
                                }
                            });
                        });
                    });
                })
            );
        });
    }

    static colorBrewerPaletes = {
        sequential: {},
        divergent:{},
        qualitative:{}
    }

    static getPalette(n) {
        let tempIndex = n % ColorFactory.palettes.length;
        return ColorFactory.palettes[tempIndex];
    }

    static getColor(palette, index) {
        let tmpIndex = index % palette.length;
        return palette[tmpIndex];
    }

    static getColorFor(kind) {
        let rtn;
        if (typeof (kind) === 'string') {
            kind = Number(kind)
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

    static makeDictionary(list, palette, name) {
        let dic = {};
        let arr = [];
        if (list instanceof Array) {
            arr = list
        } else {
            arr = list.split(',')
        }

        if (arr.length <= palette.length) {
            for (let i = 0; i < arr.length; i++) {
                dic[arr[i]] = palette[i];
            }

        }
        ColorFactory.dictionaries[name] = dic;
    }

    // GEMINI Nov 27, 2024
    static generateMonochromaticSwatches(baseColor, numShades) {
        const colors = [];
        const baseRGB = ColorFactory.hexToRgb(baseColor);

        for (let i = 0; i < numShades; i++) {
            const shade = Math.round(i * 255 / (numShades - 1));
            const r = Math.round(baseRGB.r * shade / 255);
            const g = Math.round(baseRGB.g * shade / 255);
            const b = Math.round(baseRGB.b * shade / 255);
            colors.push([r, g, b, baseRGB.a]);
        }
        return colors;
    }

    // GEMINI Nov 27, 2024
    static hexToRgb(hex) {
        let rgba = { r: 0, g: 0, b: 0, a: 255 }

        // Remove the '#' symbol if present
        hex = hex.replace('#', '');

        // Extract the red, green, and blue components
        rgba.r = parseInt(hex.substring(0, 2), 16);
        rgba.g = parseInt(hex.substring(2, 4), 16);
        rgba.b = parseInt(hex.substring(4, 6), 16);
        if (hex.length > 6)
            rgba.a = parseInt(hex.substring(6, 8), 16);


        return rgba
    }

    // GEMINI Nov 27, 2024
    static rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
}
ColorFactory.dictionaries = {};
ColorFactory.palettes = [];
ColorFactory.basic = { "r": '#cc0033', "g": '#00cc99', "b": '#0040ff', "y": '#ffbf00', "k": '#000000' };
ColorFactory.baseColors = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF", "#808080", "#FFA500", "#800080", "#008000"];