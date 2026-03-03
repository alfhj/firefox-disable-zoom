// default state
let blockAll = false;
let blockedDomains = [];

// Load state on startup
browser.storage.local.get(["blockAll", "blockedDomains"]).then((res) => {
  blockAll = res.blockAll || false;
  blockedDomains = res.blockedDomains || [];
});

// Update state on changes
browser.storage.onChanged.addListener((changes, area) => {
  if (area === "local") {
    if (changes.blockAll) {
      blockAll = changes.blockAll.newValue;
    }
    if (changes.blockedDomains) {
      blockedDomains = changes.blockedDomains.newValue;
    }
  }
});

// Listen to zoom changes
browser.tabs.onZoomChange.addListener((zoomChangeInfo) => {
  if (zoomChangeInfo.newZoomFactor === 1) return; // avoid infinite loop
  
  const tabId = zoomChangeInfo.tabId;
  
  // Get the tab URL to check the domain
  browser.tabs.get(tabId).then((tab) => {
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
  }).catch(err => console.error("Error getting tab:", err));
});
