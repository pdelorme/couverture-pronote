chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.command === 'setCoverageData') {
        coverageData = message.coverageData;
        // console.log(coverageData);
        chrome.storage.local.set({'coverageData': coverageData});
        return false;
    }
    if (message.command === 'postEdtData') {
        edtData = message.edtData;
        // console.log(edtData);
        postEDTJson(edtData);
        return false;
    }
    if(message.command === 'getCoverageData') {
        chrome.storage.local.get('coverageData', (res) => {
            // console.log("coverageData :",res);
            sendResponse(res);
        });
        return true;
    }
  });

  /**
   * Post EDT data to server.
   */
  function postEDTJson(jsonEDTData){
    // "https://data.nos-ecoles.fr/server_module_pronote.php"
    // "http://localhost:3000/edtData"
    fetch("https://data.nos-ecoles.fr/server_module_pronote.php", {
	  method: "POST",
	  body: JSON.stringify(jsonEDTData),
	  headers: {
	    "Content-type": "application/json; charset=UTF-8"
	  }
	}).then((response) => {
        console.log(response.status);
    }).catch((error) => {
        console.log(error);
    });
}