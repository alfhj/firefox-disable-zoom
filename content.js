let port;

function connect() {
    port = browser.runtime.connect({ name: "keepAlive" });

    port.onDisconnect.addListener(() => {
        // Background script might have been restarted or suspended
        // Reconnect to keep it alive
        setTimeout(connect, 1000);
    });
}

connect();
