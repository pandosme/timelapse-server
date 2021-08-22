//Copyright (c) 2021 Fred Juhlin

const fs = require("fs");
const VapixDigest = require("./vapix-digest.js");
const VapixParser = require("./vapix-parser.js");

var exports = module.exports = {};

exports.HTTP_Get = function( device, cgi, responseType, callback ) {
	VapixDigest.HTTP_Get( device, cgi, responseType, function( error, body ) {
		callback( error, body );
	});
}

exports.HTTP_Post = function( device, cgi, payload, responseType, callback ) {
//	console.log("VapixWrapper: HTTP_Post", cgi,, payload, responseType);
	VapixDigest.HTTP_Post( device, cgi, payload, responseType, function( error, body ) {
		callback( error, body );
	});
}

exports.HTTP_Put = function( device, cgi, payload, responseType, callback ) {
//	console.log("VapixWrapper: HTTP_Post", cgi,, payload, responseType);
	VapixDigest.HTTP_Put( device, cgi, payload, responseType, function( error, body ) {
		callback( error, body );
	});
}

exports.HTTP_Patch = function( device, cgi, payload, responseType, callback ) {
//	console.log("VapixWrapper: HTTP_Post", cgi,, payload, responseType);
	VapixDigest.HTTP_Patch( device, cgi, payload, responseType, function( error, body ) {
		callback( error, body );
	});
}

exports.SOAP = function( device, soapBody, callback ) {
	VapixDigest.Soap( device, soapBody, function( error, body ) {
		if( error ) {
			callback( error, body );
			return;
		}
		VapixParser.SoapParser( body, function(error,data){
			callback( error, data );
		});
	});
}

exports.CGI = function( device, cgi, callback ) {
//	console.log("VapixWrapper: CGI", device, cgi);
	VapixDigest.HTTP_Get( device, cgi, "text", function( error, body ) {
		if(error) {
			callback(error,body);
			return;
		}
		if( body.search("Error") >= 0 ) {
			callback( true, body);
			return;
		}
		callback( error, body );
	});
}

exports.CGI_Post = function( device, cgi, request, callback ) {
//	console.log("VapixWrapper: CGI_POST: ", cgi, request);
	VapixDigest.HTTP_Post( device, cgi, request, "json", function( error, body ) {
		if( error ) {
			callback(error,body);
			return;
		}
		if( body.hasOwnProperty("error") ) {
			callback( "Invalid request", body.error);
			return;
		}
		if( !body.hasOwnProperty("data") ) {
			callback( "Invalid response", body );
			return;
		}
		callback( error, body.data );
	});
}

exports.JPEG = function( device, profile, callback ) {
	VapixDigest.HTTP_Get( device, '/axis-cgi/jpg/image.cgi?' + profile, "buffer", function( error, body ) {
		callback( error, body );
	});
}

exports.Param_Get = function( device, paramPath, callback ) {
	if( !paramPath || paramPath.length === 0 || paramPath.toLowerCase ( ) === "root" ) {
		callback("Invalid input","Invalid parameter group" );
		return;
	}
	exports.HTTP_Get( device, '/axis-cgi/param.cgi?action=list&group=' + paramPath, "text", function( error, body ) {
		if( error ) {
			callback( error, body );
			return;
		}
		var params = VapixParser.param2json(body);
		callback( false, params );
	});
}

exports.Param_Set = function( device, group, parameters, callback ) {
	if( !group || group.length == 0 ) {
		callback( "Invalid input", "Undefined parameter group");
		return;
	}

	if( !parameters || !(typeof parameters === 'object') ) {
		callback( "Invlaid input", "Parameters need to be an object");
		return;
	}
	var cgi = '/axis-cgi/param.cgi?action=update';
	for( var parameter in parameters ) {
		var value = parameters[parameter];
		if( value === true )
			value = 'yes';
		if( value === false )
			value = 'no'
		if(  typeof parameters[parameter] === 'object' ) {
			//Don't update sub groups 
		} else {
			cgi += '&root.' + group + '.' + parameter + '=' + encodeURIComponent(value);
		}
	}
	
	exports.CGI( device, cgi, function( error, body ) {
		if( error ) {
			callback( error, body );
			return;
		}
		callback( false, body );
	});
}

