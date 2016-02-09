What's New
=============================================

## Version 0.0.33

- new config editor for the EMU-webApp now available. You can edit the default perspectives, default spectrogram settings as well as expert settings.
- updated protocol to support 'SAVECONFIG'
- auto-select of first time level on load + drag & drop

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
