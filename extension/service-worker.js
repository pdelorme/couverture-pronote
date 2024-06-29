chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.command === 'setCoverageData') {
        coverageData = message.coverageData;
        console.log(coverageData);
        chrome.storage.local.set({'coverageData': coverageData});
        return false;
    }
    if(message.command === 'getCoverageData') {
        chrome.storage.local.get('coverageData', (res) => {
            console.log("coverageData :",res);
            sendResponse(res);
        });
        return true;
    }
  });