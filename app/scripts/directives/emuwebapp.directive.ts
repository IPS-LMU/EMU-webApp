import * as angular from 'angular';

angular.module('emuwebApp')
	.directive('emuwebapp', function (ViewStateService, ConfigProviderService) {
		return {
			template: `
			<div ng-controller="EmuWebAppController" 
			class="emuwebapp-main" 
			id="MainCtrl" 
			handleglobalkeystrokes>
				<!-- start: modal -->
				<modal></modal>
				<!-- end: modal -->
				<!-- start: hint -->
				<hint ng-if="internalVars.showAboutHint"></hint>
				<!-- end: hint -->
				<!-- start: left side menu bar -->
				<bundle-list-side-bar ng-show="vs.bundleListSideBarOpen"></bundle-list-side-bar>
				<!-- end: left side menu bar -->

				<!-- start: main window -->
				<div class="emuwebapp-window" id="mainWindow">
					<progress-thing show-thing="{{vs.somethingInProgress}}"></progress-thing>
					<div class="printTitle">EMU-webApp : {{lmds.getCurBndlName()}}</div>

					<!-- start: top menu bar -->
					<div class="emuwebapp-top-menu">
						<button class="emuwebapp-button-icon" 
						id="bundleListSideBarOpen" 
						ng-show="cps.vals.activeButtons.openMenu" 
						ng-click="vs.toggleBundleListSideBar(cps.design.animation.period);" 
						style="float:left"><i class="material-icons">menu</i></button>
						
						<button class="emuwebapp-mini-btn left" 
						ng-show="cps.vals.activeButtons.addLevelSeg" 
						ng-disabled="!vs.getPermission('addLevelSegBtnClick')" 
						ng-click="addLevelSegBtnClick();">add level (SEG.)</button>
						
						<button class="emuwebapp-mini-btn left" 
						ng-show="cps.vals.activeButtons.addLevelEvent" 
						ng-disabled="!vs.getPermission('addLevelPointBtnClick')" 
						ng-click="addLevelPointBtnClick();">add level (EVENT)</button>
						
						<button class="emuwebapp-mini-btn left" 
						ng-show="cps.vals.activeButtons.renameSelLevel" 
						ng-disabled="!vs.getPermission('renameSelLevelBtnClick')" 
						ng-click="renameSelLevelBtnClick();">rename sel. level</button>
						
						<button class="emuwebapp-mini-btn left" 
						id="downloadTextgrid" 
						ng-show="cps.vals.activeButtons.downloadTextGrid" 
						ng-disabled="!vs.getPermission('downloadTextGridBtnClick')" 
						ng-click="downloadTextGridBtnClick();"><i class="material-icons">save</i>download TextGrid</button>
						
						<button class="emuwebapp-mini-btn left" 
						id="downloadAnnotation" 
						ng-show="cps.vals.activeButtons.downloadAnnotation" 
						ng-disabled="!vs.getPermission('downloadAnnotationBtnClick')" 
						ng-click="downloadAnnotationBtnClick();"><i class="material-icons">save</i>download annotJSON</button>
						
						<button class="emuwebapp-mini-btn left" 
						id="spectSettingsBtn" 
						ng-show="cps.vals.activeButtons.specSettings" 
						ng-disabled="!vs.getPermission('spectSettingsChange')" 
						ng-click="settingsBtnClick();"><i class="material-icons">settings</i> settings</button>
						
						<div class="emuwebapp-nav-wrap" ng-show="cps.vals.activeButtons.openDemoDB">
							<ul class="emuwebapp-dropdown-container">
								<li class="left">
									<button type="button" 
									class="emuwebapp-mini-btn full" 
									id="demoDB" 
									ng-mouseover="dropdown = true" 
									ng-mouseleave="dropdown = false" 
									ng-click="dropdown = !dropdown" 
									ng-disabled="!vs.getPermission('openDemoBtnDBclick')">open demo <span id="emuwebapp-dropdown-arrow"></span></button>
									<ul class="emuwebapp-dropdown-menu" 
									ng-mouseover="dropdown = true" 
									ng-mouseleave="dropdown = false" 
									ng-init="dropdown = false" 
									ng-show="dropdown">
										<li class="divider"></li>
										<li ng-repeat="curDB in cps.vals.demoDBs" ng-click="openDemoDBbtnClick(curDB);" id="demo{{$index}}">{{curDB}}</li>
									</ul>
								</li>
							</ul>
						</div>

						<button class="emuwebapp-mini-btn left" 
						ng-show="cps.vals.activeButtons.connect" 
						ng-disabled="!vs.getPermission('connectBtnClick')" 
						ng-click="connectBtnClick();"><i class="material-icons">input</i>{{connectBtnLabel}}</button>
						
						<button class="emuwebapp-mini-btn left" 
						id="showHierarchy" 
						ng-click="showHierarchyBtnClick();" 
						ng-disabled="!vs.getPermission('showHierarchyBtnClick')" 
						ng-show="cps.vals.activeButtons.showHierarchy"><i class="material-icons" style="transform: rotate(180deg)">details</i>hierarchy</button>
						
						<button class="emuwebapp-mini-btn left" 
						id="showeditDB" 
						ng-click="showEditDBconfigBtnClick();" 
						ng-disabled="!vs.getPermission('editDBconfigBtnClick')" 
						ng-show="cps.vals.activeButtons.editEMUwebAppConfig">edit config</button>
						
						<button class="emuwebapp-mini-btn left" 
						ng-show="cps.vals.activeButtons.search" 
						ng-disabled="!vs.getPermission('searchBtnClick')" 
						ng-click="searchBtnClick();"><i class="material-icons">search</i>search</button>
						
						<button class="emuwebapp-mini-btn left" 
						id="clear" 
						ng-show="cps.vals.activeButtons.clear" 
						ng-disabled="!vs.getPermission('clearBtnClick')" 
						ng-click="clearBtnClick();"><i class="material-icons">clear_all</i>clear</button>
						
						<button class="emuwebapp-button-icon" 
						id="aboutBtn" 
						style="float: right;" 
						ng-click="aboutBtnClick();"><img src="assets/EMU-webAppEmu.svg" class="_35px" /></button>
					</div>
					<!-- top menu bar end -->

					<!-- vertical split layout that contains top and bottom pane -->
					<div class="emuwebapp-canvas">
						<bg-splitter show-two-dim-cans="{{cps.vals.perspectives[vs.curPerspectiveIdx].twoDimCanvases.order.length > 0}}">
							<bg-pane type="topPane" min-size="80" max-size="500">
								<ul class="emuwebapp-timeline-flexcontainer">
									<li class="emuwebapp-timeline-flexitem" ng-style="{'height': getEnlarge($index)}" ng-repeat="curTrack in cps.vals.perspectives[vs.curPerspectiveIdx].signalCanvases.order track by $index" ng-switch on="curTrack">
										<osci 
										ng-switch-when="OSCI" 
										track-name="curTrack"
										cur-channel="vs.osciSettings.curChannel"
										last-update="vs.lastUpdate"
										timeline-size="vs.timelineSize"
										cur-perspective-idx="vs.curPerspectiveIdx"
										play-head-current-sample="vs.playHeadAnimationInfos.curS"
										moving-boundary-sample="vs.movingBoundarySample"
										cur-mouse-x="vs.curMouseX"
										moving-boundary="vs.movingBoundary"
										view-port-sample-start="vs.curViewPort.sS"
										view-port-sample-end="vs.curViewPort.eS"
										view-port-select-start="vs.curViewPort.selectS"
										view-port-select-end="vs.curViewPort.selectE"
										cur-bndl="lmds.getCurBndl()"
										></osci>
										
										<spectro 
										ng-switch-when="SPEC" 
										track-name="curTrack"
										spectro-settings="vs.spectroSettings"
										osci-settings="vs.osciSettings"
										last-update="vs.lastUpdate"
										moving-boundary-sample="vs.movingBoundarySample"
										cur-mouse-x="vs.curMouseX"
										view-port-sample-start="vs.curViewPort.sS"
										view-port-sample-end="vs.curViewPort.eS"
										view-port-select-start="vs.curViewPort.selectS"
										view-port-select-end="vs.curViewPort.selectE"
										cur-bndl="lmds.getCurBndl()"
										></spectro>
										
										<ssff-track 
										ng-switch-default 
										order="{{$index}}" 
										track-name="{{curTrack}}"
										></ssff-track>
									</li>
								</ul>
							</bg-pane>
							<bg-pane type="bottomPane" min-size="80">
								<!-- ghost level div containing ul of ghost levels-->
								<div ng-if="cps.vals.perspectives[vs.curPerspectiveIdx].hierarchyPathCanvases" style="margin-top: 25px;">
									<hierarchy-path-canvas 
									ng-show="showHierarchyPathCanvas()"
									annotation="dataServ.getData()"
									path="vs.hierarchyState.path"
									view-port-sample-start="vs.curViewPort.sS"
									view-port-sample-end="vs.curViewPort.eS"
									view-port-select-start="vs.curViewPort.selectS"
									view-port-select-end="vs.curViewPort.selectE"
									cur-mouse-x="vs.curMouseX"
									cur-click-level-name="vs.curClickLevelName"
									moving-boundary-sample="vs.movingBoundarySample"
									moving-boundary="vs.movingBoundary"
									moves-away-from-last-save="hists.movesAwayFromLastSave"
									cur-perspective-idx="vs.curPerspectiveIdx"
									cur-bndl="lmds.getCurBndl()"
									></hierarchy-path-canvas>
								</div>
								<!-- level div containing ul of levels -->
								<div ng-if="true" style="margin-top: 25px;">
									<ul>
										<li ng-repeat="levelName in cps.vals.perspectives[vs.curPerspectiveIdx].levelCanvases.order">
											<level 
											ng-if="levServ.getLevelDetails(levelName)"
											level="levServ.getLevelDetails(levelName)" 
											idx="$index" 
											view-port-sample-start="vs.curViewPort.sS"
											view-port-sample-end="vs.curViewPort.eS"
											view-port-select-start="vs.curViewPort.selectS"
											view-port-select-end="vs.curViewPort.selectE"
											cur-mouse-x="vs.curMouseX"
											cur-click-level-name="vs.curClickLevelName"
											moving-boundary-sample="vs.movingBoundarySample"
											moving-boundary="vs.movingBoundary",
											moves-away-from-last-save="hists.movesAwayFromLastSave"
											cur-perspective-idx="vs.curPerspectiveIdx"
											cur-bndl="lmds.getCurBndl()"
											></level>
										</li>
									</ul>
								</div>
							</bg-pane>
							<bg-pane type="emuwebapp-2d-map">
								<ul>
									<li ng-repeat="cur2dTrack in cps.vals.perspectives[vs.curPerspectiveIdx].twoDimCanvases.order" ng-switch on="cur2dTrack">
										<epg ng-switch-when="EPG"></epg>
										<dots ng-switch-when="DOTS"></dots>
									</li>
								</ul>
							</bg-pane>
						</bg-splitter>
						<history-action-popup></history-action-popup>
					</div>
					<!-- end: vertical split layout -->

					<!-- start: bottom menu bar -->
					<div class="emuwebapp-bottom-menu">
						<div>
							<preview class="preview" 
							id="preview" 
							current-bundle-name="{{getCurBndlName()}}"></preview>
						</div>

						<button class="emuwebapp-mini-btn left"
						id="zoomInBtn" 
						ng-click="cmdZoomIn();" 
						ng-disabled="!vs.getPermission('zoom')"><i class="material-icons">expand_less</i>in</button>
						
						<button class="emuwebapp-mini-btn left"
						id="zoomOutBtn" 
						ng-click="cmdZoomOut();" 
						ng-disabled="!vs.getPermission('zoom')"><i class="material-icons">expand_more</i>out</button>
						
						<button class="emuwebapp-mini-btn left"
						id="zoomLeftBtn" 
						ng-click="cmdZoomLeft();" 
						ng-disabled="!vs.getPermission('zoom')"><i class="material-icons">chevron_left</i>left</button>
						
						<button class="emuwebapp-mini-btn left"
						id="zoomRightBtn" 
						ng-click="cmdZoomRight();" 
						ng-disabled="!vs.getPermission('zoom')"><i class="material-icons">chevron_right</i>right</button>
						
						<button class="emuwebapp-mini-btn left"
						id="zoomAllBtn" 
						ng-click="cmdZoomAll();" 
						ng-disabled="!vs.getPermission('zoom')"><i class="material-icons" style="transform: rotate(90deg)">unfold_less</i>all</button>

						<button class="emuwebapp-mini-btn left"
						id="zoomSelBtn" 
						ng-click="cmdZoomSel();" 
						ng-disabled="!vs.getPermission('zoom')"><i class="material-icons" style="transform: rotate(90deg)">unfold_more</i>selection</button>
						
						<button class="emuwebapp-mini-btn left"
						id="playViewBtn" 
						ng-show="cps.vals.restrictions.playback" 
						ng-click="cmdPlayView();" 
						ng-disabled="!vs.getPermission('playaudio')" ><i class="material-icons">play_arrow</i>in view</button>
						
						<button class="emuwebapp-mini-btn left"
						id="playSelBtn" 
						ng-show="cps.vals.restrictions.playback" 
						ng-click="cmdPlaySel();" 
						ng-disabled="!vs.getPermission('playaudio')"><i class="material-icons">play_circle_outline</i>selected</button>
						
						<button class="emuwebapp-mini-btn left"
						id="playAllBtn" 
						ng-show="cps.vals.restrictions.playback" 
						ng-click="cmdPlayAll();" 
						ng-disabled="!vs.getPermission('playaudio')"><i class="material-icons">play_circle_filled</i>entire file</button>
					</div>
					<!-- end: bottom menu bar -->

					<!-- start: large text input field -->
					<!--<large-text-field-input></large-text-field-input>-->

					<!-- start: perspectives menu bar (right) -->
					<perspectives></perspectives>
					<!-- end: perspectives menu bar (right) -->
				</div>
				<!-- end: main window -->
			</div>
			<!-- end: container EMU-webApp -->
			`,
			restrict: 'E',
			scope: {
				audioGetUrl: '@',
				labelGetUrl: '@',
				labelType: '@'
			},
			link: function postLink(scope, element, attrs) {

				////////////////////////
				// Bindings
				element.bind('mouseenter', function () {
					ViewStateService.mouseInEmuWebApp = true;

				});

				element.bind('mouseleave', function () {
					ViewStateService.mouseInEmuWebApp = false;
				});

				///////////////////////
				// observe attrs

				attrs.$observe('audioGetUrl', function (val) {
					if (val !== undefined && val !== '') {
						ConfigProviderService.embeddedVals.audioGetUrl = val;
					}
				});

				attrs.$observe('labelGetUrl', function (val) {
					if (val !== undefined && val !== '') {
						ConfigProviderService.embeddedVals.labelGetUrl = val;
					}
				});

				attrs.$observe('labelType', function (val) {
					if (val !== undefined && val !== '') {
						ConfigProviderService.embeddedVals.labelType = val;
					}
				});
			}
		};
	});