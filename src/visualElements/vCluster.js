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

    populateVNodes(cluster) {
        for (let index = 0; index < cluster.nodes.length; index++) {

            const node = cluster.nodes[index]

            // Create vNode
            let vNodeTemp = new VNode(node, this.width, this.height);

            for (const connector of vNodeTemp.node.positives) {
                vNodeTemp.addPositiveVConnector(connector);
            }

            for (const connector of vNodeTemp.node.negatives) {
                vNodeTemp.addNegativeVConnector(connector);
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
            builder.text(this.cluster.label, this.pos.x, this.pos.y, this.width, 35);
            builder.textSize(9);
            builder.text(this.cluster.description, this.pos.x, this.pos.y + 15, this.width, 30);
        }

        this.vNodes.forEach(cat => {
            cat.show(builder);
        });
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

    //**** EVENTS ******/
    mouseOverEvents() {
        this.vNodes.forEach(cat => {
            cat.mouseOver();
            cat.mouseOverEvents();
            cat.mouseMovedEvents();
            cat.vPositives.forEach(connector => {
                connector.mouseOver();
            });
            cat.vNegatives.forEach(connector => {
                connector.mouseOver();
            });
        });
    }

    mouseClickedEvents() {
        this.vNodes.forEach(cat => {
            cat.mouseClickedEvents();
        });
    }

    mouseDraggedEvents() {
        this.vNodes.forEach(cat => {
            cat.mouseDraggedEvents();
        });
    }
}