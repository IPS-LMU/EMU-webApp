# General usage

**INFO: The keyboard shortcuts mentioned in this document refer to the default shortcuts of the EMU-webApp. As it is 
possible to overwrite these, please contact the person hosting your database for information about deviations from this
default behaviour.**

The EMU-webApp has slightly different labeling mechanics compared to other annotation software. Compared to the usual
click & drag of segment boundaries the web application continuously tracks the movement of the mouse, highlighting the 
boundary that is closest to it.

![Alt text](manual/pics/preSelBoundary.gif) 

The user can now perform various actions with this preselected boundary. He/she can for example grab the boundary by 
holding down the shift key and moving it to it's desired position.


Or delete the current boundary by 

Moving the mouse over segment and event levels automatically tracks the mouse movement
and calculates the nearest boundary to the current mouse position and
preselects it (indicated by marking it blue).

To move the currently preselected boundary hold down the <b>{{cps.getStrRep(cps.vals.keyMappings.shift)}}</b> key and
move the mouse to the desired position. The boundary will track the
mouse movement. A event is preselected by left-clicking it  (indicated by marking it yellow), holding down
will move the entire event.