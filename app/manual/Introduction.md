Introduction to the EMU-webApp
=============================================
<!---
author: Raphael Winkelmann
-->

Welcome to the EMU-webApp! The EMU-webApp is a full fledged browser-based labeling and correction tool that offers a multitude of labeling and visualization features. These features include unlimited undo/redo, formant correction capabilities, snap preselected boundary to nearest top/bottom boundary and snap preselected boundary to nearest zero crossing and many more. The web application is able to render everything directly in clients browser which includes the calculation and rendering of the spectrogram as it is written entirely using HTML, CSS and JavaScript. This means it can also be used as a standalone labeling application as it does not require any server-side calculations or rendering. Further it is designed to interact with any websocket server that implements the EMU-webApp websocket protocol which enables it to be used as a labeling tool for collaborative annotation efforts.

The EMU-webApp is part of the next iteration of the EMU speech database management system which provides 


# Modes of usage

Standalone 

# Configuration 

The EMU-webApp is highly configurable in the way it displays associated data belonging to the currently loaded bundle. These display configurations options only apply to when the web application is used in its client-server mode of usage as the configuration (default configuration)[/configFiles/default_emuwebappConfig.json] file that is loaded is overwritten by the configuration file of the currently .