exports.DeviceInfo = function( device, callback ) {
	var info = {
		type: "Undefined",
		model: "Undefined",
		serial: "Undefined",
		IPv4: "Undefined",
		IPv6: "Undefined",
		hostname: "Undefined",
		platform: "Undefined",
		chipset: "Undefined",
		firmware: "Undefined",
		hardware: "Undefined",
		camera: null,
		audio: null
	};

	//Brand
	exports.Param_Get( device, "brand", function( error, response ) {
		if( error ) {
			callback( error,info );
			return;
		}

		if( response.hasOwnProperty("ProdNbr") )
			info.model = response.ProdNbr;
		if( response.hasOwnProperty("ProdType") )
			info.type = response.ProdType;

		exports.Param_Get( device, "network", function( error, response ) {
			if( error ) {
				callback( error, info );
				return;
			}
			if( response.hasOwnProperty("HostName") )
				info.hostname = response.HostName;
			if( response.hasOwnProperty("VolatileHostName") )
				info.hostname = response.VolatileHostName.HostName;
			if( response.hasOwnProperty("eth0") ) {
				if( response.eth0.hasOwnProperty("IPAddress") )
					info.IPv4 = response.eth0.IPAddress;
				if( response.eth0.hasOwnProperty("IPv6") && response.eth0.IPv6.hasOwnProperty("IPAddresses") )
					info.IPv6 = response.eth0.IPv6.IPAddresses;
				if( response.eth0.hasOwnProperty("MACAddress") )
					info.mac = response.eth0.MACAddress;

				exports.Param_Get( device, "properties", function( error, response ) {
					if( error ) {
						callback( error, info );
						return;
					}
					if( response.hasOwnProperty("Firmware") && response.Firmware.hasOwnProperty("Version"))
						info.firmware = response.Firmware.Version;
					if( response.hasOwnProperty("Image") && response.Image.hasOwnProperty("Format"))
						info.camera = true;
					if( response.hasOwnProperty("Audio") && response.Audio.hasOwnProperty("Audio")) {
						info.audio = response.Audio.Audio;
					}
					if( response.hasOwnProperty("System") ) {
						if(  response.System.hasOwnProperty("SerialNumber") )
							info.serial = response.System.SerialNumber;
						if( response.System.hasOwnProperty("Architecture") )
							info.platform = response.System.Architecture;
						if( response.System.hasOwnProperty("Soc") ) {
							var items = response.System.Soc.split(' ');
							if( items.length > 1 )
								info.chipset = items[1];
							else
								info.chipset = response.System.Soc;
						}
						if( response.System.hasOwnProperty("HardwareID") )
							info.hardware = response.System.HardwareID;
					}
					callback(false,info);
				});
			}
		});
	});
}

exports.Syslog = function( device, callback ) {
	VapixDigest.HTTP_Get( device, '/axis-cgi/systemlog.cgi', "text", function(error, response) {
		if( error ) {
			callback( error, response );
			return;
		}
		var list = VapixParser.Syslog2List( response );
		callback( false, list );
	});
}

exports.GetTime = function( device, callback ) {
	var body = {
		"apiVersion": "1.0",
		"context": "NodeRed",
		"method": "getDateTimeInfo"
	};
	exports.CGI_Post( device, "/axis-cgi/time.cgi", body, function(error, response ) {
		callback( error, response );
	});
}

exports.Connections = function( device, callback ) {
	exports.CGI( device, '/axis-cgi/admin/connection_list.cgi?action=get', function(error, response) {
		if( error ) {
			callback( error, response );
			return;
		}
		var rows = response.split('\n');
		var list = [];
		for( var i = 1; i < rows.length; i++) {
			var row = rows[i].trim();
			row = row.replace(/\s{2,}/g, ' ');
			if( row.length > 10 ) {
				var items = row.split(' ');
				var ip = items[0].split('.');
				if( ip != '127' ) {
					list.push({
						address: items[0],
						protocol: items[1],
						port: items[2],
						service: items[3].split('/')[1]
					})
				}
			}
		}
		callback( false, list );
	});
}

exports.Location_Get = function( device, callback ) {
	exports.CGI( device, '/axis-cgi/geolocation/get.cgi', function(error, response) {
		if( error ) {
			callback( error, response );
			return;
		}
		VapixParser.Location( response, function(error, response ) {
			callback( error, response );
		});
	});
}

