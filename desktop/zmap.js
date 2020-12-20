    var DIR = 'img/';
    var EDGE_LENGTH_MAIN = 250;
    var EDGE_LENGTH_SUB = 100;
       var mapoptions = {
		//manipulation: {addNode:false,editEdge: {editWithoutDrag({ from: fromId, to: toId }) {} } },
		autoResize: true,
        width: '1',        
		height: '1',
        nodes: {shape: 'box'},
		
        layout: {improvedLayout:false,}
	 }; 
	var nodes = [];
    var edges = [];
	var mapdata = { nodes: nodes,edges: edges};
	//    var network = null;	

var container = document.getElementById('mapnetwork');
network = new vis.Network(container, mapdata, mapoptions);

function tryname(str){
	//return (str.replace(/[^A-Za-zА-Яа-яЁё]/g, "_"));
	return str;//(str.replace(/[/\:*"'?<>|]/g, "_"));	
}



var gLQI_REQ="";

var messages2send = [];
	
function reqMap(){
// 
	nodes = [];
    edges = [];
	messages2send = [];
	messages2send.push({ cmd: 'LQI_REQ|0000|0',nwkAddr: "0000"});
	for(var i =1;i < deviceList.length;i++){//if(deviceList[i]["IEEE"]==IEEE){shadr=deviceList[i]["Device"];}
		messages2send.push({ cmd: 'LQI_REQ|' + deviceList[i]["Device"] + '|0',nwkAddr: deviceList[i]["Device"]});

	//WSsend('LQI_REQ|'+deviceList[i]["Device"]+'|0');
	}

	WSsend('LQI_REQ|0000|00');	
} 	


/*{
  "src_addr": "0000", "Status": "00", "NeighborTableEntries": "02","StartIndex": "00","NeighborTableListCount": "02",
  "NeighborLqiList": [
    {
      "dev_num": "00","ExtendedPanID": "00124B00033A42D6","ExtendedAddress": "00124B001AA5154D","NetworkAddress": "92B5",
      "DeviceType": "12","PermitJoining": "02","Depth": "01","LQI": "AA"
    },
    {
      "dev_num": "01","ExtendedPanID": "00124B00033A42D6","ExtendedAddress": "00124B0001BBDC40","NetworkAddress": "F5DA",
      "DeviceType": "12","PermitJoining": "02","Depth": "01","LQI": "AA"
    }
  ]
}if (!nodes.hasOwnProperty(td)){nodes.push({id: 0, label: 'ZESP_Coordinator', image: DIR + 'zesp.png', shape: 'image'});}	
*/	
function parseMap(data){
	

  
	
	// add node only once
var dev=JSON.parse(data);
 if(dev.Status=="00"){
	
	if(nodes.length==0){
		nodes.push({id: 0,  label: 'ZESP_Coordinator', image: DIR + 'zesp.png',shape: 'circularImage'});
	for(var i =1;i < deviceList.length;i++){
	 var mid=tryname(ModelIdDev(deviceList[i]["IEEE"]));
	 
	nodes.push({id: parseInt(deviceList[i]["Device"],16), label: mid+"\n"+deviceList[i]["IEEE"], image: DIR + mid+'.jpg', shape: 'circularImage'});	
	
	}		
		
		
		}
	
	for(i=0;i<	dev.NeighborLqiList.length;i++){
		var mid=tryname(ModelIdDev(dev.NeighborLqiList[i].ExtendedAddress));
	td=	{id: parseInt(dev.NeighborLqiList[i].NetworkAddress,16), label: mid+"\n"+dev.NeighborLqiList[i].ExtendedAddress, image: DIR + mid+'.jpg', shape: 'circularImage'};
	 var fl=true;
	 
	 
	 for(z=0;z<	nodes.length;z++){ console.log(nodes[z]['id'] , td.id);if(nodes[z].id === td.id){fl=false;break;}} 
		
		 
	 
		 if(fl){
			 nodes.push(td);
			edges.push({from: parseInt(dev.src_addr,16), to: parseInt(dev.NeighborLqiList[i].NetworkAddress,16), length: EDGE_LENGTH_SUB});			 
		 }
		 else
		 {
			 td={from: parseInt(dev.src_addr,16), to: parseInt(dev.NeighborLqiList[i].NetworkAddress,16), length: EDGE_LENGTH_SUB};
			 if(edges.length==0)edges.push(td);	
			 for(z=0;z<	edges.length;z++){ 
			 console.log(edges[z] , td);
			 fl=true;//{from: 0, to: 23943,
			 if(edges[z]["from"] == td["from"] && edges[z]["to"] == td["to"] ){fl=false;break;}
			 } 
			
			if(fl)edges.push(td);			 
		 }
     
	 
	 
		
	}	
	if (network != undefined){
		//network.redraw();
		redrawMap();
		}
		console.log(dev.src_addr);	
 }	
	
	
	
	
 //var buffer = new Uint8Array(data.match(/[\da-f]{2}/gi).map(function (h) {return parseInt(h, 16)}))	
//	 nodes.push({id: 0, label: 'ZESP_Coordinator', image: "/" + 'zesp.png', shape: 'image'});

}


function drawMap() { 
	Desktop.createWindow({
		id: "nwmap",
        resizeable: true,
        draggable: true,
		place: "auto",
        width: 300,
		height: 300,
        icon: "<span class='mif-app'></span>",
        title: "Network map",
        content: '<div id="mapnetwork"></div>',
        content: '<div id="eventSpan"></div>'		
    });

reqMap();	
} 

