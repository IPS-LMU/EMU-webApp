'use strict';

describe('Service: Iohandlerservice', function () {

  // load the controller's module
  beforeEach(module('emuwebApp'));
  
  var scope;


  //Initialize the controller and a mock scope
  beforeEach(inject(function ($rootScope, Iohandlerservice, viewState) {
    scope = $rootScope.$new();
    scope.io = Iohandlerservice;
    scope.vs = viewState;
  }));

  /**
   *
   */
  it('should parseLabelFile with ESPS', inject(function (Espsparserservice) {
    // var def = $q.defer();
    spyOn(Espsparserservice, 'asyncParseEsps');
    scope.io.parseLabelFile('','test','test','ESPS');
    expect(Espsparserservice.asyncParseEsps).toHaveBeenCalledWith('', '', 'embeddedESPS');
  }));

  /**
   *
   */
  it('should parseLabelFile with textgrid', inject(function ($q, Textgridparserservice) {
    // var def = $q.defer();
    spyOn(Textgridparserservice, 'asyncParseTextGrid');//.and.returnValue(def.promise);
    scope.io.parseLabelFile('','test','test','TEXTGRID');
    expect(Textgridparserservice.asyncParseTextGrid).toHaveBeenCalledWith('', '', 'embeddedTEXTGRID');
  }));

  /**
   *
   */
  it('should saveBundle CORS', inject(function (ConfigProviderService) {
    ConfigProviderService.vals = {};
    ConfigProviderService.vals.main = {};
    ConfigProviderService.vals.main.comMode = 'CORS';
    scope.io.saveBundle();
  }));

  /**
   *
   */
  it('should saveBundle WS', inject(function ($q, ConfigProviderService, Websockethandler) {
    var def = $q.defer();
    ConfigProviderService.vals = {};
    ConfigProviderService.vals.main = {};
    ConfigProviderService.vals.main.comMode = 'WS';
    spyOn(Websockethandler, 'saveBundle').and.returnValue(def.promise);
    scope.io.saveBundle();
    expect(Websockethandler.saveBundle).toHaveBeenCalled();
  }));

  /**
   *
   */
  it('should getBundle CORS', inject(function ($q, ConfigProviderService) {
    var def = $q.defer();
    ConfigProviderService.vals = {};
    ConfigProviderService.vals.main = {};
    ConfigProviderService.vals.main.comMode = 'CORS';
    scope.io.getBundle('','','');
  }));

  /**
   *
   */
  it('should getBundle WS', inject(function ($q, ConfigProviderService, Websockethandler) {
    var def = $q.defer();
    ConfigProviderService.vals = {};
    ConfigProviderService.vals.main = {};
    ConfigProviderService.vals.main.comMode = 'WS';
    spyOn(Websockethandler, 'getBundle').and.returnValue(def.promise);
    scope.io.getBundle('','','');
    expect(Websockethandler.getBundle).toHaveBeenCalled();
  }));

  /**
   *
   */
  it('should getBundleList CORS', inject(function ($q, ConfigProviderService) {
    var def = $q.defer();
    ConfigProviderService.vals = {};
    ConfigProviderService.vals.main = {};
    ConfigProviderService.vals.main.comMode = 'CORS';
    scope.io.getBundleList('');
  }));

  /**
   *
   */
  it('should getBundleList WS', inject(function ($q, ConfigProviderService, Websockethandler) {
    var def = $q.defer();
    ConfigProviderService.vals = {};
    ConfigProviderService.vals.main = {};
    ConfigProviderService.vals.main.comMode = 'WS';
    spyOn(Websockethandler, 'getBundleList').and.returnValue(def.promise);
    scope.io.getBundleList('');
    expect(Websockethandler.getBundleList).toHaveBeenCalled();
  }));

  /**
   *
   */
  it('should getBundleList DEMO', inject(function ($q, ConfigProviderService, Websockethandler) {
    var def = $q.defer();
    ConfigProviderService.vals = {};
    ConfigProviderService.vals.main = {};
    ConfigProviderService.vals.main.comMode = 'DEMO';
    var test = scope.io.getBundleList('');
  }));

  /**
   *
   */
  it('should getDBconfigFile CORS', inject(function ($q, ConfigProviderService) {
    var def = $q.defer();
    ConfigProviderService.vals = {};
    ConfigProviderService.vals.main = {};
    ConfigProviderService.vals.main.comMode = 'CORS';
    scope.io.getDBconfigFile('');
  }));

  /**
   *
   */
  it('should getDBconfigFile DEMO', inject(function ($q, ConfigProviderService, Websockethandler) {
    var def = $q.defer();
    ConfigProviderService.vals = {};
    ConfigProviderService.vals.main = {};
    ConfigProviderService.vals.main.comMode = 'DEMO';
    var test = scope.io.getDBconfigFile('');
  }));

  /**
   *
   */
  it('should getDBconfigFile WS', inject(function ($q, ConfigProviderService, Websockethandler) {
    var def = $q.defer();
    ConfigProviderService.vals = {};
    ConfigProviderService.vals.main = {};
    ConfigProviderService.vals.main.comMode = 'WS';
    spyOn(Websockethandler, 'getDBconfigFile').and.returnValue(def.promise);
    scope.io.getDBconfigFile('');
    expect(Websockethandler.getDBconfigFile).toHaveBeenCalled();
  }));


  /**
   *
   */
  it('should logOnUser CORS', inject(function ($q, ConfigProviderService) {
    var def = $q.defer();
    ConfigProviderService.vals = {};
    ConfigProviderService.vals.main = {};
    ConfigProviderService.vals.main.comMode = 'CORS';
    scope.io.logOnUser('');
  }));

  /**
   *
   */
  it('should logOnUser WS', inject(function ($q, ConfigProviderService, Websockethandler) {
    var def = $q.defer();
    ConfigProviderService.vals = {};
    ConfigProviderService.vals.main = {};
    ConfigProviderService.vals.main.comMode = 'WS';
    spyOn(Websockethandler, 'logOnUser').and.returnValue(def.promise);
    scope.io.logOnUser('');
    expect(Websockethandler.logOnUser).toHaveBeenCalled();
  }));

  /**
   *
   */
  it('should getDoUserManagement CORS', inject(function ($q, ConfigProviderService) {
    var def = $q.defer();
    ConfigProviderService.vals = {};
    ConfigProviderService.vals.main = {};
    ConfigProviderService.vals.main.comMode = 'CORS';
    scope.io.getDoUserManagement();
  }));

  /**
   *
   */
  it('should getDoUserManagement WS', inject(function ($q, ConfigProviderService, Websockethandler) {
    var def = $q.defer();
    ConfigProviderService.vals = {};
    ConfigProviderService.vals.main = {};
    ConfigProviderService.vals.main.comMode = 'WS';
    spyOn(Websockethandler, 'getDoUserManagement').and.returnValue(def.promise);
    scope.io.getDoUserManagement();
    expect(Websockethandler.getDoUserManagement).toHaveBeenCalled();
  }));

  /**
   *
   */
  it('should getProtocol CORS', inject(function ($q, ConfigProviderService) {
    var def = $q.defer();
    ConfigProviderService.vals = {};
    ConfigProviderService.vals.main = {};
    ConfigProviderService.vals.main.comMode = 'CORS';
    scope.io.getProtocol();
  }));

  /**
   *
   */
  it('should getProtocol WS', inject(function ($q, ConfigProviderService, Websockethandler) {
    var def = $q.defer();
    ConfigProviderService.vals = {};
    ConfigProviderService.vals.main = {};
    ConfigProviderService.vals.main.comMode = 'WS';
    spyOn(Websockethandler, 'getProtocol').and.returnValue(def.promise);
    scope.io.getProtocol();
    expect(Websockethandler.getProtocol).toHaveBeenCalled();
  }));

});