exports.Location_Set = function( device, data, callback ) {
	var location = data;
	if( typeof data === "string" && data[0] === '{')
		location = JSON.parse(data);

	if( !location || 
	    !location.hasOwnProperty("longitude") ||
		!location.hasOwnProperty("latitude") ||
		!location.hasOwnProperty("direction") ||
		!location.hasOwnProperty("text") ) {
		callback("Invalid input","Missing longitude, latitude, direction or text");
		return;	
	}
	var cgi = "/axis-cgi/geolocation/set.cgi?";
	latSign = "";
	if( location.latitude < 0 ) {
		location.latitude = -location.latitude;
		latSign = "-";
	}
	var latInt = parseInt(location.latitude);
	var latZ = "";
	if( latInt < 10 )
		latZ = "0";

	lngSign = "";
	if( location.longitude < 0 ) {
		location.longitude = -location.longitude;
		lngSign = "-";
	}
	var lngInt = parseInt(location.longitude);	
	var lngZ = "00";
	if( lngInt >= 10 )
		lngZ = "0";
	if( lngInt >= 100 )
		lngZ = "";
	
	cgi += "lat=" + latSign + latZ + parseFloat(location.latitude).toFixed(8);
	cgi += "&lng=" + lngSign + lngZ + parseFloat(location.longitude).toFixed(8);
	cgi += "&heading=" + location.direction;
	cgi += "&text=" + encodeURIComponent(location.text);
//	console.log("Location_Set", cgi);
	exports.CGI( device, cgi, function(error, response) {
		if( error ) {
			callback( error, response );
			return;
		}
		if(  response.search("Success") > 0 ) {
			callback(false,"OK");
			return;
		}
		callback("Request failed", response);
	});
}

exports.ACAP_List = function( device, callback ) {
	exports.CGI( device, '/axis-cgi/applications/list.cgi', function(error, response) {
		if( error ) {
			callback( error, response );
			return;
		}
		VapixParser.AcapList2JSON(response, function(error, data) {
			callback( error, data );
		});
	});
}

exports.ACAP_Control = function( device, action, acapID, callback ) {
	if( !action || action.length == 0 ) {
		callback( "Invlaid input", "Missing ACAP control action");
		return;
	}
	
	if( !acapID || acapID.length == 0 || acapID.length > 20 ) {
		callback( "Invalid input", "Invalid ACAP ID");
		return;
	}
	
	var cgi =  '/axis-cgi/applications/control.cgi?action=' + action + '&package=' + acapID;
	VapixDigest.HTTP_Get( device, cgi, "text", function( error, response ) {
		if( error ) {
			callback( error, response );
			return;
		}
		response = response.trim();
		switch( response ) {
			case "OK":
			case "Error: 6":  //Application is already running
			case "Error: 7":  //Application is not running
				callback( false, "OK");
			break;
			case "Error: 4":
				callback( true, "Invalid ACAP");
			break;
			default:
				callback( true, response );
			break;
		}
	});
}

exports.Account_List = function( device, callback) {
	exports.CGI( device, '/axis-cgi/pwdgrp.cgi?action=get', function( error, response ) {
		if( error ) {
			callback( true, error );
			return;
		}
		VapixParser.Accounts2JSON( response, function( error, json ) {
			callback(error,json);
		});
	});
};