function redrawMap() {
	if(network==null){network = new vis.Network(container, mapdata, options);}
    if (network != undefined) {
        var width = $("#rstol").width(), height = $("#rstol").height()-128;
        network.setData({ nodes: nodes, edges: edges});   
      //  network.setSize(width, height);
        network.redraw();
        network.fit();
       // network.moveTo({offset:{x:0.5 * width, y:0.5 * height}});
    }
}
/*
[DeviceType/ RxOnWhenIdle/ Relationship: 1 byte]

           [DeviceType: bits 1-0]

                       Value   Description

                         0   ZigBee Coordinator

                         1   ZigBee Router

                         2   ZigBee End Device

           [RxOnWhenIdle: bits 3-2]

                       Value   Description

                         0   Does not receive when IDLE

                         1   Receives when IDLE

           [Relationship: bits 6-4]

                       Value   Description (from AssocList.h)

                         0     Parent

                         1     Child RFD

                         2     Child RFD that has the RxOnWhenIdle MAC capability flag set

                         3     Child FFD

                         4     Child FFD that has the RxOnWhenIdle MAC capability flag set

                         5     Neighbor

                         6     Other

[Depth: 1 byte]

             Depth of the parent
*/
 network.on("click", function (params) {
        params.event = "[original event]";
//        document.getElementById('eventSpan').innerHTML = '<h2>Click event:</h2>' + JSON.stringify(params, null, 4);
        var dev=this.getNodeAt(params.pointer.DOM)
		console.log('click event, getNodeAt returns: ' + Hex(dev, 4) );
		
    if(dev=="0000" || dev == null){
		reqMap();
		}else{
		WSsend('LoadJson|/Devices/'+longAdrDev(Hex(dev, 4)));	
		//showWidget(Hex(dev, 4));
		}
	});
    network.on("doubleClick", function (params) {
        params.event = "[original event]";
//        document.getElementById('eventSpan').innerHTML = '<h2>doubleClick event:</h2>' + JSON.stringify(params, null, 4);
        console.log('2click event, getNodeAt returns: ' + this.getNodeAt(params.pointer.DOM));
        console.log('2click event, getNodeAt returns: ' + JSON.stringify(params, null, 4));		
    
	
	
	});
/*
    network.on("oncontext", function (params) {
        params.event = "[original event]";
        document.getElementById('eventSpan').innerHTML = '<h2>oncontext (right click) event:</h2>' + JSON.stringify(params, null, 4);
    });
    network.on("dragStart", function (params) {
        // There's no point in displaying this event on screen, it gets immediately overwritten
        params.event = "[original event]";
        console.log('dragStart Event:', params);
        console.log('dragStart event, getNodeAt returns: ' + this.getNodeAt(params.pointer.DOM));
    });
    network.on("dragging", function (params) {
        params.event = "[original event]";
        document.getElementById('eventSpan').innerHTML = '<h2>dragging event:</h2>' + JSON.stringify(params, null, 4);
    });
    network.on("dragEnd", function (params) {
        params.event = "[original event]";
        document.getElementById('eventSpan').innerHTML = '<h2>dragEnd event:</h2>' + JSON.stringify(params, null, 4);
        console.log('dragEnd Event:', params);
        console.log('dragEnd event, getNodeAt returns: ' + this.getNodeAt(params.pointer.DOM));
    });
    network.on("controlNodeDragging", function (params) {
        params.event = "[original event]";
        document.getElementById('eventSpan').innerHTML = '<h2>control node dragging event:</h2>' + JSON.stringify(params, null, 4);
    });
    network.on("controlNodeDragEnd", function (params) {
        params.event = "[original event]";
        document.getElementById('eventSpan').innerHTML = '<h2>control node drag end event:</h2>' + JSON.stringify(params, null, 4);
        console.log('controlNodeDragEnd Event:', params);
    });
    network.on("zoom", function (params) {
        document.getElementById('eventSpan').innerHTML = '<h2>zoom event:</h2>' + JSON.stringify(params, null, 4);
    });
    network.on("showPopup", function (params) {
        document.getElementById('eventSpan').innerHTML = '<h2>showPopup event: </h2>' + JSON.stringify(params, null, 4);
    });
    network.on("hidePopup", function () {
        console.log('hidePopup Event');
    });
    network.on("select", function (params) {
        console.log('select Event:', params);
    });
    network.on("selectNode", function (params) {
        console.log('selectNode Event:', params);
    });
    network.on("selectEdge", function (params) {
        console.log('selectEdge Event:', params);
    });
    network.on("deselectNode", function (params) {
        console.log('deselectNode Event:', params);
    });
    network.on("deselectEdge", function (params) {
        console.log('deselectEdge Event:', params);
    });
	*/
    network.on("hoverNode", function (params) {
        console.log('hoverNode Event:', params);
    });
  network.on("hoverEdge", function (params) {
        console.log('hoverEdge Event:', params);
    });
   /*   network.on("blurNode", function (params) {
        console.log('blurNode Event:', params);
    });
    network.on("blurEdge", function (params) {
        console.log('blurEdge Event:', params);
    });
*/
function Hex(d, padding) {
    var hex = Number(d).toString(16).toUpperCase();
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

    while (hex.length < padding) {hex = "0" + hex;}
       return hex;  
 }   

   
