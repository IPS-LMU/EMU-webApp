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

- snap to closest boundary/event marker in level above (Keyboard Shortcut `t`)
- snap to closest boundary/event marker in level below (Keyboard Shortcut `b`)
- snap to nearest zero crossing (Keyboard Shortcut `x`)

To add a new boundary/event marker one has to first select the desired level one wishes to add it to by using the ↑ up and 
↓ down cursor keys (or by clicking the desired level with the mouse):

![Alt text](manual/GeneralUsage/pics/selectLevel.gif)

The EMU-webApp indicates the currently selected level by coloring it a darker shade of grey. To add a boundary to the
currently selected level one first has to select a point in time either in the Spectrogram or the Oscillogram by single-left-clicking
on the desired location. Hitting the ⏎ Return Key adds a new boundary/event maker to the selected level at the selected time point:

![Alt text](manual/GeneralUsage/pics/addBoundary.gif)

### SEGMENTs & EVENTs

The EMU-webApp also allows for preselecting `SEGMENT`s and `EVENT`s by single-left-clicking the desired item:

![Alt text](manual/GeneralUsage/pics/preSelSeg.gif)

The web application colors the preselected `SEGMENT`s and `EVENT`s yellow. As with preselected boundaries/event
markers the user can now perform multiple actions with these preselected items. He/she can for example edit the item’s label
by hitting the ⏎ Return Key:

![Alt text](manual/GeneralUsage/pics/editLabel.gif)

Other actions that can be performed on preselected items include:

- select next item in level (Keyboard Shortcut `TAB`)
- select previous item in level (Keyboard Shortcut `SHIFT plus TAB`)
- add time to selected item(s) (Keyboard Shortcut `+`)
- move selected item(s) (hold down `ALT` Key and drag to desired position)

**NOTE:** *by right-clicking adjacent items it is possible to select multiple items at once*

## The level hierarchy

With the EMU-webApp it is possible to define and view a hierarchical relation between items on different levels.

Which levels are parent to which is defined via the database configuration. This cannot currently be configured through the web application.

### Viewing the hierarchy

Press the `show Hierarchy` button (keyboard shortcut `h`) to open the hierarchy view. You can close it by hitting the `close` button (keyboard shortcut `esc`).

Per default, the hierarchy is shown sideways with the top of the hierarchy on the left and the time information level on the right. You can change this to a vertical view by hitting the `rotate by 90°` button (keyboard shortcut `r`).

![Rotating the hierarchy](manual/GeneralUsage/pics/rotateHierarchy.gif)

The hierarchy view can be zoomed in and out by using the mouse wheel (or a pinch gesture on a touchscreen device).

![Zooming the hierarchy](manual/GeneralUsage/pics/zoomHierarchy.gif)

When you are not seeing the entire hierarchy on the screen, you can move to a different part of it by holding down the left mouse button and moving the mouse around (just move your finger around the hierarchy on a touchscreen device).

![Panning the hierarchy](manual/GeneralUsage/pics/panHierarchy.gif)

### Selecting a path through the hierarchy

In some databases, there may be different levels with time information and/or different paths through the hierarchy of levels. For instance, there may be a level indicating phoneme boundaries (a SEGMENT level) and another level indicating tonal events (an EVENT level).

The drop-down menu above the hierarchy graph shows all possible paths in the current database. Changing it will re-draw the graph to show the selected path.

### Selecting labels

On each level there may be parallel labels. A phoneme level might carry an IPA label and a SAMPA label, for instance. You can select which labels to see beneath the items by using the drop-down menus at the very top of the hierarchy view.

### Moving portions of the hierarchy out of sight (a.k.a. collapsing a sub-tree)

You can move parts of the hierarchy out of sight by selecting the root node of that part and collapsing it.

Identify the root item of the sub-tree that you want to collapse. Clicking it will open a context menu. That context menu has a small arrow pointing in either of two directions. Clicking the arrow will collapse or decollapse the item’s children and flip the arrow’s direction. As long as the children are collapsed, the node will have a red outline.

![Collapsing a sub-tree](manual/GeneralUsage/pics/collapseSubtree.gif)

### Adding a new item

To add a new item on a level, you have two choices. Either press the blue and white plus button next to the level’s name. An item will be appended to the end of the level. As long as the level contains no items, this is your only choice. Once there are other items, you can pre-select one of them (by moving your mouse there) and then hit either the `n` or `m` key to insert a new item before or after the pre-selected one, respectively. 

![Adding a new item](manual/GeneralUsage/pics/addItem.gif)

### Modifying a label

Open an item’s context menu by single left-clicking it. You can then type a new label. The background of the text input turns red or green, indicating whether the label you have typed is legal. When done, hit Return.

Which labels are legal is defined in the database configuration. By default, all labels are legal. If you type an illegal label, you cannot save it.

![Modifying a label](manual/GeneralUsage/pics/modifyLabel.gif)

### Adding a new link

To add a new link between two items, move the mouse over one of the two. It will then turn blue, indicating it is pre-selected. Then hold down the `Shift` key and move the mouse to the other item. While you are moving, a straight line appears to connect the pre-selected item and the mouse pointer. Once you reach the second item, a dashed line will appear between both items. The color’s line (green or red) indicates whether the link is acceptable. By releasing the `Shift` key, you actually add the link, replacing the dashed, green line by a solid, grey line. If the dashed line was red (indicating an illegal link), it will just disappear when the `Shift` key is released.

![Adding a new link](manual/GeneralUsage/pics/addLink.gif)

### Deleting an item or a link

To delete an item or a link, first pre-select it by moving the mouse pointer to it. The pre-selection is indicated in blue for items and in yellow for links. Remove the pre-selected link by hitting `Backspace` or the pre-selected item by hitting the `y` key. Deleting an item will also delete all links leading to or from it.

![Deleting an item or a link](manual/GeneralUsage/pics/deleteItemOrLink.gif)

