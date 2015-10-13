What's New
=============================================

## Version 0.0.28

- now checking for duplicate attributeDefinition names on load of DBconfig

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
