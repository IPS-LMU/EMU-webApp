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
    $httpBackend.whenGET("schemaFiles/bundleSchema.json").respond(bundleSchema);
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

  /**
   * 
   */
  it('should semCheckLoadedConfig', inject(function (Validationservice, ConfigProviderService) {
    // set default
    ConfigProviderService.setVals(defaultEmuwebappConfig);

    var tmpDBconfig = angular.copy(aeDbConfig);
    console.log('SIC SIC SIC!!! Have to reset aeDbConfig.EMUwebAppConfig.perspectives[0].levelCanvases.order back to original!! Why? Who has not changed it back or did not work on a copy?');
    tmpDBconfig.EMUwebAppConfig.perspectives[0].levelCanvases.order = ["Phonetic", "Tone"];

    var res;

    ConfigProviderService.curDbConfig = tmpDBconfig;

    // should pass checks if not manipulated
    res = Validationservice.semCheckLoadedConfigs(tmpDBconfig.EMUwebAppConfig, tmpDBconfig);
    expect(res).toEqual(true);
    
    // fail on bad track name
    tmpDBconfig.EMUwebAppConfig.perspectives[0].signalCanvases.order[0] = 'badTrackName';
    res = Validationservice.semCheckLoadedConfigs(tmpDBconfig.EMUwebAppConfig, tmpDBconfig);
    expect(res).toMatch(".*EMUwebAppConfig/perspectives/signalCanvases/order.*");
    tmpDBconfig.EMUwebAppConfig.perspectives[0].signalCanvases.order[0] = 'OSCI';

    console.log(res);
  }));


});