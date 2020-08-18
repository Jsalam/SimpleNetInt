addClusterModalForm = function() {

    document.getElementById("SubmitAddClusterModal").onclick = getDataCluster
}

getDataCluster = function() {
    let name = document.getElementById("clusterName").value
    let description = document.getElementById("clusterDescription").value
    let id = ClusterFactory.clusters.length + 1;

    let dataTmp = {
        clusterID: id.toString(),
        clusterLabel: name,
        clusterDescription: description,
        nodes: []
    }
    ClusterFactory.makeCluster(dataTmp);

    let input = document.createElement("input");
    input.setAttribute("type", "radio");
    input.setAttribute("id", "cluster" + id);
    input.setAttribute("name", "cluster");
    input.setAttribute("value", id - 1);
    addToDOM("clusterChoice", input);
    let label = document.createElement("label");
    label.setAttribute("for", "cluster" + id);
    label.innerHTML = name;
    label.textContent = name;
    addToDOM("clusterChoice", label);
}

addToDOM = function(elementID, addition) {
    let element = document.getElementById(elementID);
    element.appendChild(addition);
}