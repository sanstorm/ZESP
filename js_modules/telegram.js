//Telegram_Bot*******************************
if(appConfig.Telegram_Bot.Enable=="1"){	
try{
var chat_id;

var telegram = require('telegram-bot-api');

function bot_getAlldev(){
	var dev = Devices;//zigbee_devices.Devices();
	var inline_keyboard=[dev.length];
			for (var i =0; i < dev.length;i++)
			{var el={text: '',callback_data: ''}
				el.text=dev[i].IEEE +":"+dev[i].ModelId;
				el.callback_data='dev|'+dev[i].IEEE;
				inline_keyboard[i]=[el];
			}
	return {inline_keyboard};	
}



var bot_api = new telegram({
        token: appConfig.Telegram_Bot.bot_token,
		updates: {enabled: true,get_interval: 500}
});

bot_api.getMe().then(function(data){console.log(data);}).catch(function(err){console.log(err);});



bot_api.on('message', function(message)
{
chat_id = message.chat.id;
console.log(message);
var inmsg =message.text.split("|");	
	
	if(inmsg[0]=="say"){	
		saytxt(inmsg[1]);
	}	
	if(message.text=="menu"){
		bot_api.sendMessage({
			chat_id: chat_id,
			text: 'Devices',	
			//parse_mode:'HTML',
			reply_markup: JSON.stringify(bot_getAlldev())
		}).then(function(message){console.log(message);}).catch(function(err){console.log(err);});		
	}
});



bot_api.on('inline.callback.query', function(msg)
{
    // New incoming callback query
       console.log(msg.message,msg.data);

	var cbmode =msg.data.split("|")[0];
	var cbdata =msg.data.split("|")[1];
	  
 switch (cbmode)
  {
    case "dev":{
	bot_api.editMessageText({
		chat_id: msg.message.chat.id,
		message_id:msg.message.message_id,
		text: botmenutext(cbdata),
		parse_mode:'HTML',
		reply_markup: bot_menukbd(cbdata,msg.data),
			
	})
	.then(function(message){console.log(message);}).catch(function(err){console.log(err);});
			
		
		break;

	}
    case "menu":{
	bot_api.editMessageText({
		chat_id: msg.message.chat.id,
		message_id:msg.message.message_id,
		text: msg.data,	
		//parse_mode:'HTML',
		reply_markup: JSON.stringify(bot_getAlldev())
	})
	.then(function(message){console.log(message);}).catch(function(err){console.log(err);});
	
	break;
	} 
//	'set|46B7|0B00060000|01'
    case "set":{
		
	var u16DstAddr=msg.data.split("|")[1];	
	var u8DstEp=msg.data.split("|")[2].substr(0, 2);
	var u8State=msg.data.split("|")[3];
	cmdON_OFF(parseInt(u16DstAddr,16),parseInt(u8DstEp,16),parseInt(u8State,16));		
	break;
	}	
  }


	
});





}catch(error){console.log(error)}
}


function bot_getAlldev(){
	var dev = zigbee_devices.Devices();
	var inline_keyboard=[dev.length];
			for (var i =0; i < dev.length;i++)
			{var el={text: '',callback_data: ''}
				el.text=dev[i].IEEE +":"+dev[i].ModelId;
				el.callback_data='dev|'+dev[i].IEEE;
				inline_keyboard[i]=[el];
//			console.log(i,el,inline_keyboard[i]);
			}
	console.log(JSON.stringify({inline_keyboard}));
	return {inline_keyboard};	
}




function bot_menukbd(dev,msgdata){
	var device=	(Devices.filter(function(device) { return device.IEEE == dev; }))[0]; 
	//console.log("bot_menukbd",device,msgdata);	
	var txt="{\"inline_keyboard\": [";

	try{	

	for (let [attrID, avalue] of Object.entries(device.Report)) {
		var ardevrole=avalue.role.split("&");
		var devRole  = ardevrole[0];
		var devClass = JSON.parse(ardevrole[1]);
			if(devRole=='switch'){
				txt+="[{\"text\": \"OFF\",\"callback_data\": \"set|"+device.Device+"|"+attrID+"|00\"},{\"text\": \"TOGGLE\",\"callback_data\": \"set|"+device.Device+"|"+attrID+"|02\"},{\"text\": \"ON\",\"callback_data\": \"set|"+device.Device+"|"+attrID+"|01\"}],";
			}else{
			
			
			}
		}	
	}catch{

}

	txt+="[{\"text\": \"🔄\",\"callback_data\": \""+msgdata+"\"},{\"text\": \"🔙\",\"callback_data\": \"menu|main\"}]";
	txt+="]}"
return  txt;
}

