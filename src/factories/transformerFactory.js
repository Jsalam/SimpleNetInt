/**
 * This class manages all the transformation matrices used in the visualization, except for the native matrices used by p5.js
 * The matrices are usually associated to vClusters
 */


class TransFactory {

    static init() {

        // clean elements
        TransFactory.transformers = [];

        for (const vC of ClusterFactory.vClusters) {
            console.log(vC);
            TransFactory.initTransformer(vC);
        }

    }

    static initTransformer(vC) {
        let temp = new Transformer(vC);

        // disable transformations
        temp.active = false;

        // add to collection
        TransFactory.transformers.push(temp);

        // transformers listens to Cnavas events
        Canvas.subscribe(temp);
    }

    static zoom(amnt) {
        for (const tr of TransFactory.transformers) {
            tr.zoom(amnt);
        }
    }

    static crissCross(amnt) {

        for (let index = 0; index < TransFactory.transformers.length; index++) {
            const transformer = TransFactory.transformers[index];
            if (index % 2 == 0) {
                transformer.zoom(amnt);
            } else {
                transformer.zoom(1 / amnt);
            }
        }
    }

    static reset() {
        for (const tr of TransFactory.transformers) {
            tr.reset();
        }
    }

    static pushVClusters() {
        for (const tr of TransFactory.transformers) {
            tr.pushVCluster();
        }
    }

    static popVClusters() {
        for (const tr of TransFactory.transformers) {
            tr.popVCluster();
        }
    }

    static getTransformerByVClusterID(id) {
        return TransFactory.transformers.filter(tr => tr.vCluster.cluster.id == id)[0];
    }

    static displayStatus(pos, renderer) {

        renderer.textSize(12);
        renderer.noStroke();
        renderer.fill(255, 255, 255);
        renderer.textAlign(renderer.LEFT);

        let outputString = "Press key number to manipulate local domain zoom: ";

        renderer.fill(150);

        for (let i = 0; i < TransFactory.transformers.length; i++) {
            let tr = TransFactory.transformers[i];

            outputString += tr.vCluster.cluster.id + ". " + tr.vCluster.cluster.label;

            if (tr.active) {
                outputString += ": active"
            }

            outputString += "   "
        }

        if (TransFactory.transformers.length == 0) {
            outputString = "No clustering domains in tranformer factory";
        }

        renderer.text(outputString, pos.x + 10, pos.y + 35);
        renderer.stroke(255);
    }
}
TransFactory.transformers = [];