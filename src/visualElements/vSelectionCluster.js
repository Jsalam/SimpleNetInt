class VSelectionCluster extends VCluster {
    boundingBox = [0, 0, 0, 0];

    constructor(cluster, x, y, width, height, palette) {
        super(cluster, x, y, width, height, palette);
    }

    show(renderer) {
        super.show(renderer);
        gp5.push();
        gp5.stroke(255);
        gp5.strokeWeight(4);
        gp5.noFill();
        gp5.rect(
            this.boundingBox[0],
            this.boundingBox[1],
            this.boundingBox[2],
            this.boundingBox[3],
        );
        gp5.pop();
    }
}