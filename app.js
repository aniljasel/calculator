if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .then(reg => console.log("✅ Service Worker Registered:", reg))
        .catch(err => console.log("❌ Service Worker Registration Failed:", err));
}