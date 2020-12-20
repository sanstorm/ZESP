 //MQTT---
var mqtt;
if(appConfig.MQTT.mqttEnable=="1"){	
const mqttg = require('mqtt')

var optMqtt = {
    port: appConfig.MQTT.mqttPort,
    host: 'mqtt://'+ appConfig.MQTT.mqtt,
    clientId: 'ZESP' + Math.random().toString(16).substr(2, 8),
    username: appConfig.MQTT.mqttLogin,
    password: appConfig.MQTT.mqttPassw,
    keepalive: 60,
    reconnectPeriod: 1000,
    protocolId: 'MQIsdp',
    protocolVersion: 3,
    clean: true,
    encoding: 'utf8'
};


	mqtt = mqttg.connect('mqtt://'+ appConfig.MQTT.mqtt, optMqtt);
mqtt.on('connect', function() { // When connected subscribe to a topic
	mqtt.subscribe([appConfig.MQTT.mqttup+'/+/+/set',appConfig.MQTT.mqttup+'/+/+/+/set'], function() {
		console.log("****************************mqtt.subscribe***************************************");
		var adr= zigbee_devices.getDeviceLongAddr(0);
			mqtt.publish(appConfig.MQTT.mqttup+"/"+adr+"/playSound"+"/volume/set", miSound.mi_volume.toString()); 
			mqtt.publish(appConfig.MQTT.mqttup+"/"+adr+"/playSound"+"/path/set" ,"path2file");
			mqtt.publish(appConfig.MQTT.mqttup+"/"+adr+"/playSound"+"/json/set",'{"volume":"15000","path":"path2file"}');
			mqtt.publish(appConfig.MQTT.mqttup+"/"+adr+"/playSound"+"/kill/set","1" );
			mqtt.publish(appConfig.MQTT.mqttup+"/"+adr+"/saytxt"+"/text/set", " "); 
			mqtt.publish(appConfig.MQTT.mqttup+"/"+adr+"/saytxt"+"/json/set",'{"volume":"15000","text":" ","lang":"ru"}');
			mqtt.publish(appConfig.MQTT.mqttup+"/"+adr+"/0103000000/light/set",'{"brightness": 50,"state": "OFF","color": {"r": '+mi_lamp.R+',"g": '+mi_lamp.G+',"b": '+mi_lamp.B+'}}');
	});
});


    mqtt.on('message', function(topic, message, packet) {
	   var ofset=(appConfig.MQTT.mqttup).split("/");
	   ofset=ofset.length-1;

try{    
		console.log("Received '" + message + "' on '" + topic + "'");
		var u16DstAddr=zigbee_devices.getDeviceShotAddr(topic.split("/")[ofset+1]);	
		var device=	(Devices.filter(function(dev) { return dev.IEEE == topic.split("/")[ofset+1]; }))[0];

	if (topic.split("/")[ofset+4]=="set") {
        
		if (topic.split("/")[ofset+2] == "saytxt") {
			if (topic.split("/")[ofset+3] == "text") {
			//home/saytxt/00158D000317C9FB/text/set
				saytxt(message);				
			}
			if (topic.split("/")[ofset+3] == "json") {
			//home/saytxt/00158D000317C9FB/json/set {"volume":"15000","text":"тест","lаng":"ru"}
			//'zep32/00158D0003CBC2A4/saytxt/json/set'

			var jsp=JSON.parse(message);

				saytxt(jsp.text,jsp.volume,jsp.lаng);
		//	console.log("SAY******************************lang:",jsp.lаng)	;					
			}		
		}

		
        if (topic.split("/")[ofset+2] == "playSound") {
			if (topic.split("/")[ofset+3] == "volume") {
			//home/playSound/00158D000317C9FB/volume/set
				miSound.mi_volume=parseInt(message,10);				
			}
			if (topic.split("/")[ofset+3] == "path") {		
			//home/playSound/00158D000317C9FB/path/set		
			
			exec("mpg123 -f -"+ (miSound.mi_volume).toString() + " " + message);			

			}		
			if (topic.split("/")[ofset+3] == "json") {			
			//home/playSound/00158D000317C9FB/json/set
			var jsp=JSON.parse(message);
			console.log("mpg123 -f -"+ jsp.volume + " " + jsp.path)			
			exec("mpg123 -f -"+ jsp.volume + " " + jsp.path);
			}
			if (topic.split("/")[ofset+3] == "kill") {			
			//home/playSound/00158D000317C9FB/kill/set	
			 exec("killall mpg123");				
			}		
		}			
        

var rolelabel=topic.split("/")[ofset+3].split(":")[0];		

//'{"state": "ON"}' on                   'zep32/00124B000A9E26D8/0103000000/light/set'
//'{"state": "ON", "brightness": 61}' on 'zep32/00124B000A9E26D8/0103000000/light/set'




		
		if (rolelabel == "light") {
			message=JSON.parse(message);
			//zep32/00124B000A9E26D8/0B03000000/light/state
			var state_topic=appConfig.MQTT.mqttup+"/"+topic.split("/")[ofset+1]+"/"+topic.split("/")[ofset+2]+"/light/state";
		if (u16DstAddr=="0000"){
			console.log("Received " + message);
			//mqtt.publish(state_topic,message,{retain:true}, function() {console.log(state_topic,JSON.stringify(message));});				
				console.log(message.state);
				
				if(message.state=="OFF"){mi_lamp.on=0;}else{mi_lamp.on=1;}
				for(var obj in message){
					console.log(message[obj],obj);
					//if (obj=="state"){if(message[obj]=="OFF"){mi_lamp.on=0;}else{mi_lamp.on=1;}}
					if (obj=="brightness"){mi_lamp.level=message[obj];}				
					if(message.hasOwnProperty(obj)){
						for(var prop in message[obj]){
							if (prop=="r"){mi_lamp.R=message[obj].r;}
							if (prop=="g"){mi_lamp.G=message[obj].g;}
							if (prop=="b"){mi_lamp.B=message[obj].b;}							
							}
						}
				}
			setmi_lamp(mi_lamp);
			}else{
				
			//mqtt.publish(state_topic,JSON.stringify(message),{retain:true}, function() {console.log(state_topic,JSON.stringify(message));});
				var eca=topic.split("/")[ofset+2]	
				var mEP= eca.substr(0, 2);   
				var mCL= eca.substr(2, 4);		
				var mATr=eca.substr(6, 4);
				console.log(topic.split("/")[ofset+2],eca,mEP);				
				var u8State;
				var u8DstEp;
				u8DstEp=parseInt(mEP,16);				
				for(var val in message){
					console.log(message.length,val,message[val]);		

					if(message.state=="OFF"){u8State=0;}else{u8State=1;}
						console.log(u16DstAddr,u8DstEp,u8State);
						cmdON_OFF(parseInt(u16DstAddr,16),u8DstEp,u8State);		
					if (val=="brightness"){
						var u8Level=parseInt(message[val],16);
						sendClusterMoveToLevel(2,parseInt(u16DstAddr,16), 1, u8DstEp, 1, u8Level, 1);
						sendReadAttribRequest(parseInt(u16DstAddr,16),1 ,u8DstEp  , 0x0008 , 0, 0, 0, 1, 0x0000);							
						}						
					
				
				
				
				}
			}
			
		}
		
		
//Received 'ON' on 'zep32/switch/00124B0009FE212D/0100060000/set'
//Received 'ON' on 'zep32/switch/01124B001C2E6980/ON_OFF/set'
//'zep32/01124B001C2E6980/0B00060000/switch/set'
//'zep32/01124B001C2E6980/0B00060000/ON_OFF/set'

var eca=topic.split("/")[ofset+2]	
//console.log(eca,eca.substr(0, 2),eca.substr(2, 4),eca.substr(6, 4));
var mEP= eca.substr(0, 2);   
var mCL= eca.substr(2, 4);		
var mATr=eca.substr(6, 4);
		if (rolelabel == "switch" || mCL=="0006"){		
			var u8State=0;
			var rep=device.Report;
		console.log(device);
		attrID=topic.split("/")[ofset+2];
		u8DstEp=parseInt(attrID.substr(0, 2),16);			
		//message=message.toUpperCase();
		if(message=="false" ||message=="off" || message=="OFF" || message=="FALSE" || message=="0"){u8State=0;}
		if(message=="true" || message=="on" || message=="ON" || message=="TRUE" || message=="1"){u8State=1;}
		if(message=="toggle" ||message=="TOGGLE" ||  message=="2"){u8State=2;}
		console.log(u16DstAddr,u8DstEp,u8State);		
		cmdON_OFF(parseInt(u16DstAddr,16),u8DstEp,u8State);
		
		}		

	}
		

}catch(err){console.log(err);}
		
		});


		mqtt.on('error', function(err) {
			console.log(err);
		});

}
