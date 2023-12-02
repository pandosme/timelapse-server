Timelapse-Server
================

### About

A Timelapse-Server for xis Cameras based on Node-RED and ffmpeg.  Supports both local cameras (pull images) and remote cameras (push).

### Pre-requisite
* Axis Cameras
* Linux server with GIT installed

### Installation
1. Install [Node-RED](https://nodered.org/#get-started) on your Linux server.
2. Clone repository in your home directory
```
git clone git@github.com:pandosme/timelapse-server.git
```
4. Start and Stop Node-RED to test everything is working.
5. Edit .node-red/settings.js:
   * Add/enable static route
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
9. Start Node-RED
