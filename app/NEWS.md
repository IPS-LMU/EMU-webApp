# What's New

## Version 0.1.03

### new features / performance tweaks / improvements

- time anchors implemented for automatic zooming
- updated all dependencies to current versions (incl. AngularJS & co.)
- removed json2sass dependency as it was unused (using json directly)
- can now override default auto-scaling of SSFF track contours by adding `EMUwebAppConfig -> perspectives -> signalCanvases -> minMaxValLims` entry in DBconfig.json (GitHub issue #202)

### bug fixes

## Version 0.1.02

### new features / performance tweaks / improvements

- display error dialog on bad TextGrid / wav files (issue \#197)
- now supporting WAVEFORMATEX cbSize entry in Subchunk1 -> supported Subchunk1Sizes == 16 and 18

### bug fixes

- labels in hierarchy view can now be edited in Firefox

## Version 0.1.01

### new features / performance tweaks / improvements

- using min max mapping for oscillogramme when drawing mean(sample per pixel) envelope
- wider width of URL input as well as URL list box
- better error handling for bad protocol commands sent from server
- added manual entry for URL parameters
- added DBconfigGetUrl URL parameter

### bug fixes

- fixed bad entry in keyboard shortcut list 
- catching mal formed websocket URLs (not starting with ws:// or wss://)
- not showing "save current changes" dialog anymore when saveButtons are disabled
- reset URL without GET parameters on reset to init state
- fixed multiple selection of labels using the keyboard arrows and shift
- fixed error on selection and editing of label text with enter key
- fixed select area still present on load of new bundle
- fixed text entry problem with CSS
- fixed problem of loaded color in bundleListSideBar when same bundle name in different sessions (issue \#192)
- fixed problem of not being able to play first segment if it starts at sampleStart = 0 (issue \#195)

## Version 0.1.00

- manual bootstrapping
- serverUrl now available as GET parameter
- random version bump to 0.1.00 to end alpha phase

## Version 0.0.34

- fixed broken links in FAQs
- fixed bad paging problem

## Version 0.0.33

- new config editor now available. You can edit the default perspectives, default spectrogram settings as well as expert settings.
- updated protocol to support 'SAVECONFIG'
- auto-select of first time level on load + drag & drop
- autoConnect=true GET parameter now available (http://ips-lmu.github.io/EMU-webApp/?autoConnect=true will automatically connect to the websocket server)
- problem with auto-scrolling of large labels in edit text window fixed

## Version 0.0.32

- improved EMU-webAppIcon-roundCorners.svg
- improved connection dialog. urls can now be stored in local storage (+) or be removed from local storage (-).
- background color masking of links fixed
- dropdown of path through hierarchy clickable on entire area 

## Version 0.0.31

- quickfix for bad entry in bundleListSchema (only effects Node.js usage)

## Version 0.0.30

- quickfix for typo in setting of encoding attribute. This caused the save function not to work!

## Version 0.0.29

- now actively validates annotation data before saving them to the server
- hierarchy graph can no longer be scrolled/panned away
- levels with time information now have a dark background in hierarchy view
- playback of a selected part of the hierarchy now works correctly
- show zoom factor in hierarchy view
- modals are now destroyed rather than just hidden
- reworked zooming and panning in hierarchy view
- hierarchy view now shows more or less the same part of the graph when rotated
- fixed a bug where editing a label in hierarchy view could save wrong text
- fixed a bug where corrupt data could be saved to the server
- links that are selected but invisible (because their sub-tree is collapsed) can no longer be deleted
- fixed a bug where shortcuts in hierarchy view were broken after e.g. clear and reconnect
- hierarchy view is automatically resized when window is resized
- not creating DOM elements for invisible bundleList entries which leads to much lower memory usage and a performance gain (ng-if vs. ng-show)

## Version 0.0.28

- now checking for duplicate attributeDefinition names on load of DBconfig
- improved zooming performance in hierarchy view
- fix for audioelement bug in chrome as of version 46; now using webaudio API to play audio

## Version 0.0.27

- show hierarchy button when dropping annotJSON
- items out of reach in bundleListSidebar fixed
- fixed drag and drop combination bug
- improved scaling while zooming in showHierarchy modal

## Version 0.0.26

- fixed broken scrolling in bundleListSideBar
- better scrolling OSCI mini map

## Version 0.0.25

- conversion to samples fixed for TextGrids
- multiple select of EVENTs now possible
- conversion to TextGrid problem fixed for Tiers of type "TextTier"
- performance improvement due to repainting level details on boundary move only for relevant level
- showing news in welcome modal
- 2D canvases may now include static shapes stored as contours in SSFF files
- single wav files can now be dropped (without TextGrid/Annotation)
- pressing 'enter' inside a dialog triggers the default action inside the dialog
- performance improvement due to direct canvas rendering of distorted canvases
- improved bundleListSideBar animation lag

## Version 0.0.24

- fixed off by 1px problem due to boarder problem in levels
- checking if scroll bar in level panel -> if so adding scroll bar to track panel
- fixed slight alignment issue of OSCI and SPEC due to centering on FFT length and not the actual window length
- vertical flip of EPG drawing

## Version 0.0.23

- OSCI repaint problem fix
- time level alignment due to scroll bar issue fixed
- bundleList side bar scroll bar issue fixed

## Version 0.0.22

- no line and font size increase in hierarchy view
- flawed repaint in hierarchy when new bundle is loaded fixed

## Version 0.0.21

- complete rewrite of CSS (now using SCSS)
- wav files now being parsed to typed arrays (performance improvement)
- startup hints added
- improved and expanded manual/help
- explicit remove of underscore attributes on bundle save
- draw links in hierarchy view by SHIFT-down -> draw -> SHIFT-up instead of l -> draw -> l
