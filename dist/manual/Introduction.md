# The EMU-webApp

<!---
author: Raphael Winkelmann
-->

![icon](assets/EMU-webAppIcon-roundCorners.svg)


- **Version: 0.0.21**
- *Build time stamp: Mon Jul 06 2015 14:03:18*
- *Build GIT SHA-1: b8e3cb1e3071c5c85a1d107031558168d5573c4b - master*
- *EMU-webApp-websocket-protocol version: 0.0.2*


**Warning: This webApp is still in ALPHA and is not meant to be used in production. So please use with caution! If you 
have any issues or you find a bug please create an issue on the GitHub project page.**

--------------------- 

Welcome to the EMU-webApp! The EMU-webApp is a full fledged browser-based labeling and correction tool that offers a 
multitude of labeling and visualization features. These features include unlimited undo/redo, formant correction 
capabilities, snap preselected boundary to nearest top/bottom boundary and snap preselected boundary to nearest zero 
crossing and many more. The web application is able to render everything directly in clients browser which includes the 
calculation and rendering of the spectrogram as it is written entirely using HTML, CSS and JavaScript. This means it 
can also be used as a standalone labeling application as it does not require any server-side calculations or rendering. 
Further it is designed to interact with any websocket server that implements the EMU-webApp websocket protocol which 
enables it to be used as a labeling tool for collaborative annotation efforts.

The EMU-webApp is part of the next iteration of the EMU Speech Database Management System which aims to be as close to 
an all-in-one solution for generating, manipulating, querying, analyzing and managing speech databases as possible. For 
an overview of the system please visit this URL: [http://ips-lmu.github.io/EMU.html](http://ips-lmu.github.io/EMU.html).

