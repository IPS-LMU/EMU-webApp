'use strict';

describe('Directive: emuhierarchy', function() {

    var elm, scope, tpl;
    beforeEach(module('emuwebApp'));

    beforeEach(inject(function($rootScope, viewState, HierarchyLayoutService, ConfigProviderService) {
        scope = $rootScope.$new();
        scope.vs = viewState;
        scope.hls = HierarchyLayoutService;
        scope.cps = ConfigProviderService;
    }));

    function compileDirective() {
        tpl = "<emuhierarchy></emuhierarchy>";
        inject(function ($compile) {
            elm = $compile(tpl)(scope);
        });
        scope.$digest();
    }    
    
     it('should have correct html', inject(function (ConfigProviderService) {
         compileDirective();
         expect(elm.html()).toEqual('<svg width="100%" height="100%" style="background-color: rgb(221, 221, 221); "><g><g style="z-index: 5; "></g><g><text>time →</text></g><g style="z-index: 1; "></g></g></svg>');
     }));   
    
    // it('should centerNode', function () {
    //     spyOn(elm.isolateScope(), 'getOrientatedTransform');
    //     elm.isolateScope().width = 100;
    //     elm.isolateScope().height = 100;
    //     elm.isolateScope().centerNode({_x: 1, _y: 2});
    //     expect(elm.isolateScope().getOrientatedTransform).toHaveBeenCalled();
    // });   
    
    // it('should zoom', function () {
    //     spyOn(elm.isolateScope(), 'getOrientatedTransform');
    //     elm.isolateScope().width = 100;
    //     elm.isolateScope().height = 100;
    //     elm.isolateScope().zoom();
    //     expect(elm.isolateScope().getOrientatedTransform).toHaveBeenCalled();
    // });
    
    // it('should getOrientatedTransform (vertical)', function () {
    //     elm.isolateScope().vertical = true;
    //     expect(elm.isolateScope().getOrientatedTransform()).toEqual('scale(1)translate(0,0)scale(-1,1),rotate(90)');
    // });
    
    // it('should getOrientatedTransform (not vertical)', function () {
    //     elm.isolateScope().vertical = false;
    //     expect(elm.isolateScope().getOrientatedTransform()).toEqual('scale(1)translate(0,0)rotate(0)');
    // });
    
    // it('should getOrientatedNodeTransform (vertical)', function () {
    //     elm.isolateScope().vertical = true;
    //     expect(elm.isolateScope().getOrientatedNodeTransform()).toEqual('scale(-1,1)rotate(90)');
    // });
    
    // it('should getOrientatedNodeTransform (not vertical)', function () {
    //     elm.isolateScope().vertical = false;
    //     expect(elm.isolateScope().getOrientatedNodeTransform()).toEqual('scale(1,1)rotate(0)');
    // });
    
    // it('should getNodeText (NO VALUE)', function () {
    //     expect(elm.isolateScope().getNodeText({id: 147, labels: [{name: 'test'}, {name: 'test1'}]})).toEqual('NO VALUE');
    // });
    
    // it('should getOrientatedTextAnchor (not vertical)', function () {
    //     elm.isolateScope().vertical = false;
    //     expect(elm.isolateScope().getOrientatedTextAnchor()).toEqual('begin');
    // });
    
    // it('should getOrientatedTextAnchor', function () {
    //     elm.isolateScope().vertical = true;
    //     expect(elm.isolateScope().getOrientatedTextAnchor()).toEqual('middle');
    // });    
    
    // it('should getOrientatedTextX (not vertical)', function () {
    //     elm.isolateScope().vertical = false;
    //     expect(elm.isolateScope().getOrientatedTextX()).toEqual(10);
    // });
    
    // it('should getOrientatedTextX', function () {
    //     elm.isolateScope().vertical = true;
    //     expect(elm.isolateScope().getOrientatedTextX()).toEqual(0);
    // });    
    
    // it('should getOrientatedTextY (not vertical)', function () {
    //     elm.isolateScope().vertical = false;
    //     expect(elm.isolateScope().getOrientatedTextY()).toEqual('0.35em');
    // });
    
    // it('should getOrientatedTextY', function () {
    //     elm.isolateScope().vertical = true;
    //     expect(elm.isolateScope().getOrientatedTextY()).toEqual('1.45em');
    // }); 
    
    // it('should getPath', function () {
    //     expect(elm.isolateScope().getPath({_fromX: 1,_toX: 2,_fromY: 3,_toY: 4})).toEqual('M1 3Q1 4 2 4');
    // });  
    
    // it('should react to nodeOnClick', function (HierarchyLayoutService) {
    //     spyOn(elm.isolateScope(), 'render');
    //     elm.isolateScope().nodeOnClick({});
    //     expect(elm.isolateScope().render).toHaveBeenCalled();
    // });  
    
       
    
});