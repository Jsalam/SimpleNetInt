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
}

addClusterToModalFormList = function(id, name) {
    // Create input
    let input = document.createElement("input");
    input.setAttribute("type", "radio");
    input.setAttribute("id", "cluster" + id);
    input.setAttribute("name", "cluster");
    input.setAttribute("value", id - 1);
    // Create input label
    let label = document.createElement("label");
    label.setAttribute("for", "cluster" + id);
    label.innerHTML = name;
    label.textContent = name;
    // Append children
    addToDOM("clusterChoice", input);
    addToDOM("clusterChoice", label);
}

clearClusterModalFormList = function() {
    let element = document.getElementById("clusterChoice");
    while (element.firstChild) {
        element.removeChild(element.lastChild);
    }
}

addToDOM = function(elementID, addition) {
    let element = document.getElementById(elementID);
    element.appendChild(addition);
}