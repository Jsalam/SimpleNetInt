class ThemeFlow {
    constructor(_x, _y, _nRibbons, _ribbonHeight) {
        this.org = gp5.createVector(_x, _y)
            // frets
        this.frets = [];
        this.nFrets = 50;
        this.fretGap = 45;
        // strings
        this.ribbonHeight = _ribbonHeight;
        this.nRibbons = _nRibbons;
        this.chords = [];
        this.arm = this.fretGap / 2;
        // ribbons
        this.ribbons = [];
        this.init();
    }


    init() {
        // Build Frets 
        let pos = this.nRibbons;
        let chordGapFactor = 0.2;

        // Custom made frets on west side
        let tmpOrg1 = gp5.createVector(0, 470);
        let tmpOrg2 = gp5.createVector(270, 470);
        this.frets.push(new Fret(p5.Vector.add(this.org, tmpOrg1), this.ribbonHeight, this.nRibbons, pos, chordGapFactor));

        this.frets.push(new Fret(p5.Vector.add(this.org, tmpOrg2), this.ribbonHeight, this.nRibbons, pos, chordGapFactor));

        // Intermediate frets
        for (let i = 1; i < this.nFrets; i++) {
            let x = 270 + (i * this.fretGap);
            let tmpOrg3 = gp5.createVector(x, 470);
            // this is the temporary position of each dot in the theme flow
            pos = gp5.floor(gp5.random(1, this.nRibbons + 1));
            chordGapFactor = this.nRibbons / Math.pow(this.nRibbons, 2);
            this.frets.push(new Fret(p5.Vector.add(this.org, tmpOrg3), this.ribbonHeight, this.nRibbons, pos, chordGapFactor));
        }

        // Custom made frets on east side
        pos = this.nRibbons;;
        chordGapFactor = 0.2;
        let tmpOrg4 = gp5.createVector(2520, 470)
        let tmpOrg5 = gp5.createVector(2700, 470)
        this.frets.push(new Fret(p5.Vector.add(this.org, tmpOrg4), this.ribbonHeight, this.nRibbons, pos, chordGapFactor));
        this.frets.push(new Fret(p5.Vector.add(this.org, tmpOrg5), this.ribbonHeight, this.nRibbons, pos, chordGapFactor));

        // Build Strings
        for (let i = 0; i < this.nRibbons + 1; i++) {
            this.chords.push(new Chord(this.frets, i, this.arm))
        }

        // Build Ribbons
        for (let i = 0; i < this.chords.length - 1; i++) {
            this.ribbons.push(new Ribbon(this.chords[i], this.chords[i + 1], gp5.color(gp5.random(10, 255), 0, gp5.random(50, 255), 20)))
        }
    }

    show(renderer) {

        for (const chord of this.chords) {
            chord.show(renderer, false);
        }
        for (const ribbon of this.ribbons) {
            ribbon.show(renderer, false, false)
        }
        for (const fret of this.frets) {
            fret.show(renderer);
        }
    }

    // Observing to Canvas
    fromCanvas(data) {

        // notify observers


        // MouseEvents
        if (data.event instanceof MouseEvent) {
            if (data.type == "mouseclick") {

            }
            if (data.type == "mouseup") {

            }
            if (data.type == "mousedown") {

            }
            if (data.type == "mousedrag") {

            }
            if (data.type == "mousemove") {

            }
            // Keyboard events
        } else if (data.event instanceof KeyboardEvent) {
            if (data.type == "keydown") {

            }
            if (data.type == "keyup") {}
        }
    }

    getJSON() {

        let rtn = {
            frets: [],
            chords: [],
            ribbons: []
        }

        for (let i = 0; i < this.frets.length; i++) {
            rtn.frets.push(this.frets[i].getJSON());
        }

        for (let i = 0; i < this.chords.length; i++) {
            rtn.chords.push(this.chords[i].getJSON());
        }

        for (let i = 0; i < this.ribbons.length; i++) {
            rtn.ribbons.push(this.ribbons[i].getJSON());
        }

        return rtn;
    }

    recordJSON(suffix) {
        let filename = "themeFlow.json";
        if (suffix) {
            filename = suffix + "_" + filename;
        }
        let output = this.getJSON();
        console.log(output);
        gp5.saveJSON(output, filename);
    }
}