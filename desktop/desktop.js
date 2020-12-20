	
var int_IP=localStorage.getItem('IP_adr') ;
	if (int_IP==null){
		alert("Setup ip first, then update page ");
	}	

	
	
	
	var deviceList;
	var firmwareList;
	
						//var WSzesp='ws://' + window.location.hostname + ':81';

function fsgo(element) {if(element.requestFullScreen){element.requestFullScreen();} else if(element.mozRequestFullScreen){element.mozRequestFullScreen();} else if(element.webkitRequestFullScreen){element.webkitRequestFullScreen();}}

if (int_IP != null){	

	var WSzesp='ws://'+int_IP+':81';	

	var socket = new WebSocket(WSzesp);


var checkWS = setInterval(function(){if(socket.readyState!=1){socket = new WebSocket(WSzesp);}}, 5000);	
	
		socket.addEventListener('open', function (event) {
			getDeviceList();
		//drawMap();$("#nwmap").hide();
		});

		// socket.addEventListener('message', function (event) {
			// console.log('Message from server ', event.data);
		// });
  
     
  var intervalID ;	 
	 
	 
	 
	 getDeviceList = function(){WSsend('getDeviceList');}; 
  
	WSsend=function (data) {
	try {
			socket.send(data);
			//clearInterval(intervalID);
		}catch{ 
			console.log("Ошибка. подключаемся");
		///intervalID=setInterval( WSconnect, 5000 );
		}
	} 
	

		
	socket.onclose = function(){
	  //  socket = null;
     //   setTimeout(function() { WSconnect(); }, 1000);
	}
    
    socket.onerror = function(error) {
	  alert("Ошибка " + error.message);
	 //   socket = null;
     //   setTimeout(function() { WSconnect(); }, 1000);	
	}
    var curInd=0;
	// прием данных
	socket.onmessage = function(msg){
			
		console.log(msg);
		var log=$('#div_log').text();
		$('#div_log').text(log+msg.data).trigger("create");	
		
	var z=msg.data.split("|");
	
	if(z[0]==="alldev"){
	 try {deviceList =JSON.parse(z[1]);
	    var notify = Metro.notify;
        notify.setup({width: 150,duration: 1000,animation: 'easeOutBounce'});notify.create("Devices list updated"); notify.reset();
	 } catch (exception) {};	
	}	
	if(z[0]==="jsconfig") {drawjsconfig(z[1]);}
	if(z[0]==="rsploadfwlist"){firmwareList=JSON.parse(z[1]);}
	
	
	if(z[0].includes('/Devices/', 0)){
		var zj=z[0].split("/");

		
		 showWidget(zj[2],z[1]);
		$('#jsstr'+zj[2]).val(z[1]);		

	}	
	
	
	
	
	
	
	if(z[0]==="LQI_RSP"){
		console.log(z[1]);
		
		
		
		var adr=messages2send[0].nwkAddr
		var tmp=JSON.parse(z[1]);tmp.src_addr=adr;
		
		parseMap(JSON.stringify(tmp));		
	//	src_addr":"0000", "Status":"00", "NeighborTableEntries":"04","StartIndex":"00", "NeighborTableListCount":"02"
		if(parseInt('0x'+tmp.NeighborTableEntries) > (parseInt('0x'+tmp.NeighborTableListCount)+curInd)){
			curInd+=parseInt('0x'+tmp.NeighborTableListCount);
			console.log('LQI_REQ|'+ adr +'|' + Hex(curInd,2));
			WSsend('LQI_REQ|'+ adr +'|' + Hex(curInd,2));
			}else{
		
		
		
		messages2send.splice(0, 1); //удаляем нулевой элемент
		curInd=0;
		if (messages2send.length) {
             WSsend(messages2send[0].cmd); //посылаем следующую команду
         }
		
		}
		
		
		//gLQI_REQ=z[1];

		
		}
	
	
	if(z[0]==="zcl"){
	var arv=JSON.parse(z[1]);
	var ladr; var li="";
	var dlar=self.deviceList;
		  for(var i =0;i < dlar.length;i++) { 
			//var dlaritems=Object.values(dlar)[i];				
			if(arv.short_addr== dlar[i].Device){ladr=dlar[i].IEEE;break;}	
		  }
				//$( "#myID\\.entry\\[1\\]" )
console.log('#'+ladr+'_'+arv.EP);				
		var elEP=$('#'+ladr+'_'+arv.EP);// document.getElementById(ladr+"_"+arv.EP);				  
		var elcluster_id = document.getElementById(ladr+"_"+arv.EP+"_"+arv.cluster_id);
		var elattrID = document.getElementById(ladr+"_"+arv.EP+"_"+arv.cluster_id+"_"+arv.attrID);
			
			//if(elEP===null){li="<tbody id='"+ladr+"_"+arv.EP+"'>"+"</tbody>";$('#'+ladr).append(li).trigger("create");}
			//if(elcluster_id===null){li="<tbody id='"+ladr+"_"+arv.EP+"_"+arv.cluster_id+"'>"+"</tbody>";$('#'+ladr+"_"+arv.EP).append(li).trigger("create");}
			//
			if(elattrID===null){
				li="<tr id='"+ladr+"_"+arv.EP+"_"+arv.cluster_id+"_"+arv.attrID+"'>"+"</tr>";
				$('#'+ladr+"_"+arv.EP+"_"+arv.cluster_id).append(li).trigger("create");
			}else{
			li ="<td class='hid'>I</td><td  class='hid'>"+arv.EP+"</td><td class='hid'>"+arv.cluster_id+"</td><td class='hid'>"+arv.attrID+"</td><td>?</td><td>RAW</td>";//"+arv.data+"</td>";
			
			
/*OnOff*/	if(arv.cluster_id==="0006" && arv.attrID=="0000"){ 
			li ="<td class='hid'>I</td><td  class='hid'>"+arv.EP+"</td><td class='hid'>"+arv.cluster_id+"</td><td class='hid'>"+arv.attrID+"</td><td>"+arv.data+"</td><td width='42px'><img src='ico/switch.png' width='40px'  onclick='sendbc(\"01"+arv.short_addr +arv.EP+"02\");'></td>";	
			}
/*MainPW*/	if(arv.cluster_id==="0001" && arv.attrID=="0000"){ 
			var rv=(parseInt('0x'+ arv.data.substr(-2, 2)+arv.data.substr(0, 2))/10000).toFixed(2);
			$('#'+ladr+"_pw").html(rv).trigger("create");
			li ="<td class='hid'>I</td><td  class='hid'>"+arv.EP+"</td><td class='hid'>"+arv.cluster_id+"</td><td  class='hid'>"+arv.attrID+"</td></td><td>"+rv+"</td><td width='42px'><img src='ico/battery_v.png' width='40px'> ";	
			}
/*BAT %*/	if(arv.cluster_id==="0001" && arv.attrID=="0021"){ 
			var rv=parseInt('0x'+ arv.data);
			$('#'+ladr+"_pw").html(rv).trigger("create");
			li ="<td class='hid'>I</td><td  class='hid'>"+arv.EP+"</td><td class='hid'>"+arv.cluster_id+"</td><td  class='hid'>"+arv.attrID+"</td></td><td>"+rv+"</td><td width='42px'><img src='ico/battery_v.png' width='40px'> ";	
			}


			
/*Temper*/	if(arv.cluster_id==="0402" && arv.attrID=="0000"){ 
			var rv=(parseInt('0x'+ arv.data.substr(-2, 2)+arv.data.substr(0, 2))/10000).toFixed(2);
			$('#'+ladr+"_pw").html(rv).trigger("create");
			li ="<td class='hid'>I</td><td  class='hid'>"+arv.EP+"</td><td class='hid'>"+arv.cluster_id+"</td><td  class='hid'>"+arv.attrID+"</td></td><td>"+rv+"</td><td width='42px'><img src='ico/temperature_hot.png' width='40px'> ";	
			}

			$('#'+ladr+"_lq").html(parseInt('0x'+arv.LQ)).trigger("create");
			$('#'+ladr+"_short").html(arv.short_addr).trigger("create");	
	
	$('#'+ladr+"_"+arv.EP+"_"+arv.cluster_id+"_"+arv.attrID).html(li).trigger("create");			

	}	
	//$('#devList').trigger("create");			
}	
			
	
	
	
	}

}

