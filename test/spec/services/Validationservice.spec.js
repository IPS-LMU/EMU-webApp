'use strict';

describe('Service: Validationservice', function () {

  var scope;

  // load the controller's module
  beforeEach(module('emuwebApp'));
  
  beforeEach(inject(function($httpBackend, $rootScope, Validationservice) {
    scope = $rootScope.$new();
    $httpBackend.whenGET("schemaFiles/annotationFileSchema.json").respond(annotationFileSchema);
    $httpBackend.whenGET("schemaFiles/emuwebappConfigSchema.json").respond(emuwebappConfigSchema);
    $httpBackend.whenGET("schemaFiles/DBconfigFileSchema.json").respond(DBconfigFileSchema);
    $httpBackend.whenGET("schemaFiles/bundleListSchema.json").respond(bundleListSchema);  
    Validationservice.loadSchemas();
    $rootScope.$apply();
  }));   
  
  /**
   * 
   */
  it('should validateJSO', inject(function (Validationservice) {
     spyOn(Validationservice, 'getSchema').and.returnValue({name: 'test', data: {}});
     expect(Validationservice.validateJSO('emuwebappConfigSchema', 'test')).toEqual(true);
  }));

  /**
   * 
   */
  it('should validateJSO', inject(function (Validationservice) {
     spyOn(Validationservice, 'getSchema').and.returnValue(undefined);
     expect(Validationservice.validateJSO('emuwebappConfigSchema', 'test')).toEqual('Schema: emuwebappConfigSchema is currently undefined! This is probably due to a misnamed schema file on the server...');
  }));
   
  /**
   * 
   */
  it('should getSchema', inject(function (Validationservice) {
     // schema's not loaded yet... mabye write test with loaded schema too
     expect(Validationservice.getSchema('emuwebappConfigSchema')).toEqual(undefined);
  }));

});