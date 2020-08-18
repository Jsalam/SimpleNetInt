addCategoryModalForm = function() {

    document.getElementById("SubmitAddCategoryModal").onclick = getData
}

getData = function() {
    let cluster = document.querySelector('input[name="cluster"]:checked');
    let name = document.getElementById("catName").value
    let description = document.getElementById("catDescription").value
    let positive = document.getElementById("positive").checked
    let negative = document.getElementById("negative").checked

    if (cluster) {
        let clusterTmp = ClusterFactory.clusters[cluster.value];
        let polarityTmp;
        if (positive & !negative) {
            polarityTmp = 'RIGHT'
        } else if (negative & !positive) {
            polarityTmp = 'LEFT'
        } else {
            polarityTmp = 'BOTH'
        }
        let dataTmp = {
            id: clusterTmp.categories.length,
            nodeLabel: name,
            nodeDescription: description,
            polarity: polarityTmp
        }
        let categoryTmp = ClusterFactory.makeCategory(clusterTmp, dataTmp)

        // visual representation of the new category
        let vClustTmp = ClusterFactory.getVClusterOf(clusterTmp);
        let vCategoryTmp = new VNode(categoryTmp, vClustTmp.width, vClustTmp.height);
        if (positive) {
            vCategoryTmp.addPositiveVConnector(categoryTmp.positives[0]);
        }
        if (negative) {
            vCategoryTmp.addNegativeVConnector(categoryTmp.negatives[0]);
        }

        // add to collections
        clusterTmp.addCategory(categoryTmp);
        vClustTmp.addVCategory(vCategoryTmp);

        ClusterFactory.refreshColors(1, ColorFactory.palettes[0]);
        ClusterFactory.refreshColors(2, ColorFactory.palettes[1]);
        console.log("Node added");

    } else {
        alert("You forgot to choose a cluster. Please try again, your data is not lost.")
    }

}