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

            } else if (node instanceof BipartiteNode) {
                vNodeTemp = new BipartiteVNode(node, this.width, this.height);

                // this is for the case of bipartitte nodes
                for (const connector of vNodeTemp.node.positives) {
                    vNodeTemp.addPositiveVConnector(connector);
                }

                for (const connector of vNodeTemp.node.negatives) {
                    vNodeTemp.addNegativeVConnector(connector);
                }

            }

            // set color
            if (!this.palette) {
                vNodeTemp.setColor("#adadad");
            } else if (this.palette.length < 1) {
                vNodeTemp.setColor(this.palette[0])
            } else {
                let tmpIndex = index % this.palette.length;
                vNodeTemp.setColor(this.palette[tmpIndex]);
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
        }
        // subscribe to canvas
        Canvas.subscribe(vNode);

        // add to collection
        this.vNodes.push(vNode);
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

    show(builder) {
        builder.textAlign(gp5.LEFT, gp5.TOP);
        if (this.cluster.label) {
            builder.textSize(12);
            builder.fill(0);
            builder.noStroke();
            builder.text(this.cluster.label, this.pos.x, this.pos.y, 150);
            builder.textSize(9);
            builder.text(this.cluster.description, this.pos.x, this.pos.y + 25, 100);
        }
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