import * as angular from 'angular';

import { HierarchyWorker } from '../workers/hierarchy.worker';
import styles from '../../styles/EMUwebAppDesign.scss';

let EmuWebAppComponent = {
    selector: "emuwebapp",
    template: /*html*/`
    <div
    class="emuwebapp-main" 
    id="MainCtrl">
        <!-- start: modal -->
        <modal></modal>
        <!-- end: modal -->
        <!-- start: hint -->
		<new-version-hint 
		ng-if="$ctrl.internalVars.showAboutHint"
		about-btn-overlay-click="$ctrl.aboutBtnClick()"
		></new-version-hint>
        <!-- end: hint -->
        <!-- start: left side menu bar -->
		<bundle-list-side-bar 
		ng-if="!$ctrl.ViewStateService.bundleListSideBarDisabled"
		open="$ctrl.ViewStateService.bundleListSideBarOpen">
		</bundle-list-side-bar>
        <!-- end: left side menu bar -->

        <!-- start: main window -->
        <div class="emuwebapp-window" id="mainWindow">
			<progress-bar 
			class="emuwebapp-progressBar"
			open="$ctrl.ViewStateService.somethingInProgress"
			txt="$ctrl.ViewStateService.somethingInProgressTxt"
			></progress-bar>
			
			<div class="printTitle">EMU-webApp : {{$ctrl.LoadedMetaDataService.getCurBndlName()}}</div>

            <!-- start: top menu bar -->
            <div class="emuwebapp-top-menu">
                <button class="emuwebapp-button-icon" 
                id="bundleListSideBarOpen" 
                ng-show="$ctrl.ConfigProviderService.vals.activeButtons.openMenu && !$ctrl.ViewStateService.bundleListSideBarDisabled"
                ng-click="$ctrl.ViewStateService.toggleBundleListSideBar($ctrl.styles.animation.period);" 
                style="float:left"><i class="material-icons">menu</i></button>

                <button class="emuwebapp-mini-btn left"
                ng-show="$ctrl.ConfigProviderService.vals.activeButtons.saveBundle && $ctrl.ViewStateService.bundleListSideBarDisabled"
                ng-click="$ctrl.DbObjLoadSaveService.saveBundle();"
                ng-style="$ctrl.getUnsavedChangesColor()"
                style="float:left"><i class="material-icons">save</i> Save</button>
                
                <button class="emuwebapp-mini-btn left" 
                ng-show="$ctrl.ConfigProviderService.vals.activeButtons.addLevelSeg" 
                ng-disabled="!$ctrl.ViewStateService.getPermission('addLevelSegBtnClick')" 
                ng-click="addLevelSegBtnClick();">add level (SEG.)</button>
                
                <button class="emuwebapp-mini-btn left" 
                ng-show="$ctrl.ConfigProviderService.vals.activeButtons.addLevelEvent" 
                ng-disabled="!$ctrl.ViewStateService.getPermission('addLevelPointBtnClick')" 
                ng-click="$ctrl.addLevelPointBtnClick();">add level (EVENT)</button>
                
                <button class="emuwebapp-mini-btn left" 
                ng-show="$ctrl.ConfigProviderService.vals.activeButtons.renameSelLevel" 
                ng-disabled="!$ctrl.ViewStateService.getPermission('renameSelLevelBtnClick')" 
                ng-click="$ctrl.renameSelLevelBtnClick();">rename sel. level</button>
                
                <button class="emuwebapp-mini-btn left" 
                id="downloadTextgrid" 
                ng-show="$ctrl.ConfigProviderService.vals.activeButtons.downloadTextGrid" 
                ng-disabled="!$ctrl.ViewStateService.getPermission('downloadTextGridBtnClick')" 
                ng-click="$ctrl.downloadTextGridBtnClick();"><i class="material-icons">save</i>TextGrid</button>
                
                <button class="emuwebapp-mini-btn left" 
                id="downloadAnnotation" 
                ng-show="$ctrl.ConfigProviderService.vals.activeButtons.downloadAnnotation" 
                ng-disabled="!$ctrl.ViewStateService.getPermission('downloadAnnotationBtnClick')" 
                ng-click="$ctrl.downloadAnnotationBtnClick();"><i class="material-icons">save</i>annotJSON</button>
                
                <button class="emuwebapp-mini-btn left" 
                id="spectSettingsBtn" 
                ng-show="$ctrl.ConfigProviderService.vals.activeButtons.specSettings" 
                ng-disabled="!$ctrl.ViewStateService.getPermission('spectSettingsChange')" 
                ng-click="$ctrl.settingsBtnClick();"><i class="material-icons">settings</i> settings</button>
                
                <div class="emuwebapp-nav-wrap" ng-show="$ctrl.ConfigProviderService.vals.activeButtons.openDemoDB">
                    <ul class="emuwebapp-dropdown-container">
                        <li class="left">
                            <button type="button" 
                            class="emuwebapp-mini-btn full" 
                            id="demoDB" 
                            ng-mouseover="$ctrl.dropdown = true" 
                            ng-mouseleave="$ctrl.dropdown = false" 
                            ng-click="$ctrl.dropdown = !$ctrl.dropdown" 
                            ng-disabled="!$ctrl.ViewStateService.getPermission('openDemoBtnDBclick')">open demo <span id="emuwebapp-dropdown-arrow"></span></button>
                            <ul class="emuwebapp-dropdown-menu" 
                            ng-mouseover="$ctrl.dropdown = true" 
                            ng-mouseleave="$ctrl.dropdown = false" 
                            ng-init="$ctrl.dropdown = false" 
                            ng-show="$ctrl.dropdown">
                                <li class="divider"></li>
                                <li 
                                ng-repeat="curDB in $ctrl.ConfigProviderService.vals.demoDBs" 
                                ng-click="$ctrl.openDemoDBbtnClick(curDB);" id="demo{{$index}}">{{curDB}}</li>
                            </ul>
                        </li>
                    </ul>
                </div>

                <button class="emuwebapp-mini-btn left" 
                ng-show="$ctrl.ConfigProviderService.vals.activeButtons.connect" 
                ng-disabled="!$ctrl.ViewStateService.getPermission('connectBtnClick')" 
                ng-click="$ctrl.connectBtnClick();"><i class="material-icons">input</i>{{connectBtnLabel}}</button>
                
                <button class="emuwebapp-mini-btn left" 
                id="showHierarchy" 
                ng-click="$ctrl.showHierarchyBtnClick();" 
                ng-disabled="!$ctrl.ViewStateService.getPermission('showHierarchyBtnClick')" 
                ng-show="$ctrl.ConfigProviderService.vals.activeButtons.showHierarchy"><i class="material-icons" style="transform: rotate(180deg)">details</i>hierarchy</button>
          
                <button class="emuwebapp-mini-btn left" 
                ng-show="$ctrl.ConfigProviderService.vals.activeButtons.search" 
                ng-disabled="!$ctrl.ViewStateService.getPermission('searchBtnClick')" 
                ng-click="$ctrl.searchBtnClick();"><i class="material-icons">search</i>search</button>
                
                <button class="emuwebapp-mini-btn left" 
                id="clear" 
                ng-show="$ctrl.ConfigProviderService.vals.activeButtons.clear" 
                ng-disabled="!$ctrl.ViewStateService.getPermission('clearBtnClick')" 
                ng-click="$ctrl.clearBtnClick();"><i class="material-icons">clear_all</i>clear</button>
                
                <button class="emuwebapp-button-icon" 
                id="aboutBtn" 
                style="float: right;" 
                ng-click="$ctrl.aboutBtnClick();"><img src="assets/EMU-webAppEmu.svg" class="_35px" /></button>
            </div>
            <!-- top menu bar end -->

            <!-- vertical split layout that contains top and bottom pane -->
            <div class="emuwebapp-canvas">
				<history-action-popup
				class="emuwebapp-history"
				history-action-txt="$ctrl.ViewStateService.historyActionTxt">
				</history-action-popup>
                <bg-splitter show-two-dim-cans="{{$ctrl.ConfigProviderService.vals.perspectives[$ctrl.ViewStateService.curPerspectiveIdx].twoDimCanvases.order.length > 0}}">
                    <bg-pane type="topPane" min-size="80" max-size="500">
                        <ul class="emuwebapp-timeline-flexcontainer">
                            <li class="emuwebapp-timeline-flexitem" ng-style="{'height': getEnlarge($index)}" ng-repeat="curTrack in $ctrl.ConfigProviderService.vals.perspectives[$ctrl.ViewStateService.curPerspectiveIdx].signalCanvases.order track by $index" ng-switch on="curTrack">
                                <osci 
                                ng-switch-when="OSCI" 
                                track-name="curTrack"
                                cur-channel="$ctrl.ViewStateService.osciSettings.curChannel"
                                last-update="$ctrl.ViewStateService.lastUpdate"
                                timeline-size="$ctrl.ViewStateService.timelineSize"
                                cur-perspective-idx="$ctrl.ViewStateService.curPerspectiveIdx"
                                play-head-current-sample="$ctrl.ViewStateService.playHeadAnimationInfos.curS"
                                moving-boundary-sample="$ctrl.ViewStateService.movingBoundarySample"
                                cur-mouse-x="$ctrl.ViewStateService.curMouseX"
                                moving-boundary="$ctrl.ViewStateService.movingBoundary"
                                view-port-sample-start="$ctrl.ViewStateService.curViewPort.sS"
                                view-port-sample-end="$ctrl.ViewStateService.curViewPort.eS"
                                view-port-select-start="$ctrl.ViewStateService.curViewPort.selectS"
                                view-port-select-end="$ctrl.ViewStateService.curViewPort.selectE"
                                cur-bndl="$ctrl.LoadedMetaDataService.getCurBndl()"
                                ></osci>
                                
                                <spectro 
                                ng-switch-when="SPEC" 
                                track-name="curTrack"
								window-size-in-secs="$ctrl.ViewStateService.spectroSettings.windowSizeInSecs"
								range-from="$ctrl.ViewStateService.spectroSettings.rangeFrom"
								range-to="$ctrl.ViewStateService.spectroSettings.rangeTo"
								dynamic-range="$ctrl.ViewStateService.spectroSettings.dynamicRange"
								window="$ctrl.ViewStateService.spectroSettings.window"
								draw-heat-map-colors="$ctrl.ViewStateService.spectroSettings.drawHeatMapColors"
								pre-emphasis-filter-factor="$ctrl.ViewStateService.spectroSettings.preEmphasisFilterFactor"
								heat-map-color-anchors="$ctrl.ViewStateService.spectroSettings.heatMapColorAnchors"
								invert="$ctrl.ViewStateService.spectroSettings.invert"
                                osci-settings="$ctrl.ViewStateService.osciSettings"
                                last-update="$ctrl.ViewStateService.lastUpdate"
                                moving-boundary-sample="$ctrl.ViewStateService.movingBoundarySample"
								cur-mouse-x="$ctrl.ViewStateService.curMouseX"
								cur-mouse-y="$ctrl.ViewStateService.curMouseY"
                                view-port-sample-start="$ctrl.ViewStateService.curViewPort.sS"
                                view-port-sample-end="$ctrl.ViewStateService.curViewPort.eS"
                                view-port-select-start="$ctrl.ViewStateService.curViewPort.selectS"
                                view-port-select-end="$ctrl.ViewStateService.curViewPort.selectE"
                                cur-bndl="$ctrl.LoadedMetaDataService.getCurBndl()"
                                ></spectro>
                                
                                <ssff-track 
                                ng-switch-default 
                                order="{{$index}}" 
								track-name="curTrack"
								cur-mouse-x="$ctrl.ViewStateService.curMouseX"
								cur-mouse-y="$ctrl.ViewStateService.curMouseY"
                                view-port-sample-start="$ctrl.ViewStateService.curViewPort.sS"
                                view-port-sample-end="$ctrl.ViewStateService.curViewPort.eS"
                                view-port-select-start="$ctrl.ViewStateService.curViewPort.selectS"
                                view-port-select-end="$ctrl.ViewStateService.curViewPort.selectE"
                                ></ssff-track>
                            </li>
                        </ul>
                    </bg-pane>
                    <bg-pane type="bottomPane" min-size="80">
                        <!-- ghost level div containing ul of ghost levels-->
                        <div style="margin-top: 25px;">
                            <hierarchy-path-canvas 
                            ng-if="$ctrl.ViewStateService.getPermission('zoom') && $ctrl.ConfigProviderService.curDbConfig.linkDefinitions.length > 0 && $ctrl.showHierarchyPathCanvas()"
                            annotation="$ctrl.DataService.getData()"
                            path="$ctrl.ViewStateService.hierarchyState.path"
                            view-port-sample-start="$ctrl.ViewStateService.curViewPort.sS"
                            view-port-sample-end="$ctrl.ViewStateService.curViewPort.eS"
                            view-port-select-start="$ctrl.ViewStateService.curViewPort.selectS"
                            view-port-select-end="$ctrl.ViewStateService.curViewPort.selectE"
                            cur-mouse-x="$ctrl.ViewStateService.curMouseX"
                            cur-click-level-name="$ctrl.ViewStateService.curClickLevelName"
                            moving-boundary-sample="$ctrl.ViewStateService.movingBoundarySample"
                            moving-boundary="$ctrl.ViewStateService.movingBoundary"
                            moves-away-from-last-save="$ctrl.HistoryService.movesAwayFromLastSave"
                            cur-perspective-idx="$ctrl.ViewStateService.curPerspectiveIdx"
                            cur-bndl="$ctrl.LoadedMetaDataService.getCurBndl()"
                            ></hierarchy-path-canvas>
                        </div>
                        <!-- level div containing ul of levels -->
                        <div ng-if="true" style="margin-top: 25px;">
                            <ul>
                                <li ng-repeat="levelName in $ctrl.ConfigProviderService.vals.perspectives[$ctrl.ViewStateService.curPerspectiveIdx].levelCanvases.order">
                                    <level 
                                    ng-if="$ctrl.LevelService.getLevelDetails(levelName)"
                                    level="$ctrl.LevelService.getLevelDetails(levelName)" 
                                    idx="$index" 
                                    view-port-sample-start="$ctrl.ViewStateService.curViewPort.sS"
                                    view-port-sample-end="$ctrl.ViewStateService.curViewPort.eS"
                                    view-port-select-start="$ctrl.ViewStateService.curViewPort.selectS"
                                    view-port-select-end="$ctrl.ViewStateService.curViewPort.selectE"
                                    cur-mouse-x="$ctrl.ViewStateService.curMouseX"
                                    cur-click-level-name="$ctrl.ViewStateService.curClickLevelName"
                                    moving-boundary-sample="$ctrl.ViewStateService.movingBoundarySample"
                                    moving-boundary="$ctrl.ViewStateService.movingBoundary",
                                    moves-away-from-last-save="$ctrl.HistoryService.movesAwayFromLastSave"
                                    cur-perspective-idx="$ctrl.ViewStateService.curPerspectiveIdx"
                                    cur-bndl="$ctrl.LoadedMetaDataService.getCurBndl()"
                                    ></level>
                                </li>
                            </ul>
                        </div>
                    </bg-pane>
                    <bg-pane type="emuwebapp-2d-map">
                        <ul>
                            <li ng-repeat="cur2dTrack in $ctrl.ConfigProviderService.vals.perspectives[$ctrl.ViewStateService.curPerspectiveIdx].twoDimCanvases.order" ng-switch on="cur2dTrack">
								<epg-grid-canvas 
								ng-switch-when="EPG"
								cur-mouse-pos-sample="$ctrl.ViewStateService.curMousePosSample"
								view-port-sample-start="$ctrl.ViewStateService.curViewPort.sS"
								view-port-sample-end="$ctrl.ViewStateService.curViewPort.eS"
								></epg-grid-canvas>
								<dots-canvas 
								ng-switch-when="DOTS"
								cur-bndl="$ctrl.LoadedMetaDataService.getCurBndl()"
								cur-perspective-idx="$ctrl.ViewStateService.curPerspectiveIdx"
								cur-perspective-idx="$ctrl.ViewStateService.curPerspectiveIdx"
								cur-mouse-pos-sample="$ctrl.ViewStateService.curMousePosSample"
								view-port-sample-start="$ctrl.ViewStateService.curViewPort.sS"
								view-port-sample-end="$ctrl.ViewStateService.curViewPort.eS"
								></dots-canvas>
                            </li>
                        </ul>
                    </bg-pane>
                </bg-splitter>
            </div>
            <!-- end: vertical split layout -->

            <!-- start: bottom menu bar -->
            <div class="emuwebapp-bottom-menu">
                <div>
                    <osci-overview class="preview" 
					id="preview"
					cur-channel="$ctrl.ViewStateService.osciSettings.curChannel"
					view-port-sample-start="$ctrl.ViewStateService.curViewPort.sS"
					view-port-sample-end="$ctrl.ViewStateService.curViewPort.eS"
					cur-bndl="$ctrl.LoadedMetaDataService.getCurBndl()"
					></osci-overview>
                </div>

                <button class="emuwebapp-mini-btn left"
                id="zoomInBtn" 
                ng-click="$ctrl.cmdZoomIn();" 
                ng-disabled="!$ctrl.ViewStateService.getPermission('zoom')"><i class="material-icons">expand_less</i>in</button>
                
                <button class="emuwebapp-mini-btn left"
                id="zoomOutBtn" 
                ng-click="$ctrl.cmdZoomOut();" 
                ng-disabled="!$ctrl.ViewStateService.getPermission('zoom')"><i class="material-icons">expand_more</i>out</button>
                
                <button class="emuwebapp-mini-btn left"
                id="zoomLeftBtn" 
                ng-click="$ctrl.cmdZoomLeft();" 
                ng-disabled="!$ctrl.ViewStateService.getPermission('zoom')"><i class="material-icons">chevron_left</i>left</button>
                
                <button class="emuwebapp-mini-btn left"
                id="zoomRightBtn" 
                ng-click="$ctrl.cmdZoomRight();" 
                ng-disabled="!$ctrl.ViewStateService.getPermission('zoom')"><i class="material-icons">chevron_right</i>right</button>
                
                <button class="emuwebapp-mini-btn left"
                id="zoomAllBtn" 
                ng-click="$ctrl.cmdZoomAll();" 
                ng-disabled="!$ctrl.ViewStateService.getPermission('zoom')"><i class="material-icons" style="transform: rotate(90deg)">unfold_less</i>all</button>

                <button class="emuwebapp-mini-btn left"
                id="zoomSelBtn" 
                ng-click="$ctrl.cmdZoomSel();" 
                ng-disabled="!$ctrl.ViewStateService.getPermission('zoom')"><i class="material-icons" style="transform: rotate(90deg)">unfold_more</i>selection</button>
                
                <button class="emuwebapp-mini-btn left"
                id="playViewBtn" 
                ng-show="$ctrl.ConfigProviderService.vals.restrictions.playback" 
                ng-click="$ctrl.cmdPlayView();" 
                ng-disabled="!$ctrl.ViewStateService.getPermission('playaudio')" ><i class="material-icons">play_arrow</i>in view</button>
                
                <button class="emuwebapp-mini-btn left"
                id="playSelBtn" 
                ng-show="$ctrl.ConfigProviderService.vals.restrictions.playback" 
                ng-click="$ctrl.cmdPlaySel();" 
                ng-disabled="!$ctrl.ViewStateService.getPermission('playaudio')"><i class="material-icons">play_circle_outline</i>selected</button>
                
                <button class="emuwebapp-mini-btn left"
                id="playAllBtn" 
                ng-show="$ctrl.ConfigProviderService.vals.restrictions.playback" 
                ng-click="$ctrl.cmdPlayAll();" 
                ng-disabled="!$ctrl.ViewStateService.getPermission('playaudio')"><i class="material-icons">play_circle_filled</i>entire file</button>
            </div>
            <!-- end: bottom menu bar -->

            <!-- start: large text input field -->
            <!--<large-text-field-input></large-text-field-input>-->

            <!-- start: perspectives menu bar (right) -->
			<perspectives-side-bar></perspectives-side-bar>
            <!-- end: perspectives menu bar (right) -->
        </div>
        <!-- end: main window -->
    </div>
    <!-- end: container EMU-webApp -->
    `,
    bindings: {
        audioGetUrl: '<',
        labelGetUrl: '<',
        labelType: '<'
    },
    controller: [
		'$scope',
		'$element',
		'$window',
		'$document',
		'$location',
		'$timeout',
		'ViewStateService',
		'HistoryService',
		'IoHandlerService',
		'SoundHandlerService',
		'ConfigProviderService',
		'FontScaleService',
		'SsffDataService',
		'LevelService',
		'TextGridParserService',
		'WavParserService',
		'DrawHelperService',
		'ValidationService',
		'AppcacheHandlerService',
		'LoadedMetaDataService',
		'DbObjLoadSaveService',
		'AppStateService',
		'DataService',
		'ModalService',
		'BrowserDetectorService',
		'HierarchyLayoutService',
		'HandleGlobalKeyStrokes',
		class EmuWebAppController{
        private $scope;
        private $element;
        private $window;
        private $document;
		private $location;
		private $timeout;
        private ViewStateService;
        private HistoryService;
        private IoHandlerService;
        private SoundHandlerService;
        private ConfigProviderService;
        private FontScaleService;
        private SsffDataService;
        private LevelService;
        private TextGridParserService;
        private WavParserService;
        private DrawHelperService;
        private ValidationService;
        private AppcacheHandlerService;
        private LoadedMetaDataService;
        private DbObjLoadSaveService;
        private AppStateService;
        private DataService;
        private ModalService;
        private BrowserDetectorService;
		private HierarchyLayoutService;
		private HandleGlobalKeyStrokes;

        // init vars
		private connectBtnLabel;
		private dbLoaded;
		private is2dCancasesHidden;
		private windowWidth;
		private internalVars;
        private dropdown;

		// private xTmp;
		// private yTmp;

        private _inited;

        constructor(
            $scope,
            $element,
            $window,
            $document,
			$location,
			$timeout,
            ViewStateService,
            HistoryService,
            IoHandlerService,
            SoundHandlerService,
            ConfigProviderService,
            FontScaleService,
            SsffDataService,
            LevelService,
            TextGridParserService,
            WavParserService,
            DrawHelperService,
            ValidationService,
            AppcacheHandlerService,
            LoadedMetaDataService,
            DbObjLoadSaveService,
            AppStateService,
            DataService,
            ModalService,
            BrowserDetectorService,
			HierarchyLayoutService,
			HandleGlobalKeyStrokes){
            
                this.$scope = $scope;
                this.$element = $element;
                this.$window = $window;
                this.$document = $document;
				this.$location = $location;
				this.$timeout = $timeout;
                this.ViewStateService = ViewStateService;
                this.HistoryService = HistoryService;
                this.IoHandlerService = IoHandlerService;
                this.SoundHandlerService = SoundHandlerService;
                this.ConfigProviderService = ConfigProviderService;
                this.FontScaleService = FontScaleService;
                this.SsffDataService = SsffDataService;
                this.LevelService = LevelService;
                this.TextGridParserService = TextGridParserService;
                this.WavParserService = WavParserService;
                this.DrawHelperService = DrawHelperService;
                this.ValidationService = ValidationService;
                this.AppcacheHandlerService = AppcacheHandlerService;
                this.LoadedMetaDataService = LoadedMetaDataService;
                this.DbObjLoadSaveService = DbObjLoadSaveService;
                this.AppStateService = AppStateService;
                this.DataService = DataService;
                this.ModalService = ModalService;
                this.BrowserDetectorService = BrowserDetectorService;
                this.HierarchyLayoutService = HierarchyLayoutService;
				this.HandleGlobalKeyStrokes = HandleGlobalKeyStrokes;

            	// init vars
		        this.connectBtnLabel = 'connect';
                // this.tmp = {};
                this.dbLoaded = false;
                this.is2dCancasesHidden = true;
                this.windowWidth = $window.outerWidth;
                this.internalVars = {};
                this.internalVars.showAboutHint = false;// this should probably be moved to ViewStateService

                // this.xTmp = 123;
                // this.yTmp = 321;
                // check for new version
                this.AppcacheHandlerService.checkForNewVersion();

            	// check if URL parameters are set -> if so set embedded flags! SIC this should probably be moved to loadFilesForEmbeddedApp
		        var searchObject = this.$location.search();
                if (searchObject.audioGetUrl && searchObject.labelGetUrl && searchObject.labelType) {
                    ConfigProviderService.embeddedVals.audioGetUrl = searchObject.audioGetUrl;
                    ConfigProviderService.embeddedVals.labelGetUrl = searchObject.labelGetUrl;
                    ConfigProviderService.embeddedVals.labelType = searchObject.labelType;
                    ConfigProviderService.embeddedVals.fromUrlParams = true;
                }
                if (searchObject.hasOwnProperty("disableBundleListSidebar")) {
                    this.ViewStateService.bundleListSideBarDisabled = true;
                }

                // call function on init
		        this.loadDefaultConfig();

				// bind keys
				this.HandleGlobalKeyStrokes.bindGlobalKeys();

        };

        $postLink = function(){
            ////////////////////////
            // Bindings
            this.$element.bind('mouseenter', () => {
                this.ViewStateService.mouseInEmuWebApp = true;

            });

            this.$element.bind('mouseleave', () => {
                this.ViewStateService.mouseInEmuWebApp = false;
            });
            
            // bind window resize event
            angular.element(this.$window).bind('resize', () => {
                this.LevelService.deleteEditArea();
                this.ViewStateService.setWindowWidth(this.$window.outerWidth);
                if (this.ViewStateService.hierarchyState.isShown()) {
                    ++this.ViewStateService.hierarchyState.resize;
				}
                this.$scope.$digest();
            });

            // bind shift/alt keyups for history
            angular.element(this.$window).bind('keyup', (e) => {
				if(typeof this.ConfigProviderService.vals.keyMappings !== 'undefined'){ // check if loaded
					if (e.keyCode === this.ConfigProviderService.vals.keyMappings.shift || e.keyCode === this.ConfigProviderService.vals.keyMappings.alt) {
						this.HistoryService.addCurChangeObjToUndoStack();
						this.$scope.$digest();
					}
				}
            });

            // Take care of preventing navigation out of app (only if something is loaded, not in embedded mode and not developing (auto connecting))
            window.onbeforeunload = () => {
                if (this.ConfigProviderService.embeddedVals.audioGetUrl === '' && 
                this.LoadedMetaDataService.getBundleList().length > 0 && 
                !this.ConfigProviderService.vals.main.autoConnect && 
                this.HistoryService.movesAwayFromLastSave > 0) {
                    return 'Do you really wish to leave/reload the EMU-webApp? All unsaved changes will be lost...';
                }
            };

            /////////////
            // listens

			// listen for connectionDisrupted event -> I don't like listens but in this case it might me the way to go...
			let _this = this;

            this.$scope.$on('connectionDisrupted', () => {
                _this.AppStateService.resetToInitState();
            });

            // listen for resetToInitState
            this.$scope.$on('resetToInitState', () => {
                _this.loadDefaultConfig();
            });
            
            this.$scope.$on('reloadToInitState', (event, data) => {
                _this.loadDefaultConfig();
                _this.ViewStateService.url = data.url;
                _this.ViewStateService.somethingInProgressTxt = 'Connecting to server...';
                _this.ViewStateService.somethingInProgress = true;
                _this.IoHandlerService.WebSocketHandlerService.initConnect(data.url).then((message) => {
                    if (message.type === 'error') {
                        _this.ModalService.open('views/error.html', 'Could not connect to websocket server: ' + data.url).then(() => {
                            _this.AppStateService.resetToInitState();
                        });
                    } else {
                        _this.handleConnectedToWSserver(data);
                    }
                }, (errMess) => {
                    _this.ModalService.open('views/error.html', 'Could not connect to websocket server: ' + JSON.stringify(errMess, null, 4)).then(() => {
                        _this.AppStateService.resetToInitState();
                    });
                });
            });
        };
        
        $onChanges = function (changes) {
            if(this._inited){
                //
                if(changes.audioGetUrl){
                    this.ConfigProviderService.embeddedVals.audioGetUrl = changes.audioGetUrl.currentValue;
                }
                //
                if(changes.labelGetUrl){
                    this.ConfigProviderService.embeddedVals.labelGetUrl = changes.labelGetUrl.currentValue;
                }
                //
                if(changes.labelType){
                    this.ConfigProviderService.embeddedVals.labelType = changes.labelGetUrl.currentValue;
                }
            }
        };
        
        $onInit = function() {
            this._inited = true;
        };

        /**
		 *
		 */
		private loadFilesForEmbeddedApp() {
            var searchObject = this.$location.search();
			if (searchObject.audioGetUrl || searchObject.bndlJsonGetUrl) {
				if(searchObject.audioGetUrl){
                    this.ConfigProviderService.embeddedVals.audioGetUrl = searchObject.audioGetUrl;
                    this.ConfigProviderService.vals.activeButtons.openDemoDB = false;
                    var promise = this.IoHandlerService.httpGetPath(
                    	this.ConfigProviderService.embeddedVals.audioGetUrl,
						'arraybuffer'
					);
				}else{
                    var promise = this.IoHandlerService.httpGetPath(searchObject.bndlJsonGetUrl, "application/json");
				}

				promise.then((data) => {
					this.ViewStateService.showDropZone = false;
					// set bundle name
					var tmp = this.ConfigProviderService.embeddedVals.audioGetUrl;
					this.LoadedMetaDataService.setCurBndlName(tmp.substr(0, tmp.lastIndexOf('.')).substr(tmp.lastIndexOf('/') + 1, tmp.length));

					//hide menu
					if (this.ViewStateService.getBundleListSideBarOpen()) {
						if(searchObject.saveToWindowParent !== "true"){
							this.ViewStateService.toggleBundleListSideBar(styles.animationPeriod);
						}
					}

					this.ViewStateService.somethingInProgressTxt = 'Loading DB config...';

					// test if DBconfigGetUrl is set if so use it
					var DBconfigGetUrl;
					if (searchObject.DBconfigGetUrl){
						DBconfigGetUrl = searchObject.DBconfigGetUrl;
					}else{
						DBconfigGetUrl = 'configFiles/embedded_emuwebappConfig.json';
					}
					
					// then get the DBconfigFile
					this.IoHandlerService.httpGetPath(DBconfigGetUrl).then(async (resp) => {
						// first element of perspectives is default perspective
						this.ViewStateService.curPerspectiveIdx = 0;
						this.ConfigProviderService.setVals(resp.data.EMUwebAppConfig);
						// validate emuwebappConfigSchema
						var validRes = this.ValidationService.validateJSO('emuwebappConfigSchema', this.ConfigProviderService.vals);
						if (validRes === true) {
							// turn of keybinding only on mouseover
							if (this.ConfigProviderService.embeddedVals.fromUrlParams) {
								this.ConfigProviderService.vals.main.catchMouseForKeyBinding = false;
							}

							this.ConfigProviderService.curDbConfig = resp.data;
							
							// validate DBconfigFileSchema!
							validRes = this.ValidationService.validateJSO('DBconfigFileSchema', this.ConfigProviderService.curDbConfig);
							
							if (validRes === true) {
								if(searchObject.saveToWindowParent === "true"){
									this.ConfigProviderService.vals.activeButtons.saveBundle = true;
								}
								var bndlList = [{'session': 'File(s)', 'name': 'from URL parameters'}];
								this.LoadedMetaDataService.setBundleList(bndlList);
								this.LoadedMetaDataService.setCurBndl(bndlList[0]);

								// set wav file
								this.ViewStateService.somethingInProgress = true;
								this.ViewStateService.somethingInProgressTxt = 'Parsing WAV file...';

								if(searchObject.audioGetUrl){
									this.WavParserService.parseWavAudioBuf(data.data).then((messWavParser) => {
										var audioBuffer = messWavParser;
										this.ViewStateService.curViewPort.sS = 0;
										this.ViewStateService.curViewPort.eS = audioBuffer.length;
										this.ViewStateService.resetSelect();
										this.SoundHandlerService.audioBuffer = audioBuffer;

										var respType;
										if(this.ConfigProviderService.embeddedVals.labelType === 'TEXTGRID'){
											respType = 'text';
										}else{
											// setting everything to text because the BAS webservices somehow respond with a
											// 200 (== successful response) but the data field is empty
											respType = 'text';
										}
										// get + parse file
										if(searchObject.labelGetUrl){
											this.IoHandlerService.httpGetPath(this.ConfigProviderService.embeddedVals.labelGetUrl, respType).then((data2) => {
												this.ViewStateService.somethingInProgressTxt = 'Parsing ' + this.ConfigProviderService.embeddedVals.labelType + ' file...';
												this.IoHandlerService.parseLabelFile(data2.data, this.ConfigProviderService.embeddedVals.labelGetUrl, 'embeddedTextGrid', this.ConfigProviderService.embeddedVals.labelType).then(async (parseMess) => {

													var annot = parseMess;
													this.DataService.setData(annot);

													// if no DBconfigGetUrl is given generate levelDefs and co. from annotation
													if (!searchObject.DBconfigGetUrl){

														var lNames = [];
														var levelDefs = [];
														for(var i = 0, len = annot.levels.length; i < len; i++){
															var l = annot.levels[i];
															lNames.push(l.name);
															var attrDefs = [];
															for(var j = 0, len2 = l.items[0].labels.length; j < len2; j++){
																attrDefs.push({
																	'name': l.items[0].labels[j].name,
																	'type': 'string'
																});
															}
															levelDefs.push({
																'name': l.name,
																'type': l.type,
																'attributeDefinitions': attrDefs
															})
														}

														this.ConfigProviderService.curDbConfig.levelDefinitions = levelDefs;
														this.ViewStateService.setCurLevelAttrDefs(this.ConfigProviderService.curDbConfig.levelDefinitions);
														// extract levels containing time to display as levelCanvases 
														let lNamesWithTime = [];

														levelDefs.forEach((ld) => {
															if(ld.type !== 'ITEM'){
																lNamesWithTime.push(ld.name)
															}
														})
														this.ConfigProviderService.vals.perspectives[this.ViewStateService.curPerspectiveIdx].levelCanvases.order = lNamesWithTime;

														let hierarchyWorker = await new HierarchyWorker();
														let linkDefs = await hierarchyWorker.guessLinkDefinitions(annot);
														this.ConfigProviderService.curDbConfig.linkDefinitions = linkDefs;
														this.ConfigProviderService.vals.activeButtons.showHierarchy = true;

													}

													this.ViewStateService.setCurLevelAttrDefs(this.ConfigProviderService.curDbConfig.levelDefinitions);

													this.ViewStateService.somethingInProgressTxt = 'Done!';
													this.ViewStateService.somethingInProgress = false;
													this.ViewStateService.setState('labeling');

												}, function (errMess) {
													this.ModalService.open('views/error.html', 'Error parsing wav file: ' + errMess.status.message);
												});

											}, function (errMess) {
												this.ModalService.open('views/error.html', 'Could not get label file: ' + this.ConfigProviderService.embeddedVals.labelGetUrl + ' ERROR ' + JSON.stringify(errMess.message, null, 4));
											});
										}else{
											// hide download + search buttons
											this.ConfigProviderService.vals.activeButtons.downloadAnnotation = false;
											this.ConfigProviderService.vals.activeButtons.downloadTextGrid = false;
											this.ConfigProviderService.vals.activeButtons.search = false;
											this.ViewStateService.somethingInProgressTxt = 'Done!';
											this.ViewStateService.somethingInProgress = false;
											this.ViewStateService.setState('labeling');
										}


									}, function (errMess) {
										this.ModalService.open('views/error.html', 'Error parsing wav file: ' + errMess.status.message);
									});
                                }else{
                                    this.DbObjLoadSaveService.loadBundle({name: 'fromURLparams'}, searchObject.bndlJsonGetUrl);
								}

							} else {
								this.ModalService.open('views/error.html', 'Error validating / checking DBconfig: ' + JSON.stringify(validRes, null, 4));
							}
						} else {
							this.ModalService.open('views/error.html', 'Error validating ConfigProviderService.vals (emuwebappConfig data) after applying changes of newly loaded config (most likely due to wrong entry...): ' + JSON.stringify(validRes, null, 4));
						}

					}, (errMess) => {
						this.ModalService.open('views/error.html', 'Could not get embedded_config.json: ' + errMess);
					});
				}, (errMess) => {
					this.ModalService.open('views/error.html', 'Could not get audio file:' + this.ConfigProviderService.embeddedVals.audioGetUrl + ' ERROR: ' + JSON.stringify(errMess, null, 4));
				});
			}
		};

		/**
		 * init load of config files
		 */
		private loadDefaultConfig() {
			this.ViewStateService.somethingInProgress = true;
			this.ViewStateService.somethingInProgressTxt = 'Loading schema files';
			// load schemas first
			this.ValidationService.loadSchemas().then((replies) => {
				this.ValidationService.setSchemas(replies);
				this.IoHandlerService.httpGetDefaultConfig().then((response) => {
					this.ViewStateService.somethingInProgressTxt = 'Validating emuwebappConfig';
					var validRes = this.ValidationService.validateJSO('emuwebappConfigSchema', response.data);
					if (validRes === true) {
						this.ConfigProviderService.setVals(response.data);
						angular.copy(this.ConfigProviderService.vals, this.ConfigProviderService.initDbConfig);
						this.handleDefaultConfigLoaded();
						// loadFilesForEmbeddedApp if these are set
						this.loadFilesForEmbeddedApp();
						this.checkIfToShowWelcomeModal();
						// FOR DEVELOPMENT
						// $scope.aboutBtnClick();
						// this.openDemoDBbtnClick("ema");
						this.ViewStateService.somethingInProgress = false;
					} else {
						this.ModalService.open('views/error.html', 'Error validating / checking emuwebappConfigSchema: ' + JSON.stringify(validRes, null, 4)).then(() => {
							this.AppStateService.resetToInitState();
						});
					}

				}, (response) => { // onError
					this.ModalService.open('views/error.html', 'Could not get defaultConfig for EMU-webApp: ' + ' status: ' + response.status + ' headers: ' + response.headers + ' config ' + response.config).then(() => {
						this.AppStateService.resetToInitState();
					});
				});

			}, (errMess) => {
				this.ModalService.open('views/error.html', 'Error loading schema file: ' + JSON.stringify(errMess, null, 4)).then(() => {
					this.AppStateService.resetToInitState();
				});
			});
		};

		private checkIfToShowWelcomeModal() {
			var curVal = localStorage.getItem('haveShownWelcomeModal');
            var searchObject = this.$location.search();

			if (!this.BrowserDetectorService.isBrowser.PhantomJS() && curVal === null && typeof searchObject.viewer_pane !== 'undefined') {
				localStorage.setItem('haveShownWelcomeModal', 'true');
				this.internalVars.showAboutHint = true;
			}

			// FOR DEVELOPMENT
			// this.internalVars.showAboutHint = true;
			// set timerout
			if(this.internalVars.showAboutHint){
				this.$timeout(() => {
					this.internalVars.showAboutHint = false;
				}, 3000)
			}

		};

		private getCurBndlName() {
			return this.LoadedMetaDataService.getCurBndlName();
		};

		/**
		 * function called after default config was loaded
		 */
		private handleDefaultConfigLoaded() {

			if (!this.ViewStateService.getBundleListSideBarOpen()) {
				this.ViewStateService.toggleBundleListSideBar(styles.animationPeriod);
			}
			// check if either autoConnect is set in DBconfig or as get parameter
			var searchObject = this.$location.search();

			if (this.ConfigProviderService.vals.main.autoConnect || searchObject.autoConnect === 'true') {
				if (typeof searchObject.serverUrl !== 'undefined') { // overwrite serverUrl if set as GET parameter
					this.ConfigProviderService.vals.main.serverUrl = searchObject.serverUrl;
				}
				if(searchObject.comMode !== "GITLAB"){
					// sic IoHandlerService.WebSocketHandlerService is private!
					this.IoHandlerService.WebSocketHandlerService.initConnect(this.ConfigProviderService.vals.main.serverUrl).then((message) => {
						if (message.type === 'error') {
							this.ModalService.open('views/error.html', 'Could not connect to websocket server: ' + this.ConfigProviderService.vals.main.serverUrl).then(() => {
							this.AppStateService.resetToInitState();
						});
						} else {
							this.handleConnectedToWSserver({session: null, reload: null});
						}
					}, function (errMess) {
						this.ModalService.open('views/error.html', 'Could not connect to websocket server: ' + JSON.stringify(errMess, null, 4)).then(() => {
							this.AppStateService.resetToInitState();
						});
					});
				} else {
					// set comMode and pretend we are connected to server
					// the IoHandlerService will take care of the rest
					this.ConfigProviderService.vals.main.comMode = "GITLAB";
					this.handleConnectedToWSserver({session: null, reload: null});
				}
			}

			// setspectroSettings
			this.ViewStateService.setspectroSettings(this.ConfigProviderService.vals.spectrogramSettings.windowSizeInSecs,
				this.ConfigProviderService.vals.spectrogramSettings.rangeFrom,
				this.ConfigProviderService.vals.spectrogramSettings.rangeTo,
				this.ConfigProviderService.vals.spectrogramSettings.dynamicRange,
				this.ConfigProviderService.vals.spectrogramSettings.window,
				this.ConfigProviderService.vals.spectrogramSettings.drawHeatMapColors,
				this.ConfigProviderService.vals.spectrogramSettings.preEmphasisFilterFactor,
				this.ConfigProviderService.vals.spectrogramSettings.heatMapColorAnchors,
				this.ConfigProviderService.vals.spectrogramSettings.invert);

			// setting transition values
			this.ViewStateService.setTransitionTime(styles.animationPeriod);
		};

		/**
		 * function is called after websocket connection
		 * has been established. It executes the protocol
		 * and loads the first bundle in the bundle list (= default behavior).
		 */
		private handleConnectedToWSserver(data) {
			// hide drop zone
			var session = data.session;
			var reload = data.reload;
            this.ViewStateService.showDropZone = false;
            var searchObject = this.$location.search();
			if(searchObject.comMode !== "GITLAB"){
				this.ConfigProviderService.vals.main.comMode = 'WS';
			}
			this.ConfigProviderService.vals.activeButtons.openDemoDB = false;
			this.ViewStateService.somethingInProgress = true;
			this.ViewStateService.somethingInProgressTxt = 'Checking protocol...';
			// Check if server speaks the same protocol
			this.IoHandlerService.getProtocol().then((res) => {
				if (res.protocol === 'EMU-webApp-websocket-protocol' && res.version === '0.0.2') {
					this.ViewStateService.somethingInProgressTxt = 'Checking user management...';
					// then ask if server does user management
					this.IoHandlerService.getDoUserManagement().then((doUsrData) => {
						if (doUsrData === 'NO') {
							this.innerHandleConnectedToWSserver({session: session, reload: reload});
						} else {
							// show user management error
							this.ModalService.open('views/loginModal.html').then((res) => {
								if (res) {
									this.innerHandleConnectedToWSserver({session: session, reload: reload});
								} else {
									this.AppStateService.resetToInitState();
								}
							});
						}
					});
					
				} else {
					// show protocol error and disconnect from server
					this.ModalService.open('views/error.html', 'Could not connect to websocket server: ' + this.ConfigProviderService.vals.main.serverUrl + '. It does not speak the same protocol as this client. Its protocol answer was: "' + res.protocol + '" with the version: "' + res.version + '"').then(() => {
						this.AppStateService.resetToInitState();
					});
				}
			});
		};

		/**
		 * to avoid redundant code...
		 */
		private innerHandleConnectedToWSserver(data) {
			var session = data.session;
			var reload = data.reload;
			this.ViewStateService.somethingInProgressTxt = 'Loading DB config...';
			// then get the DBconfigFile
			this.IoHandlerService.getDBconfigFile().then((data) => {
				// first element of perspectives is default perspective
				this.ViewStateService.curPerspectiveIdx = 0;
				this.ConfigProviderService.setVals(data.EMUwebAppConfig);				
				
				var validRes = this.ValidationService.validateJSO('emuwebappConfigSchema', this.ConfigProviderService.vals);
				if (validRes === true) {
					this.ConfigProviderService.curDbConfig = data;
					this.ViewStateService.setCurLevelAttrDefs(this.ConfigProviderService.curDbConfig.levelDefinitions);
					// setspectroSettings
					this.ViewStateService.setspectroSettings(this.ConfigProviderService.vals.spectrogramSettings.windowSizeInSecs,
						this.ConfigProviderService.vals.spectrogramSettings.rangeFrom,
						this.ConfigProviderService.vals.spectrogramSettings.rangeTo,
						this.ConfigProviderService.vals.spectrogramSettings.dynamicRange,
						this.ConfigProviderService.vals.spectrogramSettings.window,
						this.ConfigProviderService.vals.spectrogramSettings.drawHeatMapColors,
						this.ConfigProviderService.vals.spectrogramSettings.preEmphasisFilterFactor,
						this.ConfigProviderService.vals.spectrogramSettings.heatMapColorAnchors,
						this.ConfigProviderService.vals.spectrogramSettings.invert);
					// set first path as default
					this.ViewStateService.setHierarchySettings(this.HierarchyLayoutService.findAllNonPartialPaths().possible[0]);
					
					validRes = this.ValidationService.validateJSO('DBconfigFileSchema', data);
					if (validRes === true) {
						// then get the DBconfigFile
						this.ViewStateService.somethingInProgressTxt = 'Loading bundle list...';
						this.IoHandlerService.getBundleList().then((bdata) => {
							validRes = this.LoadedMetaDataService.setBundleList(bdata);
							// show standard buttons
							this.ConfigProviderService.vals.activeButtons.clear = true;
							this.ConfigProviderService.vals.activeButtons.specSettings = true;
							
							if (validRes === true) {
								// then load first bundle in list
								if(session === null) {
									session = this.LoadedMetaDataService.getBundleList()[0];
								}
								this.DbObjLoadSaveService.loadBundle(session).then(() => {
									// FOR DEVELOPMENT:
									// DbObjLoadSaveService.saveBundle(); // for testing save function
									// $scope.menuBundleSaveBtnClick(); // for testing save button
									// $scope.showHierarchyBtnClick(); // for devel of showHierarchy modal
									// $scope.settingsBtnClick(); // for testing spect settings dial
									// $scope.searchBtnClick();
									// ViewStateService.curViewPort.sS = 27455;
									// ViewStateService.curViewPort.eS = 30180;

								});

								//ViewStateService.currentPage = (ViewStateService.numberOfPages(LoadedMetaDataService.getBundleList().length)) - 1;
								if(reload) {
									this.LoadedMetaDataService.openCollapseSession(session.session);
								}
							} else {
								this.ModalService.open('views/error.html', 'Error validating bundleList: ' + JSON.stringify(validRes, null, 4)).then(() => {
									this.AppStateService.resetToInitState();
								});
							}
						});

					} else {
						this.ModalService.open('views/error.html', 'Error validating / checking DBconfig: ' + JSON.stringify(validRes, null, 4)).then(() => {
							this.AppStateService.resetToInitState();
						});
					}

				} else {
					this.ModalService.open('views/error.html', 'Error validating ConfigProviderService.vals (emuwebappConfig data) after applying changes of newly loaded config (most likely due to wrong entry...): ' + JSON.stringify(validRes, null, 4)).then(() => {
						this.AppStateService.resetToInitState();
					});
				}
			});
		};

		/**
		 *
		 */
		// private toggleCollapseSession(ses) {
		// 	this.uniqSessionList[ses].collapsed = !this.uniqSessionList[ses].collapsed;
		// };

		/**
		 *
		 */
		private getEnlarge(index) {
			var len = this.ConfigProviderService.vals.perspectives[this.ViewStateService.curPerspectiveIdx].signalCanvases.order.length;
			var large = 50;
			if (this.ViewStateService.getenlarge() === -1) {
				return 'auto';
			} else {
				if (len === 1) {
					return 'auto';
				}
				if (len === 2) {
					if (this.ViewStateService.getenlarge() === index) {
						return '70%';
					} else {
						return '27%';
					}
				} else {
					if (this.ViewStateService.getenlarge() === index) {
						return large + '%';
					} else {
						return (95 - large) / (len - 1) + '%';
					}
				}
			}
		};


		/**
		 *
		 */
		private cursorInTextField() {
			this.ViewStateService.setcursorInTextField(true);
		};

		/**
		 *
		 */
		private cursorOutOfTextField() {
			this.ViewStateService.setcursorInTextField(false);
		};

		private getUnsavedChangesColor() {
			if (this.HistoryService.movesAwayFromLastSave !== 0) {
				return {
					'background-color': '#f00',
					'color': 'white'
				};
			}
		}

		/////////////////////////////////////////
		// handle button clicks

		// top menu:
		/**
		 *
		 */
		private addLevelSegBtnClick() {
			if (this.ViewStateService.getPermission('addLevelSegBtnClick')) {
				var length = 0;
				if (this.DataService.data.levels !== undefined) {
					length = this.DataService.data.levels.length;
				}
				var newName = 'levelNr' + length;
				var level = {
					items: [],
					name: newName,
					type: 'SEGMENT'
				};

				if (this.ViewStateService.getCurAttrDef(newName) === undefined) {
					var leveldef = {
						'name': newName,
						'type': 'EVENT',
						'attributeDefinitions': {
							'name': newName,
							'type': 'string'
						}
					};
					this.ViewStateService.setCurLevelAttrDefs(leveldef);
				}
				this.LevelService.insertLevel(level, length, this.ViewStateService.curPerspectiveIdx);
				//  Add to history
				this.HistoryService.addObjToUndoStack({
					'type': 'ANNOT',
					'action': 'INSERTLEVEL',
					'level': level,
					'id': length,
					'curPerspectiveIdx': this.ViewStateService.curPerspectiveIdx
				});
				this.ViewStateService.selectLevel(false, this.ConfigProviderService.vals.perspectives[this.ViewStateService.curPerspectiveIdx].levelCanvases.order, this.LevelService); // pass in LevelService to prevent circular deps
			}
		};

		/**
		 *
		 */
		private addLevelPointBtnClick () {

			if (this.ViewStateService.getPermission('addLevelPointBtnClick')) {
				var length = 0;
				if (this.DataService.data.levels !== undefined) {
					length = this.DataService.data.levels.length;
				}
				var newName = 'levelNr' + length;
				var level = {
					items: [],
					name: newName,
					type: 'EVENT'
				};
				if (this.ViewStateService.getCurAttrDef(newName) === undefined) {
					var leveldef = {
						name: newName,
						type: 'EVENT',
						attributeDefinitions: {
							name: newName,
							type: 'string'
						}
					};
					this.ViewStateService.setCurLevelAttrDefs(leveldef);
				}
				this.LevelService.insertLevel(level, length, this.ViewStateService.curPerspectiveIdx);
				//  Add to history
				this.HistoryService.addObjToUndoStack({
					'type': 'ANNOT',
					'action': 'INSERTLEVEL',
					'level': level,
					'id': length,
					'curPerspectiveIdx': this.ViewStateService.curPerspectiveIdx
				});
				this.ViewStateService.selectLevel(false, this.ConfigProviderService.vals.perspectives[this.ViewStateService.curPerspectiveIdx].levelCanvases.order, this.LevelService); // pass in LevelService to prevent circular deps
			}
		};

		/**
		 *
		 */
		private renameSelLevelBtnClick() {
			if (this.ViewStateService.getPermission('renameSelLevelBtnClick')) {
				if (this.ViewStateService.getcurClickLevelName() !== undefined) {
					this.ModalService.open('views/renameLevel.html', this.ViewStateService.getcurClickLevelName());
				} else {
					this.ModalService.open('views/error.html', 'Rename Error : Please choose a Level first !');
				}
			}
		};

		/**
		 *
		 */
		private downloadTextGridBtnClick() {
			if (this.ViewStateService.getPermission('downloadTextGridBtnClick')) {
				this.TextGridParserService.asyncToTextGrid().then((parseMess) => {
					parseMess = parseMess.replace(/\t/g, '    '); // replace all tabs with 4 spaces
					this.ModalService.open('views/export.html', this.LoadedMetaDataService.getCurBndl().name + '.TextGrid', parseMess);
				});
			}
		};

		/**
		 *
		 */
		private downloadAnnotationBtnClick() {
			if (this.ViewStateService.getPermission('downloadAnnotationBtnClick')) {
				if(this.ValidationService.validateJSO('emuwebappConfigSchema', this.DataService.getData())) {
					this.ModalService.open('views/export.html', this.LoadedMetaDataService.getCurBndl().name + '_annot.json', angular.toJson(this.DataService.getData(), true));
				}
			}
		};

		/**
		 *
		 */
		private settingsBtnClick() {
			if (this.ViewStateService.getPermission('spectSettingsChange')) {
				this.ModalService.open('views/settingsModal.html');
			}
		};

		/**
		 *
		 */
		private connectBtnClick() {
			if (this.ViewStateService.getPermission('connectBtnClick')) {
				this.ModalService.open('views/connectModal.html').then((url) => {
					if (url) {
						this.ViewStateService.somethingInProgressTxt = 'Connecting to server...';
						this.ViewStateService.somethingInProgress = true;
						this.ViewStateService.url = url;
						// SIC IoHandlerService.WebSocketHandlerService is private
						this.IoHandlerService.WebSocketHandlerService.initConnect(url).then((message) => {
							if (message.type === 'error') {
								this.ModalService.open('views/error.html', 'Could not connect to websocket server: ' + url).then(() => {
									this.AppStateService.resetToInitState();
								});
							} else {
								this.handleConnectedToWSserver({session: null, reload: null});
							}
						}, function (errMess) {
							this.ModalService.open('views/error.html', 'Could not connect to websocket server: ' + JSON.stringify(errMess, null, 4)).then(() => {
								this.AppStateService.resetToInitState();
							});
						});
					}
				});
			} else {

			}
		};

		/**
		 *
		 */
		private openDemoDBbtnClick(nameOfDB) {
			if (this.ViewStateService.getPermission('openDemoBtnDBclick')) {
				this.dropdown = false;
				this.ConfigProviderService.vals.activeButtons.openDemoDB = false;
				this.LoadedMetaDataService.setDemoDbName(nameOfDB);
				// hide drop zone
				this.ViewStateService.showDropZone = false;

				this.ViewStateService.somethingInProgress = true;
				// alert(nameOfDB);
				this.ViewStateService.setState('loadingSaving');
				this.ConfigProviderService.vals.main.comMode = 'DEMO';
				this.ViewStateService.somethingInProgressTxt = 'Loading DB config...';

				this.IoHandlerService.getDBconfigFile(nameOfDB).then((res) => {
					var data = res.data;
					// first element of perspectives is default perspective
					this.ViewStateService.curPerspectiveIdx = 0;
					this.ConfigProviderService.setVals(data.EMUwebAppConfig);

					var validRes = this.ValidationService.validateJSO('emuwebappConfigSchema', this.ConfigProviderService.vals);
					if (validRes === true) {
						this.ConfigProviderService.curDbConfig = data;
						this.ViewStateService.setCurLevelAttrDefs(this.ConfigProviderService.curDbConfig.levelDefinitions);
						validRes = this.ValidationService.validateJSO('DBconfigFileSchema', this.ConfigProviderService.curDbConfig);

						if (validRes === true) {
							// then get the DBconfigFile
							this.ViewStateService.somethingInProgressTxt = 'Loading bundle list...';

							this.IoHandlerService.getBundleList(nameOfDB).then((res) => {
								var bdata = res.data;
								// validRes = ValidationService.validateJSO('bundleListSchema', bdata);
								// if (validRes === true) {
								this.LoadedMetaDataService.setBundleList(bdata);
								// show standard buttons
								this.ConfigProviderService.vals.activeButtons.clear = true;
								this.ConfigProviderService.vals.activeButtons.specSettings = true;

								// then load first bundle in list
								this.DbObjLoadSaveService.loadBundle(this.LoadedMetaDataService.getBundleList()[0]);

							}, function (err) {
								this.ModalService.open('views/error.html', 'Error loading bundle list of ' + nameOfDB + ': ' + err.data + ' STATUS: ' + err.status).then(() => {
									this.AppStateService.resetToInitState();
								});
							});
						} else {
							this.ModalService.open('views/error.html', 'Error validating / checking DBconfig: ' + JSON.stringify(validRes, null, 4)).then(() => {
								this.AppStateService.resetToInitState();
							});
						}


					} else {
						this.ModalService.open('views/error.html', 'Error validating ConfigProviderService.vals (emuwebappConfig data) after applying changes of newly loaded config (most likely due to wrong entry...): ' + JSON.stringify(validRes, null, 4)).then(() => {
							this.AppStateService.resetToInitState();
						});
					}

				}, (err) => {
					this.ModalService.open('views/error.html', 'Error loading DB config of ' + nameOfDB + ': ' + err.data + ' STATUS: ' + err.status).then(() => {
						this.AppStateService.resetToInitState();
					});
				});
			}
		};

		/**
		 *
		 */
		private aboutBtnClick () {
			if (this.ViewStateService.getPermission('aboutBtnClick')) {
				this.ModalService.open('views/help.html');
			}
		};

		/**
		 *
		 */
		private showHierarchyBtnClick () {
			if (!this.ViewStateService.hierarchyState.isShown()) {
				this.ViewStateService.hierarchyState.toggleHierarchy();
				this.ModalService.open('views/showHierarchyModal.html');
			}
		};


		/**
		 *
		 */
		private searchBtnClick () {
			if (this.ViewStateService.getPermission('searchBtnClick')) {
				this.ModalService.open('views/searchAnnot.html');
			}
		};


		/**
		 *
		 */
		private clearBtnClick () {
			// ViewStateService.setdragBarActive(false);
			var modalText;
			if ((this.HistoryService.movesAwayFromLastSave !== 0 && this.ConfigProviderService.vals.main.comMode !== 'DEMO')) {
				modalText = 'Do you wish to clear all loaded data and if connected disconnect from the server? CAUTION: YOU HAVE UNSAVED CHANGES! These will be lost if you confirm.';
			} else {
				modalText = 'Do you wish to clear all loaded data and if connected disconnect from the server? You have NO unsaved changes so no changes will be lost.';
			}
			this.ModalService.open('views/confirmModal.html', modalText).then((res) => {
				if (res) {
					this.AppStateService.resetToInitState();
				}
			});
		};

		// bottom menu:

		/**
		 *
		 */
		private cmdZoomAll () {
			if (this.ViewStateService.getPermission('zoom')) {
				this.LevelService.deleteEditArea();
				this.ViewStateService.setViewPort(0, this.SoundHandlerService.audioBuffer.length);
			} else {
				//console.log('action currently not allowed');
			}
		};

		/**
		 *
		 */
		private cmdZoomIn () {
			if (this.ViewStateService.getPermission('zoom')) {
				this.LevelService.deleteEditArea();
				this.ViewStateService.zoomViewPort(true);
			} else {
				//console.log('action currently not allowed');
			}
		};

		/**
		 *
		 */
		private cmdZoomOut () {
			if (this.ViewStateService.getPermission('zoom')) {
				this.LevelService.deleteEditArea();
				this.ViewStateService.zoomViewPort(false);
			} else {
				//console.log('action currently not allowed');
			}
		};

		/**
		 *
		 */
		private cmdZoomLeft () {
			if (this.ViewStateService.getPermission('zoom')) {
				this.LevelService.deleteEditArea();
				this.ViewStateService.shiftViewPort(false);
			} else {
				//console.log('action currently not allowed');
			}
		};

		/**
		 *
		 */
		private cmdZoomRight () {
			if (this.ViewStateService.getPermission('zoom')) {
				this.LevelService.deleteEditArea();
				this.ViewStateService.shiftViewPort(true);
			} else {
				//console.log('action currently not allowed');
			}
		};

		/**
		 *
		 */
		private cmdZoomSel () {
			if (this.ViewStateService.getPermission('zoom')) {
				this.LevelService.deleteEditArea();
				this.ViewStateService.setViewPort(this.ViewStateService.curViewPort.selectS, this.ViewStateService.curViewPort.selectE);
			} else {
				//console.log('action currently not allowed');
			}
		};

		/**
		 *
		 */
		private cmdPlayView () {
			if (this.ViewStateService.getPermission('playaudio')) {
				this.SoundHandlerService.playFromTo(this.ViewStateService.curViewPort.sS, this.ViewStateService.curViewPort.eS);
				this.ViewStateService.animatePlayHead(this.ViewStateService.curViewPort.sS, this.ViewStateService.curViewPort.eS);
			} else {
				//console.log('action currently not allowed');
			}
		};

		/**
		 *
		 */
		private cmdPlaySel () {
			if (this.ViewStateService.getPermission('playaudio')) {
				this.SoundHandlerService.playFromTo(this.ViewStateService.curViewPort.selectS, this.ViewStateService.curViewPort.selectE);
				this.ViewStateService.animatePlayHead(this.ViewStateService.curViewPort.selectS, this.ViewStateService.curViewPort.selectE);
			} else {
				//console.log('action currently not allowed');
			}
		};

		/**
		 *
		 */
		private cmdPlayAll () {
			if (this.ViewStateService.getPermission('playaudio')) {
				this.SoundHandlerService.playFromTo(0, this.SoundHandlerService.audioBuffer.length);
				this.ViewStateService.animatePlayHead(0, this.SoundHandlerService.audioBuffer.length);
			} else {
				//console.log('action currently not allowed');
			}
		};

		///////////////////////////
		// other

		// private tmp () {
		// 	console.log("tmp btn click");
		// 	this.xTmp = this.xTmp + 1;
		// 	this.yTmp = this.yTmp + 1;
		// };
        
        // private getTmp(){
		// 	return angular.copy(this.xTmp)
		// };

		private showHierarchyPathCanvas (){
			return(localStorage.getItem('showHierarchyPathCanvas') == 'true')
		};

    }]

}

angular.module('emuwebApp')
.component(EmuWebAppComponent.selector, EmuWebAppComponent);
