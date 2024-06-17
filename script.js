console.log("This is 'Script.js'");
chrome.scripting
  .registerContentScripts([{
    id: "session-script",
    js: ["dynamic-content.js"],
    persistAcrossSessions: false,
    matches: ["https://*.index-education.net/*"],
    runAt: "document_start",
  }])
  .then(() => console.log("registration complete"))
  .catch((err) => console.warn("unexpected error", err))
  console.log("Script.js:OK");
