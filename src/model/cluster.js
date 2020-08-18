class Cluster {
    constructor(id) {
        this.label;
        this.description;
        this.categories = [];
        this.id = id;
    }

    addCategory(cat) {
        this.categories.push(cat);
    }

    setLabel(label){
        this.label = label;
    }

    setDescription(text){
        this.description = text;
    }

    getJSON(){
        let rtn = {clusterID:this.id, 
            clusterLabel: this.label,
            clusterDescription: this.description,
            nodes:[]
        }
        this.categories.forEach(element => {
            let tmpN = element.getJSON();
            rtn.nodes.push(tmpN);
        });
        return rtn;
    }
}