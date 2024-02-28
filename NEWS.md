# What's New

## Version 1.5.1

### new features / performance tweaks / improvements

- allow databases that test the beta feature of using Rda alongside SSFF to be loaded instead of causing a schema violation

### bug fixes

- fix snap to level above/below feature: the neighbor level is now determined by what the user actually sees, and no longer by the order of the levels array in the `_annot.json`

## Version 1.5.0

### new features / performance tweaks / improvements

- Updated a few dependencies

### bug fixes

- Correction tool now works correctly when `Start_Time` of SSFF track is not 0
- When `Start_Time` is not 0, the part of the SSFF track in the left part of the viewport was not displayed
- Fixed schema validation error (#315)
- The schema for `signalCanvases` does not allow additional properties anymore
- Some new features were not reflected in `emuwebappConfigSchema`

## Version 1.4.0

### new features / performance tweaks / improvements

- replaced node-sass with dart-sass
- updated a few dependencies

### bug fixes

- SSFF parser worker can now save BYTE, LONG, FLOAT, and DOUBLE in addition to SHORT; can also save big-endian (fixes #308; thanks @samgregory)
- Fix assigning colors to individual signalCanvas contours (fixes #303; thanks @samgregory)
- Crosshair now reports correct y value when minMaxValLims is set (fixes #296; thanks @samgregory)

## Version 1.3.9

### new features / performance tweaks / improvements

### bug fixes

- fixed bad extraction of channel data in draw-helper service (switching which channels to draw now works again)

## Version 1.3.8

### new features / performance tweaks / improvements

- handleglobalkeystrokes is now a service
- LargeTextFieldInputDirective stub class is now a component

### bug fixes

- fixed broken dotsCanvas component (minification issue)
- fixed bad correction of ID to Id in refactor (fixes #299)
- fixed blocking of handling keyb. short-cuts under Firefox

## Version 1.3.7

### new features / performance tweaks / improvements

- increased text height by 2px for better scroll-bar clearance on non-OSX systems (closes #225)
- better visibility of track names & min/max values due to color change (fixes #295)
- minification on build working again (fairly large perf. gains)

### bug fixes

- fixed bad handling of URL parameter when only an audio file is given in settings dialog

## Version 1.3.6

### new features / performance tweaks / improvements

- new `gitlabPath` added

### bug fixes

- fixed bad handling of colorContour values in non-assigned tracks (fixes #287)

## Version 1.3.5

### new features / performance tweaks / improvements

### bug fixes

- fixed border causing negative mouse x pos values

## Version 1.3.4

### new features / performance tweaks / improvements

- shorten download button text to `TextGrid` and `annotJSON`
- removed sample values from hierarchy path canvas
- fixed laggy progressbar by listening to changes rather than ng-show to trigger animation

### bug fixes

- forcing osci peaks recalc on draw of OSCI overview canvas

## Version 1.3.3

### new features / performance tweaks / improvements

- hierarchy guesser completed for when no DBconfig is available
- higher y resolution on level canvases
- switched to arial font

### bug fixes

- double showing of progress-bar component
- fixed scrollbar in level canvases pane issues (now always hidden)
- fixed bundle list side bar animation

## Version 1.3.2

### new features / performance tweaks / improvements

- if no hierarchy path is available no hierarchy path canvas is shown and settings stay hidden
- LevelCanvasMarkupCanvasComponent now a component
- font scaling factor now also applied to hierarchy path canvas
- moved emuwebappDesign from sass to scss and made it importable with .d.ts file
- removed default_emuwebappDesign.json file to have single source of truth in scss file
- epg and dot canvas now components

### bug fixes

- fixed show hierarchy path canvas setting being dependent on legacy DBconfig entry
- fixed building of DBconfig if none is passed in via URL parameters to only show SEGMENT and EVENT levels
- fixed drawing errors caused by uninited data on load 

## Version 1.3.1

### bug fixes

- fixed not redrawing OSCI on viewPort updates

## Version 1.3.0

### bug fixes

- fixed repaint glitch in SPEC and ssff track 

### new features / performance tweaks / improvements

- osci-overview now component 
- markup-canvases now component that handle their own mouse events
- passing in elements of spect settings to spect component
- implemented font scaling setting

## Version 1.2.11

### bug fixes

- fixed alignment issues in long files due to rounding issues

### new features / performance tweaks / improvements

- osci and spec are now components
- hierarchy settings now available in settings modal as well
- all canvases now 4k

## Version 1.2.9

### bug fixes

- fixed repaint issue on perspective change for hierarchy path canvas
- fixed hard coded "fms" ext for GitLab save

### new features / performance tweaks / improvements



## Version 1.2.8

### bug fixes

- fixed color change missing in bundle list side bar

### new features / performance tweaks / improvements

- updated to d3.js version >= 5
- starting to use material icons
- removed unused gifs for size reduction

## Version 1.2.7

### bug fixes

- fixed missing arrow function in various services

## Version 1.2.6

### bug fixes


### new features / performance tweaks / improvements

- fixed help if comMode ist GITLAB
- fixed requestAnimationFrame binding of this
- D3 hierarchy SVG now a component
- emuhierarchy directive now a component


## Version 1.2.5

### bug fixes


### new features / performance tweaks / improvements

- hierarchy-path-canvas now draws entire path instead of just the top level

## Version 1.2.4

### bug fixes


### new features / performance tweaks / improvements

- implemented hierarchy-path-canvas (only top level of path is drawn)
- sampleStart + dur now drawn in blue to up contrast
- using text instead of JSON encoding for gitlab commit payload 

## Version 1.2.3

### bug fixes


### new features / performance tweaks / improvements

- level directive is now a component

## Version 1.2.2

### bug fixes

- fixed broken TextGrid parser worker + service

### new features / performance tweaks / improvements

- also parsing parallel labels in json files that are passed in via URL parameters

## Version 1.2.1

### bug fixes


### new features / performance tweaks / improvements

- inverting the spectrogram is now configurable
- tamed welcome dialog 


## Version 1.2.0

### bug fixes


### new features / performance tweaks / improvements

- removed bower dep.
- using webpack as loader
- dark mode implementation
- removed canvas expansion buttons

## Version 1.1.3

### bug fixes

-  added functionality for saveToWindowParent=true URL parameter

### new features / performance tweaks / improvements


## Version 1.1.2

### bug fixes

- fixed snap to nearest zero crossing for events (fixes \#265)
- fixed snap to nearest zero crossing from final boundary of level (fixes \#267)

### new features / performance tweaks / improvements

## Version 1.1.1

### new features / performance tweaks / improvements

- new comMode implemented which allows the EMU-webApp to speak to GitLab directly (a manual entry explaining how this can be done to follow)


## Version 1.0.3

### bug fixes

- fixed alignment bug on large screens (x-dim > 2048 pixels)


## Version 1.0.2

### bug fixes

- revert of "resize now listens to $window.parent not $window

## Version 1.0.1

1.0.0 version bump because it has been in regular stable use for 
quite some time now (no major version changes between 0.1.15 and 1.0.0!)

### new features / performance tweaks / improvements

- can now correct the fifth contour as well
- about modal now refers to EMU-SDMS manual instead of having duplicate entries
- resize now listens to $window.parent not $window

## Version 0.1.15

### new features / performance tweaks / improvements

- added CLARIN Matomo (ex. Piwik) tracker
- checking for viewer_pane as URL parameter to display welcome modal (detect RStudio viewer)

### bug fixes

- using non-promise version of decodeAudioData  

## Version 0.1.14

### new features / performance tweaks / improvements

### bug fixes

- fixed click breaking dropdown functionality in hierarchy dialog (closes \#261)
- fixed crash on Firefox & Chrome when appCache isn't available (http -> no https)

## Version 0.1.13

### new features / performance tweaks / improvements

- added bndlJsonGetUrl as get parameter
- added horizontalLines to ssffTrack configs
- removed google analytics

### bug fixes

## Version 0.1.12

### new features / performance tweaks / improvements

- .wav file header parser improved to accept fmt chunk in variable chunk position in header
- audioGetUrl get parameter can be now be used by itself

### bug fixes

## Version 0.1.11

### new features / performance tweaks / improvements

- the x crosshair is now extended to the level canvases (also fixes issue \#228)
- new shortcuts Shift+1 .. Shift+9 for switching perspectives
- the configuration option "multiplicationFactor" for the anagest module (gesture analysis) was renamed to "gestureDirection"; the value must now be either "peak" or "valley" instead of 1/-1; please change the DBconfig.json of emuDBs with EMA data accordingly

### bug fixes

- preview of newly drawn link in hierarchy view is back
- catching enter in forced modals (e.g. anagest) to avoid undefined breaks in predefined work flows (closed \#236)
- modals are cleanly initialized (before, modals could accidentally re-use e.g. the return value or force property of the previously shown modal; see \#203)
- the anagest module (gesture analysis) can now analyze opening gestures (represented by a valley in the corresponding EMA sensor position track)
- similar level names (e.g. Phonetic and Phonetic2) are now correctly handled in path search; this means that the list of paths in hierarchy view and search is now correct again (closed \#210)
- when closing the hierarchy modal, the selected path will now always be remembered (closed \#240)   

## Version 0.1.10

### new features / performance tweaks / improvements

- drawing zero line in OSCI again
- added webkitOfflineAudioContext to new wav parser routine. This should make the webApp work with common sample rates on Safari (only 44100, 4800 and 96000 seems to work though)
- custom label fonts and sizes now possible
- permitting and handling GETURL encoding entries in bundle object sent by server (faster loading of bundles as it gets the audio file as a binary file/arraybuffer form server using a simple GET request to a specified URL)
- added parsing of LONG SSFF columns to the ssffParser

### bug fixes

- now interpreting SHORT column types as signed INT16 instead of unsigned INT16 arrays


## Version 0.1.9

### bug fixes

- mini fix for firefox as firefox throws a type error if you put a non-int into new Float23array() which takes a number as an argument... interesting! Math.round() fixes the issue

## Version 0.1.8

### new features / performance tweaks / improvements

- values on crosshairs now always visible (jump to top if there is not enough space to display them underneath)
- x crosshair now showing on every signal canvas (closes \#221)

### bug fixes

- fixed bad comparison of integer with possible float with Math.round() in peak calculation of OSCI. This caused the OSCI not to display at certain sample rates.

## Version 0.1.7

### new features / performance tweaks / improvements

- cleaned JS code to remove jshint errors
- long bundle and session names now scrollable
- implemented shortcut to save bundle (SHIFT + S)
- implemented play in view to end of file with autoscrolling
- better error message on parsing error while parsing annot.json
- only using response type 'text' for gets as 'json' causes errors on some servers
- shift left clicking on preselected area in signal canvases now expands selected area (\#162)
- propper handeling of DBconfig when passed in via URL
- only displaying "finished editing" check box, "comment" text input and save button in bundle list side bar for current bundle. Displaying text only versions for not current bundle. (issue \#218)
- only updating history action on change of comment text (issue \#219)
- up and down arrow keys can now be used to select which hierarchy path is displayed in hierarchy modal (issue \#208)

### bug fixes

- prechecking relationship type when rebending links on boundary deletes (fixes issue \#214)
- fixed bug caused by Chrome API change that did not allow for files to be downloaded the way we had implemented it (in download modals)
- fix history service handling of first segment boundary (fixes \#212)
- $apply on final resetting requestAnimationFrame for clearing of play head animation(\#190)

## Version 0.1.6

### new features / performance tweaks / improvements

- now allowing 8, 16, 24, 32 Bit wavs to be used including files containing WAVEFORMATEXTENSIBLE struct chunk
- using audioBuffer object though out webApp (not custom wavJSO object)
- using OfflineAudioContext to parse audio files
- multi channel audio supported	
- improved performance of OSCI envelope rendering and calculation of peaks


### bug fixes

- double parsing of audio file avoided on drag & drop incl. base64 conversion
- fixed broken snap to nearest zero crossing on last segment


## Version 0.1.5

### new features / performance tweaks / improvements

- description field added to levelDefinition:attributeDefinitions

## Version 0.1.4

### new features / performance tweaks / improvements

- show hierarchy now shows all paths through hierarchy (excluding partial paths) not only paths ending in levels with time (SEGMENT and EVENT levels)
- $http.get() handling is now compatible to AngularJS 1.6.0)
- ctrl + play shortcut buttons while in text edit mode now works 

### bug fixes

- show hierarchy button not shown when annotJSON files are drag & dropped onto drop zone

## Version 0.1.3

### new features / performance tweaks / improvements

- time anchors implemented for automatic zooming
- updated all dependencies to current versions (incl. AngularJS & co.)
- removed json2sass dependency as it was unused (using json directly)
- can now override default auto-scaling of SSFF track contours by adding `EMUwebAppConfig -> perspectives -> signalCanvases -> minMaxValLims` entry in DBconfig.json (GitHub issue #202)

### bug fixes

- fixed bad anagest implementation

## Version 0.1.2

### new features / performance tweaks / improvements

- display error dialog on bad TextGrid / wav files (issue \#197)
- now supporting WAVEFORMATEX cbSize entry in Subchunk1 -> supported Subchunk1Sizes == 16 and 18

### bug fixes

- labels in hierarchy view can now be edited in Firefox

## Version 0.1.1

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

## Version 0.1.0

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