function botmenutext(dev){
	var device=	(Devices.filter(function(device) { return device.IEEE == dev; }))[0]; 
	//console.log(device);
	var date = new Date();
		try{	
			var txt="";
			txt+=' <b>'+device.ModelId+':'+device.Device +'</b>\n';	
			txt+='<pre>';
			txt+='____________________\n';	
			console.log(device.Report);
			for (let [attrID, avalue] of Object.entries(device.Report)) {	
						var ardevrole=avalue.role.split("&");
						var devRole ;
						var devClass;
						var device_class;
						if(ardevrole.length > 1)	{
							devRole  = ardevrole[0];
							devClass = JSON.parse(ardevrole[1]);
							device_class=devClass.device_class;
						}else{
							device_class=avalue.role;
						}

	
			
			txt+=' '+ geticon(device_class)+' '+ avalue.label + '\n    '+ ((avalue.parsed!="undefined") ? avalue.parsed  : avalue.val) +'\n';
		  //txt+=' '+ geticon(device_class)+' '+ avalue.label + '\n    '+ avalue.parsed+'\n';				
			txt+='____________________\n';			
			}	
		//	txt+='|🌡️ Temperature  23.67\n';
		//	txt+='_______________________\n';	
		//	txt+='|☂️ Humiditi    67\n';
		//	txt+='_______________________\n';		
		//	txt+='|☢️ Voc         55\n';
		//	txt+='_______________________\n';		
		//	txt+='|💡 Lamp        ON\n';	
		//	txt+='_______________________\n';	
		}catch{txt+="Undefined\n";}

		txt+='Time:'+ date.getTime()+'\n';
		txt+='</pre>';
		return txt;
}
//📶 ▶️ 🔄 🔙 ✔️ ⚙️ 📷 🔋 🎚️ toLocaleLowerCase()
function geticon(device_class){
	console.log("geticon("+device_class+")")
	var ico="";
	switch(device_class.toLocaleLowerCase())
	  {
		case "battery":ico="🔋";break;
		case "battery_charging":ico="🔋";break;
		case "door":ico="🚪";break;
		case "connectivity":ico="📎";break;
		case "garage_door":ico="📎";break;
		case "gas":ico="📎";break;
		case "heat":ico="📎";break;
		case "light":ico="📎";break;
		case "lock":ico="📎";break;
		case "moisture":ico="📎";break;
		case "motion":ico="🚶‍♂️";break;
		case "moving":ico="📎";break;
		case "occupancy":ico="🚶‍♂️";break;
		case "opening":ico="📎";break;
		case "plug":ico="📎";break;
		case "power":ico="📎";break;
		case "presence":ico="📎";break;
		case "problem":ico="📎";break;
		case "safety":ico="📎";break;
		case "smoke":ico="📎";break;
		case "sound":ico="📎";break;
		case "vibration":ico="📎";break;
		case "window":ico="📎";break;
		case "illuminance":ico="📎";break;
		case "signal_strength":ico="📎";break;
		case "timestamp":ico="📎";break;
		case "current":ico="📎";break;
		case "energy":ico="📎";break;
		case "power_factor":ico="📎";break;
		case "voltage":ico="📎";break;
		case "temperature":ico="🌡️";break;		
		case "humidity":ico="🌧️";break;
		case "pressure":ico="🎚️";break;		
		case "gas":ico="☢️";break;
		case "lamp":ico="💡️";break;
		case "pir":ico=" :footprints:";break
			default: ico="📎";break
	}
	return ico;
}