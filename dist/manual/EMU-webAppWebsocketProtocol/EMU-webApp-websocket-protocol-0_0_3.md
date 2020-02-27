The EMU-webApp-websocket-protocol
=============================================
<!---
author: Raphael Winkelmann
-->




This document describes the EMU-webApp-websocket-protocol in its current
version. The current version number can be found in the section Version 
History.


Version History
---------------

-   **0.0.1**: Initial protocol version

-   **0.0.2**: Updated `_bundle.json` schema (`ssffTrackName`
    → `fileExtention`) to remove SSFF file redundancy
    **(current version)**

-   **0.0.3**: Future version to include EDITDBCONFIG operations
    (currently under development)

Protocol Overview
------------------

The EMU-webApp-websocket-protocol consists of a set of 
request/response JSON files that control the interaction
between the client (the EMU-webApp) and a server supporting
the protocol. A graph depicting the protocol can be seen in 
the figure below. This graph depicts the protocol in
version 0.0.3 as it already includes the commands
`GETDOEDITDBCONFIG` and `EDITDBCONFIG`.

![Alt text](manual/pics/protocol.svg) 



The Protocol Commands
------------

### GETPROTOCOL


*Initial request to see if client and server speak the same protocol.*

Request:

    {
      'type': 'GETPROTOCOL', 
      'callbackID': 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    }

Response:

    {
      'callbackID': request.callbackID,
      'data': {
        'protocol': 'EMU-webApp-websocket-protocol',
        'version': '0.0.1'
      },
      'status': {
        'type': 'SUCCESS',
        'message': ''
      }
    }

### GETDOUSERMANAGEMENT


*Ask server if a it wishes to perform user management (will toggle login
dialog if YES)*

Request:

    {
      'type': 'GETDOUSERMANAGEMENT', 
      'callbackID': 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    }

Response:

    {
      'callbackID': request.callbackID,
      'data': 'NO'
      'status': {
        'type': 'SUCCESS',
        'message': ''
      }
    }

### LOGONUSER


*Ask server to log on user. Username and password are sent to server.*


Request:

    {
      'type': 'LOGONUSER',
      'data': {
        'userName': 'smith', 
        'pwd':'mySecretPwd'
      },
      'callbackID': 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    }

Response:

    {
      'callbackID': request.callbackID,
      'data': 'BADUSERNAME' | 'BADPASSWORD' | 'LOGGEDON'
      'status': {
        'type': 'SUCCESS',
        'message': ''
      }
    }

### GETGLOBALDBCONFIG

### Should we maybe rename this to just GETDBCONFIG? Seeing as we are doing a
version update soon anyway?

*Next the globalDBconfig.json is requested from the DB. This is needed
for the level definitions, the legal values of each
level and the custom config specified in the field EMU-webAppConfig and more.*


Request:

    {
      'type': 'GETGLOBALDBCONFIG', 
      'callbackID': 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    }


Response:

    {
      'callbackID': request.callbackID,
      'data': configData,
      'status': {
        'type': 'SUCCESS',
        'message': ''
      }
    }

Where `configData` is the javascript object representing
`_DBconfig.json` file of the according database.

### GETBUNDLELIST


*Next a bundlelist is requested.*


Request

    {
      'type': 'GETBUNDLELIST', 
      'callbackID': 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    }


Response:

    {
      'callbackID': request.callbackID,
      'data': bundleList,
      'status': {
        'type': 'SUCCESS',
        'message': ''
      }
    }

### GETBUNDLE


*After receiving the bundleList by default the first bundle in the
bundleList is requested. This request is also sent when the user clicks
a bundle in the bundleList side bar of the EMU-webApp*


Request:

    {
      'type': 'GETBUNDLE',
      'name': 'msajc003',
      'session': '0000',
      'callbackID': 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    }


Response:

    {
      'callbackID': request.callbackID,
      'data': bundleData,
      'status': {
        'type': 'SUCCESS',
        'message': ''
      }
    }

Where `bundleData` is the javascript object containing all the values of
ssffTracks + audio + annotation.json in the DB (see example bundle for
details).

### SAVEBUNDLE


*Function to be called if the user saves a loaded bundle (by pushing the
save button).*


Request:

    {
      'type': 'SAVEBUNDLE',
      'data': bundleData,
      'callbackID': 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    }

Where `bundleData` is the javascript object OPTIONALLY containing the
values of ssffTracks + audio + annotation.json in the DB (see example
bundle for details). It only sends the data that has been altered.

Response:

    {
      'callbackID': request.callbackID,
      'status': {
        'type': 'SUCCESS',
        'message': ''
      }
    }

### SAVECONFIG


*Function to be called if the user saves a configuration (by pushing the
save button in the EMU-webApp Configuration).*


Request:

    {
      'type': 'SAVECONFIG',
      'data': configData,
      'callbackID': 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    }

Where `configData` is the javascript object containing the
desired configuration for the EMU-webApp. If the response
is a 'SUCCESS', the configuration is saved on the server 
side and the webApp will reload with the newly saved configuration.

Response:

    {
      'callbackID': request.callbackID,
      'status': {
        'type': 'SUCCESS',
        'message': ''
      }
    }

### GETDOEDITDBCONFIG


*Ask server if it allows editing of the \_DBconfig*


Request:

    {
      'type': 'GETDOEDITDBCONFIG', 
      'callbackID': 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    }

Response:

    {
      'callbackID': request.callbackID,
      'data': 'YES'
      'status': {
        'type': 'SUCCESS',
        'message': ''
      }
    }


### EDITDBCONFIG


*Send DBconfig edit command to server. Compared to the other protocol
request this request has several subtypes that specify the various edit
operations to the \_DBconfig*


Request:

    {
      'type': 'EDITDBCONFIG',
      'subtype': 'ADDLEVELDEFINITION', 
      'data': newLevelDefinition
      'callbackID': 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    }

Response:

    {
      'callbackID': request.callbackID,
      'data': 'YES'
      'status': {
        'type': 'SUCCESS',
        'message': ''
      }
    }

    {
      'callbackID': request.callbackID,
      'data': {
        'EDITDBCONFIG-errorMsg': '',
        'subtype': 'MODIFYATTRIBUTEDEFINITION',
        'levelDefinitionsName': 'Phonetic',
        'attributeDefinitionsName': 'IPA'
      },
      'status': {
        'type': 'SUCCESS',
        'message': ''
      }
    }

The current subtypes are (more will be added in the near future):

-   `ADDLEVELDEFINITION`

-   `ADDATTRIBUTEDEFINITION`

-   `MODIFYATTRIBUTEDEFINITION`

-   `ADDSSFFDEFINITION`

### DISCONNECTWARNING


*Function that tells the server that it is about to disconnect. This is
currently needed because the httpuv R package can’t listen to the
websockets own close event.*


Request:

    {
      'type': 'DISCONNECTWARNING'
      'callbackID': 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    }


Response:

    {
      'callbackID': request.callbackID,
      'status': {
        'type': 'SUCCESS',
        'message': ''
      }
    }

Error handling
--------------

If an error occurs with any of the request types above a response should
still be sent to the client. The status of this response should be set
to `ERROR` and an error message should be given in the message field.
This message will then be displayed on the client.

ERROR:

    {
      'callbackID': request.callbackID,
      'status': {
        'type': 'ERROR',
        'message': 'An error occured trying to read a file from disk. Please make sure: /path/to/file exists or check the config...
      }
    }

