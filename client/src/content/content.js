// YouTube Party Extension - Content Script
// This script runs on YouTube pages to detect and control video playback

console.log('🎬 YouTube Party content script loaded');

let videoElement = null;
let isInitialized = false;

// Function to find the YouTube video element
function findVideoElement() {
    const video = document.querySelector('video');
    if (video && video.src) {
        console.log('📺 Found YouTube video element');
        return video;
    }
    return null;
}

// Initialize video event listeners
function initializeVideoListeners(video) {
    if (isInitialized) return;
    
    console.log('🎯 Initializing video event listeners');
    
    // Listen for play events
    video.addEventListener('play', () => {
        console.log('▶️ Video played at:', video.currentTime);
        sendMessageToPopup({
            type: 'VIDEO_PLAY',
            timestamp: video.currentTime,
            videoId: getCurrentVideoId()
        });
    });
    
    // Listen for pause events
    video.addEventListener('pause', () => {
        console.log('⏸️ Video paused at:', video.currentTime);
        sendMessageToPopup({
            type: 'VIDEO_PAUSE',
            timestamp: video.currentTime,
            videoId: getCurrentVideoId()
        });
    });
    
    // Listen for seek events (when user jumps to different time)
    video.addEventListener('seeked', () => {
        console.log('⏭️ Video seeked to:', video.currentTime);
        sendMessageToPopup({
            type: 'VIDEO_SEEK',
            timestamp: video.currentTime,
            videoId: getCurrentVideoId()
        });
    });
    
    // Listen for time updates (every few seconds for sync)
    let lastSyncTime = 0;
    video.addEventListener('timeupdate', () => {
        const currentTime = video.currentTime;
        // Only sync every 5 seconds to avoid spam
        if (currentTime - lastSyncTime > 5) {
            lastSyncTime = currentTime;
            sendMessageToPopup({
                type: 'VIDEO_TIMEUPDATE',
                timestamp: currentTime,
                videoId: getCurrentVideoId(),
                paused: video.paused
            });
        }
    });
    
    isInitialized = true;
    console.log('✅ Video listeners initialized');
}

// Get current YouTube video ID from URL
function getCurrentVideoId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('v');
}

// Send message to popup (extension popup)
function sendMessageToPopup(message) {
    chrome.runtime.sendMessage(message).catch(err => {
        // Popup might not be open, that's okay
        console.log('📤 Message sent (popup may not be open):', message.type);
    });
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('📥 Received message from popup:', message.type);
    
    if (!videoElement) {
        console.log('❌ No video element found');
        sendResponse({ error: 'No video found' });
        return;
    }
    
    switch (message.type) {
        case 'CONTROL_PLAY':
            console.log('🎮 Controlling video: PLAY at', message.timestamp);
            videoElement.currentTime = message.timestamp;
            videoElement.play();
            break;
            
        case 'CONTROL_PAUSE':
            console.log('🎮 Controlling video: PAUSE at', message.timestamp);
            videoElement.currentTime = message.timestamp;
            videoElement.pause();
            break;
            
        case 'CONTROL_SEEK':
            console.log('🎮 Controlling video: SEEK to', message.timestamp);
            videoElement.currentTime = message.timestamp;
            break;
            
        case 'GET_VIDEO_STATE':
            sendResponse({
                videoId: getCurrentVideoId(),
                currentTime: videoElement.currentTime,
                paused: videoElement.paused,
                duration: videoElement.duration
            });
            return;
    }
    
    sendResponse({ success: true });
});

// Main initialization function
function initialize() {
    console.log('🚀 Initializing YouTube Party on:', window.location.href);
    
    // Find video element
    videoElement = findVideoElement();
    
    if (videoElement) {
        initializeVideoListeners(videoElement);
        
        // Notify popup that we found a video
        sendMessageToPopup({
            type: 'VIDEO_DETECTED',
            videoId: getCurrentVideoId(),
            timestamp: videoElement.currentTime,
            paused: videoElement.paused
        });
    } else {
        console.log('⏳ No video found yet, will retry...');
    }
}

// Wait for page to load, then initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}

// Also try to reinitialize when navigating (YouTube is a SPA)
let lastUrl = location.href;
new MutationObserver(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        console.log('🔄 YouTube navigation detected, reinitializing...');
        isInitialized = false;
        setTimeout(initialize, 1000); // Give YouTube time to load the new video
    }
}).observe(document, { subtree: true, childList: true }); 