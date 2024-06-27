chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.command === 'set') {
        coverageData = message.coverageData;
        console.log(coverageData);
        chrome.storage.local.set({'coverageData': coverageData});
        return false;
    }
    if(message.command === 'get') {
        chrome.storage.local.get('coverageData', (res) => {
            console.log("coverageData :",res);
            sendResponse(res);
        });
        return true;
    }
  });