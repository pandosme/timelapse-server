Timelapse-Server
================

Collects images from Axis cameras and stores them in directories so user can generate and play MP4 video at configurable fram rates.

Common use cases:
* Construction site progress.  Typically capturing one image every day at sun noon.
* Monitor slow changes for outdoor seasonas, warehouse stock or rooms.  Typically capturing images based on a timer. 
* Forensic search.  Typically capturing images on motion detection.

Features:
* Web-based dashboard
* Supports both local cameras (pull images) and remote cameras (push).
* User-selectable image capture triggers
* View status of all on-going recordings
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
git clone git@github.com:pandosme/timelapse-server.git
```
4. Start and Stop Node-RED to test everything is working.
5. Edit .node-red/settings.js.  Find the line with httpStatic, remove comments and add route
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
9. Start Node-RED and got to the Dashboard

   


