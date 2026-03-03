# Disable Zoom - Firefox Extension

A lightweight Firefox extension designed to prevent manual zooming on webpages. Since Firefox lacks native support for the `browser.tabs.setZoomSettings()` API, this extension actively monitors zoom changes and instantly reverts the zoom level to 100% on restricted domains.

## Features

- **Block zoom on current page:** Easily toggle zoom blocking for the active tab's domain.
- **Block all pages:** Enforce a strict 100% zoom level across all websites globally.
- **Sleek Popup UI:** Clean, modern interface to manage your zoom preferences.

## Installation Methods

### Temporary Installation (for development/testing)

To load the extension temporarily in Firefox:

1. Open Firefox and navigate to `about:debugging`.
2. Click on "**This Firefox**" in the left-hand sidebar.
3. Click the "**Load Temporary Add-on...**" button under the "Temporary Extensions" section.
4. Navigate to the directory where you saved/cloned this project (`.../firefox-disable-zoom`).
5. Select the `manifest.json` file (or any other file in the directory) and click **Open**.
6. The extension is now installed temporarily and will appear in your top right extensions toolbar. Note: temporary extensions are removed when Firefox restarts.

## Usage

1. **Accessing Settings**: Once installed, click the "Disable Zoom" icon in your Firefox extension toolbar. If you don't see it, it might be in the Extensions puzzle piece menu.
2. **Blocking a Specific Domain**: Navigate to a website you want to restrict (e.g., `https://example.com`) and click **"Block zoom on page"**. Any attempt to zoom on that domain will now instantly reset to 100%.
3. **Blocking Everywhere**: Click **"Block on all pages"** to prevent zooming globally across all domains. To disable this, simply open the popup and click "Unblock on all pages".

## How it Works

The extension uses Manifest V3 and relies on the `browser.tabs.onZoomChange` API. When a user zooms in or out, the background script detects the change, checks if the current domain is restricted (or if global blocking is enabled), and immediately forces the zoom level back to `1` (100%) using `browser.tabs.setZoom(tabId, 1)`. User preferences are stored using `browser.storage.local`.
