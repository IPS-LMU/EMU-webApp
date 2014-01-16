'use strict';

angular.module('emulvcApp')
  .controller('FileCtrl', function ($scope,
    viewState, Iohandlerservice, Soundhandlerservice, ConfigProviderService) {

    var dropzone = document.getElementById('dropzone');
    var dropDefault = 'Drop your files here or click here to open a file';
    var dropNotAllowed = 'File is not allowed';
    var dropAllowed = 'Drop your file @ to load it';
    var dropParsingStarted = 'Parsing started';
    // var parsingFile;
    // var parsingFileType;

    /**
     * listen for configLoaded
     */
    $scope.dropText = dropDefault;


    $scope.hideDropZone = function () {
      $scope.dropClass = 'hidden';
    };

    $scope.showDropZone = function () {
      $scope.dropClass = '';
    };

    function dragEnterLeave(evt) {
      evt.stopPropagation();
      evt.preventDefault();
      $scope.$apply(function () {
        $scope.dropText = dropDefault;
        $scope.dropClass = '';
      });
    }
    dropzone.addEventListener('dragenter', dragEnterLeave, false);
    dropzone.addEventListener('dragleave', dragEnterLeave, false);
    dropzone.addEventListener('dragover', function (evt) {
      evt.stopPropagation();
      evt.preventDefault();
      // var clazz = 'not-available';
      var ok = evt.dataTransfer && evt.dataTransfer.types && evt.dataTransfer.types.indexOf('Files') >= 0;
      $scope.$apply(function () {
        var items = evt.dataTransfer.items;
        for (var i = 0; i < items.length; i++) {
          console.log(items[i]);
        }
        $scope.dropText = ok ? dropAllowed : dropNotAllowed;
        $scope.dropClass = ok ? 'over' : 'not-available';
      });
    }, false);

    dropzone.addEventListener('drop', function (evt) {
      evt.stopPropagation();
      evt.preventDefault();
      $scope.$apply(function () {
        $scope.dropText = dropParsingStarted;
        $scope.dropClass = '';
      });
      var items = evt.dataTransfer.items;
      for (var i = 0; i < items.length; i++) {
        var item = items[i].webkitGetAsEntry();
        if (item) {
          traverseFileTree(item);
        }
      }
    }, false);

    function traverseFileTree(item, path) {
      path = path || '';
      if (item.isFile) {
        item.file(function (file) {
          var extension = file.name.substr(file.name.lastIndexOf('.') + 1).toUpperCase();
          if (extension === 'WAV') {
            // $rootScope.$broadcast('fileLoaded', fileType.WAV, file);
          }
          if (extension === 'TEXTGRID') {
            // $rootScope.$broadcast('fileLoaded', fileType.TEXTGRID, file);
          }
        });
      } else if (item.isDirectory) {
        var dirReader = item.createReader();
        dirReader.readEntries(function (entries) {
          for (var i = 0; i < entries.length; i++) {
            traverseFileTree(entries[i], path + item.name + '/');
          }
        });
      }
    }
  });