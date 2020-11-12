class ThemeFlow {
    constructor() {
        this.frets = [];
        this.nFrets = 50;
        this.stringGap = 30;
        this.gap = 45;
        this.nStrings = 5;
        this.chords = [];
        this.arm = 22.5;
        this.ribbons = [];
        this.init();
        console.log("done theme");
    }


    init() {
        // Build Frets 
        this.frets.push(new Fret(gp5.createVector(0, 440), this.stringGap, this.nStrings, 3)); //
        this.frets.push(new Fret(gp5.createVector(270, 440), this.stringGap, this.nStrings, 3)); //

        for (let i = 1; i < this.nFrets; i++) {
            this.frets.push(new Fret(gp5.createVector(270 + (i * this.gap), 520), this.stringGap - 15, this.nStrings, gp5.floor(gp5.random(1, this.nStrings + 1)))); //
        }
        this.frets.push(new Fret(gp5.createVector(2520, 440), this.stringGap, this.nStrings, 3)); //
        this.frets.push(new Fret(gp5.createVector(2700, 440), this.stringGap, this.nStrings, 3)); //

        // Build Strings
        for (let i = 0; i < this.nStrings + 1; i++) {
            this.chords.push(new Chord(this.frets, i, this.arm))
        }

        for (let i = 0; i < this.chords.length - 1; i++) {
            this.ribbons.push(new Ribbon(this.chords[i], this.chords[i + 1], gp5.color(gp5.random(10, 255), 0, gp5.random(50, 255), 140)))
        }
    }

    show(renderer) {

        for (const fret of this.frets) {
            fret.show(renderer);
        }
        // for (const chord of this.chords) {
        //     chord.show(renderer, false);
        // }
        for (const ribbon of this.ribbons) {
            ribbon.show(renderer, false, false)
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
}