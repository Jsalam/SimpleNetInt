class ColorFactory {

    static loadPalettes(path, names, thenFunction) {
        return new Promise(resolve => {
            resolve(
                // First palette
                gp5.loadStrings(path + names[0], data => {
                    ColorFactory.palettes.push(data);
                    console.log(0 + ", :" + ColorFactory.palettes.length);
                    // Second palette
                    gp5.loadStrings(path + names[1], data => {
                        ColorFactory.palettes.push(data);
                        console.log(1 + ", :" + ColorFactory.palettes.length);
                        // Third palette
                        gp5.loadStrings(path + names[2], data => {
                            ColorFactory.palettes.push(data);
                            console.log(2 + ", :" + ColorFactory.palettes.length);
                            // Fourth palette
                            gp5.loadStrings(path + names[3], data => {
                                ColorFactory.palettes.push(data);
                                console.log(3 + ", :" + ColorFactory.palettes.length);
                                // Call the "then" function once all the palettes are completed
                                if (thenFunction) {
                                    thenFunction();
                                }
                            });
                        });
                    });
                })
            );
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

}
ColorFactory.palettes = [];
ColorFactory.basic = { "r": '#cc0033', "g": '#00cc99', "b": '#0040ff', "y": '#ffbf00', "k": '#000000' };