var Desktop = {
    options: {
        windowArea: ".window-area",
        windowAreaClass: "",
        taskBar: ".task-bar > .tasks",
        taskBarClass: ""
    },

    wins: {},

    setup: function(options){
        this.options = $.extend( {}, this.options, options );
        return this;
    },

    addToTaskBar: function(wnd){
        var icon = wnd.getIcon();
        var wID = wnd.win.attr("id");
        var item = $("<span>").addClass("task-bar-item started").html(icon);

        item.data("wID", wID);

        item.appendTo($(this.options.taskBar));
    },

    removeFromTaskBar: function(wnd){
        var wID = wnd.attr("id");
        var items = $(".task-bar-item");
        var that = this;
        $.each(items, function(){
            var item = $(this);
            if (item.data("wID") === wID) {
                delete that.wins[wID];
                item.remove();
            }
        })
    },

    createWindow: function(o){
		 o.onMaxClick = function(){
            win = $(this);
            $(".window").css("z-index", 1);

            if (!win.hasClass("modal")) {
                win.css("z-index", 3);
            }
        };
        o.onDragStart = function(){
            win = $(this);
            $(".window").css("z-index", 1);

            if (!win.hasClass("modal")) {
                win.css("z-index", 3);
            }
        };
        o.onDragStop = function(){
            win = $(this);
            if (!win.hasClass("modal"))
                win.css("z-index", 2);
        };
        o.onWindowDestroy = function(win){
            Desktop.removeFromTaskBar($(win));
        };

        var w = $("<div>").appendTo($(this.options.windowArea));
        var wnd = w.window(o).data("window");

        var win = wnd.win;
        var shift = Metro.utils.objectLength(this.wins) * 16;

        if (wnd.options.place === "auto" && wnd.options.top === "auto" && wnd.options.left === "auto") {
            win.css({
                top: shift,
                left: shift
            });
        }
        this.wins[win.attr("id")] = wnd;
        this.addToTaskBar(wnd);

        return wnd;
    }
};

