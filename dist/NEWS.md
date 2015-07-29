What's New
=============================================

## Version 0.0.24

- fixed off by 1px problem due to boarder problem in levels
- checking if scroll bar in level panel -> if so adding scroll bar to track panel
<<<<<<< HEAD
=======
- fixed slight alignment issue of OSCI and SPEC due to centering on FFT length and not the actual window length
- vertical flip of EPG drawing
>>>>>>> master

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