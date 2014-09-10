'use strict';

describe('espsParserWorker', function () {
  var scope, deferred;
  var worker;
  var name;
  var audioExt;
  var sampleRate;

  // load the controller's module
  beforeEach(module('emuwebApp'));

  beforeEach(function () {
    worker = new Worker('scripts/workers/espsParserWorker.js');
    name = 'lab';
    audioExt = '.wav';
    sampleRate = 20000;
  });

  /**
   *
   */
  it('should parse esps file containing segments correctly ', inject(function () {
    

    // add event listener to worker to respond to messages
    worker.addEventListener('message', function (e) {
      var jso = e.data.data;
      expect(e.data.status.type).toEqual('SUCCESS');
      expect(jso.name).toEqual(name);
      expect(jso.annotates).toEqual(name + audioExt);
      expect(jso.sampleRate).toEqual(sampleRate);

      // level attr.
      expect(jso.levels[0].type).toEqual('SEGMENT');
      expect(jso.levels[0].name).toEqual(name);

      // item 0
      expect(jso.levels[0].items[0].labels[0].value).toEqual('V');
      expect(jso.levels[0].items[0].sampleStart).toEqual(3749);
      expect(jso.levels[0].items[0].sampleDur).toEqual(1389);

      // item 16
      expect(jso.levels[0].items[16].labels[0].value).toEqual('@');
      expect(jso.levels[0].items[16].sampleStart).toEqual(30124);
      expect(jso.levels[0].items[16].sampleDur).toEqual(844);

      // item 33
      expect(jso.levels[0].items[33].labels[0].value).toEqual('l');
      expect(jso.levels[0].items[33].sampleStart).toEqual(50126);
      expect(jso.levels[0].items[33].sampleDur).toEqual(1962);


    }, false);


    worker.postMessage({
      'cmd': 'parseESPS',
      'esps': msajc003EspsLabFile,
      'sampleRate': sampleRate,
      'annotates': name + audioExt,
      'name': name
    });

  }));


  /**
   *
   */
  // it('should parse esps file containing events correctly ', inject(function (Espsparserservice, LevelService) {

  //   // add event listener to worker to respond to messages
  //   worker.addEventListener('message', function (e) {
  //     var jso = e.data.data;
  //     expect(e.data.status.type).toEqual('SUCCESS');
  //     expect(jso.name).toEqual(name);
  //     expect(jso.annotates).toEqual(name + audioExt);
  //     expect(jso.sampleRate).toEqual(sampleRate);

  //     // level attr.
  //     expect(jso.levels[0].type).toEqual('EVENT');
  //     expect(jso.levels[0].name).toEqual(name);

  //     // item 0
  //     expect(jso.levels[0].items[0].labels[0].value).toEqual('H*');
  //     expect(jso.levels[0].items[0].samplePoint).toEqual(8381);

  //     // item 3
  //     expect(jso.levels[0].items[3].labels[0].value).toEqual('H*');
  //     expect(jso.levels[0].items[3].samplePoint).toEqual(38255);

  //     // item 6
  //     expect(jso.levels[0].items[6].labels[0].value).toEqual('L%');
  //     expect(jso.levels[0].items[6].samplePoint).toEqual(51552);

  //   }, false);


  //   worker.postMessage({
  //     'cmd': 'parseESPS',
  //     'esps': msajc003EspsToneFile,
  //     'sampleRate': sampleRate,
  //     'annotates': name + audioExt,
  //     'name': name
  //   });

  // }));


});