Desktop.setup();

var w_icons = [
    'rocket', 'apps', 'cog', 'anchor'
];
var w_titles = [
    'rocket', 'apps', 'cog', 'anchor'
];

function createWindow(){
    var index = Metro.utils.random(0, 3);
    var w = Desktop.createWindow({
        resizeable: true,
        draggable: true,
        width: 300,
        icon: "<span class='mif-"+w_icons[index]+"'></span>",
        title: w_titles[index],
        content: "<div class='p-2'>----</div>"
    });

    setTimeout(function(){
        w.setContent("New window content");
    }, 3000);
}
function createLogWindow(){
    var index = Metro.utils.random(0, 3);
    var w = Desktop.createWindow({
        resizeable: true,
        draggable: true,
        width: 300,
        icon: "<span class='mif-"+w_icons[index]+"'></span>",
        title: w_titles[index],
        content: "<div><div id='div_log'>...</div></div>"
    });

}

function createWindowModal(){
    Desktop.createWindow({
        resizeable: false,
        draggable: true,
        width: 300,
        icon: "<span class='mif-cogs'></span>",
        title: "Modal window",
        content: "<div class='p-2'>This is desktop demo created with Metro 4 Components Library</div>",
        overlay: true,
        //overlayColor: "transparent",
        modal: true,
        place: "center",
        onShow: function(win){
            var win = $(win);
            win.addClass("ani-swoopInTop");
            setTimeout(function(){
                $(win).removeClass("ani-swoopInTop");
            }, 1000);
        },
        onClose: function(win){
            var win = $(win);
            win.addClass("ani-swoopOutTop");
        }
    });
}

function createWindowYoutube(){
    Desktop.createWindow({
        resizeable: true,
        draggable: true,
        width: 300,
        icon: "<span class='mif-youtube'></span>",
        title: "Youtube video",
        content: "https://youtu.be/LDGWYzzKNUk",
        clsContent: "bg-dark"
    });
}

function openCharm() {
    var charm = $("#charm").data("charms");
    charm.toggle();
}
function addCharm_notifies() {
	var li="";$('#notifies_bar').html;
        li+='<div class="charm-notify">';
        li+='<img class="icon" src="img/zesp.png">';
        li+='<div class="title">About ZESP</div>';
        li+='<div class="secondary">blablabla</div>';
        li+='<div class="secondary">14:20 &bull; www.mygateway.ru</div>';
        li+='</div>';
		$('#notifies_bar').html(li);//.trigger("append"); 
}
$(".window-area").on("click", function(){
    Metro.charms.close("#charm");
});

