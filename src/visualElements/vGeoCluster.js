class VGeoCluster extends VCluster {
    /**
     * ************************** constructor **************************
     * @param {Cluster} cluster The cluster object with nodes and edges
     * @param {Number} posX 
     * @param {Number} posY 
     * @param {Number} width 
     * @param {Number} height 
     * @param {Object} palette Retrieved from the ColorFactory collection of palettes
     * @param {String} keyAttribute The attribute of the cluster 
     * @param {String} cartography The URL of the GeoJSON file 
     */
    constructor(cluster, posX, posY, width, height, palette, keyAttribute, cartography) {
        super(cluster, posX, posY, width, height, palette);
        this.glProgram = new CartoGL(cluster, palette, keyAttribute, cartography);
        this.glProgram.geometryLoaded.then(() => {
            this.layout.cartographic(this.glProgram);
        })
    }

    /**
     * Receives events from the canvas and updates the VGeoCluster accordingly.
     * This replaces the former handleEvents method in this class.
     * @param {*} data the event sent by the canvas to its observers.
     */
    fromCanvas(data) {
        this.glProgram.fromCanvas(data);
        this.layout.cartographic(this.glProgram);
    }


    show(renderer) {
        // super.show(renderer);
        // this.handleEvents();
        this.glProgram.show(renderer);
    }
}