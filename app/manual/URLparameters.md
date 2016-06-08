# URL Parameters

The EMU-webApp currently implements several URL parameters (see [https://en.wikipedia.org/wiki/Query_string](https://en.wikipedia.org/wiki/Query_string) for more information) as part of it's query string. This document describes the currently implemented parameters and gives some accompanying examples.

## Websocket Server Parameters

- **serverUrl**=*URL* URL pointing to a websocket server that implements the EMU-webApp websocket protocol
- **autoConnect**=*true / false* automatically connect to websocket server URL specified in the **serverUrl** parameter. If the **serverUrl** parameter isn't set the webApp defaults to the entry in it's `default_emuwebappConfig.json`

### Examples

- auto connect to local wsServer: [http://ips-lmu.github.io/EMU-webApp/?autoConnect=true&serverUrl=ws:%2F%2Flocalhost:17890](http://ips-lmu.github.io/EMU-webApp/?autoConnect=true&serverUrl=ws:%2F%2Flocalhost:17890)

## Label File Preview Parameters

- **audioGetUrl**=*URL* GET URL that will respond with .wav file
- **labelGetUrl**=*URL* GET URL that will respond with label/annotation file
- **DBconfigGetURL**=*URL* GET URL that will respond with DBconfigJSON NOT IMPLEMENTED YET!
- **labelType**=*TEXTGRID / annotJSON* specifies the type of annotation file

### Examples

- TextGrid example: [http://ips-lmu.github.io/EMU-webApp/?audioGetUrl=https:%2F%2Fraw.githubusercontent.com%2FIPS-LMU%2FEMU-webApp%2Fmaster%2Fapp%2FtestData%2FoldFormat%2Fmsajc003%2Fmsajc003.wav&labelGetUrl=https:%2F%2Fraw.githubusercontent.com%2FIPS-LMU%2FEMU-webApp%2Fmaster%2Fapp%2FtestData%2FoldFormat%2Fmsajc003%2Fmsajc003.TextGrid&labelType=TEXTGRID](http://ips-lmu.github.io/EMU-webApp/?audioGetUrl=https://raw.githubusercontent.com/IPS-LMU/EMU-webApp/master/app/testData/oldFormat/msajc003/msajc003.wav&labelGetUrl=https://raw.githubusercontent.com/IPS-LMU/EMU-webApp/master/app/testData/oldFormat/msajc003/msajc003.TextGrid&labelType=TEXTGRID)
- annotJSON example: [http://ips-lmu.github.io/EMU-webApp/?audioGetUrl=https://raw.githubusercontent.com/IPS-LMU/EMU-webApp/master/app/testData/newFormat/ae/0000_ses/msajc003_bndl/msajc003.wav&labelGetUrl=https://raw.githubusercontent.com/IPS-LMU/EMU-webApp/master/app/testData/newFormat/ae/0000_ses/msajc003_bndl/msajc003_annot.json&labelType=annotJSON](http://ips-lmu.github.io/EMU-webApp/?audioGetUrl=https://raw.githubusercontent.com/IPS-LMU/EMU-webApp/master/app/testData/newFormat/ae/0000_ses/msajc003_bndl/msajc003.wav&labelGetUrl=https://raw.githubusercontent.com/IPS-LMU/EMU-webApp/master/app/testData/newFormat/ae/0000_ses/msajc003_bndl/msajc003_annot.json&labelType=annotJSON)

## Navigation parameters

### Manual Entry

TODO!!!