exports.Account_Set = function( device, options, callback) {
//	console.log("VapixWrapper.Account_Set:", device, options);
	if( !options ) {
		callback("Invalid input","No account data");
		return;
	}
	if( typeof options !== "string" && typeof options !== "object" ) {
		callback("Invalid input","No account data");
		return;
	}
	account = options;
	if( typeof account === "string" )
		account = JSON.parse(account);
	
	if( !account || !account.hasOwnProperty("name") || !account.hasOwnProperty("privileges") || !account.hasOwnProperty("password") ) {
		callback("Invalid input", "Missing account name, password or priviliges");
		return;
	}

	var cgi = '/axis-cgi/pwdgrp.cgi?action=update&user=' + account.name + '&pwd=' + encodeURIComponent(account.password);
	VapixDigest.HTTP_Get( device, cgi, "text", function( error, response ) {
//		console.log("Vapix.Wrapper.Account_Set: Update", error, response);
		if( !error && response.search("Error") < 0 ) {
			callback(error, response);
			return;
		}

		if( account.name === "root" ) {  //Try generate root account for the first time
			cgi = '/axis-cgi/pwdgrp.cgi?action=add&user=root&pwd=' + encodeURIComponent(account.password) + '&grp=root&sgrp=admin:operator:viewer:ptz';
			VapixDigest.HTTP_Get_No_digest( device, cgi, "text", function(error, response ) {
				callback( error, response );
			});
			return;
		}
		
		var sgrp = "viewer";
		if( account.privileges.toLowerCase() === "viewer" || account.privileges.toLowerCase() === "player" )
			sgrp = "viewer";
		if( account.privileges.toLowerCase() === "operator" || account.privileges.toLowerCase() === "client" )
			sgrp = "viewer:operator:ptz";
		if( account.privileges.toLowerCase() === "admin" || account.privileges.toLowerCase() === "administrator" )
			sgrp = "viewer:operator:admin:ptz";
		if( account.privileges.toLowerCase() === "api" )
			sgrp = "operator:admin";
		
		cgi = '/axis-cgi/pwdgrp.cgi?action=add&user=' + account.name + '&pwd=' + encodeURIComponent(account.password) + '&grp=users&sgrp=' + sgrp + '&comment=node';
		VapixDigest.HTTP_Get( device, cgi, "text", function( error, response ) {	
				if( error ) {
					callback( error, response );
					return;
				}
				if( response.search("Error") >= 0 ) {
					callback( "Request failed", response );
					return;
				}
				callback( false, "OK" );
				return;
		});
//		callback( false, "OK" );
	});
};

exports.Account_Remove = function( device, accountName, callback) {
	if( !accountName || typeof accountName !== "string" || accountName.length === 0 || accountName.length > 64) {
		callback("Invalid input","Invalid account name");
		return;
	}
	var cgi  = "/axis-cgi/pwdgrp.cgi?action=remove&user=" + accountName;
	exports.CGI( device, cgi, function( error, response ) {
		if( error ) {
			callback(error, response );
			return;
		}
		callback(false,"OK");
	});
};

exports.Upload_Firmare = function( device , options, callback ) {
//	console.log("Firmware upgrade.");
	
	if( Buffer.isBuffer(options)  ) {
		VapixDigest.upload( device, "firmware", "firmware.bin", null, options, function( error, response) {
			callback( error, response );
		});
		return;
	}
	
	if( typeof options !== "string" ) {
		callback("Invalid input","Firmware upload requires a filepath or buffer");
		return;
	}
	if( !fs.existsSync(options) ) {
		callback("Invalid input","File "+ options + " does not exist");
		return;
	}	

	VapixDigest.upload( device, "firmware", "firmware.bin", null, fs.createReadStream(options), function( error, response) {
//		console.log("Firmware upgrade: ", error, response);
		if( !error ) {
			callback( error, response );
			return;
		}
		//Possible an old API version.  Try the legacy firmware upload
//		console.error("Firmware upgrade failed. Trying the legacy upgrade API");
		VapixDigest.upload( device, "firmware_legacy", "firmware.bin", null, fs.createReadStream(options), function( error, response) {
			if( error ) {
				callback(error, response);
				return;
			}
			if( response.search("Error") > 0 ) 
				callback( "Upgrade failed", response );
			else
				callback( false, response );
		});
	});
}

exports.Upload_Overlay = function( device, filename, options, callback ) {
	if(!filename || typeof filename !== "string" ) {
		callback(true,"Invalid filename");
		return;
	}

	if( !fs.existsSync(filename) ) {
		callback("Invalid input", filename + " does not exist");
		return;
	}	
	
	var paths = filename.split("/");
	var file = paths[paths.length-1];

	VapixDigest.upload( device, "overlay", file, options, fs.createReadStream(filename), function( error, response) {
		callback( error, response );
	});
}