function Collapse(){
	console.log("clear");
};
function Clear_notifies(){
	 $('#notifies_bar').html("").trigger("create");
	console.log("clear");
};
function Join() {
	//addCharm_notifies();
   if (enJoin){WSsend('addDevice');}else{WSsend('addDeviceDone');}

	   Metro.charms.close('#charm');
	    var notify = Metro.notify;
        notify.setup({width: 150,duration: 1000,animation: 'easeOutBounce'});notify.create("Join mode change"); notify.reset();
}

function drawjsconfig(json) { 
		//	console.log(json);
	try {	
			
			var	json= JSON.parse(json);
				jsconfig=json;
				var li="";
				  
			for(var obj in json){
					li+='<div class="frame"><div class="heading">'+ obj +'</div>';
					
					if(json.hasOwnProperty(obj)){
						li+='<div class="content">';
						for(var prop in json[obj]){
							if(json[obj].hasOwnProperty(prop)){
							var op=prop;var valp=json[obj][prop];
							li +='<div class="p-0"><input  class="input-small" type="text" data-role="input" id="'+op+'" value="'+ valp+'" data-append="'+op +'"></input></div>'				
							}
							
						}
						li+="</div>";
					}
					li+="</div>";
				}

			
			
			$('#jsconfig').html(li).trigger("update");
			
    var customButtons = [{html: "<span class='mif-floppy-disk'></span>",cls: "sys-button",onclick: "sendsaveConfig()"}];
		Desktop.createWindow({
        resizeable: false,
        draggable: true,
		place: "center",
        customButtons: customButtons,
        width: 300,
		height: 500,
        icon: "<span class='mif-cog'></span>",
        title: "Config",
        content: "<div id='jsconfig' div data-role='accordion' data-active-heading-class='ribbed-cyan fg-darc ' data-active-content-class='bg-cyan fg-white'>"+li+"</div>"
    });
	
		} catch (exception) {};	


};
function sendsaveConfig() { 	
	
				for(var obj in jsconfig){
					if(jsconfig.hasOwnProperty(obj)){
							for(var prop in jsconfig[obj]){
								if(jsconfig[obj].hasOwnProperty(prop)){
								var op=prop;var val=jsconfig[obj][prop];var valh=$("#"+op).val();
								  jsconfig[obj][prop]=valh;
								}
							}
						}
				}

		console.log(JSON.stringify(jsconfig));
		SaveJson("/jsconfig.txt",JSON.stringify(jsconfig));
		WSsend('RebootESP');
	};
function SaveJson(path,data){WSsend('SaveJson|'+path+'|'+data);}

function drawListDev() { 
//var li='<ul data-role="listview" data-view="icons-medium">';
var li='<ul id="ListDev" data-role="listview" data-view="tiles">';
//var li='<ul data-role="treeview" data-view="icons">';	
//var li='<ul data-role="listview" data-view="tiles">';	
   for(var i =0;i < self.deviceList.length;i++){
	var z=self.deviceList[i];console.log(z);
	li +='<li data-caption="'+z.Device+  " : "+  z.ModelId +'">'
	li +='<ul>';
	li +=' <li onclick="drawDev(this.id);" id="'+z.IEEE+'" data-icon="img/'+tryname(z.ModelId)+'.jpg" data-caption="'+z.IEEE+'"></li>';		
	
	li +='</ul>';	 
	li +='</li>';
  }
	li +='</ul>';

	// $('#notifies_bar').html(li).trigger("create");
	Desktop.createWindow({
        resizeable: true,
        draggable: true,
		place: "center",
        width: 300,
		height: 500,
        icon: "<span class='mif-app'></span>",
        title: "Zigbee Devices",
        content: li
    });

}
async function drawDev(IEEE){
 console.log(IEEE);console.log(shotAdrDev(IEEE));
 
//const response = await fetch('http://82.146.46.112/template/DIYRUZ_R4_5.json',{mode:'no-cors'});
//const myJson = await response.json();
//console.log(JSON.stringify(myJson));

//	WSsend('LoadJson|/template/'+IEEE+'.json');	

	//z=event.data.split("|");
	//if(z[0]==="/template/'+IEEE+'.json"){WSsend('getDeviceList');}

	//WSsend('LoadJson|/devices/'+IEEE+'.json');		

//	WSsend('LoadJson|/template/Lamp_01.json');	
	///ATimer = setInterval(function () {clearInterval(ATimer);}, 1500);	

//$("#nwmap").hide()
//запрашиваем жсон окно откроется по по приходу ответа
	WSsend('LoadJson|/Devices/'+IEEE);






}

 
 	   
        

 
 
