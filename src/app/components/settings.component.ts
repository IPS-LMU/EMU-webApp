import * as angular from 'angular';
import { type } from 'jquery';

let SettingsComponent = {
    selector: "settings",
	template: /*html*/`
	<div class="emuwebapp-text">
		<div ng-if="$ctrl.ConfigProviderService.curDbConfig.linkDefinitions.length > 0">
		<h1>Hierarchy Settings</h1>

		<span>Show hierarchy path canvas: <input type="checkbox" ng-model="$ctrl.hierarchySettings.showHierarchyPathCanvas"></span>

		<h2>Visable Path</h2>
		<select 
		id="emuwebapp-selection" 
		name="emuwebapp-selection" 
		ng-model="$ctrl.hierarchySettings.paths.selected" 
		ng-options="value for value in $ctrl.hierarchySettings.paths.possibleAsStr"
		ng-change="$ctrl.getCurVisAttributes()"></select>
		
		<h2>Visable Attribute Definitions</h2>
		<div class="emuwebapp-nav-wrap" ng-repeat="(key, levelName) in $ctrl.StandardFuncsService.reverseCopy($ctrl.hierarchySettings.paths.possible[$ctrl.getSelHierarchyPathIdx()])">
		{{levelName}}: 
			<select 
			id="emuwebapp-selection" 
			name="emuwebapp-selection"
			ng-options="attrDef as attrDef for attrDef in $ctrl.ConfigProviderService.getAttrDefsNames(levelName)"
			ng-model="$ctrl.hierarchySettings.paths.curVisAttributeDefs[levelName]"
			>
			</select>
		</div>
		</div>
	<h1>Level Canvas Settings</h1>

	<span>Font scaling factor: <input type="range" ng-model="$ctrl.levelCanvasesFontScalingFactor" min="1" max="200"> {{$ctrl.levelCanvasesFontScalingFactor}}%</span>


    <h1>OSCI Settings</h1>
    <div>
        <h2>Current channel</h2>
        <select ng-model="$ctrl.osciChannel" ng-options="channel for channel in $ctrl.osciAvailableChannels"></select>
    </div>	
    <h1>SPEC Settings</h1>
    <div>
        <h2>View Range (Hz)</h2>
		From: <input type="text" 
		ng-keyup="$ctrl.checkSpectroSettings()" 
		ng-style="$ctrl.cssError(2,4)" 
		ng-model="$ctrl.modalVals.rangeFrom" 
		ng-focus="$ctrl.cursorInTextField();" 
		ng-blur="$ctrl.cursorOutOfTextField();"/>
		To: <input type="text" 
		ng-keyup="$ctrl.checkSpectroSettings()" 
		ng-style="$ctrl.cssError(1,3)" 
		ng-model="$ctrl.modalVals.rangeTo" 
		ng-focus="$ctrl.cursorInTextField();" 
		ng-blur="$ctrl.cursorOutOfTextField();"/><br />
        <div ng-show="$ctrl.htmlError(1)"><b style="color: #f00;">Error:</b> Upper Range is bigger then {{upperBoundary}}</div>
        <div ng-show="$ctrl.htmlError(2)"><b style="color: #f00;">Error:</b> Only positive Integers are allowed.</div>
        <div ng-show="$ctrl.htmlError(3)"><b style="color: #f00;">Error:</b> Only Integers allowed inside 'To'.</div>
        <div ng-show="$ctrl.htmlError(4)"><b style="color: #f00;">Error:</b> Only Integers allowed inside 'From'.</div>
    </div>
    <div>
        <h2>Window Size (seconds)</h2>
        <span>resulting number of samples <em>{{$ctrl.modalVals._windowSizeInSamples}}</em> zero-padded to <em>{{$ctrl.modalVals._fftN}} (min. = 512)</em></span>
		<input type="text" 
		ng-keyup="$ctrl.checkSpectroSettings()" 
		ng-style="$ctrl.cssError(6)" 
		ng-model="$ctrl.modalVals.windowSizeInSecs" 
		ng-change="$ctrl.calcWindowSizeVals()" 
		ng-focus="$ctrl.cursorInTextField();" 
		ng-blur="$ctrl.cursorOutOfTextField();"/> <br />
        <div ng-show="$ctrl.htmlError(6)"><b style="color: #f00;">Error:</b> Only Floats are allowed.</div>
    </div>
    <div>
        <h2>Dynamic Range for Maximum (dB)</h2>
		<input type="text" 
		ng-keyup="$ctrl.checkSpectroSettings()" 
		ng-style="$ctrl.cssError(5)" 
		ng-model="$ctrl.modalVals.dynamicRange" 
		ng-focus="$ctrl.cursorInTextField();" 
		ng-blur="$ctrl.cursorOutOfTextField();"/> <br />
        <div ng-show="$ctrl.htmlError(5)"><b style="color: #f00;">Error:</b> Only Integers are allowed.</div>
    </div>
    <div>
        <h2>Pre-emphasis filter factor</h2> 
        <span>resulting high pass filter function: <em>ŝ(k) = s(k)-{{$ctrl.modalVals.preEmphasisFilterFactor}}*s(k-1)</em></span>
		<input type="text" 
		ng-keyup="$ctrl.checkSpectroSettings()" 
		ng-style="$ctrl.cssError(7)" 
		ng-model="$ctrl.modalVals.preEmphasisFilterFactor" 
		ng-focus="$ctrl.cursorInTextField();" 
		ng-blur="$ctrl.cursorOutOfTextField();"/> <br />
        <div ng-show="$ctrl.htmlError(7)"><b style="color: #f00;">Error:</b> Only Floats are allowed.</div>
    </div>
    <div>
        <h2>Window Function</h2>
		<select id="selWindowInfo" 
		ng-model="$ctrl.selWindowInfo.name" 
		ng-options="opt for opt in $ctrl.windowOptions"></select>
    </div>
    <div>
        <h2>Invert</h2>
        <span>Invert colors of spectrogram: <input type="checkbox" ng-model="$ctrl.modalVals.invert"></span>
    </div>
    <div>
        <h2>Color Options</h2>
        <span>Draw spectrogram in heat map colors: <input type="checkbox" ng-model="$ctrl.modalVals.drawHeatMapColors"></span>
        <table class='emuwebapp-modalTable' ng-style="$ctrl.cssError(8)">
            <tr>
                <th></th>
                <th>red</th>
                <th>green</th>
                <th>blue</th>
                <th>resulting color</th>
            </tr>

            <tr>
                <td>First spectrogram color anchor:</td>
				<td>r: <input type="text" class="emuwebapp-rgbTextInput" 
				ng-keyup="$ctrl.checkSpectroSettings()"  
				ng-model="$ctrl.modalVals.heatMapColorAnchors[0][0]" 
				ng-focus="$ctrl.cursorInTextField();" 
				ng-blur="$ctrl.cursorOutOfTextField();"/></td>
				<td>g: <input type="text" class="emuwebapp-rgbTextInput"
				ng-keyup="$ctrl.checkSpectroSettings()" 
				ng-model="$ctrl.modalVals.heatMapColorAnchors[0][1]" 
				ng-focus="$ctrl.cursorInTextField();" 
				ng-blur="$ctrl.cursorOutOfTextField();"/></td>
				<td>b: <input type="text" class="emuwebapp-rgbTextInput"
				ng-keyup="$ctrl.checkSpectroSettings()" 
				ng-model="$ctrl.modalVals.heatMapColorAnchors[0][2]" 
				ng-focus="$ctrl.cursorInTextField();" 
				ng-blur="$ctrl.cursorOutOfTextField();"/></td>
                <td><div ng-style="$ctrl.ViewStateService.getColorOfAnchor($ctrl.modalVals.heatMapColorAnchors, 0);"></div></td>
            </tr>
            <tr>
                <td>Second spectrogram color anchor: </td>
				<td>r: <input  type="text" class="emuwebapp-rgbTextInput" 
				ng-keyup="$ctrl.checkSpectroSettings()" 
				ng-model="$ctrl.modalVals.heatMapColorAnchors[1][0]" 
				ng-focus="$ctrl.cursorInTextField();" 
				ng-blur="$ctrl.cursorOutOfTextField();"/></td>
				<td>g: <input  type="text" class="emuwebapp-rgbTextInput" 
				ng-keyup="$ctrl.checkSpectroSettings()" 
				ng-model="$ctrl.modalVals.heatMapColorAnchors[1][1]" 
				ng-focus="$ctrl.cursorInTextField();" 
				ng-blur="$ctrl.cursorOutOfTextField();"/></td>
				<td>b: <input  type="text" class="emuwebapp-rgbTextInput" 
				ng-keyup="$ctrl.checkSpectroSettings()" 
				ng-model="$ctrl.modalVals.heatMapColorAnchors[1][2]" 
				ng-focus="$ctrl.cursorInTextField();" 
				ng-blur="$ctrl.cursorOutOfTextField();"/></td>
                <td><div ng-style="$ctrl.ViewStateService.getColorOfAnchor($ctrl.modalVals.heatMapColorAnchors, 1);"></div></td>
            </tr>
            <tr>
                <td>Third spectrogram color anchor: </td>
				<td>r: <input  type="text" class="emuwebapp-rgbTextInput" 
				ng-keyup="$ctrl.checkSpectroSettings()" 
				ng-model="$ctrl.modalVals.heatMapColorAnchors[2][0]" 
				ng-focus="$ctrl.cursorInTextField();" 
				ng-blur="$ctrl.cursorOutOfTextField();"/></td>
				<td>g: <input  type="text" class="emuwebapp-rgbTextInput" 
				ng-keyup="$ctrl.checkSpectroSettings()" 
				ng-model="$ctrl.modalVals.heatMapColorAnchors[2][1]" 
				ng-focus="$ctrl.cursorInTextField();" 
				ng-blur="$ctrl.cursorOutOfTextField();"/></td>
				<td>b: <input  type="text" class="emuwebapp-rgbTextInput" 
				ng-keyup="$ctrl.checkSpectroSettings()" 
				ng-model="$ctrl.modalVals.heatMapColorAnchors[2][2]" 
				ng-focus="$ctrl.cursorInTextField();" 
				ng-blur="$ctrl.cursorOutOfTextField();"/></td>
                <td><div ng-style="$ctrl.ViewStateService.getColorOfAnchor($ctrl.modalVals.heatMapColorAnchors, 2);"></div></td>
            </tr>
        </table>
        <div ng-show="$ctrl.htmlError(8)"><b style="color: #f00;">Error:</b> Only Integers allowed.</div>
    </div>
</div>
<div class="emuwebapp-inline-modal-footer">
	<button class="emuwebapp-mini-btn" ng-click="$ctrl.reset()"><i class="material-icons">cancel</i>Cancel</button>
	<button id="emuwebapp-modal-save" class="emuwebapp-mini-btn" ng-click="$ctrl.saveSettings()"><i class="material-icons">save</i>Save</button>
</div>
`,
bindings: {},
controller: [
	'$scope', 
	'ModalService', 
	'ViewStateService', 
	'DataService', 
	'MathHelperService', 
	'SoundHandlerService', 
	'StandardFuncsService', 
	'HierarchyLayoutService', 
	'ConfigProviderService',
	class SettingsController{

	private $scope;
    private ModalService;
    private ViewStateService;
    private DataService;
    private MathHelperService;
    private SoundHandlerService;
	private StandardFuncsService;
	private HierarchyLayoutService;
	private ConfigProviderService;

    private windowOptions;
    private selWindowInfo;
    private errorID;
    private upperBoundary;

    private osciChannel;
    private osciAvailableChannels;

    private modalVals;

	private hierarchySettings;

	private levelCanvasesFontScalingFactor;

	// private attributeDefinitionClickCounter;

    constructor(
		$scope, 
		ModalService, 
		ViewStateService, 
		DataService, 
		MathHelperService, 
		SoundHandlerService, 
		StandardFuncsService, 
		HierarchyLayoutService, 
		ConfigProviderService
		){
		this.$scope = $scope;
		this.ModalService = ModalService;
        this.ViewStateService = ViewStateService;
        this.DataService = DataService;
        this.MathHelperService = MathHelperService;
		this.SoundHandlerService = SoundHandlerService;
		this.StandardFuncsService = StandardFuncsService;
		this.HierarchyLayoutService = HierarchyLayoutService;
		this.ConfigProviderService = ConfigProviderService;

        this.windowOptions = Object.keys(this.ViewStateService.getWindowFunctions());
		this.selWindowInfo = {};
		this.selWindowInfo.name = Object.keys(this.ViewStateService.getWindowFunctions())[this.ViewStateService.spectroSettings.window - 1];
		this.errorID = [];
		this.upperBoundary = '';

		this.osciChannel = this.ViewStateService.osciSettings.curChannel;
        
        if(typeof this.SoundHandlerService.audioBuffer.numberOfChannels === 'number'){ // testing if available for unit tests
			this.osciAvailableChannels = Array.from(Array(this.SoundHandlerService.audioBuffer.numberOfChannels).keys());
		}

		this.modalVals = {
			'rangeFrom': this.ViewStateService.spectroSettings.rangeFrom,
			'rangeTo': this.ViewStateService.spectroSettings.rangeTo,
			'dynamicRange': this.ViewStateService.spectroSettings.dynamicRange,
			'windowSizeInSecs': this.ViewStateService.spectroSettings.windowSizeInSecs,
			'window': this.ViewStateService.spectroSettings.window,
			'drawHeatMapColors': this.ViewStateService.spectroSettings.drawHeatMapColors,
			'preEmphasisFilterFactor': this.ViewStateService.spectroSettings.preEmphasisFilterFactor,
			'heatMapColorAnchors': this.ViewStateService.spectroSettings.heatMapColorAnchors,
			'_fftN': 512,
			'_windowSizeInSamples': this.SoundHandlerService.audioBuffer.sampleRate * this.ViewStateService.spectroSettings.windowSizeInSecs,
			'invert': this.ViewStateService.spectroSettings.invert
		};

		this.hierarchySettings = {
			paths: {
				possible: [],
				possibleAsStr: [],
				selected: '',
				curVisAttributeDefs: {}
			},
			showHierarchyPathCanvas: localStorage.getItem('showHierarchyPathCanvas') == 'true'
		}

		var pathInfo = this.HierarchyLayoutService.findAllNonPartialPaths();
		this.hierarchySettings.paths.possible = pathInfo.possible;
		this.hierarchySettings.paths.possibleAsStr = pathInfo.possibleAsStr;

		// select first possible path on load
		this.hierarchySettings.paths.selected = this.hierarchySettings.paths.possibleAsStr[ViewStateService.hierarchyState.curPathIdx];
		this.getCurVisAttributes();

		this.ViewStateService.hierarchyState.curNrOfPaths = this.hierarchySettings.paths.possibleAsStr.length;

		// counter to get update for EmuHierarchyComponent
		// this.attributeDefinitionClickCounter = 0;
		if(Number(localStorage.getItem('levelCanvasesFontScalingFactor')) === 0){
			this.levelCanvasesFontScalingFactor = 100;
		} else {
			this.levelCanvasesFontScalingFactor = Number(localStorage.getItem('levelCanvasesFontScalingFactor'));
		}

	}
	
	private getCurVisAttributes() {
		this.hierarchySettings.paths.curVisAttributeDefs = {};
		if(typeof this.hierarchySettings.paths.possible[this.getSelHierarchyPathIdx()] !== "undefined"){
			let curLevelNames = this.StandardFuncsService.reverseCopy(this.hierarchySettings.paths.possible[this.getSelHierarchyPathIdx()]);
			curLevelNames.forEach(ln => {
				this.hierarchySettings.paths.curVisAttributeDefs[ln] = this.ViewStateService.getCurAttrDef(ln);
			});
		}
	}

	private getSelHierarchyPathIdx () {
		var selIdx = this.hierarchySettings.paths.possibleAsStr.indexOf(this.hierarchySettings.paths.selected);
		return (selIdx);
	};

        /**
		 *
		 */
		private cursorInTextField () {
			this.ViewStateService.setEditing(true);
			this.ViewStateService.setcursorInTextField(true);
		};

		/**
		 *
		 */
		private cursorOutOfTextField () {
			this.ViewStateService.setEditing(false);
			this.ViewStateService.setcursorInTextField(false);
		};

		//////////////////////////
		// window size functions

		/**
		 *
		 */
		private calcWindowSizeInSamples () {
			this.modalVals._windowSizeInSamples = this.SoundHandlerService.audioBuffer.sampleRate * this.modalVals.windowSizeInSecs;
		};

		/**
		 *
		 */
		private calcFftN () {
			var fftN = this.MathHelperService.calcClosestPowerOf2Gt(this.modalVals._windowSizeInSamples);
			// fftN must be greater than 512 (leads to better resolution of spectrogram)
			if (fftN < 512) {
				fftN = 512;
			}
			this.modalVals._fftN = fftN;
		};

		/**
		 *
		 */
		private calcWindowSizeVals () {
			this.calcWindowSizeInSamples();
			this.calcFftN();
		};

		//
		////////////////////

		/**
		 *
		 */
		private reset () {
			this.errorID = [];
			this.modalVals = {
				'rangeFrom': this.ViewStateService.spectroSettings.rangeFrom,
				'rangeTo': this.ViewStateService.spectroSettings.rangeTo,
				'dynamicRange': this.ViewStateService.spectroSettings.dynamicRange,
				'windowSizeInSecs': this.ViewStateService.spectroSettings.windowSizeInSecs,
				'window': this.ViewStateService.spectroSettings.window,
				'drawHeatMapColors': this.ViewStateService.spectroSettings.drawHeatMapColors,
				'preEmphasisFilterFactor': this.ViewStateService.spectroSettings.preEmphasisFilterFactor,
				'heatMapColorAnchors': this.ViewStateService.spectroSettings.heatMapColorAnchors,
				'_fftN': 512,
				'_windowSizeInSamples': this.SoundHandlerService.audioBuffer.sampleRate * this.ViewStateService.spectroSettings.windowSizeInSecs,
				'invert': this.ViewStateService.spectroSettings.invert

			};
			this.ModalService.close();
		};

		/**
		 *
		 */
		private cssError (id, id2) {
			if (this.errorID[id]) {
				return {'background': '#f00'};
			}
			if (id2 !== undefined) {
				if (this.errorID[id2]) {
					return {'background': '#f00'};
				}
			}
		};

		/**
		 *
		 */
		private htmlError (id) {
			return this.errorID[id];
		};


		/**
		 *
		 */
		private saveSettings () {
			var error = false;
			this.errorID.forEach((entry) => {
				if (entry === true) {
					error = true;
				}
			});
			if (!error) {
				this.ViewStateService.setspectroSettings(
					this.modalVals.windowSizeInSecs, 
					this.modalVals.rangeFrom, 
					this.modalVals.rangeTo, 
					this.modalVals.dynamicRange, 
					this.selWindowInfo.name, 
					this.modalVals.drawHeatMapColors, 
					this.modalVals.preEmphasisFilterFactor, 
					this.modalVals.heatMapColorAnchors,
					this.modalVals.invert);
				this.ViewStateService.setOsciSettings(this.osciChannel);
				// save hierarchy settings to viewstate
				
				this.ViewStateService.hierarchyState.path = this.hierarchySettings.paths.possible[this.getSelHierarchyPathIdx()];
				this.ViewStateService.hierarchyState.curPathIdx = this.getSelHierarchyPathIdx();

				Object.keys(this.hierarchySettings.paths.curVisAttributeDefs).forEach(levelName => {
					this.ViewStateService.setCurAttrDef(
						levelName, 
						this.hierarchySettings.paths.curVisAttributeDefs[levelName],
						this.ConfigProviderService.getAttrDefsNames(levelName).indexOf(this.hierarchySettings.paths.curVisAttributeDefs[levelName]));
				});

				if(this.hierarchySettings.showHierarchyPathCanvas){
					localStorage.setItem('showHierarchyPathCanvas', 'true');
				} else {
					localStorage.setItem('showHierarchyPathCanvas', 'false');
				}

				localStorage.setItem('levelCanvasesFontScalingFactor', this.levelCanvasesFontScalingFactor);

				
				this.reset();
			}
		};

		/**
		 *
		 */
		private checkSpectroSettings () {
			if (this.modalVals.heatMapColorAnchors[0][0] % 1 !== 0 ||
				this.modalVals.heatMapColorAnchors[0][1] % 1 !== 0 ||
				this.modalVals.heatMapColorAnchors[0][2] % 1 !== 0 ||
				this.modalVals.heatMapColorAnchors[1][0] % 1 !== 0 ||
				this.modalVals.heatMapColorAnchors[1][1] % 1 !== 0 ||
				this.modalVals.heatMapColorAnchors[1][2] % 1 !== 0 ||
				this.modalVals.heatMapColorAnchors[2][0] % 1 !== 0 ||
				this.modalVals.heatMapColorAnchors[2][1] % 1 !== 0 ||
				this.modalVals.heatMapColorAnchors[2][2] % 1 !== 0) {
				this.errorID[8] = true;
			}
			else {
				this.errorID[8] = false;
			}
			if (isNaN(this.modalVals.preEmphasisFilterFactor * this.SoundHandlerService.audioBuffer.sampleRate)) {
				this.errorID[7] = true;
			}
			else {
				this.errorID[7] = false;
			}
			if (isNaN(this.SoundHandlerService.audioBuffer.sampleRate * this.modalVals.windowSizeInSecs)) {
				this.errorID[6] = true;
			}
			else {
				this.errorID[6] = false;
			}
			if (this.modalVals.dynamicRange % 1 !== 0) {
				this.errorID[5] = true;
			}
			else {
				this.errorID[5] = false;
			}
			if (this.modalVals.rangeFrom % 1 !== 0) {
				this.errorID[4] = true;
			}
			else {
				this.errorID[4] = false;
			}
			if (this.modalVals.rangeTo % 1 !== 0) {
				this.errorID[3] = true;
			}
			else {
				this.errorID[3] = false;
			}
			if (this.modalVals.rangeFrom < 0) {
				this.errorID[2] = true;
			}
			else {
				this.errorID[2] = false;
			}
			this.upperBoundary = this.DataService.data.sampleRate / 2;
			if (this.modalVals.rangeTo > this.upperBoundary) {
				this.errorID[1] = true;
			}
			else {
				this.errorID[1] = false;
			}
		};

}]

   
}

angular.module('emuwebApp')
.component(SettingsComponent.selector, SettingsComponent);
