// Check if a new cache is available on page load.
var counter = 0;
window.addEventListener('load', function (e) {
  window.applicationCache.addEventListener('updateready', function (e) {
    console.log("counter:" + counter);
    $('.modal').css('display', 'none');

  }, false);

  window.applicationCache.addEventListener('progress', function (e) {
    counter += 1;
  }, false);

  window.applicationCache.addEventListener('checking', function (e) {
    // document.getElementById("appcachemodal").style.display = 'none';
  }, false);



  //   window.applicationCache.addEventListener('downloading', function(e) {
  //     console.log('raphy downloading');
  // }, false);

}, false);

document.addEventListener("DOMContentLoaded", function (event) {
  console.log("DOM fully loaded and parsed");
  console.log(document.getElementById("appcachemodal"));
});