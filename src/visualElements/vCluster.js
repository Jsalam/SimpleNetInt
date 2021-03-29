class VCluster {
    constructor(cluster, x, y, width, height, palette) {
        this.pos = gp5.createVector(x, y);
        this.width = width;
        this.height = height;
        this.vNodes = [];
        this.cluster = cluster;
        this.palette = palette;
        this.populateVNodes(cluster);
        //   this.setPalette();
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
                let vNodeW = 30;
                let vNodeH = 30;

                // instantiation
                vNodeTemp = new VNode(node, vNodeW, vNodeH);
                for (const connector of vNodeTemp.node.connectors) {
                    vNodeTemp.addVConnector(connector);
                }

            }

            // set color if the data from JSPN does not have color info
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
        // renderer.textAlign(gp5.LEFT, gp5.TOP);
        // if (this.cluster.label) {
        //     renderer.textSize(12);
        //     renderer.fill(0);
        //     renderer.noStroke();
        //     renderer.textLeading(12);
        //     renderer.text(this.cluster.label, this.pos.x, this.pos.y, 140);
        //     renderer.textSize(9);
        //     renderer.text(this.cluster.description, this.pos.x, this.pos.y + 30, 100);
        // }
    }

    getJSON() {
        let rtn = {
            clusterID: this.cluster.id,
            clusterLabel: this.cluster.label,
            clusterDescription: this.cluster.description,
            nodes: []
        }

        this.vNodes.forEach(vNode => {
            let tmpN = vNode.getJSON();
            rtn.nodes.push(tmpN);
        });
        return rtn;
    }
}