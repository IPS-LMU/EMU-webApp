'use strict';

angular.module('emulvcApp')
    .factory('uuid', function () {
        var svc = {
            new: function () {
                function rand(s) {
                    var p = (Math.random().toString(16) + '000000000').substr(2, 8);
                    return s ? '-' + p.substr(0, 4) + '-' + p.substr(4, 4) : p;
                }
                return rand() + rand(true) + rand(true) + rand();
            },

            empty: function () {
                return '00000000-0000-0000-0000-000000000000';
            }
        };

        return svc;
    });