'use strict';

describe('Directive: splitPaneView', function() {

    var elm, scope;
    beforeEach(module('emuwebApp'));

    beforeEach(inject(function($rootScope, $compile, viewState) {
        scope = $rootScope.$new();
        scope.vs = viewState;
    }));

    function compileDirective(toggle) {
        inject(function($compile) {
            elm = $compile('<bg-splitter show-two-dim-cans="'+toggle+'">'+
                                '<bg-pane type="topPane" min-size="80" max-size="500">top</<bg-pane>'+
                                '<bg-pane type="bottomPane" min-size="80"> bottom </bg-pane>'+
                                '<bg-pane type="emuwebapp-2d-map"> </bg-pane>'+
                            '</bg-splitter>')(scope);
        });
        scope.$digest();
    }

   it('should have correct html with bottomRightResizePane', function () {
     compileDirective(true);
     expect(elm.isolateScope()).toBeDefined();
     expect(elm.isolateScope().bottomRightResizePane.elem.css('display')).toBe('block');
     expect(elm.find('div').length).toBe(7);
   });
   
   it('should have correct without bottomRightResizePane', function () {
     compileDirective(false);
     expect(elm.isolateScope()).toBeDefined();
     expect(elm.isolateScope().bottomRightResizePane.elem).toBeHidden();
     expect(elm.find('div').length).toBe(7);
   });   
   
   it('should resize bottomRightResizePane via emuwebapp-split-handler', function () {
     compileDirective(true);
     expect(elm.isolateScope()).toBeDefined();
     var event = document.createEvent('Event');
     event.initEvent('mousedown', true, true);
     spyOn(scope.vs, 'setdragBarActive');
     var divs = elm.find('div');
     divs[2].dispatchEvent(event); // emuwebapp-split-handler
     expect(scope.vs.setdragBarActive).toHaveBeenCalledWith(true);
   }); 
   
   it('should watch element mousemove on dragSplitPaneResizer', function () {
     compileDirective(true);
     var event = document.createEvent('Event');
     event.initEvent('mousedown', true, true);
     spyOn(scope.vs, 'setdragBarActive');
     var divs = elm.find('div');
     divs[2].dispatchEvent(event); // emuwebapp-split-handler
     expect(scope.vs.setdragBarActive).toHaveBeenCalledWith(true);     
     expect(elm.isolateScope()).toBeDefined();
     var event2 = document.createEvent('Event');
     event2.initEvent('mousemove', true, true);
     spyOn(scope.vs, 'setdragBarHeight');
     elm[0].dispatchEvent(event2);
     expect(scope.vs.setdragBarHeight).toHaveBeenCalled();
   });   
   
   it('should resize bottomRightResizePane via emuwebapp-bottomRightResizePaneTopResizer', function () {
     compileDirective(true);
     expect(elm.isolateScope()).toBeDefined();
     var event = document.createEvent('Event');
     event.initEvent('mousedown', true, true);
     spyOn(scope.vs, 'setdragBarActive');
     var divs = elm.find('div');
     divs[5].dispatchEvent(event); // emuwebapp-bottomRightResizePaneTopResizer
     expect(scope.vs.setdragBarActive).toHaveBeenCalledWith(true);
   });   
   
   it('should watch element mousemove on emuwebapp-bottomRightResizePaneTopResizer', function () {
     compileDirective(true);
     var event = document.createEvent('Event');
     event.initEvent('mousedown', true, true);
     spyOn(scope.vs, 'setdragBarActive');
     var divs = elm.find('div');
     divs[5].dispatchEvent(event); // emuwebapp-bottomRightResizePaneTopResizer
     expect(scope.vs.setdragBarActive).toHaveBeenCalledWith(true);     
     expect(elm.isolateScope()).toBeDefined();
     var event2 = document.createEvent('Event');
     event2.initEvent('mousemove', true, true);
     elm[0].dispatchEvent(event2);
   }); 

   
   it('should resize bottomRightResizePane via emuwebapp-bottomRightResizePaneLeftResizer', function () {
     compileDirective(true);
     expect(elm.isolateScope()).toBeDefined();
     var event = document.createEvent('Event');
     event.initEvent('mousedown', true, true);
     spyOn(scope.vs, 'setdragBarActive');
     var divs = elm.find('div');
     divs[6].dispatchEvent(event); // emuwebapp-bottomRightResizePaneLeftResizer
     expect(scope.vs.setdragBarActive).toHaveBeenCalledWith(true);
   });   
   
   it('should watch element mousemove on emuwebapp-bottomRightResizePaneLeftResizer', function () {
     compileDirective(true);
     var event = document.createEvent('Event');
     event.initEvent('mousedown', true, true);
     spyOn(scope.vs, 'setdragBarActive');
     var divs = elm.find('div');
     divs[6].dispatchEvent(event); // emuwebapp-bottomRightResizePaneLeftResizer
     expect(scope.vs.setdragBarActive).toHaveBeenCalledWith(true);     
     expect(elm.isolateScope()).toBeDefined();
     var event2 = document.createEvent('Event');
     event2.initEvent('mousemove', true, true);
     elm[0].dispatchEvent(event2);
   });  
   
   it('should resize bottomRightResizePane via emuwebapp-bottomRightResizePaneCornerResizer', function () {
     compileDirective(true);
     expect(elm.isolateScope()).toBeDefined();
     var event = document.createEvent('Event');
     event.initEvent('mousedown', true, true);
     spyOn(scope.vs, 'setdragBarActive');
     var divs = elm.find('div');
     divs[4].dispatchEvent(event); // emuwebapp-bottomRightResizePaneCornerResizer
     expect(scope.vs.setdragBarActive).toHaveBeenCalledWith(true);
   });   
   
   it('should watch element mousemove on emuwebapp-bottomRightResizePaneCornerResizer', function () {
     compileDirective(true);
     var event = document.createEvent('Event');
     event.initEvent('mousedown', true, true);
     spyOn(scope.vs, 'setdragBarActive');
     var divs = elm.find('div');
     divs[4].dispatchEvent(event); // emuwebapp-bottomRightResizePaneCornerResizer
     expect(scope.vs.setdragBarActive).toHaveBeenCalledWith(true);     
     expect(elm.isolateScope()).toBeDefined();
     var event2 = document.createEvent('Event');
     event2.initEvent('mousemove', true, true);
     elm[0].dispatchEvent(event2);
   });  
   
   it('should watch document mouseup', function () {
     compileDirective(true);
     expect(elm.isolateScope()).toBeDefined();
     var event = document.createEvent('Event');
     event.initEvent('mouseup', true, true);
     spyOn(scope.vs, 'setdragBarActive');
     document.dispatchEvent(event);
     expect(scope.vs.setdragBarActive).toHaveBeenCalled();
   }); 
});
