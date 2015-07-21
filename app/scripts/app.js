'use strict';


angular.module('emuwebApp', ['ui', 'ui.sortable', 'ngAnimate', 'angular.filter', 'btford.markdown'])
  .constant("Languages", {
    "currentLanguage": 0,
      "dialog": {
        "exit": [
            "Do you really wish to leave/reload the EMU-webApp? All unsaved changes will be lost...",
            "Wollen Sie die EMU-webApp wirklich beenden? Ungespeicherte Aenderungen gehen verloren ..."
          ],
        "clear": [
          "Do you wish to clear all loaded data and if connected disconnect from the server? You have NO unsaved changes so no changes will be lost.",
          "Wollen Sie wirklich beenden ?"
        ]
      },
  })
  .config(function($locationProvider) {
    $locationProvider.html5Mode(true);
  });
