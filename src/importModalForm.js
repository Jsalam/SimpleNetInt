let nodesImported;
let edgesImported;

importNetworkModalForm = function() {

    // var nodesFile = document.getElementById('dragDropNodes');
    // var edgesFile = document.getElementById('dragDropEdges');
    var networkFile = document.getElementById('dragDropNetwork');

    //  makeDroppable(nodesFile, callbackNodes);
    //  makeDroppable(edgesFile, callbackEdges);
    makeDroppable(networkFile, callbackNetwork);

    // Get user click button
    document.getElementById("importNetwork").onclick = getDataImport;
}

getDataImport = function() {
    buildClustersImport(nodesImported);
    buildEdgesImport(edgesImported);
}

callbackNodes = function(files) {
    //Only process json files.
    if (files[0].type.endsWith('/json')) {
        document.getElementById('nodesFileName').innerHTML = files[0].name
        loadFile(files[0], 'nodes');
    } else {
        alert("Wrong file format. Must be a JSON file")
    }
}

callbackEdges = function(files) {
    //Only process json files.
    if (files[0].type.endsWith('json')) {
        document.getElementById('edgesFileName').innerHTML = files[0].name
        loadFile(files[0], 'edges');
    } else {
        alert("Wrong file format. Must be a JSON file")
    }
}

callbackNetwork = function(files) {
    //Only process json files.
    if (files[0].type.endsWith('json')) {
        document.getElementById('networkFileName').innerHTML = files[0].name
        loadFile(files[0], 'network');
        // add file name to dropdown menu of models
        let dropdown = document.getElementById('modelChoice');
        let option = document.createElement("option");
        option.value = 100;
        option.text = files[0].name;
        dropdown.appendChild(option);
    } else {
        alert("Wrong file format. Must be a JSON file")
    }
}

loadFile = function(file, kind) {
    let reader = new FileReader();
    // Closure to capture the file information.
    reader.onload = (function(theFile) {
        return function(e) {
            // Read text data and parse to JSON.
            let data = JSON.parse(e.target.result)
            if (kind == 'nodes') {
                nodesImported = data;
            } else if (kind == 'edges') {
                edgesImported = data;
            } else if (kind == 'network') {
                nodesImported = data.nodes;
                edgesImported = data.edges;
            }
        };
    })(file);
    // Read in the file as text.
    reader.readAsText(file);
}

callback = function(files) {
    console.log("both")
    console.log(files.getData());
}

//source: https://bitwiser.in/2015/08/08/creating-dropzone-for-drag-drop-file.html
makeDroppable = function(element, callback) {

    var input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('multiple', true);
    input.style.display = 'none';

    input.addEventListener('change', triggerCallback);
    element.appendChild(input);

    element.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        element.classList.add('dragover');
    });

    element.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        element.classList.remove('dragover');
    });

    element.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        element.classList.remove('dragover');
        triggerCallback(e);
    });

    element.addEventListener('click', function() {
        input.value = null;
        input.click();
    });

    function triggerCallback(e) {
        var files;
        if (e.dataTransfer) {
            files = e.dataTransfer.files;
        } else if (e.target) {
            files = e.target.files;
        }
        callback.call(null, files);
    }
}

buildClustersImport = function(result) {
    ClusterFactory.reset();
    ClusterFactory.makeClusters(result);
    ClusterFactory.refreshColors(0, ColorFactory.palettes[0]);
    ClusterFactory.refreshColors(1, ColorFactory.palettes[1]);
    ClusterFactory.refreshColors(2, ColorFactory.palettes[2]);
    ClusterFactory.refreshColors(3, ColorFactory.palettes[3]);
}

buildEdgesImport = function(result) {
    EdgeFactory.reset();
    EdgeFactory.buildEdges(result, ClusterFactory.clusters)
}