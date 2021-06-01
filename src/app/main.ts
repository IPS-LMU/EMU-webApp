// Vendor
import "angular";
import "jquery";
// import "bootstrap";
import "angular-animate";
import "angular-cookies";
import "angular-resource";
import "angular-route";
import "angular-sanitize";
import "angular-touch";
import "angular-filter";
import "tv4";
import * as d3 from 'd3';
import "showdown";
// import "wav-range-requests";

// App
import "./app";
import "./components";
import "./controllers";
import "./directives";
import "./filters";
import "./polyfills";
import "./prototypeexpansions";
import "./services";

// import "./workers";

// Styles
import "../styles/font.scss";
import "../styles/text.scss";
import "../styles/button.scss";
import "../styles/media-query.scss";
import "../styles/emuwebapp.scss";
import "../styles/preview.scss";
import "../styles/modal.scss";
import "../styles/bundleListSideBar.scss";
import "../styles/rightSideMenu.scss";
import "../styles/twoDimCanvas.scss";
import "../styles/print.scss";
import "../styles/progressBar.scss";
import "../styles/aboutHint.scss";
import "../styles/drop.scss";
import "../styles/timeline.scss";
import "../styles/flexBoxGrid.scss";
import "../styles/levels.scss";
import "../styles/historyActionPopup.scss";
import "../styles/hierarchy.scss";
import "../styles/splitPanes.scss";
import "../styles/tabbed.scss";
import "../styles/animation.scss";
import "../styles/customAngularuiModal.scss";
import "../styles/largeTextInputField.scss";
import "../styles/levelCanvasesGrid.scss";

// import {NgModule} from '@angular/core';
// import {BrowserModule} from '@angular/platform-browser';
// import {UpgradeModule} from '@angular/upgrade/static';
// import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

// @NgModule({
//     imports: [
//       BrowserModule,
//       UpgradeModule
//     ]
//   })
  
//   export class AppModule {
//     // Override Angular bootstrap so it doesn't do anything
//     ngDoBootstrap() {
//     }
//   }
  
//   // Bootstrap using the UpgradeModule
//   platformBrowserDynamic().bootstrapModule(AppModule).then(platformRef => {
//     console.log("Bootstrapping in Hybrid mode with Angular & AngularJS");
//     const upgrade = platformRef.injector.get(UpgradeModule) as UpgradeModule;
//     upgrade.bootstrap(document.body, ['emuwebApp']);
//   });