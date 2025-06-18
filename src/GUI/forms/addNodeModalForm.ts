import $ from "jquery";
import { ClusterFactory } from "../../factories/clusterFactory";
import { VNode } from "../../visualElements/vNode";
import { NodeAttributes, NodeInit } from "../../graphElements/node";

export function getData() {
  let cluster = document.querySelector(
    'input[name="cluster"]:checked',
  ) as HTMLInputElement;
  let name = (document.getElementById("catName") as HTMLInputElement).value;
  let description = (
    document.getElementById("catDescription") as HTMLInputElement
  ).value;
  let attr = (document.getElementById("catAttributesOther") as HTMLInputElement)
    .value;

  if (cluster) {
    // get the cluster object
    let clusterTmp = ClusterFactory.clusters[parseInt(cluster.value)];
    // format string
    attr = "{" + attr + "}";
    // parse to JSON
    attr = JSON.parse(attr);
    // Merge JSONs
    let attributes: NodeAttributes = { attr };
    // console.log(attributes);

    let dataTmp: NodeInit = {
      id: clusterTmp.nodes.length,
      nodeLabel: name,
      nodeDescription: description,
      nodeAttributes: attributes,
    };

    let nodeTmp = ClusterFactory.makeNode(clusterTmp, dataTmp);

    // visual representation of the new category
    let vClustTmp = ClusterFactory.getVClusterOf(clusterTmp)!;

    let vNodeTmp = new VNode(nodeTmp, ClusterFactory.wdth, ClusterFactory.hght);
    if (nodeTmp instanceof Node) {
      if (nodeTmp.connectors.length > 0) {
        vNodeTmp.addVConnector(nodeTmp.connectors[0]);
      }
    }
    
    vClustTmp.sortingWidget!.addItem(vNodeTmp);

    // add to collections
    clusterTmp.addNode(nodeTmp);
    vClustTmp.addVNode(vNodeTmp);
  } else {
    alert(
      "You forgot to choose a cluster. Please try again, your data isn't lost.",
    );
  }
}

document.addEventListener("DOMContentLoaded", function () {
  $("#addNodeModal").on("hide.bs.modal", function () {
    if (document.activeElement) {
      (document.activeElement as HTMLInputElement).blur();
    }
  });
});
