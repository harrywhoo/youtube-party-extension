// Content script for YouTube video synchronization
// Detects user-initiated video events and sends them to the background script
// Listens for incoming sync events from the background script and applies them to the video

try {
    console.log('🚀 CONTENT SCRIPT STARTING TO LOAD!!!');
    console.log('🌐 Current URL:', window.location.href);
    console.log('📄 Document ready state:', document.readyState);
    console.log('🔍 Document title:', document.title);
    console.log('🎯 Looking for video elements...');
    
    // Check if we're actually on a YouTube page
    if (!window.location.href.includes('youtube.com')) {
        console.error('❌ Not on a YouTube page!');
    } else if (!window.location.href.includes('/watch')) {
        console.warn('⚠️ On YouTube but not a watch page');
    } else {
        console.log('✅ Confirmed on YouTube watch page');
    }
    
    // Try to find video elements immediately
    const videos = document.querySelectorAll('video');
    console.log('🎬 Found', videos.length, 'video elements immediately');
    videos.forEach((video, index) => {
        console.log(`  Video ${index}:`, video);
    });

} catch (error) {
    console.error('💥 CRITICAL ERROR in content script initialization:', error);
}

let isRemoteSeeking = false;
let currentVideo: HTMLVideoElement | null = null;
let isInitialized = false;

// Event handler functions (so we can remove them later)
const playHandler = () => {
    console.log('🎬 PLAY EVENT TRIGGERED!');
    if (isRemoteSeeking) {
        console.log('🔄 Ignoring play event - remote seeking active');
        isRemoteSeeking = false;
        return;
    }
    if (currentVideo) {
        console.log('User played video at:', currentVideo.currentTime);
        chrome.runtime.sendMessage({
            type: 'outgoing-sync',
            action: 'play',
            time: currentVideo.currentTime
        });
    } else {
        console.warn('❌ Play event but no currentVideo reference!');
    }
};

const pauseHandler = () => {
    console.log('⏸️ PAUSE EVENT TRIGGERED!');
    if (isRemoteSeeking) {
        console.log('🔄 Ignoring pause event - remote seeking active');
        isRemoteSeeking = false;
        return;
    }
    if (currentVideo) {
        console.log('User paused video at:', currentVideo.currentTime);
        chrome.runtime.sendMessage({
            type: 'outgoing-sync',
            action: 'pause',
            time: currentVideo.currentTime
        });
    } else {
        console.warn('❌ Pause event but no currentVideo reference!');
    }
};

const seekedHandler = () => {
    console.log('⏩ SEEKED EVENT TRIGGERED!');
    if (isRemoteSeeking) {
        console.log('🔄 Ignoring seeked event - remote seeking active');
        isRemoteSeeking = false;
        return;
    }
    if (currentVideo) {
        console.log('User seeked video to:', currentVideo.currentTime);
        chrome.runtime.sendMessage({
            type: 'outgoing-sync',
            action: 'seek',
            time: currentVideo.currentTime
        });
    } else {
        console.warn('❌ Seeked event but no currentVideo reference!');
    }
};

// Wait for video element to be available
function waitForVideo(): Promise<HTMLVideoElement> {
    return new Promise((resolve) => {
        const checkForVideo = () => {
            const video = document.querySelector('video') as HTMLVideoElement;
            if (video) {
                console.log('✅ YouTube video element found:', video);
                console.log('Video element details:', {
                    src: video.src,
                    currentTime: video.currentTime,
                    duration: video.duration,
                    paused: video.paused
                });
                resolve(video);
            } else {
                console.log('❌ No video element found, retrying...');
                setTimeout(checkForVideo, 500);
            }
        };
        checkForVideo();
    });
}

// Remove old event listeners if they exist
function removeVideoListeners() {
    if (currentVideo) {
        console.log('🧹 Removing old video event listeners from:', currentVideo);
        currentVideo.removeEventListener('play', playHandler);
        currentVideo.removeEventListener('pause', pauseHandler);
        currentVideo.removeEventListener('seeked', seekedHandler);
    } else {
        console.log('🧹 No current video to remove listeners from');
    }
}

// Set up event listeners on the video element
function setupVideoListeners(video: HTMLVideoElement) {
    console.log('🎯 Setting up video event listeners on:', video);
    
    // Remove old listeners first
    removeVideoListeners();
    
    // Update current video reference
    currentVideo = video;
    console.log('📹 Updated currentVideo reference');
    
    // Add new listeners
    console.log('🔗 Adding event listeners...');
    video.addEventListener('play', playHandler);
    console.log('✅ Added play listener');
    
    video.addEventListener('pause', pauseHandler);
    console.log('✅ Added pause listener');
    
    video.addEventListener('seeked', seekedHandler);
    console.log('✅ Added seeked listener');
    
    // Test that the video element is responsive
    console.log('🧪 Testing video element state:', {
        paused: video.paused,
        currentTime: video.currentTime,
        duration: video.duration,
        readyState: video.readyState
    });
}

// Handle incoming sync messages from background script
chrome.runtime.onMessage.addListener((message, _sender) => {
    console.log('📨 Content script received message:', message.type);
    
    if (message.type === 'incoming-sync') {
        console.log('Received sync message:', message);
        handleIncomingSync(message);
    } else if (message.type === 'incoming-url-sync') {
        // Navigate to the new URL from other users
        const { url, videoId } = message;
        console.log('🔄 Received URL sync message! VideoID:', videoId, 'URL:', url);
        console.log('🔄 Current URL:', window.location.href);
        console.log('🔄 Navigating to synced URL:', url);
        
        // Reset initialization flag since we're navigating
        isInitialized = false;
        window.location.href = url;
    } else if (message.type === 'url-changed') {
        // Background script detected URL change
        console.log('📍 Background detected URL change:', message.url);
        // Reinitialize content script for new video
        isInitialized = false;
        setTimeout(initializeContentScript, 1000);
    }
});

function handleIncomingSync(message: any) {
    const video = document.querySelector('video') as HTMLVideoElement;
    if (!video) {
        console.warn('No video element found for sync');
        return;
    }

    const { action, time } = message;
    isRemoteSeeking = true;

    switch (action) {
        case 'seek':
            console.log('Syncing seek to:', time);
            video.currentTime = time;
            break;
        case 'play':
            console.log('Syncing play at:', time);
            video.currentTime = time;
            video.play().catch(err => console.warn('Could not play video:', err));
            break;
        case 'pause':
            console.log('Syncing pause at:', time);
            video.pause();
            break;
        default:
            console.warn('Unknown sync action:', action);
    }
    
    // Reset flag after a short delay
    setTimeout(() => {
        isRemoteSeeking = false;
    }, 1000);
}

// Initialize the content script
async function initializeContentScript() {
    // Prevent multiple initializations
    if (isInitialized) {
        console.log('Content script already initialized, skipping...');
        return;
    }
    
    try {
        console.log('Content script starting on YouTube page');
        const video = await waitForVideo();
        setupVideoListeners(video);
        isInitialized = true;
        console.log('Content script initialized successfully');
    } catch (error) {
        console.error('Failed to initialize content script:', error);
    }
}

// Start the content script
try {
    console.log('🎬 Starting content script initialization...');
    initializeContentScript();
    console.log('🎬 Content script initialization called successfully');
} catch (error) {
    console.error('💥 FATAL ERROR starting content script:', error);
}


