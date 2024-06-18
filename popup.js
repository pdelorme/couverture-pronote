console.log('This is an other popup!');

async function refresh(){
	const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
	const response = await chrome.tabs.sendMessage(tab.id, {greeting: "hello"});
	// do something with response here, not outside the function
	console.log(response);
}

var refreshButton = document.getElementById("refreshButton");
refreshButton.addEventListener(
  "click", () => refresh(), false);

/*
var s = document.createElement('script');
s.src = chrome.runtime.getURL('script.js');
s.onload = function() { this.remove(); };
// see also "Dynamic values in the injected code" section in this answer
(document.head || document.documentElement).appendChild(s);
*/