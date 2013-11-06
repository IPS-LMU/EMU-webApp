"use strict";

var FileCtrl = angular.module("emulvcApp")
	.controller("FileCtrl", function($scope, $modal, $log, $http, $compile,
		viewState, Iohandlerservice, Soundhandlerservice, ConfigProviderService) {

    var dropbox = document.getElementById("dropbox");
    var droptext1 = "Drop your files here";
    var droptext2 = "File is not allowed";
    var droptext3 = "Parsing started";
    var wavLoaded = false;
    
    $scope.dropText = droptext1;
    $scope.files = [];
   
    
    function dragEnterLeave(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        $scope.$apply(function(){
            $scope.dropText = droptext1;
            $scope.dropClass = "";
        })
    }
    dropbox.addEventListener("dragenter", dragEnterLeave, false);
    dropbox.addEventListener("dragleave", dragEnterLeave, false);
    dropbox.addEventListener("dragover", function(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        var clazz = "not-available";
        var ok = evt.dataTransfer && evt.dataTransfer.types && evt.dataTransfer.types.indexOf("Files") >= 0;
        $scope.$apply(function(){
            $scope.dropText = ok ? droptext1 : droptext2;
            $scope.dropClass = ok ? "over" : "not-available";
        })
    }, false);
    
    dropbox.addEventListener("drop", function(evt) {
        console.log("drop evt:", JSON.parse(JSON.stringify(evt.dataTransfer)));
        evt.stopPropagation();
        evt.preventDefault();
        $scope.$apply(function(){
            $scope.dropText = droptext3;
            $scope.dropClass = "";
        })
        var files = evt.dataTransfer.files;
        if (files.length > 0) {
            $scope.$apply(function(){
                for (var i = 0; i < files.length; i++) {
                	$scope.files.push(files[i]);
                	var extension = files[i].name.substr(files[i].name.lastIndexOf(".")).toUpperCase();
        			console.log(extension);
                }                
            });
        }
    }, false)

    $scope.setFiles = function(element) {
    $scope.$apply(function(scope) {
      console.log("files:", element.files);
        $scope.files = [];
        for (var i = 0; i < element.files.length; i++) {
          $scope.files.push(element.files[i]);
        }
      });
    };
});