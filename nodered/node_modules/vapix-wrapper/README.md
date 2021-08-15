# VapixWrapper 
### (C) Fred Juhlin 2021
A library that simplifies working with Axis VAPIX API request and response.

## Device
The device object uses the following properties:

- address:  string (IP Address or FQDN)
- user: string (Device account user name)
- password: string (Device account password)
- protocol: string [OPTIONAL]  ('http' (default) or 'https')

Device:
```
{
  address: "1.2.3.4",
  user: "root",
  password: "pass",
  protocol: "http"
}
```

## Error
All callbacks responds with an error.  On success, error is null, false or undefined.  On failure error will be true or a string describing the problem.

## HTTP_Get( device, cgi, responseType, callback )
Makes a standard HTTP request without any processing nor parsing of response.  Typically used when requesting ACAP APIs.
```
VapixWrapper.HTTP_Get( device, "/axis-cgi/...", "text", function( error, body ) {
	//Do something...
});
```

## HTTP_Post( device, cgi, payload, responseType, callback )
Makes a standard HTTP request without any processing nor parsing of response.  Typically used when requesting ACAP APIs.
```
VapixWrapper.HTTP_Post( device, "/axis-cgi/...", postPayload, "json", function( error, body ) {
	//Do something...
});
```

## CGI( device, cgi, callback )
Make an VAPIX HTTP CGI request similar to HTTP_Get.  The difference is that CGI will process the response to detect error response.  Axis devices has a tendancy to respond 200 OK on failures and the error is in the response.
```
VapixWrapper.CGI( device, "/axis-cgi/...", function( error, body ) {
	//Do something...
});
```

## CGI_Post( device, cgi, request, callback )
Make an VAPIX HTTP POST CGI request similar to HTTP_Post.  The difference is that CGI_Post will process the response to detect error response.  Axis devices has a tendancy to respond 200 OK on failures and the error is in the response.
```
var requestBody = {
  "apiVersion": "1.0",
  "context": "someContext",
  "method": "getNetworkInfo",
  "params":{}
}

VapixWrapper.CGI_Post( device, "/axis-cgi/network_settings.cgi", requestBody, function( error, body ) {
	//Do something...
});
```

## SOAP( device, soapBody, callback )
Make an a SOAP call to Axis device (vapix/services).  Parses and XML resonce and make it to a JS object.
```
var soapBody = '<tds:GetCertificates xmlns="http://www.onvif.org/ver10/device/wsdl"></tds:GetCertificates>';

VapixWrapper.SOAP( device, soapBody, function( error, body ) {
	//Do something...
});
```

## JPEG( device, profile, callback )
Fetches a JPEG image capture from a camera.  The profile syntax is similar the the VAPIX syntax but omitting the name 'resolutiuon'
```
VapixWrapper.JPEG( device, "640x480", function( error, body ) {
	//Do something...
});
```

## Param_Get( device, paramPath, callback )
Request to VAPIX param CGI but responds with a JSON instead of a text blob.  See VAPIX Param-CGI documemtnation for groups/names/paths.
```
VapixWrapper.Param_Get( device, "network" , function( error, body ) {
	//Do something...
});
```

## Param_Set( device, group, parameters, callback )
Request to VAPIX param CGI with similar object structure responded by Param_Get. The object may have many, all or one property.
```
VapixWrapper.Param_Set( device, "network" , {param_1:10,param_2:5}, function( error, body ) {
	//Do something...
});
```

## DeviceInfo( device, callback )
Collects a number of properties from the Axis device.
```
VapixWrapper.DeviceInfo( device, function( error, info ) {
	//Do something...
});

info = {
	type: string,
	model: string,
	serial: string,
	IPv4: string,
	IPv6: string,
	hostname: string,
	platform: string,
	chipset: string,
	firmware: string,
	hardware: string,
	camera: true | null,
	audio: true | null
};
```

## Syslog( device, callback )
Get the device syslog as a JavaScript list.
```
VapixWrapper.Syslog( device, function( error, list ) {
	//Do something...
});
```

## Connections( device, callback )
Returns a list of connection to the device

## Location_Get( device, callback )
Gets the GeoLocation stored on the device.

## Location_Set( device, data, callback )
Sets (stores) the GeoLocation data.  Use the same object structure returned by Location_Get.

## ACAP_List = function( device, callback )
Return a list of all installed ACAPs and their status

## ACAP_Control( device, action, acapID, callback )
"start", "stop", "remove" with a specific acapID.  The acapID is the package name (not Application ID)

## Account_List = function( device, callback)
Returns a list of accounts defined in the device

## Account_Set( device, account, callback)
Adds or updated an account.
```
{
  name: "someAccountName",
  password: "somePassword",
  privileges: "Admin", "Operator" or "Viewer"
 }
```

## Account_Remove( device, accountName, callback)
Removes an account

## Upload_Firmare( device, file, callback )
Updates the device firmware.  file can be a filepath or a file buffer

## Upload_ACAP( device, file, callback )
Installs or updates an ACAP file (eap).  file can be a filepath or a file buffer
