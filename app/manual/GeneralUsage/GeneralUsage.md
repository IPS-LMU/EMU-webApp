# General usage

**INFO: The keyboard shortcuts mentioned in this document refer to the default shortcuts of the EMU-webApp. As it is 
possible to overwrite these, please contact the person hosting your database for information about deviations from this
default behaviour.**

## Annotating levels containing time information

### Boundaries / Event marker

The EMU-webApp has slightly different labeling mechanics to other annotation software. Compared to the usual
click & drag of segment boundaries and event markers the web application continuously tracks the movement of the 
mouse in levels of the type `SEGMENT` or `EVENT`, highlighting the boundary/event marker that is closest to it by 
coloring it blue:

![Alt text](manual/GeneralUsage/pics/preSelBoundary.gif)

The user can perform various actions with these preselected boundaries/event markers. He/she can for example grab a
preselected boundary/event marker by holding down the shift key and moving it to the desired position:

![Alt text](manual/GeneralUsage/pics/moveBoundary.gif)

Or delete the current boundary/event marker by hitting the backspace key:

![Alt text](manual/GeneralUsage/pics/deleteBoundary.gif)

Other actions that can be performed on preselected boundaries include:

- snap to closest boundary / event marker in level above (Keyboard Shortcut `t`)
- snap to closest boundary / event marker in level below (Keyboard Shortcut `b`)
- snap to nearest zero crossing (Keyboard Shortcut `x`)

To add a new boundary/event marker one has to first select the desired level one wishes to add it to by using the ↑ up and 
↓ down cursor keys:

![Alt text](manual/GeneralUsage/pics/selectLevel.gif)

The EMU-webApp indicates the currently selected level by coloring it a darker shade of grey. To add a boundary to the
currently selected level one first has to select a point in time either in the Spectrogram or the Oscillogram by single-left-clicking
on the desired location. Hitting the ⏎ Return Key adds a new boundary/event maker to the selected level at the selected time point:

![Alt text](manual/GeneralUsage/pics/addBoundary.gif)

### SEGMENTs & EVENTs

The EMU-webApp also allows for preselecting `SEGMENT`s and `EVENT`s by single-left-clicking the desired item:

![Alt text](manual/GeneralUsage/pics/preSelSeg.gif)

The web application colors the preselected `SEGMENT`s and `EVENT`s yellow. As with preselected boundaries / event
markers the user can now perform multiple actions with these preselected items. He/she can for example edit the item's label
by hitting the ⏎ Return Key:

![Alt text](manual/GeneralUsage/pics/editLabel.gif)

Other actions that can be performed on preselected items include:

- select next item in level (Keyboard Shortcut `TAB`)
- select previous item in level (Keyboard Shortcut `SHIFT plus TAB`)
- add time to selected item(s) (Keyboard Shortcut `+`)
- move selected item(s) (hold down `ALT` Key and drag to desired position)

**NOTE:** *by right-clicking adjacent items it is possible to select multiple items at once*