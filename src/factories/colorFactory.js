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
                                    thenFunction();
                                }
                            });
                        });
                    });
                })
            );
            console.log("Colors palettes instantiated");
        });
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
        switch (kind) {
            // Edges
            case "Book":
                rtn = "#172940"
                break;
            case "Inara":
                rtn = "#68182D";
                break;
            case "Jayne":
                rtn = "#E84C25";
                break;
            case "Kaylee":
                rtn = "#A6499B";
                break;
            case "Mal":
                rtn = "#8C6444";
                break;
            case "River":
                rtn = "#FAC7C4";
                break;
            case "Serenity":
                rtn = "#FAA61A";
                break;
            case "Simon":
                rtn = "#F2E640";
                break;
            case "Wash":
                rtn = "#7DC6BB";
                break;
            case "Zoe":
                rtn = "#613967";
                break;
                // Categories
            case "1":
                rtn = "#FA1374";
                break;
            case "2":
                rtn = "#FAFA74";
                break;
            case "3":
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

}
ColorFactory.palettes = [];
ColorFactory.basic = { "r": '#cc0033', "g": '#00cc99', "b": '#0040ff', "y": '#ffbf00', "k": '#000000' };