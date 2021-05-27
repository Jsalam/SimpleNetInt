class ColorFactory {

    static loadPalettes(path, names, thenFunction) {
        return new Promise(resolve => {
            resolve(
                // First palette
                gp5.loadStrings(path + names[0], data => {
                    this.makePalette(data);
                    //ColorFactory.palettes.push(data);
                    //console.log(0 + ", :" + ColorFactory.palettes.length);
                    // Second palette
                    gp5.loadStrings(path + names[1], data => {
                        this.makePalette(data);
                        //console.log(1 + ", :" + ColorFactory.palettes.length);
                        // Third palette
                        gp5.loadStrings(path + names[2], data => {
                            this.makePalette(data);
                            //console.log(2 + ", :" + ColorFactory.palettes.length);
                            // Fourth palette
                            gp5.loadStrings(path + names[3], data => {
                                this.makePalette(data);
                                //console.log(3 + ", :" + ColorFactory.palettes.length);
                                // Fifth palette
                                gp5.loadStrings(path + names[4], data => {
                                    this.makePalette(data);
                                    //console.log(4 + ", :" + ColorFactory.palettes.length);
                                    // Sixth palette
                                    gp5.loadStrings(path + names[5], data => {
                                        this.makePalette(data);
                                        //console.log(5 + ", :" + ColorFactory.palettes.length);
                                        // Seventh palette
                                        gp5.loadStrings(path + names[6], data => {
                                            this.makePalette(data);
                                            //console.log(6 + ", :" + ColorFactory.palettes.length);
                                            // Eighth palette
                                            gp5.loadStrings(path + names[7], data => {
                                                this.makePalette(data);
                                                //console.log(7 + ", :" + ColorFactory.palettes.length);
                                                // Call the "then" function once all the palettes are completed
                                                if (thenFunction) {
                                                    thenFunction();
                                                }
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                })
            );
        });
    }

    static makePalette(data) {
        let pal = { "name": data[0], "theme": data[1], "colors": data.splice(2, data.length) }
        ColorFactory.palettes.push(pal);
    }

    static getPaletteByIndex(n) {
        // this is to get a valid index within the array length 
        let tempIndex = n % ColorFactory.palettes.length;
        return ColorFactory.palettes[tempIndex];
    }

    static getPaletteByName(name) {
        return ColorFactory.palettes.find(pal => pal.name === name)
    }

    static getPaletteByTheme(theme) {
        return ColorFactory.palettes.find(pal => pal.theme === theme)
    }

    static getColor(palette, index) {
        // this is to get a valid index within the array length 
        let tmpIndex = index % palette.colors.length;
        return palette.colors[tmpIndex];
    }

}
ColorFactory.palettes = [];
ColorFactory.basic = { "r": '#cc0033', "g": '#00cc99', "b": '#0040ff', "y": '#ffbf00', "k": '#000000' };