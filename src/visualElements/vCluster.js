class VCluster extends Button{
    constructor(cluster, x, y, width, height, palette) {
        super(x,y,width,height)
        this.vNodes = [];
        this.cluster = cluster;
        this.palette = palette;
        this.populateVNodes(cluster);
        //   this.setPalette();
        // instantiate a tranformer for this vCluster
        TransFactory.initTransformer(this);
        // instantiate a layout
        this.layout = new Layout();
    }

    // Observing to Canvas
    fromCanvas(data) {
        if (data instanceof MouseEvent) {
            // do something
        } else if (data instanceof KeyboardEvent) {
            // do something
        } else {
            // do something
        }
    }

    populateVNodes(cluster) {
        for (let index = 0; index < cluster.nodes.length; index++) {
            const node = cluster.nodes[index];

            // Create vNode
            let vNodeTemp;
            if (node instanceof Node) {

                // node size
                let vNodeW = 10;
                let vNodeH = 10;

                // instantiation
                vNodeTemp = new VNode(node, vNodeW, vNodeH);
                for (const connector of vNodeTemp.node.connectors) {
                    vNodeTemp.addVConnector(connector);
                }

            }

            // set color if the data from JSON does not have color info
            if (!node.importedVNodeData.color) {

                if (!this.palette) {
                    vNodeTemp.setColor("#adadad");
                } else if (this.palette.length < 1) {
                    vNodeTemp.setColor(ColorFactory.getColor(this.palette, 0))
                } else {
                    vNodeTemp.setColor(ColorFactory.getColor(this.palette, index));
                }
            }

            // add to colecction
            this.addVNode(vNodeTemp, node.importedVNodeData);
        }
    }

    addVNode(vNode, data) {
        if (data) {
            const pos = gp5.createVector(data.posX, data.posY, data.posZ);
            vNode.updateCoords(pos, 0);
            vNode.setColor(data.color);
        } else {
            vNode.updateCoords(this.pos, this.vNodes.length + 1);
            vNode.setColor(ColorFactory.getColor(this.palette, this.cluster.nodes.length));
        }
        // subscribe to canvas
        Canvas.subscribe(vNode);

        // add to collection
        this.vNodes.push(vNode);
    }

    getVNode(node) {
        return this.vNodes.filter(vN => {
            return vN.node.idCat === node.idCat;
        })[0];
    }

    setPalette(palette) {
        if (palette) {
            this.palette = palette;
        }

        let counter = 0;
        if (this.palette) {

            for (let i = 0; i < this.vNodes.length; i++) {
                if (counter >= this.palette.length) {
                    counter = 0;
                }
                this.vNodes[i].setColor(this.palette[counter]);
                counter++;
            }
        }
    }

    show(renderer) {
        renderer.textAlign(gp5.LEFT, gp5.TOP);
        if (this.cluster.label) {
            renderer.textSize(12);
            renderer.fill(100);
            renderer.noStroke();
            renderer.textLeading(12);
            renderer.text(this.cluster.label, this.pos.x, this.pos.y, 140);
        }
    }

    getJSON() {
        let trans = TransFactory.getTransformerByVClusterID(this.cluster.id);
        let rtn = {
            clusterID: this.cluster.id,
            clusterLabel: this.cluster.label,
            clusterDescription: this.cluster.description,
            // The latest values of the transformer linked to this vCluster
            scaleFactor: trans.scaleFactor,
            matrixComponents: JSON.stringify(trans.transform),
            nodes: []
        }

        this.vNodes.forEach(vNode => {
            let tmpN = vNode.getJSON();
            rtn.nodes.push(tmpN);
        });
        return rtn;
    }
}