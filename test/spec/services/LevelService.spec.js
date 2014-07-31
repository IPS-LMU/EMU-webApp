'use strict';

describe('Service: LevelService', function () {

  // load the controller's module
  beforeEach(module('emuwebApp'));
  
  var configProviderServiceData = {"main":{"osciSpectroZoomFactor":2,"autoConnect":false,"serverUrl":"ws://localhost:8080","serverTimeoutInterval":5000,"comMode":"WS","catchMouseForKeyBinding":false},"keyMappings":{"toggleSideBarLeft":111,"toggleSideBarRight":79,"zoomSel":101,"zoomAll":113,"zoomOut":115,"zoomIn":119,"shiftViewPortLeft":97,"shiftViewPortRight":100,"playEntireFile":102,"playAllInView":32,"playSelected":99,"deletePreselBoundary":8,"selNextPrevItem":9,"selNextItem":39,"selPrevItem":37,"createNewItemAtSelection":13,"levelUp":38,"levelDown":40,"undo":122,"redo":90,"shrinkSelSegmentsRight":95,"shrinkSelSegmentsLeft":45,"expandSelSegmentsRight":43,"expandSelSegmentsLeft":42,"selectFirstContourCorrectionTool":49,"selectSecondContourCorrectionTool":50,"selectThirdContourCorrectionTool":51,"selectFourthContourCorrectionTool":52,"selectNoContourCorrectionTool":48,"selectSegmentsInSelection":103,"snapBoundaryToNearestTopBoundary":116,"snapBoundaryToNearestBottomBoundary":98,"snapBoundaryToNearestZeroCrossing":120,"shift":16,"alt":18,"esc":27},"colors":{"labelColor":"#000","osciColor":"#000","levelColor":"#E7E7E7","appBackground":"#f00","playProgressColor":"rgba(255, 255, 255, 0.5)","selectedAreaColor":"rgba(22, 22, 22, 0.1)","selectedBorderColor":"rgba(0, 0, 0, 0.7)","selectedBoundaryColor":"#0DC5FF","selectedLevelColor":"rgba(22, 22, 22, 0.1)","selectedSegmentColor":"rgba(255, 255, 22, 0.5)","selectedContourColor":"#eeff41","startBoundaryColor":"#000","endBoundaryColor":"#888","zeroLineColor":"#0DC5FF","crossHairsColor":"rgba(255, 0, 0, 0.95)","transitionTime":400},"font":{"fontType":"HelveticaNeue","fontPxSize":14},"spectrogramSettings":{"N":256,"rangeFrom":0,"rangeTo":5000,"dynamicRange":70,"window":"GAUSS","preEmphasisPerOctaveInDb":6,"transparency":255,"drawHeatMapColors":false},"perspectives":[{"name":"default","signalCanvases":{"order":[],"assign":[],"contourLims":[]},"levelCanvases":{"order":[]},"twoDimCanvases":{"order":[]}}],"labelCanvasConfig":{"addTimeMode":"absolute","addTimeValue":750,"newSegmentName":"","newEventName":""},"restrictions":{"playback":true,"correctionTool":true,"editItemSize":true,"editItemName":true,"deleteItemBoundary":true,"deleteItem":true,"deleteLevel":true,"addItem":true,"drawCrossHairs":true,"drawSampleNrs":false,"drawZeroLine":true,"bundleComments":false,"bundleFinishedEditing":false,"showPerspectivesSidebar":false},"activeButtons":{"addLevelSeg":false,"addLevelEvent":false,"renameSelLevel":false,"downloadTextGrid":false,"specSettings":true,"connect":true,"clear":true,"deleteSingleLevel":false,"resizeSingleLevel":true,"saveSingleLevel":false,"resizePerspectives":true,"openDemoDB":true,"saveBundle":false,"openMenu":true},"demoDBs":["ae","ema","epgdorsal"]} ;
  
  var mockaeMsajc003 = {"name":"msajc003","annotates":"SES0000/msajc003/msajc003.wav","sampleRate":20000,"levels":[{"name":"Utterance","type":"ITEM","items":[{"id":8,"labels":[{"name":"Utterance","value":""}]}]},{"name":"Intonational","type":"ITEM","items":[{"id":7,"labels":[{"name":"Intonational","value":"L%"}]}]},{"name":"Intermediate","type":"ITEM","items":[{"id":5,"labels":[{"name":"Intermediate","value":"L-"}]},{"id":46,"labels":[{"name":"Intermediate","value":"L-"}]}]},{"name":"Word","type":"ITEM","items":[{"id":2,"labels":[{"name":"Word","value":"C"},{"name":"Accent","value":"S"},{"name":"Text","value":"amongst"}]},{"id":24,"labels":[{"name":"Word","value":"F"},{"name":"Accent","value":"W"},{"name":"Text","value":"her"}]},{"id":30,"labels":[{"name":"Word","value":"C"},{"name":"Accent","value":"S"},{"name":"Text","value":"friends"}]},{"id":43,"labels":[{"name":"Word","value":"F"},{"name":"Accent","value":"W"},{"name":"Text","value":"she"}]},{"id":52,"labels":[{"name":"Word","value":"F"},{"name":"Accent","value":"W"},{"name":"Text","value":"was"}]},{"id":61,"labels":[{"name":"Word","value":"C"},{"name":"Accent","value":"W"},{"name":"Text","value":"considered"}]},{"id":83,"labels":[{"name":"Word","value":"C"},{"name":"Accent","value":"S"},{"name":"Text","value":"beautiful"}]}]},{"name":"Syllable","type":"ITEM","items":[{"id":102,"labels":[{"name":"Syllable","value":"W"}]},{"id":103,"labels":[{"name":"Syllable","value":"S"}]},{"id":104,"labels":[{"name":"Syllable","value":"S"}]},{"id":105,"labels":[{"name":"Syllable","value":"S"}]},{"id":106,"labels":[{"name":"Syllable","value":"W"}]},{"id":107,"labels":[{"name":"Syllable","value":"W"}]},{"id":108,"labels":[{"name":"Syllable","value":"W"}]},{"id":109,"labels":[{"name":"Syllable","value":"S"}]},{"id":110,"labels":[{"name":"Syllable","value":"W"}]},{"id":111,"labels":[{"name":"Syllable","value":"S"}]},{"id":112,"labels":[{"name":"Syllable","value":"W"}]},{"id":113,"labels":[{"name":"Syllable","value":"W"}]}]},{"name":"Phoneme","type":"ITEM","items":[{"id":114,"labels":[{"name":"Phoneme","value":"V"}]},{"id":115,"labels":[{"name":"Phoneme","value":"m"}]},{"id":116,"labels":[{"name":"Phoneme","value":"V"}]},{"id":117,"labels":[{"name":"Phoneme","value":"N"}]},{"id":118,"labels":[{"name":"Phoneme","value":"s"}]},{"id":119,"labels":[{"name":"Phoneme","value":"t"}]},{"id":120,"labels":[{"name":"Phoneme","value":"@:"}]},{"id":121,"labels":[{"name":"Phoneme","value":"f"}]},{"id":122,"labels":[{"name":"Phoneme","value":"r"}]},{"id":123,"labels":[{"name":"Phoneme","value":"E"}]},{"id":124,"labels":[{"name":"Phoneme","value":"n"}]},{"id":125,"labels":[{"name":"Phoneme","value":"z"}]},{"id":126,"labels":[{"name":"Phoneme","value":"S"}]},{"id":127,"labels":[{"name":"Phoneme","value":"i:"}]},{"id":128,"labels":[{"name":"Phoneme","value":"w"}]},{"id":129,"labels":[{"name":"Phoneme","value":"@"}]},{"id":130,"labels":[{"name":"Phoneme","value":"z"}]},{"id":131,"labels":[{"name":"Phoneme","value":"k"}]},{"id":132,"labels":[{"name":"Phoneme","value":"@"}]},{"id":133,"labels":[{"name":"Phoneme","value":"n"}]},{"id":134,"labels":[{"name":"Phoneme","value":"s"}]},{"id":135,"labels":[{"name":"Phoneme","value":"I"}]},{"id":136,"labels":[{"name":"Phoneme","value":"d"}]},{"id":137,"labels":[{"name":"Phoneme","value":"@"}]},{"id":138,"labels":[{"name":"Phoneme","value":"d"}]},{"id":139,"labels":[{"name":"Phoneme","value":"b"}]},{"id":140,"labels":[{"name":"Phoneme","value":"j"}]},{"id":141,"labels":[{"name":"Phoneme","value":"u:"}]},{"id":142,"labels":[{"name":"Phoneme","value":"d"}]},{"id":143,"labels":[{"name":"Phoneme","value":"@"}]},{"id":144,"labels":[{"name":"Phoneme","value":"f"}]},{"id":145,"labels":[{"name":"Phoneme","value":"@"}]},{"id":146,"labels":[{"name":"Phoneme","value":"l"}]}]},{"name":"Phonetic","type":"SEGMENT","items":[{"id":147,"sampleStart":3750,"sampleDur":1390,"labels":[{"name":"Phonetic","value":"V"}]},{"id":148,"sampleStart":5140,"sampleDur":1665,"labels":[{"name":"Phonetic","value":"m"}]},{"id":149,"sampleStart":6805,"sampleDur":1730,"labels":[{"name":"Phonetic","value":"V"}]},{"id":150,"sampleStart":8535,"sampleDur":1135,"labels":[{"name":"Phonetic","value":"N"}]},{"id":151,"sampleStart":9670,"sampleDur":1670,"labels":[{"name":"Phonetic","value":"s"}]},{"id":152,"sampleStart":11340,"sampleDur":595,"labels":[{"name":"Phonetic","value":"t"}]},{"id":153,"sampleStart":11935,"sampleDur":1550,"labels":[{"name":"Phonetic","value":"H"}]},{"id":154,"sampleStart":13485,"sampleDur":1315,"labels":[{"name":"Phonetic","value":"@:"}]},{"id":155,"sampleStart":14800,"sampleDur":3055,"labels":[{"name":"Phonetic","value":"f"}]},{"id":156,"sampleStart":17855,"sampleDur":1145,"labels":[{"name":"Phonetic","value":"r"}]},{"id":157,"sampleStart":19000,"sampleDur":1640,"labels":[{"name":"Phonetic","value":"E"}]},{"id":158,"sampleStart":20640,"sampleDur":3280,"labels":[{"name":"Phonetic","value":"n"}]},{"id":159,"sampleStart":23920,"sampleDur":1870,"labels":[{"name":"Phonetic","value":"z"}]},{"id":160,"sampleStart":25790,"sampleDur":2610,"labels":[{"name":"Phonetic","value":"S"}]},{"id":161,"sampleStart":28400,"sampleDur":865,"labels":[{"name":"Phonetic","value":"i:"}]},{"id":162,"sampleStart":29265,"sampleDur":860,"labels":[{"name":"Phonetic","value":"w"}]},{"id":163,"sampleStart":30125,"sampleDur":845,"labels":[{"name":"Phonetic","value":"@"}]},{"id":164,"sampleStart":30970,"sampleDur":1720,"labels":[{"name":"Phonetic","value":"z"}]},{"id":165,"sampleStart":32690,"sampleDur":830,"labels":[{"name":"Phonetic","value":"k"}]},{"id":166,"sampleStart":33520,"sampleDur":790,"labels":[{"name":"Phonetic","value":"H"}]},{"id":167,"sampleStart":34310,"sampleDur":520,"labels":[{"name":"Phonetic","value":"@"}]},{"id":168,"sampleStart":34830,"sampleDur":1000,"labels":[{"name":"Phonetic","value":"n"}]},{"id":169,"sampleStart":35830,"sampleDur":2035,"labels":[{"name":"Phonetic","value":"s"}]},{"id":170,"sampleStart":37865,"sampleDur":1045,"labels":[{"name":"Phonetic","value":"I"}]},{"id":171,"sampleStart":38910,"sampleDur":425,"labels":[{"name":"Phonetic","value":"d"}]},{"id":172,"sampleStart":39335,"sampleDur":1340,"labels":[{"name":"Phonetic","value":"@"}]},{"id":173,"sampleStart":40675,"sampleDur":2330,"labels":[{"name":"Phonetic","value":"db"}]},{"id":174,"sampleStart":43005,"sampleDur":1220,"labels":[{"name":"Phonetic","value":"j"}]},{"id":175,"sampleStart":44225,"sampleDur":1450,"labels":[{"name":"Phonetic","value":"u:"}]},{"id":176,"sampleStart":45675,"sampleDur":385,"labels":[{"name":"Phonetic","value":"dH"}]},{"id":177,"sampleStart":46060,"sampleDur":1180,"labels":[{"name":"Phonetic","value":"@"}]},{"id":178,"sampleStart":47240,"sampleDur":1710,"labels":[{"name":"Phonetic","value":"f"}]},{"id":179,"sampleStart":48950,"sampleDur":1176,"labels":[{"name":"Phonetic","value":"@"}]},{"id":180,"sampleStart":50126,"sampleDur":1964,"labels":[{"name":"Phonetic","value":"l"}]}]},{"name":"Tone","type":"EVENT","items":[{"id":181,"samplePoint":8382,"labels":[{"name":"Tone","value":"H*"}]},{"id":182,"samplePoint":18632,"labels":[{"name":"Tone","value":"H*"}]},{"id":183,"samplePoint":22140,"labels":[{"name":"Tone","value":"L-"}]},{"id":184,"samplePoint":38255,"labels":[{"name":"Tone","value":"H*"}]},{"id":185,"samplePoint":44613,"labels":[{"name":"Tone","value":"H*"}]},{"id":186,"samplePoint":50862,"labels":[{"name":"Tone","value":"L-"}]},{"id":187,"samplePoint":51553,"labels":[{"name":"Tone","value":"L%"}]}]},{"name":"Foot","type":"ITEM","items":[{"id":47,"labels":[{"name":"Foot","value":"F"}]},{"id":53,"labels":[{"name":"Foot","value":"F"}]},{"id":62,"labels":[{"name":"Foot","value":"F"}]},{"id":71,"labels":[{"name":"Foot","value":"F"}]},{"id":84,"labels":[{"name":"Foot","value":"F"}]}]}],"links":[{"fromID":2,"toID":102},{"fromID":2,"toID":103},{"fromID":2,"toID":114},{"fromID":2,"toID":115},{"fromID":2,"toID":116},{"fromID":2,"toID":117},{"fromID":2,"toID":118},{"fromID":2,"toID":119},{"fromID":2,"toID":147},{"fromID":2,"toID":148},{"fromID":2,"toID":149},{"fromID":2,"toID":150},{"fromID":2,"toID":151},{"fromID":2,"toID":152},{"fromID":2,"toID":153},{"fromID":5,"toID":2},{"fromID":5,"toID":24},{"fromID":5,"toID":30},{"fromID":5,"toID":102},{"fromID":5,"toID":103},{"fromID":5,"toID":104},{"fromID":5,"toID":105},{"fromID":5,"toID":114},{"fromID":5,"toID":115},{"fromID":5,"toID":116},{"fromID":5,"toID":117},{"fromID":5,"toID":118},{"fromID":5,"toID":119},{"fromID":5,"toID":120},{"fromID":5,"toID":121},{"fromID":5,"toID":122},{"fromID":5,"toID":123},{"fromID":5,"toID":124},{"fromID":5,"toID":125},{"fromID":5,"toID":147},{"fromID":5,"toID":148},{"fromID":5,"toID":149},{"fromID":5,"toID":150},{"fromID":5,"toID":151},{"fromID":5,"toID":152},{"fromID":5,"toID":153},{"fromID":5,"toID":154},{"fromID":5,"toID":155},{"fromID":5,"toID":156},{"fromID":5,"toID":157},{"fromID":5,"toID":158},{"fromID":5,"toID":159},{"fromID":5,"toID":181},{"fromID":5,"toID":182},{"fromID":7,"toID":2},{"fromID":7,"toID":5},{"fromID":7,"toID":24},{"fromID":7,"toID":30},{"fromID":7,"toID":43},{"fromID":7,"toID":46},{"fromID":7,"toID":47},{"fromID":7,"toID":52},{"fromID":7,"toID":53},{"fromID":7,"toID":61},{"fromID":7,"toID":62},{"fromID":7,"toID":71},{"fromID":7,"toID":83},{"fromID":7,"toID":84},{"fromID":7,"toID":102},{"fromID":7,"toID":103},{"fromID":7,"toID":104},{"fromID":7,"toID":105},{"fromID":7,"toID":106},{"fromID":7,"toID":107},{"fromID":7,"toID":108},{"fromID":7,"toID":109},{"fromID":7,"toID":110},{"fromID":7,"toID":111},{"fromID":7,"toID":112},{"fromID":7,"toID":113},{"fromID":7,"toID":114},{"fromID":7,"toID":115},{"fromID":7,"toID":116},{"fromID":7,"toID":117},{"fromID":7,"toID":118},{"fromID":7,"toID":119},{"fromID":7,"toID":120},{"fromID":7,"toID":121},{"fromID":7,"toID":122},{"fromID":7,"toID":123},{"fromID":7,"toID":124},{"fromID":7,"toID":125},{"fromID":7,"toID":126},{"fromID":7,"toID":127},{"fromID":7,"toID":128},{"fromID":7,"toID":129},{"fromID":7,"toID":130},{"fromID":7,"toID":131},{"fromID":7,"toID":132},{"fromID":7,"toID":133},{"fromID":7,"toID":134},{"fromID":7,"toID":135},{"fromID":7,"toID":136},{"fromID":7,"toID":137},{"fromID":7,"toID":138},{"fromID":7,"toID":139},{"fromID":7,"toID":140},{"fromID":7,"toID":141},{"fromID":7,"toID":142},{"fromID":7,"toID":143},{"fromID":7,"toID":144},{"fromID":7,"toID":145},{"fromID":7,"toID":146},{"fromID":7,"toID":147},{"fromID":7,"toID":148},{"fromID":7,"toID":149},{"fromID":7,"toID":150},{"fromID":7,"toID":151},{"fromID":7,"toID":152},{"fromID":7,"toID":153},{"fromID":7,"toID":154},{"fromID":7,"toID":155},{"fromID":7,"toID":156},{"fromID":7,"toID":157},{"fromID":7,"toID":158},{"fromID":7,"toID":159},{"fromID":7,"toID":160},{"fromID":7,"toID":161},{"fromID":7,"toID":162},{"fromID":7,"toID":163},{"fromID":7,"toID":164},{"fromID":7,"toID":165},{"fromID":7,"toID":166},{"fromID":7,"toID":167},{"fromID":7,"toID":168},{"fromID":7,"toID":169},{"fromID":7,"toID":170},{"fromID":7,"toID":171},{"fromID":7,"toID":172},{"fromID":7,"toID":173},{"fromID":7,"toID":174},{"fromID":7,"toID":175},{"fromID":7,"toID":176},{"fromID":7,"toID":177},{"fromID":7,"toID":178},{"fromID":7,"toID":179},{"fromID":7,"toID":180},{"fromID":7,"toID":181},{"fromID":7,"toID":182},{"fromID":7,"toID":184},{"fromID":7,"toID":185},{"fromID":8,"toID":2},{"fromID":8,"toID":5},{"fromID":8,"toID":7},{"fromID":8,"toID":24},{"fromID":8,"toID":30},{"fromID":8,"toID":43},{"fromID":8,"toID":46},{"fromID":8,"toID":47},{"fromID":8,"toID":52},{"fromID":8,"toID":53},{"fromID":8,"toID":61},{"fromID":8,"toID":62},{"fromID":8,"toID":71},{"fromID":8,"toID":83},{"fromID":8,"toID":84},{"fromID":8,"toID":102},{"fromID":8,"toID":103},{"fromID":8,"toID":104},{"fromID":8,"toID":105},{"fromID":8,"toID":106},{"fromID":8,"toID":107},{"fromID":8,"toID":108},{"fromID":8,"toID":109},{"fromID":8,"toID":110},{"fromID":8,"toID":111},{"fromID":8,"toID":112},{"fromID":8,"toID":113},{"fromID":8,"toID":114},{"fromID":8,"toID":115},{"fromID":8,"toID":116},{"fromID":8,"toID":117},{"fromID":8,"toID":118},{"fromID":8,"toID":119},{"fromID":8,"toID":120},{"fromID":8,"toID":121},{"fromID":8,"toID":122},{"fromID":8,"toID":123},{"fromID":8,"toID":124},{"fromID":8,"toID":125},{"fromID":8,"toID":126},{"fromID":8,"toID":127},{"fromID":8,"toID":128},{"fromID":8,"toID":129},{"fromID":8,"toID":130},{"fromID":8,"toID":131},{"fromID":8,"toID":132},{"fromID":8,"toID":133},{"fromID":8,"toID":134},{"fromID":8,"toID":135},{"fromID":8,"toID":136},{"fromID":8,"toID":137},{"fromID":8,"toID":138},{"fromID":8,"toID":139},{"fromID":8,"toID":140},{"fromID":8,"toID":141},{"fromID":8,"toID":142},{"fromID":8,"toID":143},{"fromID":8,"toID":144},{"fromID":8,"toID":145},{"fromID":8,"toID":146},{"fromID":8,"toID":147},{"fromID":8,"toID":148},{"fromID":8,"toID":149},{"fromID":8,"toID":150},{"fromID":8,"toID":151},{"fromID":8,"toID":152},{"fromID":8,"toID":153},{"fromID":8,"toID":154},{"fromID":8,"toID":155},{"fromID":8,"toID":156},{"fromID":8,"toID":157},{"fromID":8,"toID":158},{"fromID":8,"toID":159},{"fromID":8,"toID":160},{"fromID":8,"toID":161},{"fromID":8,"toID":162},{"fromID":8,"toID":163},{"fromID":8,"toID":164},{"fromID":8,"toID":165},{"fromID":8,"toID":166},{"fromID":8,"toID":167},{"fromID":8,"toID":168},{"fromID":8,"toID":169},{"fromID":8,"toID":170},{"fromID":8,"toID":171},{"fromID":8,"toID":172},{"fromID":8,"toID":173},{"fromID":8,"toID":174},{"fromID":8,"toID":175},{"fromID":8,"toID":176},{"fromID":8,"toID":177},{"fromID":8,"toID":178},{"fromID":8,"toID":179},{"fromID":8,"toID":180},{"fromID":8,"toID":181},{"fromID":8,"toID":182},{"fromID":8,"toID":184},{"fromID":8,"toID":185},{"fromID":24,"toID":104},{"fromID":24,"toID":120},{"fromID":24,"toID":154},{"fromID":24,"toID":181},{"fromID":30,"toID":105},{"fromID":30,"toID":121},{"fromID":30,"toID":122},{"fromID":30,"toID":123},{"fromID":30,"toID":124},{"fromID":30,"toID":125},{"fromID":30,"toID":155},{"fromID":30,"toID":156},{"fromID":30,"toID":157},{"fromID":30,"toID":158},{"fromID":30,"toID":159},{"fromID":30,"toID":182},{"fromID":43,"toID":106},{"fromID":43,"toID":126},{"fromID":43,"toID":127},{"fromID":43,"toID":160},{"fromID":43,"toID":161},{"fromID":46,"toID":43},{"fromID":46,"toID":52},{"fromID":46,"toID":61},{"fromID":46,"toID":83},{"fromID":46,"toID":106},{"fromID":46,"toID":107},{"fromID":46,"toID":108},{"fromID":46,"toID":109},{"fromID":46,"toID":110},{"fromID":46,"toID":111},{"fromID":46,"toID":112},{"fromID":46,"toID":113},{"fromID":46,"toID":126},{"fromID":46,"toID":127},{"fromID":46,"toID":128},{"fromID":46,"toID":129},{"fromID":46,"toID":130},{"fromID":46,"toID":131},{"fromID":46,"toID":132},{"fromID":46,"toID":133},{"fromID":46,"toID":134},{"fromID":46,"toID":135},{"fromID":46,"toID":136},{"fromID":46,"toID":137},{"fromID":46,"toID":138},{"fromID":46,"toID":139},{"fromID":46,"toID":140},{"fromID":46,"toID":141},{"fromID":46,"toID":142},{"fromID":46,"toID":143},{"fromID":46,"toID":144},{"fromID":46,"toID":145},{"fromID":46,"toID":146},{"fromID":46,"toID":160},{"fromID":46,"toID":161},{"fromID":46,"toID":162},{"fromID":46,"toID":163},{"fromID":46,"toID":164},{"fromID":46,"toID":165},{"fromID":46,"toID":166},{"fromID":46,"toID":167},{"fromID":46,"toID":168},{"fromID":46,"toID":169},{"fromID":46,"toID":170},{"fromID":46,"toID":171},{"fromID":46,"toID":172},{"fromID":46,"toID":173},{"fromID":46,"toID":174},{"fromID":46,"toID":175},{"fromID":46,"toID":176},{"fromID":46,"toID":177},{"fromID":46,"toID":178},{"fromID":46,"toID":179},{"fromID":46,"toID":180},{"fromID":46,"toID":184},{"fromID":46,"toID":185},{"fromID":47,"toID":103},{"fromID":47,"toID":115},{"fromID":47,"toID":116},{"fromID":47,"toID":117},{"fromID":47,"toID":118},{"fromID":47,"toID":119},{"fromID":47,"toID":148},{"fromID":47,"toID":149},{"fromID":47,"toID":150},{"fromID":47,"toID":151},{"fromID":47,"toID":152},{"fromID":47,"toID":153},{"fromID":52,"toID":107},{"fromID":52,"toID":128},{"fromID":52,"toID":129},{"fromID":52,"toID":130},{"fromID":52,"toID":162},{"fromID":52,"toID":163},{"fromID":52,"toID":164},{"fromID":53,"toID":104},{"fromID":53,"toID":120},{"fromID":53,"toID":154},{"fromID":53,"toID":181},{"fromID":61,"toID":108},{"fromID":61,"toID":109},{"fromID":61,"toID":110},{"fromID":61,"toID":131},{"fromID":61,"toID":132},{"fromID":61,"toID":133},{"fromID":61,"toID":134},{"fromID":61,"toID":135},{"fromID":61,"toID":136},{"fromID":61,"toID":137},{"fromID":61,"toID":138},{"fromID":61,"toID":165},{"fromID":61,"toID":166},{"fromID":61,"toID":167},{"fromID":61,"toID":168},{"fromID":61,"toID":169},{"fromID":61,"toID":170},{"fromID":61,"toID":171},{"fromID":61,"toID":172},{"fromID":61,"toID":173},{"fromID":61,"toID":184},{"fromID":62,"toID":105},{"fromID":62,"toID":106},{"fromID":62,"toID":107},{"fromID":62,"toID":108},{"fromID":62,"toID":121},{"fromID":62,"toID":122},{"fromID":62,"toID":123},{"fromID":62,"toID":124},{"fromID":62,"toID":125},{"fromID":62,"toID":126},{"fromID":62,"toID":127},{"fromID":62,"toID":128},{"fromID":62,"toID":129},{"fromID":62,"toID":130},{"fromID":62,"toID":131},{"fromID":62,"toID":132},{"fromID":62,"toID":133},{"fromID":62,"toID":155},{"fromID":62,"toID":156},{"fromID":62,"toID":157},{"fromID":62,"toID":158},{"fromID":62,"toID":159},{"fromID":62,"toID":160},{"fromID":62,"toID":161},{"fromID":62,"toID":162},{"fromID":62,"toID":163},{"fromID":62,"toID":164},{"fromID":62,"toID":165},{"fromID":62,"toID":166},{"fromID":62,"toID":167},{"fromID":62,"toID":168},{"fromID":62,"toID":182},{"fromID":71,"toID":109},{"fromID":71,"toID":110},{"fromID":71,"toID":134},{"fromID":71,"toID":135},{"fromID":71,"toID":136},{"fromID":71,"toID":137},{"fromID":71,"toID":138},{"fromID":71,"toID":169},{"fromID":71,"toID":170},{"fromID":71,"toID":171},{"fromID":71,"toID":172},{"fromID":71,"toID":173},{"fromID":71,"toID":184},{"fromID":83,"toID":111},{"fromID":83,"toID":112},{"fromID":83,"toID":113},{"fromID":83,"toID":139},{"fromID":83,"toID":140},{"fromID":83,"toID":141},{"fromID":83,"toID":142},{"fromID":83,"toID":143},{"fromID":83,"toID":144},{"fromID":83,"toID":145},{"fromID":83,"toID":146},{"fromID":83,"toID":173},{"fromID":83,"toID":174},{"fromID":83,"toID":175},{"fromID":83,"toID":176},{"fromID":83,"toID":177},{"fromID":83,"toID":178},{"fromID":83,"toID":179},{"fromID":83,"toID":180},{"fromID":83,"toID":185},{"fromID":84,"toID":111},{"fromID":84,"toID":112},{"fromID":84,"toID":113},{"fromID":84,"toID":139},{"fromID":84,"toID":140},{"fromID":84,"toID":141},{"fromID":84,"toID":142},{"fromID":84,"toID":143},{"fromID":84,"toID":144},{"fromID":84,"toID":145},{"fromID":84,"toID":146},{"fromID":84,"toID":173},{"fromID":84,"toID":174},{"fromID":84,"toID":175},{"fromID":84,"toID":176},{"fromID":84,"toID":177},{"fromID":84,"toID":178},{"fromID":84,"toID":179},{"fromID":84,"toID":180},{"fromID":84,"toID":185},{"fromID":102,"toID":114},{"fromID":102,"toID":147},{"fromID":103,"toID":115},{"fromID":103,"toID":116},{"fromID":103,"toID":117},{"fromID":103,"toID":118},{"fromID":103,"toID":119},{"fromID":103,"toID":148},{"fromID":103,"toID":149},{"fromID":103,"toID":150},{"fromID":103,"toID":151},{"fromID":103,"toID":152},{"fromID":103,"toID":153},{"fromID":104,"toID":120},{"fromID":104,"toID":154},{"fromID":104,"toID":181},{"fromID":105,"toID":121},{"fromID":105,"toID":122},{"fromID":105,"toID":123},{"fromID":105,"toID":124},{"fromID":105,"toID":125},{"fromID":105,"toID":155},{"fromID":105,"toID":156},{"fromID":105,"toID":157},{"fromID":105,"toID":158},{"fromID":105,"toID":159},{"fromID":105,"toID":182},{"fromID":106,"toID":126},{"fromID":106,"toID":127},{"fromID":106,"toID":160},{"fromID":106,"toID":161},{"fromID":107,"toID":128},{"fromID":107,"toID":129},{"fromID":107,"toID":130},{"fromID":107,"toID":162},{"fromID":107,"toID":163},{"fromID":107,"toID":164},{"fromID":108,"toID":131},{"fromID":108,"toID":132},{"fromID":108,"toID":133},{"fromID":108,"toID":165},{"fromID":108,"toID":166},{"fromID":108,"toID":167},{"fromID":108,"toID":168},{"fromID":109,"toID":134},{"fromID":109,"toID":135},{"fromID":109,"toID":169},{"fromID":109,"toID":170},{"fromID":109,"toID":184},{"fromID":110,"toID":136},{"fromID":110,"toID":137},{"fromID":110,"toID":138},{"fromID":110,"toID":171},{"fromID":110,"toID":172},{"fromID":110,"toID":173},{"fromID":111,"toID":139},{"fromID":111,"toID":140},{"fromID":111,"toID":141},{"fromID":111,"toID":173},{"fromID":111,"toID":174},{"fromID":111,"toID":175},{"fromID":111,"toID":185},{"fromID":112,"toID":142},{"fromID":112,"toID":143},{"fromID":112,"toID":176},{"fromID":112,"toID":177},{"fromID":113,"toID":144},{"fromID":113,"toID":145},{"fromID":113,"toID":146},{"fromID":113,"toID":178},{"fromID":113,"toID":179},{"fromID":113,"toID":180},{"fromID":114,"toID":147},{"fromID":115,"toID":148},{"fromID":116,"toID":149},{"fromID":117,"toID":150},{"fromID":118,"toID":151},{"fromID":119,"toID":152},{"fromID":119,"toID":153},{"fromID":120,"toID":154},{"fromID":121,"toID":155},{"fromID":122,"toID":156},{"fromID":123,"toID":157},{"fromID":124,"toID":158},{"fromID":125,"toID":159},{"fromID":126,"toID":160},{"fromID":127,"toID":161},{"fromID":128,"toID":162},{"fromID":129,"toID":163},{"fromID":130,"toID":164},{"fromID":131,"toID":165},{"fromID":131,"toID":166},{"fromID":132,"toID":167},{"fromID":133,"toID":168},{"fromID":134,"toID":169},{"fromID":135,"toID":170},{"fromID":136,"toID":171},{"fromID":137,"toID":172},{"fromID":138,"toID":173},{"fromID":139,"toID":173},{"fromID":140,"toID":174},{"fromID":141,"toID":175},{"fromID":142,"toID":176},{"fromID":143,"toID":177},{"fromID":144,"toID":178},{"fromID":145,"toID":179},{"fromID":146,"toID":180}]};
  
  var mockEmaProsody0024 = {"name":"dfgspp_mo1_prosody_0024","annotates":"0000_ses/dfgspp_mo1_prosody_0024_bndl/dfgspp_mo1_prosody_0024.wav","sampleRate":24000,"levels":[{"name":"Word","type":"ITEM","items":[{"id":42,"labels":[{"name":"Word","value":"Klausur"}]}]},{"name":"Segment","type":"SEGMENT","items":[{"id":0,"sampleStart":0,"sampleDur":8640,"labels":[{"name":"Segment","value":"&p:"}]},{"id":1,"sampleStart":8640,"sampleDur":6240,"labels":[{"name":"Segment","value":"m"}]},{"id":2,"sampleStart":14880,"sampleDur":2640,"labels":[{"name":"Segment","value":"O"}]},{"id":3,"sampleStart":17520,"sampleDur":720,"labels":[{"name":"Segment","value":"r"}]},{"id":4,"sampleStart":18240,"sampleDur":960,"labels":[{"name":"Segment","value":"g"}]},{"id":5,"sampleStart":19200,"sampleDur":960,"labels":[{"name":"Segment","value":"N"}]},{"id":6,"sampleStart":20160,"sampleDur":960,"labels":[{"name":"Segment","value":"m"}]},{"id":7,"sampleStart":21120,"sampleDur":960,"labels":[{"name":"Segment","value":"U"}]},{"id":8,"sampleStart":22080,"sampleDur":720,"labels":[{"name":"Segment","value":"s"}]},{"id":9,"sampleStart":22800,"sampleDur":2160,"labels":[{"name":"Segment","value":"z"}]},{"id":10,"sampleStart":24960,"sampleDur":960,"labels":[{"name":"Segment","value":"i:"}]},{"id":11,"sampleStart":25920,"sampleDur":960,"labels":[{"name":"Segment","value":"v"}]},{"id":12,"sampleStart":26880,"sampleDur":1680,"labels":[{"name":"Segment","value":"e:"}]},{"id":13,"sampleStart":28560,"sampleDur":720,"labels":[{"name":"Segment","value":"d"}]},{"id":14,"sampleStart":29280,"sampleDur":2640,"labels":[{"name":"Segment","value":"6"}]},{"id":15,"sampleStart":31920,"sampleDur":1200,"labels":[{"name":"Segment","value":"k"}]},{"id":16,"sampleStart":33120,"sampleDur":1200,"labels":[{"name":"Segment","value":"l"}]},{"id":17,"sampleStart":34320,"sampleDur":2400,"labels":[{"name":"Segment","value":"aU"}]},{"id":18,"sampleStart":36720,"sampleDur":1440,"labels":[{"name":"Segment","value":"z"}]},{"id":19,"sampleStart":38160,"sampleDur":2160,"labels":[{"name":"Segment","value":"u:"}]},{"id":20,"sampleStart":40320,"sampleDur":720,"labels":[{"name":"Segment","value":"6"}]},{"id":21,"sampleStart":41040,"sampleDur":960,"labels":[{"name":"Segment","value":"n"}]},{"id":22,"sampleStart":42000,"sampleDur":1440,"labels":[{"name":"Segment","value":"O"}]},{"id":23,"sampleStart":43440,"sampleDur":960,"labels":[{"name":"Segment","value":"x"}]},{"id":24,"sampleStart":44400,"sampleDur":2400,"labels":[{"name":"Segment","value":"E"}]},{"id":25,"sampleStart":46800,"sampleDur":960,"labels":[{"name":"Segment","value":"k"}]},{"id":26,"sampleStart":47760,"sampleDur":1440,"labels":[{"name":"Segment","value":"s"}]},{"id":27,"sampleStart":49200,"sampleDur":3360,"labels":[{"name":"Segment","value":"a:"}]},{"id":28,"sampleStart":52560,"sampleDur":720,"labels":[{"name":"Segment","value":"m"}]},{"id":29,"sampleStart":53280,"sampleDur":720,"labels":[{"name":"Segment","value":"@"}]},{"id":30,"sampleStart":54000,"sampleDur":1440,"labels":[{"name":"Segment","value":"n"}]},{"id":31,"sampleStart":55440,"sampleDur":2160,"labels":[{"name":"Segment","value":"S"}]},{"id":32,"sampleStart":57600,"sampleDur":1440,"labels":[{"name":"Segment","value":"r"}]},{"id":33,"sampleStart":59040,"sampleDur":2640,"labels":[{"name":"Segment","value":"aI"}]},{"id":34,"sampleStart":61680,"sampleDur":720,"labels":[{"name":"Segment","value":"b"}]},{"id":35,"sampleStart":62400,"sampleDur":720,"labels":[{"name":"Segment","value":"@"}]},{"id":36,"sampleStart":63120,"sampleDur":31440,"labels":[{"name":"Segment","value":"n"}]},{"id":37,"sampleStart":94560,"sampleDur":1200,"labels":[{"name":"Segment","value":"&p:"}]}]},{"name":"TT","type":"SEGMENT","items":[{"id":38,"sampleStart":30970,"sampleDur":1737,"labels":[{"name":"TT","value":"raise"}]},{"id":39,"sampleStart":32707,"sampleDur":2514,"labels":[{"name":"TT","value":"lower"}]}]},{"name":"TB","type":"SEGMENT","items":[{"id":40,"sampleStart":29609,"sampleDur":2695,"labels":[{"name":"TB","value":"raise"}]},{"id":41,"sampleStart":32304,"sampleDur":2028,"labels":[{"name":"TB","value":"lower"}]}]}],"links":[{"fromID":42,"toID":15},{"fromID":42,"toID":20}]} 
  
  var mockEpgdorsalJDR10 = {
      "name":"JDR10",
      "annotates":"0000_ses/JDR10_bndl/JDR10.wav",
      "sampleRate":16000,
      "levels":[{
        "name":"Word",
        "type":"ITEM",
        "items":[{
          "id":2,
          "labels":[{
            "name":"Word",
            "value":"rockinskiweg"
            },{
            "name":"Kommentar",
            "value":""
            }]
          }]
          },{
          "name":"Phonetic",
          "type":"SEGMENT",
          "items":[{
            "id":3,
            "sampleStart":87710,
            "sampleDur":929,
            "labels":[{
              "name":"Phonetic",
              "value":"O"
            }]
          },{
            "id":0,
            "sampleStart":88639,
            "sampleDur":1642,
            "labels":[{
              "name":"Phonetic",
              "value":"k"
            }]
          },{
            "id":1,
            "sampleStart":90281,
            "sampleDur":761,
            "labels":[{
              "name":"Phonetic",
              "value":"H"
            }]
          },{
            "id":4,
            "sampleStart":91042,
            "sampleDur":553,
            "labels":[{
              "name":"Phonetic",
              "value":"I"
            }]
          }]
        }],
        "links":[{
          "fromID":2,
          "toID":0
        },{
          "fromID":2,
          "toID":1
        },{
          "fromID":2,
          "toID":3
        },{
          "fromID":2,
          "toID":4
        }]
    };
    
 /**
   *
   */
  it('should set level data and max Element id', inject(function (LevelService) {
    // test on mockEpgdorsalJDR10
    LevelService.setData(mockEpgdorsalJDR10);
    expect(LevelService.data).toEqual(mockEpgdorsalJDR10); 
    expect(LevelService.maxElementID).toEqual(4); 
    
    // test on mockEmaProsody0024
    LevelService.setData(mockEmaProsody0024);
    expect(LevelService.maxElementID).toEqual(42); 
  }));    
    
 /**
   *
   */
  it('should raise max Element id', inject(function (LevelService) {
    // test on mockEpgdorsalJDR10
    LevelService.setData(mockEpgdorsalJDR10);
    LevelService.raiseId(1);
    expect(LevelService.maxElementID).toEqual(5);
    
    // test on mockEmaProsody0024
    LevelService.setData(mockEmaProsody0024);
    LevelService.raiseId(1);
    expect(LevelService.maxElementID).toEqual(43);
  })); 
      
 /**
   *
   */
  it('should lower max Element id', inject(function (LevelService) {
    // test on mockEpgdorsalJDR10
    LevelService.setData(mockEpgdorsalJDR10);
    LevelService.lowerId(1);
    expect(LevelService.maxElementID).toEqual(3); 
    
    // test on mockEmaProsody0024
    LevelService.setData(mockEmaProsody0024);
    LevelService.lowerId(1);
    expect(LevelService.maxElementID).toEqual(41);     
  })); 
        
 /**
   *
   */
  it('should return level details', inject(function (LevelService) {
    // test on mockEpgdorsalJDR10
    LevelService.setData(mockEpgdorsalJDR10);
    expect(LevelService.getLevelDetails('Phonetic').level.name).toEqual('Phonetic'); 
    expect(LevelService.getLevelDetails('Phonetic').level.type).toEqual('SEGMENT');
    expect(LevelService.getLevelDetails('Phonetic').level.items.length).toEqual(4); 

    // test on mockEmaProsody0024
    LevelService.setData(mockEmaProsody0024);
    expect(LevelService.getLevelDetails('TB').level.name).toEqual('TB'); 
    expect(LevelService.getLevelDetails('TB').level.type).toEqual('SEGMENT');
    expect(LevelService.getLevelDetails('TB').level.items.length).toEqual(2); 
  })); 
    
 /**
   *
   */
  it('should return element order by passing id', inject(function (LevelService) {
    // test on mockEpgdorsalJDR10
    LevelService.setData(mockEpgdorsalJDR10);
    expect(LevelService.getOrderById('Phonetic',3)).toEqual(0); 
    expect(LevelService.getOrderById('Phonetic',0)).toEqual(1); 
    expect(LevelService.getOrderById('Phonetic',1)).toEqual(2); 
    expect(LevelService.getOrderById('Phonetic',4)).toEqual(3); 

    // test on mockEmaProsody0024
    LevelService.setData(mockEmaProsody0024);
    expect(LevelService.getOrderById('TB',40)).toEqual(0); 
    expect(LevelService.getOrderById('TB',41)).toEqual(1); 
  }));  
      
 /**
   *
   */
  it('should return element id by passing order', inject(function (LevelService) {
    // test on mockEpgdorsalJDR10
    LevelService.setData(mockEpgdorsalJDR10);
    expect(LevelService.getIdByOrder('Phonetic',0)).toEqual(3); 
    expect(LevelService.getIdByOrder('Phonetic',1)).toEqual(0); 
    expect(LevelService.getIdByOrder('Phonetic',2)).toEqual(1); 
    expect(LevelService.getIdByOrder('Phonetic',3)).toEqual(4); 

    // test on mockEmaProsody0024
    LevelService.setData(mockEmaProsody0024);
    expect(LevelService.getIdByOrder('TB',0)).toEqual(40); 
    expect(LevelService.getIdByOrder('TB',1)).toEqual(41); 
  }));    
      
 /**
   *
   */
  it('should get element (segment) details by passing name and order', inject(function (LevelService) {
    // test on mockEpgdorsalJDR10
    LevelService.setData(mockEpgdorsalJDR10);
    expect(LevelService.getElementDetails('Phonetic',0).id).toEqual(3);
    expect(LevelService.getElementDetails('Phonetic',0).sampleStart).toEqual(87710); 
    expect(LevelService.getElementDetails('Phonetic',0).sampleDur).toEqual(929);
    expect(LevelService.getElementDetails('Phonetic',0).labels[0].name).toEqual('Phonetic');
    expect(LevelService.getElementDetails('Phonetic',0).labels[0].value).toEqual('O');
    

    // test on mockEmaProsody0024
    LevelService.setData(mockEmaProsody0024);
    expect(LevelService.getElementDetails('TB',0).id).toEqual(40); 
    expect(LevelService.getElementDetails('TB',0).sampleStart).toEqual(29609); 
    expect(LevelService.getElementDetails('TB',0).sampleDur).toEqual(2695);
    expect(LevelService.getElementDetails('TB',0).labels[0].name).toEqual('TB');
    expect(LevelService.getElementDetails('TB',0).labels[0].value).toEqual('raise');    
  }));    
      
 /**
   *
   */
  it('should get last element details by passing name', inject(function (LevelService) {
    // test on mockEpgdorsalJDR10
    LevelService.setData(mockEpgdorsalJDR10);
    expect(LevelService.getLastElement('Phonetic').id).toEqual(4);
    expect(LevelService.getLastElement('Phonetic').sampleStart).toEqual(91042); 
    expect(LevelService.getLastElement('Phonetic').sampleDur).toEqual(553);
    expect(LevelService.getLastElement('Phonetic').labels[0].name).toEqual('Phonetic');
    expect(LevelService.getLastElement('Phonetic').labels[0].value).toEqual('I');
    

    // test on mockEmaProsody0024
    LevelService.setData(mockEmaProsody0024);
    expect(LevelService.getLastElement('TB').id).toEqual(41); 
    expect(LevelService.getLastElement('TB').sampleStart).toEqual(32304); 
    expect(LevelService.getLastElement('TB').sampleDur).toEqual(2028);
    expect(LevelService.getLastElement('TB').labels[0].name).toEqual('TB');
    expect(LevelService.getLastElement('TB').labels[0].value).toEqual('lower');    
  }));  
      
 /**
   *
   */
  it('should get next element details by passing name and id', inject(function (LevelService) {
    // test on mockEpgdorsalJDR10
    LevelService.setData(mockEpgdorsalJDR10);
    expect(LevelService.getNextElement('Phonetic',1).id).toEqual(4);
    expect(LevelService.getNextElement('Phonetic',1).sampleStart).toEqual(91042); 
    expect(LevelService.getNextElement('Phonetic',1).sampleDur).toEqual(553);
    expect(LevelService.getNextElement('Phonetic',1).labels[0].name).toEqual('Phonetic');
    expect(LevelService.getNextElement('Phonetic',1).labels[0].value).toEqual('I');
    

    // test on mockEmaProsody0024
    LevelService.setData(mockEmaProsody0024);
    expect(LevelService.getNextElement('TB',40).id).toEqual(41); 
    expect(LevelService.getNextElement('TB',40).sampleStart).toEqual(32304); 
    expect(LevelService.getNextElement('TB',40).sampleDur).toEqual(2028);
    expect(LevelService.getNextElement('TB',40).labels[0].name).toEqual('TB');
    expect(LevelService.getNextElement('TB',40).labels[0].value).toEqual('lower');    
  })); 
      
 /**
   *
   */
  it('should get element details by passing name and id', inject(function (LevelService) {
    // test on mockEpgdorsalJDR10
    LevelService.setData(mockEpgdorsalJDR10);
    expect(LevelService.getElementDetailsById('Phonetic',3).id).toEqual(3);
    expect(LevelService.getElementDetailsById('Phonetic',3).sampleStart).toEqual(87710); 
    expect(LevelService.getElementDetailsById('Phonetic',3).sampleDur).toEqual(929);
    expect(LevelService.getElementDetailsById('Phonetic',3).labels[0].name).toEqual('Phonetic');
    expect(LevelService.getElementDetailsById('Phonetic',3).labels[0].value).toEqual('O');
    

    // test on mockEmaProsody0024
    LevelService.setData(mockEmaProsody0024);
    expect(LevelService.getElementDetailsById('TB',40).id).toEqual(40); 
    expect(LevelService.getElementDetailsById('TB',40).sampleStart).toEqual(29609); 
    expect(LevelService.getElementDetailsById('TB',40).sampleDur).toEqual(2695);
    expect(LevelService.getElementDetailsById('TB',40).labels[0].name).toEqual('TB');
    expect(LevelService.getElementDetailsById('TB',40).labels[0].value).toEqual('raise');    
  }));  

   /**
   *
   */
  it('should set and get lasteditAreaElem', inject(function (LevelService) {
    // test on mockEpgdorsalJDR10
    LevelService.setlasteditAreaElem('a');
    expect(LevelService.getlasteditAreaElem()).toEqual('a');   
  })); 
  
   /**
   *
   */
  it('should set and get lasteditArea', inject(function (LevelService) {
    // test on mockEpgdorsalJDR10
    LevelService.setlasteditArea('_1');
    expect(LevelService.getlasteditArea()).toEqual('_1');   
    expect(LevelService.getlastID()).toEqual('1');   
  })); 

   // todo openEditArea && deleteEditArea && createSelection && createEditArea 
   // --> maybe move to directive in order to make it testable   
      
 /**
   *
   */
  it('should insert a new element on level', inject(function (LevelService) {
    // test on mockEpgdorsalJDR10
    LevelService.setData(mockEpgdorsalJDR10);
    LevelService.insertElementDetails(5, 'Phonetic', 0, 'test', 87610, 100);
    expect(LevelService.getLevelDetails('Phonetic').level.items.length).toEqual(5); 
    expect(LevelService.getElementDetails('Phonetic',0).id).toEqual(5); 
    expect(LevelService.getElementDetails('Phonetic',0).sampleStart).toEqual(87610); 
    expect(LevelService.getElementDetails('Phonetic',0).sampleDur).toEqual(100);
    expect(LevelService.getElementDetails('Phonetic',0).labels[0].name).toEqual('Phonetic');
    expect(LevelService.getElementDetails('Phonetic',0).labels[0].value).toEqual('test');  
    // test on mockEmaProsody0024
    LevelService.setData(mockEmaProsody0024);
    LevelService.insertElementDetails(42, 'TB', 0, 'test', 29509, 100);
    expect(LevelService.getLevelDetails('TB').level.items.length).toEqual(3); 
    expect(LevelService.getElementDetails('TB',0).id).toEqual(42); 
    expect(LevelService.getElementDetails('TB',0).sampleStart).toEqual(29509); 
    expect(LevelService.getElementDetails('TB',0).sampleDur).toEqual(100);
    expect(LevelService.getElementDetails('TB',0).labels[0].name).toEqual('TB');
    expect(LevelService.getElementDetails('TB',0).labels[0].value).toEqual('test');      
  })); 
        
 /**
   *
   */
  it('should change element (segment) details on level based on name and id', inject(function (LevelService) {
    // test on mockEpgdorsalJDR10
    LevelService.setData(mockEpgdorsalJDR10);
    LevelService.setElementDetails('Phonetic', 3, 'test', 87700, 939);
    expect(LevelService.getElementDetails('Phonetic',0).id).toEqual(3);
    expect(LevelService.getElementDetails('Phonetic',0).sampleStart).toEqual(87700); 
    expect(LevelService.getElementDetails('Phonetic',0).sampleDur).toEqual(939);
    expect(LevelService.getElementDetails('Phonetic',0).labels[0].name).toEqual('Phonetic');
    expect(LevelService.getElementDetails('Phonetic',0).labels[0].value).toEqual('test');

    // test on mockEmaProsody0024
    LevelService.setData(mockEmaProsody0024);
    LevelService.setElementDetails('TB', 40, 'test', 29604, 2700);
    expect(LevelService.getElementDetails('TB',0).id).toEqual(40); 
    expect(LevelService.getElementDetails('TB',0).sampleStart).toEqual(29604); 
    expect(LevelService.getElementDetails('TB',0).sampleDur).toEqual(2700);
    expect(LevelService.getElementDetails('TB',0).labels[0].name).toEqual('TB');
    expect(LevelService.getElementDetails('TB',0).labels[0].value).toEqual('test');     
    }));  
        
 /**
   *
   */
  it('should change element (point) details on level based on name and id', inject(function (LevelService) {
    // test on mockaeMsajc003
    LevelService.setData(mockaeMsajc003);
    LevelService.setPointDetails('Tone', 181, 'test', 100);
    expect(LevelService.getElementDetails('Tone',0).id).toEqual(181);
    expect(LevelService.getElementDetails('Tone',0).samplePoint).toEqual(100); 
    expect(LevelService.getElementDetails('Tone',0).labels[0].name).toEqual('Tone');
    expect(LevelService.getElementDetails('Tone',0).labels[0].value).toEqual('test');  
    }));  
        
 /**
   *
   */
  it('should get element neightbour details', inject(function (LevelService) {
    // test on mockEpgdorsalJDR10
    // should return neighbours "O" and "I"
    LevelService.setData(mockEpgdorsalJDR10);
    var neigh = LevelService.getElementNeighbourDetails('Phonetic', 0, 1);   
    expect(neigh.left.id).toEqual(3);
    expect(neigh.right.id).toEqual(4);
    expect(neigh.left.labels[0].value).toEqual('O');
    expect(neigh.right.labels[0].value).toEqual('I');    
    
    // test on mockEmaProsody0024
    // should return neighbours undefined and "lower"
    LevelService.setData(mockEmaProsody0024);
    var neigh = LevelService.getElementNeighbourDetails('TB', 40, 40);
    expect(neigh.left).toEqual(undefined);
    expect(neigh.right.id).toEqual(41);
    expect(neigh.right.labels[0].value).toEqual('lower'); 
        
    // test on mockEmaProsody0024
    // should return neighbours "raise" and undefined
    LevelService.setData(mockEmaProsody0024);
    var neigh = LevelService.getElementNeighbourDetails('TB', 41, 41);
    expect(neigh.left.id).toEqual(40);
    expect(neigh.left.labels[0].value).toEqual('raise'); 
    expect(neigh.right).toEqual(undefined);
       
    // test on mockaeMsajc003
    // should return neighbours "V" and "l"
    LevelService.setData(mockaeMsajc003);
    var neigh = LevelService.getElementNeighbourDetails('Phonetic', 148, 179);
    expect(neigh.left.id).toEqual(147);
    expect(neigh.left.labels[0].value).toEqual('V'); 
    expect(neigh.right.id).toEqual(180);
    expect(neigh.right.labels[0].value).toEqual('l');     

    // test on mockaeMsajc003
    // should return neighbours undefined and undefined
    LevelService.setData(mockaeMsajc003);
    var neigh = LevelService.getElementNeighbourDetails('Phonetic', 147, 180);
    expect(neigh.left).toEqual(undefined);
    expect(neigh.right).toEqual(undefined);
    }));  
        
 /**
   *
   */
  it('should getEvent (surrounding details) at given pcm position', inject(function (LevelService, Soundhandlerservice) {
    // test on mockaeMsajc003
    LevelService.setData(mockaeMsajc003);
    // Soundhandlerservice.wavJSO.Data.length = 58089 
    // before any element nearest should be false
    expect(LevelService.getEvent(10, 'Phonetic', 58089).nearest).toEqual(false);
    // after any element nearest should be true
    expect(LevelService.getEvent(58088, 'Phonetic', 58089).nearest).toEqual(true);
    // in the middle nearest should be element
    // nearest left
    expect(LevelService.getEvent(20650, 'Phonetic', 58089).nearest.sampleStart).toEqual(20640);
    // nearest right
    expect(LevelService.getEvent(23900, 'Phonetic', 58089).nearest.sampleStart).toEqual(23920);
    // evtr should be actual element
    expect(LevelService.getEvent(20650, 'Phonetic', 58089).evtr.sampleStart).toEqual(20640);
    expect(LevelService.getEvent(23900, 'Phonetic', 58089).evtr.sampleStart).toEqual(20640);
    // before first -> evtr should be first element
    expect(LevelService.getEvent(10, 'Phonetic', 58089).evtr.sampleStart).toEqual(3750);
    // after last -> evtr should be first element
    expect(LevelService.getEvent(58088, 'Phonetic', 58089).evtr.sampleStart).toEqual(50126);
    
    // test on mockEmaProsody0024
    LevelService.setData(mockEmaProsody0024);
    // Soundhandlerservice.wavJSO.Data.length = 96002  
    // before any element nearest should be false
    expect(LevelService.getEvent(10, 'TT', 96002).nearest).toEqual(false);
    // after any element nearest should be true
    expect(LevelService.getEvent(96000, 'TT', 96002).nearest).toEqual(true);
    // in the middle nearest should be element
    // nearest left
    expect(LevelService.getEvent(30980, 'TT', 96002).nearest.sampleStart).toEqual(30970);
    // nearest right
    expect(LevelService.getEvent(32700, 'TT', 96002).nearest.sampleStart).toEqual(32707);
    // evtr should be actual element
    expect(LevelService.getEvent(30980, 'TT', 96002).evtr.sampleStart).toEqual(30970);
    expect(LevelService.getEvent(32700, 'TT', 96002).evtr.sampleStart).toEqual(30970);
    // before first -> evtr should be first element
    expect(LevelService.getEvent(10, 'TT', 96002).evtr.sampleStart).toEqual(30970);
    // after last -> evtr should be first element
    expect(LevelService.getEvent(96000, 'TT', 96002).evtr.sampleStart).toEqual(32707);
    
    //test on mockEpgdorsalJDR10
    LevelService.setData(mockEpgdorsalJDR10);
    // Soundhandlerservice.wavJSO.Data.length = 112000 
    // before any element nearest should be false
    expect(LevelService.getEvent(10, 'Phonetic', 112000).nearest).toEqual(false);
    // after any element nearest should be true
    expect(LevelService.getEvent(111998, 'Phonetic', 112000).nearest).toEqual(true);
    // in the middle nearest should be element
    // nearest left
    expect(LevelService.getEvent(87720, 'Phonetic', 112000).nearest.sampleStart).toEqual(87710);
    // nearest right
    expect(LevelService.getEvent(88630, 'Phonetic', 112000).nearest.sampleStart).toEqual(88639);
    // evtr should be actual element
    expect(LevelService.getEvent(87720, 'Phonetic', 112000).evtr.sampleStart).toEqual(87710);
    expect(LevelService.getEvent(88630, 'Phonetic', 112000).evtr.sampleStart).toEqual(87710);
    // before first -> evtr should be first element
    expect(LevelService.getEvent(10, 'Phonetic', 112000).evtr.sampleStart).toEqual(87710);
    // after last -> evtr should be first element
    expect(LevelService.getEvent(111998, 'Phonetic', 112000).evtr.sampleStart).toEqual(91042);        
    }));  
        
 /**
   *
   */
  it('should delete a level', inject(function (LevelService,ConfigProviderService) {
    // test on mockaeMsajc003
    ConfigProviderService.setVals(configProviderServiceData);
    LevelService.setData(mockaeMsajc003);
    expect(LevelService.data.levels.length).toEqual(9);
    LevelService.deleteLevel(0,0);
    expect(LevelService.data.levels.length).toEqual(8);
    
    // test on mockEmaProsody0024
    LevelService.setData(mockEmaProsody0024);
    expect(LevelService.data.levels.length).toEqual(4);
    LevelService.deleteLevel(2,0);
    expect(LevelService.data.levels.length).toEqual(3); 
        
    // test on mockEpgdorsalJDR10
    LevelService.setData(mockEpgdorsalJDR10);
    expect(LevelService.data.levels.length).toEqual(2);
    LevelService.deleteLevel(1,0);
    expect(LevelService.data.levels.length).toEqual(1);    
    })); 
          
 /**
   *
   */
  it('should add a level', inject(function (LevelService,ConfigProviderService) {
    // test on mockaeMsajc003
    ConfigProviderService.setVals(configProviderServiceData);
    LevelService.setData(mockaeMsajc003);
    expect(LevelService.data.levels.length).toEqual(9);
    LevelService.addLevel({"items":[{"id":150,"sampleStart":0,"sampleDur":90932,"labels":[{"name":"levelNr0","value":""}]}],"name":"levelNr0","type":"SEGMENT"} , 0, 0);
    expect(LevelService.data.levels.length).toEqual(10);
    expect(LevelService.data.levels[0].items[0].id).toEqual(150);
    
    // test on mockEmaProsody0024
    LevelService.setData(mockEmaProsody0024);
    expect(LevelService.data.levels.length).toEqual(4);
    LevelService.addLevel({"items":[{"id":151,"sampleStart":0,"sampleDur":90932,"labels":[{"name":"levelNr0","value":""}]}],"name":"levelNr0","type":"SEGMENT"} , 2, 0);
    expect(LevelService.data.levels.length).toEqual(5);
    expect(LevelService.data.levels[2].items[0].id).toEqual(151);
        
    // test on mockEpgdorsalJDR10
    LevelService.setData(mockEpgdorsalJDR10);
    expect(LevelService.data.levels.length).toEqual(2);
    LevelService.addLevel({"items":[{"id":152,"sampleStart":0,"sampleDur":90932,"labels":[{"name":"levelNr0","value":""}]}],"name":"levelNr0","type":"SEGMENT"} , 1, 0);
    expect(LevelService.data.levels.length).toEqual(3);
    expect(LevelService.data.levels[1].items[0].id).toEqual(152);
    })); 
          
 /**
   *
   */
  it('should rename an element', inject(function (LevelService,ConfigProviderService) {
    // test on mockaeMsajc003
    LevelService.setData(mockaeMsajc003);
    LevelService.renameLabel('Phonetic', 147, 'test');
    expect(LevelService.getElementDetailsById('Phonetic',147).labels[0].value).toEqual('test');
    
    // test on mockEmaProsody0024
    LevelService.setData(mockEmaProsody0024);
    LevelService.renameLabel('TB', 40, 'test');
    expect(LevelService.getElementDetailsById('TB',40).labels[0].value).toEqual('test');    
            
    // test on mockEpgdorsalJDR10
    LevelService.setData(mockEpgdorsalJDR10);
    LevelService.renameLabel('Phonetic', 3, 'test');
    expect(LevelService.getElementDetailsById('Phonetic',3).labels[0].value).toEqual('test');    
    }));  
          
 /**
   *
   */
  it('should rename a level', inject(function (LevelService,ConfigProviderService) {
    // test on mockaeMsajc003
    LevelService.setData(mockaeMsajc003);
    ConfigProviderService.setVals(configProviderServiceData);
    expect(LevelService.getLevelDetails('Phonetic').id).toEqual(6);
    LevelService.renameLevel('Phonetic', 'test', 0);
    expect(LevelService.getLevelDetails('test').id).toEqual(6);

    // test on mockEmaProsody0024
    LevelService.setData(mockEmaProsody0024);
    expect(LevelService.getLevelDetails('TB').id).toEqual(3);
    LevelService.renameLevel('TB', 'test', 0);
    expect(LevelService.getLevelDetails('test').id).toEqual(3); 
    
    // test on mockEpgdorsalJDR10
    LevelService.setData(mockEpgdorsalJDR10);
    expect(LevelService.getLevelDetails('Phonetic').id).toEqual(1);
    LevelService.renameLevel('Phonetic', 'test', 0);
    expect(LevelService.getLevelDetails('test').id).toEqual(1);      
    }));  
          
 /**
   *
   */
  it('should delete a segment', inject(function (LevelService,ConfigProviderService) {
    // test on mockaeMsajc003
    // 2 elements in the middle
    LevelService.setData(mockaeMsajc003);
    expect(LevelService.getLevelDetails('Phonetic').level.items.length).toEqual(34);     
    LevelService.deleteSegments('Phonetic', 148, 2);    
    expect(LevelService.getLevelDetails('Phonetic').level.items.length).toEqual(32);     
    expect(LevelService.getElementDetailsById('Phonetic',147).sampleDur).toEqual(3088);   //  <- (6838 - 3750)
    expect(LevelService.getElementDetailsById('Phonetic',150).sampleStart).toEqual(6838);     
    
    // test on mockEmaProsody0024
    // 1 elements on left side
    LevelService.setData(mockEmaProsody0024);
    expect(LevelService.getLevelDetails('Phonetic').level.items.length).toEqual(34);     
    LevelService.deleteSegments('Phonetic', 148, 2);    
    expect(LevelService.getLevelDetails('Phonetic').level.items.length).toEqual(32);     
    expect(LevelService.getElementDetailsById('Phonetic',147).sampleDur).toEqual(3088);   //  <- (6838 - 3750)
    expect(LevelService.getElementDetailsById('Phonetic',150).sampleStart).toEqual(6838);      
    }));       


});