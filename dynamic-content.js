console.log("This is 'Dynamic-Content.js'");
document.addEventListener('readystatechange', () => {    
  if (document.readyState == 'complete') {
  	console.log("DCS : document complete");
  }
});
window.addEventListener('load', function () {    
    console.log('DCS: Page loaded');
});