function shotAdrDev(Adr){
	var shadr='0000';
	for(var i =0;i < deviceList.length;i++){
		if(deviceList[i]["IEEE"]==Adr){
			shadr=deviceList[i]["Device"];}
	}
	return shadr;
}
function longAdrDev(Adr){
	var ladr='0000';
	for(var i =0;i < deviceList.length;i++){
		if(deviceList[i]["Device"]==Adr){
			ladr=deviceList[i]["IEEE"];}
	}
	return ladr;
}
function ModelIdDev(Adr){
	var ModelId='Unknown';
	if(Adr.length > 4){
	for(var i =0;i < deviceList.length;i++){
		if(deviceList[i]["IEEE"]==Adr){
			ModelId=deviceList[i]["ModelId"];}
	}
	}else{
	for(var i =0;i < deviceList.length;i++){
		if(deviceList[i]["Device"]==Adr){
			ModelId=deviceList[i]["ModelId"];}
	}
	}
	
	return ModelId;
}

function createSetupWindow(){
if (socket==null){
	var li='<form class="inline-form"><input id="strIP" type="text" placeholder="Ip Adress">';
	    var customButtons = [{html: "<span class='mif-floppy-disk'></span>",cls: "sys-button",onclick: "localStorage.setItem('IP_adr',$(\"#strIP\").val());document.location.reload(true) "}];
	Desktop.createWindow({draggable: true,place: "center",
        width: 230,
		height: 75,
        icon: "<span class='mif-app'></span>",
        title: "Setup IP",
		customButtons: customButtons,
        content: li
    });
}else{
	WSsend('loadConfig');
	
}


}

function drawListFw(){
	WSsend('loadfwlist');
    var customButtons = [
        {
            html: "<span class='mif-rocket'></span>",
            cls: "sys-button",
            onclick: "alert('You press rocket button')"
        },
        {
            html: "<span class='mif-user'></span>",
            cls: "alert",
            onclick: "alert('You press user button')"
        },
        {
            html: "<span class='mif-cog'></span>",
            cls: "warning",
            onclick: "alert('You press cog button')"
        }
    ];	
var li="";	
ATimer = setInterval(function () {

	for(var i =0;i < firmwareList.length;i++){
			var z=firmwareList[i].ModelId;console.log(z);
	li+='<div data-role="panel"';
    li+=' data-title-caption="'+firmwareList[i].ModelId+'"';
    li+=' data-collapsible="true"';
	li+=' data-cls-panel="shadow-3"';
	li+=' data-cls-collapse-toggle="fg-white marker-dark"';	
    li+=' data-custom-buttons="'+customButtons+'">...</div>';	
	
   }	
	
	Desktop.createWindow({resizeable: true,draggable: true,place: "center",
        width: 300,
		height: 500,
        icon: "<span class='mif-app'></span>",
        title: "Firmware list",
        content: li
    });
	clearInterval(ATimer);}, 2500);

}
//$(window).on(Metro.events.resize , function(){ network.setSize($("#nwmap").width(), $("#nwmap").height());network.redraw();});
var enJoin=false;
$(".charm-tile").on("click", function(){
    $(this).toggleClass("active");
	console.log($(this).attr('class'));
	if(this.innerText=="Join"){enJoin=!enJoin;Join();}
	if(this.innerText=="Device list"){Metro.charms.close("#charm");drawListDev();}
	if(this.innerText=="Network"){
		if($(this).attr('class')=== "charm-tile active"){
		network.setSize($("#rstol").width(), $("#rstol").height());redrawMap();
		}else{
		network.setSize(1, 1);redrawMap();
		}}
		

	
});
//***************************************************************************************	
function MoveToLevel(data,val){if(val>0){data=data.replace('svalue',Hex(parseInt(val),2));console.log(data);WSsend(data);}}
function MoveToColorTemp(data,val){if(val>0){data=data.replace('svalue',Hex(parseInt(val),2));console.log(data);WSsend(data);}}
function MoveToColor(data,val){data=data.replace('Xvalue',Hex(val[0],4));data=data.replace('Yvalue',Hex(val[1],4));WSsend(data);}
function MoveToSat(data,val){data=data.replace('svalue',Hex(val,2));WSsend(data);}
function MoveToHue(data,val){data=data.replace('svalue',Hex(val,2));WSsend(data);}	
//---------------------------------------------------------------------------------------
function rgb(Device,epn){
	var html='<div id="picker"><div  onclick=\'var colorPicker = new iro.ColorPicker("#picker",{layout:[{component: iro.ui.Wheel,}],width: 180,color: "#ff00ff"});colorPicker.on("color:change", function(color) {if (color.index === 0) {MoveToColor("MoveToColor|'+Device+'|1|'+epn+'|Xvalue|Yvalue|0001",rgb_to_cie(color.rgb.r, color.rgb.g, color.rgb.b));console.log(color.value);console.log(rgb_to_cie(color.hue, color.saturation, color.rgb.b));}})\' >rgb</></div>';
	
return html;
}	

