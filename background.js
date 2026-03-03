// Helper function to get storage
const getStorage = (keys) => new Promise(resolve => browser.storage.local.get(keys, resolve));

// Keep-alive connection logic
browser.runtime.onConnect.addListener((port) => {
    if (port.name === "keepAlive") {
        port.onDisconnect.addListener(() => {
            // Port disconnected (tab closed or extension reloaded)
        });
    }
});

// Listen to zoom changes
browser.tabs.onZoomChange.addListener(async (zoomChangeInfo) => {
    if (zoomChangeInfo.newZoomFactor === 1) return; // avoid infinite loop

    const tabId = zoomChangeInfo.tabId;

    try {
        const res = await getStorage(["blockAll", "blockedDomains"]);
        const blockAll = res.blockAll || false;
        const blockedDomains = res.blockedDomains || [];

        // Get the tab URL to check the domain
        const tab = await browser.tabs.get(tabId);
        if (!tab.url) return;

        try {
            const url = new URL(tab.url);
            const domain = url.hostname;

            if (blockAll) {
                browser.tabs.setZoom(tabId, 1);
            } else if (blockedDomains.includes(domain)) {
                browser.tabs.setZoom(tabId, 1);
            }
        } catch (e) {
            // invalid URL like about:blank
            if (blockAll) browser.tabs.setZoom(tabId, 1);
        }
    } catch (err) {
        console.error("Error handling zoom change:", err);
    }
});
