Timelapse-Server
================
The [Timelapse ACAP](https://pandosme.github.io/acap/2020/01/01/timelapse.html) makes it easy to create timelapse videos using Axis camera.  A server-based solution may be better solution if you have many cameras .  The timelapse-server collects images from Axis cameras and stores them in directories so user can generate and play MP4 video at configurable frame rates.

Common use cases:
* Construction site progress.  Typically capturing one image every day at sun noon.
* Monitor slow changes for outdoor seasonal, warehouse stock or rooms.  Typically capturing images based on a timer. 
* Forensic search.  Typically capturing images on motion detection.  

Features:
* Web-based dashboard
* Supports both local cameras (pull images) and remote cameras (push images).
* User-selectable image capture triggers
* Set GPS location to generate Sun noon event to be used as trigger.
* Condition filters to limit image capturing only between sunrise and sunset, between dawn and dusk or during office hours
* View status of all ongoing recordings
* Inspect frames in timelapse
* Generate MP4 video
* Download MP4 video

### Pre-requisite
* Axis Cameras
* Linux server with GIT installed

### Installation
1. Install [Node-RED](https://nodered.org/#get-started) on your Linux server.
2. Clone repository in your home directory
```
git clone https://github.com/pandosme/timelapse-server.git
```
4. Start and Stop Node-RED to test everything is working.
5. Edit .node-red/settings.js.  Find the line with httpStatic, remove comments, and add route.
```
httpSatic: [
   {path: 'timelapse/recordings/', root: "/recordings/"}
],
```
5. Copy flow.json and package.json to your .node-red directory
```
cp ~/timelapse-server/flow.json ~/.node-red
cp ~/timelapse-server/package.json ~/.node-red
```
7. Install all required packages
```
cd .node-red
npm install
cd ..
```
8. Install ffmpeg
```
sudo apt install ffmpeg
```
9. Start Node-RED and go to the Dashboard on address ```http://server-address:1880/ui```
The flows can be inspected and modified on ```http://server-address:1880```

## Timelapse configuration
### Local cameras
If the server can access a camera, create a new Timelapse, set trigger, camera address, user and password

### Remote cameras (and custom triggers)
If the server cannot reach the camera but the camera can reach the server, create a timelapse with trigger "HTTP".  This creates an HTTP endpoint e.g. "/timelapse/RCNACUGA" that a camera can push images to.
1. In the cameras under System | Events, create a new HTTP recipient with the address ```https:/server-address:1880/timelapse/RCNACUGA```
2. Create an HTTP upload event based on some trigger available in the camera and user the recipient previously created.
IMPORTANT!  Set "Maximum images" to 1

## Generate and play MP4
1. Select a timelapse in the table
2. On the right side, click "Generate MP4".
MP4 generation may take some time based on the image size, number of frames and what hardware the server runs on.
3. In the table in column MP4, a link with a date will appear.  Use this link to play the video or download.  The link can be shared to others that has access the server.

## Security
If the server is exposed to Internet it is recommended to add authentication for the flows, dashboard.
You must generae password hashes and edit the file ```.node-red/settings.js```.
[Read more on Securing Node-RED](https://nodered.org/docs/user-guide/runtime/securing-node-red)