exports.Upload_ACAP = function( device , options, callback ) {
	// options may be a filepath or a file buffer

	if(!options) {  
		callback("Invalid input","Data must be a buffer or a filepath string");
		return;
	}
	
	if( Buffer.isBuffer(options)  ) {
		VapixDigest.upload( device, "acap", "acap.eap", null, options, function( error, response) {
			if(!error) {
				callback( error, response );
				return;
			}
			VapixDigest.upload( device, "acap_legacy", "acap.eap", null, options, function( error, response) {
				if( error ) {
					callback( error, response );
					return;
				}
				var body = response.trim();
				switch( body ) {
					case "OK":
						callback( false, "ACAP installed" );
					break;
					case "Error: 1":
						callback( "ACAP install failed", "Invalid file type" );
					break;
					case "Error: 2":
						callback( "ACAP install failed", "File verification failed" );
					break;
					case "Error: 3":
						callback( "ACAP install failed", "File is too large or the storage is full" );
					break;
					case "Error: 5":
					case "Error: 10":
						callback( "ACAP install failed", "File is not compatible with the HW or FW" );
					break;
					default:
						callback( "ACAP install failed", body );
					break;
				}
			});
		});
		return;
	}
	
	if( typeof options !== "string" ) {
		callback("Invalid input","Invalid filepath or buffer");
		return;
	}
	if( !fs.existsSync(options) ) {
		callback("Invalid input", options + " does not exist");
		return;
	}	

	VapixDigest.upload( device, "acap", "acap.eap", null, fs.createReadStream(options), function( error, response) {
		if(!error) {
			callback( error, response );
			return;
		}
//		console.log("ACAP upload failed.  Testing legacy ACAP upload CGI...");
		VapixDigest.upload( device, "acap_legacy", "acap.eap", null, fs.createReadStream(options), function( error, response) {
			if( error ) {
				callback( error, response );
				return;
			}
			var body = response.trim();
			switch( body ) {
				case "OK":
					callback( false, "ACAP installed" );
				break;
				case "Error: 1":
					callback( "ACAP install failed", "Invalid file type" );
				break;
				case "Error: 2":
					callback( "ACAP install failed", "File verification failed" );
				break;
				case "Error: 3":
					callback( "ACAP install failed", "File is too large or the storage is full" );
				break;
				case "Error: 5":
				case "Error: 10":
					callback( "ACAP install failed", "File is not compatible with the HW or FW" );
				break;
				default:
					callback( "ACAP install failed", body );
				break;
			}
		});
	});
}

exports.Certificates_Get = function( device, certificateID, callback ) {
	var body = '<tds:GetCertificateInformation xmlns="http://www.onvif.org/ver10/device/wsdl">';
	body += '<CertificateID>' + certificateID + '</CertificateID>';
	body += '</tds:GetCertificateInformation>';
	
	VapixDigest.Soap( device, body, function( error, response ) {
		if( error ) {
			callback( error, response);
			return;
		}
		VapixParser.Certificate( response, function( error, cert ) {
			callback( error,cert);
		});
	});
};

exports.Certificates_List = function( device, callback ){
	var body = '<tds:GetCertificates xmlns="http://www.onvif.org/ver10/device/wsdl"></tds:GetCertificates>';
	VapixDigest.Soap( device, body, function( error, response ) {
		if( error ) {
			callback(error, response);
		}
		VapixParser.Certificates( response, function( error, list ) {
			if( error ) {
				callback( error, response );
				return;
			}
			if( list.length === 0 ) {
				callback( false, list );
				return;
			}
			var certCounter = list.length;
			var theCallback = callback;
			var certList = [];
			for( var i = 0; i < list.length; i++ ) {
				exports.Certificates_Get( device, list[i].id, function( error, response ) {
					if( !error )
						certList.push( response );
					certCounter--;
					if( certCounter <= 0 )
						theCallback( false, certList );
				});
			};
			return;
		});
	});
}

exports.Certificates_CSR = function( device, options, callback){
	if(!options || typeof csr === "number" || typeof csr === "boolean") {
		callback("Invalid input","Undefined CSR");
		return;
	}
	csr = options;
	if( typeof csr === "string" )
		csr = JSON.parse(csr);
	if(!csr) {
		callback("Invalid input","Undefined CSR");
		return;
	}
	csr.id = "CSR_" + new Date().getTime();
	VapixParser.CSR_Request_Body( csr, function( error, body ) {
		if( error ) {
			callback( error, body  + " Check if CSR has unique id" );
		};
		VapixDigest.Soap( device, body, function( error, response ) {
			if( error ) {
				callback(error,response);
				return;
			}
			VapixParser.SoapParser( response, function( error, data ) {
				if( !data.hasOwnProperty("acertificates:CreateCertificate2Response") ) {
					callback("Invalid request", data);
					return;
				}
				callback(error,{
					id: data["acertificates:CreateCertificate2Response"]["acertificates:Id"],
					pem: data["acertificates:CreateCertificate2Response"]["acertificates:Certificate"]
				});
			});
		});
	});
}