//***************************************************************************************	
function showWidget(dev, jsdata){
//chek if loaded	floppy-disk data-draggable="true"

	 for(var i =0;i < deviceList.length;i++){
		if(deviceList[i]["IEEE"]==dev||deviceList[i]["Device"]==dev)	
		{var z=deviceList[i];dev=deviceList[i]["IEEE"];

		break;}
	}



 	var li="<div id='wdg"+dev+"'>";	
		li +="<table border='1' width='100%'cellspacing='0' cellpadding='0'style='font-weight:bold'>";
		li +="<tr><td width='65' rowspan='3' ><img src='img/"+  z.ModelId +".jpg' width='65px'></td>";
			
		li +='<tr><td width="26"><img src="ico/qualityofservice.png" width="25px"></td><td><div id="+z.IEEE+"_lq>...</div></td><td></td><td width=25px"> <a href="javascript:deldevl(\''+z.IEEE+'\')" >Del</a> </td></tr>';

		 var ep=z.EP;
		 var epn=Object.keys(ep);
		 var li;
		 
		 
		 
	li +="</table><div data-role='collapsible' data-mini='true' data-theme='a'><h6> "+z.IEEE+ ":" +z.Device  +"</h6></>";		 
		li +="<table border='0' width='100%'cellspacing='0' cellpadding='0'>";		
		for(var x =0;x < epn.length ;x++){ // endpoints
			var cl=Object.values(ep)[x];
			var clar=Object.values(cl);
			var pid=clar[0];
			if (clar.length==3){var cli=clar[1];var clo=clar[2];}
			if (clar.length==4){var cli=clar[2];var clo=clar[3];}
//ToDo вставить виджет из json по mac адресу если сохранен  или по model_ID из темплейтов				
//			li+=getVisJson(z.IEEE);						
			

			for(var clx =0;clx < cli.length ;clx++){ // clasters
				li +="<tbody style='text-align:left' id="+z.IEEE+"_"+epn[x]+ "_" +cli[clx]+ ">"; 
				//li +="<tr class='hid'><th width='10'>I</th><th width='20'>"+epn[x]+"</th><th  width='40'>"+cli[clx]+"</th><th width='40'></th><th width='100%'></th><th><a href=\"javascript:AFInfoRequest('"+z.IEEE+epn[x]+cli[clx]+"');\" ><img src='ico/service.png' width='20px'></a></th></tr>";

	
			switch (cli[clx]) {
				case "0006": li+="<tr id='"+z.IEEE+"_"+epn[x]+ "_" +cli[clx]+"_0000'><td class='hid'>I</td><td  class='hid'>"+epn[x]+"</td><td class='hid'>"+cli[clx]+"</td><td class='hid'>"+"0000"+"</td><td>"+"xx"+"</td><td width='42px'><img src='ico/switch.png' width='40px'  onclick='sendbc(\"01"+ z.Device +epn[x]+"02\");'></td></tr>";
				break;
				case "0008":
				
				li+='<div class="slider"data-role="slider"data-show-hint="true"data-max-value="100"data-min-value="-1" onChange=\'var s = "MoveToLevel|'+z.Device+'|1|'+epn[x]+'|1|svalue|0005";MoveToLevel(s,this.offsetParent.lastElementChild.firstElementChild.innerText);\'></div>';
    
      			
		
				break;
				case "0300":
				li+='<div class="slider"data-role="slider"data-show-hint="true"data-max-value="100"data-min-value="-1" onChange=\'var s = "MoveToColorTemp|'+z.Device+'|1|'+epn[x]+'|svalue|0001";MoveToColorTemp(s,this.offsetParent.lastElementChild.firstElementChild.innerText);\'></div>';	
				li+=rgb(z.Device,epn[x]);	
			
				break;			
			}
			
				
				
				
				
				li +="</tbody>"; //clin close
			}
			
			
			
//			for(var clx =0;clx < clo.length ;clx++){ // clasters
//				li +="<tbody style='text-align:left' id="+z.IEEE+"_"+epn[x]+ "_" +clo[clx]+ ">"; 
//				li +="<tr class='hid'><th  width='10'>O</th><th width='20'>"+epn[x]+"</th><th  width='40'>"+clo[clx]+"</th><th width='40'></th><th width='100%'></th><th><a href=\"javascript:AFInfoRequest('"+z.Device/*z.IEEE+epn[x]+clo[clx]*/+"');\" ><img src='ico/service.png' width='20px'></a></th></tr>";
//				li +="</tbody>"; //clon close
//			}			
			
			li +="</tbody>"; //epn close
		 }
		  
		  li +="</table>";  
		 li +="</div>";  
//***********************************************************************************************************
li +="</div>";


li +="<div id='cfg"+dev+"' style='display: none;' >";	
li += '<ul data-role="treeview"> \
   <li class="collapsible tree-node" data-caption="Config"> \
        <ul> \
            <li style="width: 220px"><textarea data-role="textarea" id="jsstr'+dev+'">'+jsdata+'</textarea></li> \
<li style="width: 220px"><button class="button flat-button" onclick="SaveJson(\'/Devices/'+dev+'\',$(\'#jsstr'+dev+'\').val());console.log( $(\'#jsstr'+dev+'\').val());">Save</button></li> \
        </ul> \
    </li> \
</ul>'
li +="</div>";



		

//***********************************************************************************************************sendsaveWdev(dev)
var mid=tryname(ModelIdDev(dev));// 'img/' + mid+'.jpg'
   var customButtons = [{html: "<span class='mif-pencil'></span>",cls: "sys-button",onclick: "$('#wdg"+dev+"').hide();$('#cfg"+dev+"').show();"}];
		Desktop.createWindow({
        resizeable: false,
        draggable: true,
		place: "center",
        customButtons: customButtons,
        width: 300,
		height: 500,
        icon: '<img src="img/'+mid+'.jpg" class="icon">',
        title: mid,
        content: li,
               
});



 //$(this).trigger("create");  
}
	AFInfoRequest = function(afrdata) {	
			console.log(afrdata);
		WSsend('AFInfoRequest|'+afrdata);			
	
	}
	 deldevl = function(Adr) {
 		 for(var i =0;i < self.deviceList.length;i++){
			if(self.deviceList[i]["IEEE"]==Adr){
			console.log(self.deviceList);
			WSsend('removeDevice|'+self.deviceList[i]["Device"]);
			delete self.deviceList[i];self.deviceList.splice(i,1);
			SaveJson("/devicesjs.txt",JSON.stringify(self.deviceList));
			WSsend('reloadtDeviceList');
			break;
			}
		 } 
 
 }
 function sendbc(data){
//var buffer = new Uint8Array(data.match(/[\da-f]{2}/gi).map(function (h) {return parseInt(h, 16)}));
var buffer = new Uint8Array(data.match(/[\da-f]{2}/gi).map(function (h) {return parseInt(h, 16)}))
console.log(data);
WSsend(buffer);
}
function rgb_to_cie(red, green, blue) {red 	= (red > 0.04045) ? Math.pow((red + 0.055) / (1.0 + 0.055), 2.4) : (red / 12.92);green 	= (green > 0.04045) ? Math.pow((green + 0.055) / (1.0 + 0.055), 2.4) : (green / 12.92);blue 	= (blue > 0.04045) ? Math.pow((blue + 0.055) / (1.0 + 0.055), 2.4) : (blue / 12.92);const X = red * 0.664511 + green * 0.154324 + blue * 0.162028;const Y = red * 0.283881 + green * 0.668433 + blue * 0.047685;const Z = red * 0.000088 + green * 0.072310 + blue * 0.986039;let x= (X / (X + Y + Z)).toFixed(4);let y= (Y / (X + Y + Z)).toFixed(4);if (isNaN(x)) { x = 0;}if (isNaN(y)) { y = 0;}return [(x*65279).toFixed(0), (y*65279).toFixed(0)];}
	
