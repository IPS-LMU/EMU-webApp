#################
# Usage:
# python app.py ~/Desktop/emuR_demoData/ae_emuDB
# Then navigate browser to:
#   http://ips-lmu.github.io/EMU-webApp/?autoConnect=true&serverUrl=ws:%2F%2Flocalhost:8888


#################
# imports
from tornado import websocket, web, ioloop
import argparse, os, re
import json
import glob
import base64


##################
# define input args
parser = argparse.ArgumentParser(description='Serve emuDB via a websocket connection using the EMU-webApp-websocket-protocol version 0.0.2.')
parser.add_argument('pathToEmuDB', help='path to folder containing emuDB')

##################
# global vars
cl = [] # array to store clients

def get_ssffTracksUsedByDBconfig(DBconfig):
    allTracks = []
    # anagestConfig ssffTracks
    for ld in DBconfig['levelDefinitions']:
        if 'anagestConfig' in ld:
            allTracks.append(ld['anagestConfig']['verticalPosSsffTrackName'])
            allTracks.append(ld['anagestConfig']['velocitySsffTrackName'])
    for p in DBconfig['EMUwebAppConfig']['perspectives']:
        # tracks in signalCanvases$order
        for sco in p['signalCanvases']['order']:
            allTracks.append(sco)

        # tracks in twoDimCanvases$order
        for tdco in p['twoDimCanvases']['order']:
            allTracks.append(tdco)

        # tracks in signalCanvases$assign
        for sca in p['signalCanvases']['assign']:
            allTracks.append(sca['ssffTrackName'])
        # tracks in p$twoDimCanvases$twoDimDrawingDefinitions
        if 'twoDimDrawingDefinitions' in p['twoDimCanvases']:
            for tddd in p['twoDimCanvases']['twoDimDrawingDefinitions']:
                # dots
                for dot in tddd['dots']:
                    allTracks.append(dot['xSsffTrack'])
                    allTracks.append(dot['ySsffTrack'])
        
    # uniq tracks
    allTracks = list(set(allTracks))
    # remove OSCI and SPEC tracks
    allTracks = list(filter(('OSCI').__ne__, allTracks))
    allTracks = list(filter(('SPEC').__ne__, allTracks))
  
    # get corresponding ssffTrackDefinitions
    allTrackDefs = []
    for std in DBconfig['ssffTrackDefinitions']:
        if std['name'] in allTracks:
            allTrackDefs.append(std)
  
    return(allTrackDefs)


