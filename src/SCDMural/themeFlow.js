/**
 * All the data is comming from Canvas.observers. See filtering methods at the bottom 
 */
class ThemeFlow {
    /**
     * 
     * @param {*} _x 
     * @param {*} _y 
     * @param {*} _ribbonHeight 
     */
    constructor(_x, _y, _ribbonHeight) {
        this.org = gp5.createVector(_x, _y)
        this.ribbonHeight = _ribbonHeight;
        this.setup();
        if (this.nRibbons > 0) {
            this.init();
        }
    }

    setup() {
        this.vNodes = this.getVNodesFromCanvas();
        // frets
        this.frets = [];
        this.nFrets = this.vNodes.length;
        this.fretGap = 45;
        // strings

        this.nRibbons = this.getVClustersFromCanvas().length;
        this.chords = [];
        this.arm = this.fretGap / 2;
        // ribbons
        this.ribbons = [];
        this.labels = this.getLabelsFromCanvas();
    }


    initA() {
        // Build Frets 
        let pos = this.nRibbons;
        let chordGapFactor = 0.8;

        let cascadeXPos = 9; // feet * pixels

        // Custom made frets on west side
        let tmpOrg1 = gp5.createVector(0, 470);
        let tmpOrg2 = gp5.createVector(cascadeXPos * this.fretGap, 470);
        this.frets.push(new Fret(p5.Vector.add(this.org, tmpOrg1), this.ribbonHeight, this.nRibbons, 4, chordGapFactor));

        this.frets.push(new Fret(p5.Vector.add(this.org, tmpOrg2), this.ribbonHeight, this.nRibbons, 4, chordGapFactor));


        // Intermediate frets
        for (let i = 0; i < this.nFrets; i++) {
            let x = (cascadeXPos + 1) * this.fretGap + (i * this.fretGap);
            //let tmpOrg3 = gp5.createVector(x, 470);
            chordGapFactor = this.nRibbons / Math.pow(this.nRibbons, 2);
            let vNodeTmp = this.vNodes[i];
            let tmpOrg3 = vNodeTmp.pos;
            // this is the temporary position of each dot in the theme flow
            pos = 1 + this.getPositionOnThemeFlow(vNodeTmp);
            this.frets.push(new Fret(p5.Vector.add(this.org, tmpOrg3), this.ribbonHeight, this.nRibbons, pos, chordGapFactor, vNodeTmp));
        }

        // Custom made frets on east side
        pos = this.nRibbons;;
        chordGapFactor = 0.2;
        let tmpOrg4 = gp5.createVector(2681, 472)
        let tmpOrg5 = gp5.createVector(2700, 472)
            //this.frets.push(new Fret(p5.Vector.add(this.org, tmpOrg4), this.ribbonHeight, this.nRibbons, pos, chordGapFactor));
        this.frets.push(new Fret(p5.Vector.add(this.org, tmpOrg5), this.ribbonHeight, this.nRibbons, pos, chordGapFactor));

        // Build Strings
        for (let i = 0; i < this.nRibbons + 1; i++) {
            this.chords.push(new Chord(this.frets, i, this.arm))
        }

        // Build Ribbons
        for (let i = 0; i < this.chords.length - 1; i++) {
            let colorPalette = ColorFactory.getPaletteByTheme(this.labels[i]);
            //  console.log(i + "  " + colorPalette.theme)
            if (colorPalette) {
                this.ribbons.push(new Ribbon(this.chords[i], this.chords[i + 1], gp5.color(colorPalette.colors[0] + '30'), this.labels[i]));
            } else {
                this.ribbons.push(new Ribbon(this.chords[i], this.chords[i + 1], gp5.color(200, 100 - i * 10), this.labels[i]));
            }
        }
    }

    updateCoordinates() {
        for (const fret of this.frets) {
            fret.updateCoordinates();
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

    getVNodesFromCanvas() {
        return Canvas.observers.filter(elm => elm instanceof VNode);
    }

    getVClustersFromCanvas() {
        return Canvas.observers.filter(elm => elm instanceof VCluster);
    }

    getLabelsFromCanvas() {
        let names = []

        for (const elem of this.getVClustersFromCanvas()) {
            names.push(elem.cluster.label)
        }
        return names;
    }

    getPositionOnThemeFlow(vNode) {
        // get the cluster name of the node
        let labelTmp = ClusterFactory.getCluster(vNode.node.idCat.cluster).label;
        // find the index in  this.labels collection
        const isEqual = (element) => element === labelTmp;
        let index = this.labels.findIndex(isEqual)

        return index
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