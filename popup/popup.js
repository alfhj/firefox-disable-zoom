document.addEventListener("DOMContentLoaded", async () => {
    const currentDomainEl = document.getElementById("current-domain");
    const btnToggleDomain = document.getElementById("btn-toggle-domain");
    const textToggleDomain = document.getElementById("text-toggle-domain");

    const btnToggleAll = document.getElementById("btn-toggle-all");
    const textToggleAll = document.getElementById("text-toggle-all");

    let currentDomain = "";
    let blockAll = false;
    let blockedDomains = [];

    // Try to use browser.storage, fallback to chrome.storage
    const storageAPI = window.browser?.storage || window.chrome?.storage;
    const tabsAPI = window.browser?.tabs || window.chrome?.tabs;

    if (!storageAPI || !tabsAPI) {
        currentDomainEl.textContent = "API error";
        return;
    }

    // Helper to await callbacks for Chrome compatibility if needed
    const getStorage = (keys) => new Promise(resolve => storageAPI.local.get(keys, resolve));
    const setStorage = (data) => new Promise(resolve => storageAPI.local.set(data, resolve));
    const queryTabs = (query) => new Promise(resolve => tabsAPI.query(query, resolve));
    const setZoom = (tabId, factor) => new Promise(resolve => tabsAPI.setZoom(tabId, factor, resolve));

    // Get current state
    const res = await getStorage(["blockAll", "blockedDomains"]);
    blockAll = res.blockAll || false;
    blockedDomains = res.blockedDomains || [];

    // Get active tab domain
    try {
        const tabs = await queryTabs({ active: true, currentWindow: true });
        if (tabs && tabs.length > 0 && tabs[0].url) {
            const url = new URL(tabs[0].url);

            // Filter out internal pages and about:blank
            if (url.protocol.startsWith('http')) {
                currentDomain = url.hostname;
                currentDomainEl.textContent = `Domain: ${currentDomain}`;
            } else {
                currentDomainEl.textContent = "Not applicable here";
                btnToggleDomain.disabled = true;
            }
        } else {
            currentDomainEl.textContent = "No valid domain";
            btnToggleDomain.disabled = true;
        }
    } catch (err) {
        currentDomainEl.textContent = "Error reading domain";
        btnToggleDomain.disabled = true;
    }

    function updateUI() {
        if (blockAll) {
            textToggleAll.textContent = "Unblock on all pages";
            btnToggleAll.classList.add("active");
        } else {
            textToggleAll.textContent = "Block on all pages";
            btnToggleAll.classList.remove("active");
        }

        if (currentDomain) {
            if (blockedDomains.includes(currentDomain)) {
                textToggleDomain.textContent = "Unblock zoom on page";
                btnToggleDomain.classList.add("active");
            } else {
                textToggleDomain.textContent = "Block zoom on page";
                btnToggleDomain.classList.remove("active");
            }
        }
    }

    updateUI();

    btnToggleDomain.addEventListener("click", async () => {
        if (!currentDomain) return;

        if (blockedDomains.includes(currentDomain)) {
            blockedDomains = blockedDomains.filter(d => d !== currentDomain);
        } else {
            blockedDomains.push(currentDomain);
        }

        await setStorage({ blockedDomains });
        updateUI();

        // Reset zoom now if it was just blocked
        if (blockedDomains.includes(currentDomain)) {
            const tabs = await queryTabs({ active: true, currentWindow: true });
            if (tabs.length > 0) {
                setZoom(tabs[0].id, 1);
            }
        }
    });

    btnToggleAll.addEventListener("click", async () => {
        blockAll = !blockAll;
        await setStorage({ blockAll });
        updateUI();

        if (blockAll) {
            const tabs = await queryTabs({ active: true, currentWindow: true });
            if (tabs.length > 0) {
                setZoom(tabs[0].id, 1);
            }
        }
    });
});
