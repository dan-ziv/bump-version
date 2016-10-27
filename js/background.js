chrome.browserAction.onClicked.addListener(function (tab) {
    chrome.windows.create({
        url: chrome.runtime.getURL("../pages/popup.html"),
        width: 400,
        height: 450,
        type: "popup"
    });
});