class SocketHandler(websocket.WebSocketHandler):
    def check_origin(self, origin):
        return True

    def open(self):
        if self not in cl:
            cl.append(self)

    def on_message(self, message):
        msg = json.loads(message)
        print('received:', msg)
        if msg['type'] == 'GETPROTOCOL':
            print('######### handling GETPROTOCOL')
            protocolData = {'protocol': 'EMU-webApp-websocket-protocol', 'version': '0.0.2'}
            response={'status': {'type': 'SUCCESS'}, 'callbackID': msg['callbackID'], 'data': protocolData}
            self.write_message(json.dumps(response))
        elif msg['type'] == 'GETDOUSERMANAGEMENT':
            print('######### handling GETDOUSERMANAGEMENT')
            response = {'status': {'type': 'SUCCESS'}, 'callbackID': msg['callbackID'], 'data': 'NO'}
            self.write_message(json.dumps(response))
        elif msg['type'] == 'GETGLOBALDBCONFIG':
            print('######### handling GETGLOBALDBCONFIG')
            path, folder = os.path.split(args.pathToEmuDB)
            # extract name of emuDB from folder
            if '_emuDB' in folder:
                dbName = re.sub('_emuDB$', '', folder)
            else:
                dbName = folder

            # read DBconfig
            with open(os.path.join(path, folder, dbName + '_DBconfig.json')) as json_data:
                d = json.load(json_data)

            response = {'status': {'type': 'SUCCESS'}, 'callbackID': msg['callbackID'], 'data': d}
            self.write_message(json.dumps(response))

        elif msg['type'] == 'GETBUNDLELIST':
            print('######### handling GETBUNDLELIST')
            bndlPaths = [y for x in os.walk(args.pathToEmuDB) for y in glob.glob(os.path.join(x[0], '*_bndl'))]
            bndlList = []
            for p in bndlPaths:
                splitPath = p.split("/") # SIC only works with Unix paths
                sesDir = splitPath[-2]
                sesName = re.sub('_ses$', '', sesDir)
                bndlDir = splitPath[-1]
                bndlName = re.sub('_bndl$', '', bndlDir)
                bndlList.append({'session': sesName, 'name': bndlName})

            response = {'status': {'type': 'SUCCESS'}, 'callbackID': msg['callbackID'], 'data': bndlList}
            self.write_message(json.dumps(response))

        elif msg['type'] == 'GETBUNDLE':
            print('######### handling GETBUNDLE')
            bndlDir = os.path.join(args.pathToEmuDB, msg['session'] + '_ses', msg['name'] + '_bndl')
            bndl = {}

            path, folder = os.path.split(args.pathToEmuDB)
            # extract name of emuDB from folder
            if '_emuDB' in folder:
                dbName = re.sub('_emuDB$', '', folder)
            else:
                dbName = folder

            # read DBconfig (won't be sent but we need the infos)
            with open(os.path.join(path, folder, dbName + '_DBconfig.json')) as json_data:
                dbConfig = json.load(json_data)

            # read annot.json
            with open(os.path.join(bndlDir, msg['name'] + '_annot.json')) as annot_json:
                annot = json.load(annot_json)

            bndl['annotation'] = annot

            # read wav file 
            with open(os.path.join(bndlDir, msg['name'] + '.wav'), "rb") as f:
                encoded = base64.b64encode(f.read())

            bndl['mediaFile'] = {'encoding': 'BASE64', 'data': encoded.decode("utf-8")}

            bndl['ssffFiles'] = []
            ssffTracksInUse = get_ssffTracksUsedByDBconfig(dbConfig)
            # loop through tracks and append to ssffFiles array
            for stiu in ssffTracksInUse:
                # read ssff file
                with open(os.path.join(bndlDir, msg['name'] + '.' + stiu['fileExtension']), "rb") as f:
                    encoded = base64.b64encode(f.read())
                bndl['ssffFiles'].append({'fileExtension':stiu['fileExtension'], 'encoding': 'BASE64', 'data': encoded.decode("utf-8")})

            response = {'status': {'type': 'SUCCESS'}, 'callbackID': msg['callbackID'], 'data': bndl}
            self.write_message(json.dumps(response))

        elif msg['type'] == 'SAVEBUNDLE':
            print('######### handling GETBUNDLE')
            print('### Pretending to save bundle:')
            print('\tname:', msg['data']['annotation']['name'])
            print('\tsession:', msg['data']['session'])
            print('\tssffFiles:', msg['data']['ssffFiles'])
            print(msg['data']['annotation'])
            response = {'status': {'type': 'SUCCESS', 'message': 'Pst... I did not really do anything. Please do not tell anyone...'}, 'callbackID': msg['callbackID']}
            self.write_message(json.dumps(response))
 
        elif msg['type'] == 'DISCONNECTWARNING':
            print('######### handling DISCONNECTWARNING')
            response = {'status': {'type': 'SUCCESS'}, 'callbackID': msg['callbackID']}
            self.write_message(json.dumps(response))
 
        else:
            print('bad request')
            response = {'status': {'type': 'ERROR', 'message': 'received bad request!'}, 'callbackID': msg['callbackID']}
            self.write_message(json.dumps(response))


    def on_close(self):
        if self in cl:
            cl.remove(self)

# app init
app = web.Application([
    (r'/', SocketHandler),
])

if __name__ == '__main__':
    args = parser.parse_args()
    app.listen(8888)
    ioloop.IOLoop.instance().start()
