Timelapse-Server
================

### About

A Timelapse-Server for xis Cameras based on Node-RED and ffmpeg.  Supports both local cameras (pull images) and remote cameras (push).

### Installation
1. Install [Node-RED](https://nodered.org/#get-started) on your Linux server.
2. Start and Stop Node-RED to test everything is working.
3. Edit .node-red/settings.js:
   * Add/enable static route
   httpSatic: \[

   ```httpSatic\: \[
   
        {path: 'timelapse/recordings/', root: "/recordings/"}
   
    \],```
`

