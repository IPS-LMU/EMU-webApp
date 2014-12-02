'use strict';

describe('Directive: myDropZone', function() {

    var elm, scope, mockObject, mockObjectgrid, mockObjectother, mockDir;
    beforeEach(module('emuwebApp', 'emuwebApp.templates'));
    
    beforeEach(inject(function($rootScope, $compile) {
        scope = $rootScope.$new();
        mockObject = {
            name : 'test.wav',
            file : function() {return mockObject},
            isFile : function() {return true}
        };
        mockObjectgrid = {
            name : 'test.textgrid',
            file : function() {return mockObject},
            isFile : function() {return true}
        };
        mockObjectother = {
            name : 'test.other',
            file : function() {return mockObject},
            isFile : function() {return true}
        };
        mockDir = {
            name : 'test.wav',
            file : 'test',
            isDirectory : function() {return true}
        };
    }));

    function compileDirective(tpl) {
        if (!tpl) tpl = '<my-drop-zone></my-drop-zone>';
        inject(function($compile) {
            elm = $compile(tpl)(scope);
        });
        scope.$digest();
    }
 
    it('should have init text', function() {
        compileDirective();
        expect(elm.isolateScope()).toBeDefined();
        expect(elm.isolateScope().dropText).toContain(elm.isolateScope().dropTextDefault);
        expect(elm.isolateScope().dropClass).toBe(elm.isolateScope().dropClassDefault);
    });
    
    
    it('should react on Data drop', function() {
        compileDirective();
        spyOn(elm.isolateScope(), 'dropFiles');
        elm.triggerHandler({
          type: 'drop',
          target: {
            files: [ 'testFile' ]
          }
        });
        scope.$apply();
        expect(elm.isolateScope().dropFiles).toHaveBeenCalled();
    });
    
    it('should react on Data dragover', function() {
        compileDirective();
        elm.triggerHandler({
          type: 'dragover',
          target: {
            files: [ 'testFile' ]
          }
        });
        scope.$apply();
        expect(elm.isolateScope().dropText).toContain(elm.isolateScope().dropAllowed);
        expect(elm.isolateScope().dropClass).toBe(elm.isolateScope().dropClassOver);        

    });   
    
    it('should react on Data dragenter', function() {
        compileDirective();
        elm.triggerHandler({
          type: 'dragenter',
          target: {
            files: [ 'testFile' ]
          }
        });
        scope.$apply();
        expect(elm.isolateScope().dropText).toContain(elm.isolateScope().dropTextDefault);
        expect(elm.isolateScope().dropClass).toBe(elm.isolateScope().dropClassDefault);        

    });
    
    it('should react on Event dragleave', function() {
        compileDirective();
        elm.triggerHandler({
          type: 'dragleave',
          target: {
            files: [ 'testFile' ]
          }
        });
        scope.$apply();
        expect(elm.isolateScope().dropText).toContain(elm.isolateScope().dropTextDefault);
        expect(elm.isolateScope().dropClass).toBe(elm.isolateScope().dropClassDefault);        
    });
    
    it('should updateQueueLength', function() {
        compileDirective();
        elm.isolateScope().updateQueueLength(10);
        expect(elm.isolateScope().count).toBe(10);
        elm.isolateScope().updateQueueLength(10);
        expect(elm.isolateScope().count).toBe(20);
    }); 
    
    it('should startRendering', inject(function (DragnDropDataService) {
        compileDirective();
        spyOn(DragnDropDataService, 'setData');
        elm.isolateScope().updateQueueLength(1);
        elm.isolateScope().handles.push('test');
        elm.isolateScope().bundles.push('test');
        elm.isolateScope().startRendering();
        expect(DragnDropDataService.setData).toHaveBeenCalledWith([ 'test' ]);
    })); 
    
    it('should dropFiles', function() {
        compileDirective();
        spyOn(elm.isolateScope(), 'loadFiles');
        elm.triggerHandler({
          type: 'drop',
          originalEvent: {
            dataTransfer: {
              files: [ 'testFile.wav' ]
            }
          }
        });
        scope.$apply(); 
        expect(elm.isolateScope().loadFiles).toHaveBeenCalled();
    }); 
    
    it('should not loadFiles with name .DS_Store', function() {
        compileDirective();
        spyOn(elm.isolateScope(), 'updateQueueLength');
        elm.isolateScope().loadFiles([{name: '.DS_Store'}]);
        expect(elm.isolateScope().updateQueueLength).toHaveBeenCalledWith(-1);
    }); 
    
    it('should loadFiles (no file)', function() {
        compileDirective();
        spyOn(elm.isolateScope(), 'updateQueueLength');
        elm.isolateScope().loadFiles([{name: 'test.wav'}]);
        expect(elm.isolateScope().updateQueueLength).toHaveBeenCalledWith(-1);
    }); 
    
    it('should loadFiles', function() {
        compileDirective();
        spyOn(elm.isolateScope(), 'updateQueueLength');
        elm.isolateScope().loadFiles([mockObject]);
        expect(elm.isolateScope().updateQueueLength).toHaveBeenCalledWith(1);
    }); 
    
    
    it('should enqueueFileAddition with wav', function() {
        compileDirective();
        spyOn(elm.isolateScope(), 'startRendering');
        elm.isolateScope().enqueueFileAddition(mockObject);
        expect(elm.isolateScope().startRendering).toHaveBeenCalled();
    }); 
    
    it('should enqueueFileAddition with textgrid', function() {
        compileDirective();
        elm.isolateScope().enqueueFileAddition(mockObjectgrid);
        expect(elm.isolateScope().dropText).toBe(elm.isolateScope().dropParsingWaiting);
    }); 
    
    it('should enqueueFileAddition with other', function() {
        compileDirective();
        elm.isolateScope().enqueueFileAddition(mockObjectother);
        expect(elm.isolateScope().dropText).toBe(elm.isolateScope().dropTextErrorFileType);
    }); 
});