// Content script for YouTube video synchronization
// Detects user-initiated video events and sends them to the background script
// Listens for incoming sync events from the background script and applies them to the video

let isRemoteSeeking = false;

// Wait for video element to be available
function waitForVideo(): Promise<HTMLVideoElement> {
    return new Promise((resolve) => {
        const checkForVideo = () => {
            const video = document.querySelector('video') as HTMLVideoElement;
            if (video) {
                console.log('YouTube video element found');
                resolve(video);
            } else {
                setTimeout(checkForVideo, 500);
            }
        };
        checkForVideo();
    });
}

// Set up event listeners on the video element
function setupVideoListeners(video: HTMLVideoElement) {
    console.log('Setting up video event listeners');
    
    video.addEventListener('play', () => {
        if (isRemoteSeeking) {
            isRemoteSeeking = false;
            return;
        }
        console.log('User played video at:', video.currentTime);
        chrome.runtime.sendMessage({
            type: 'outgoing-sync',
            action: 'play',
            time: video.currentTime
        });
    });

    video.addEventListener('pause', () => {
        if (isRemoteSeeking) {
            isRemoteSeeking = false;
            return;
        }
        console.log('User paused video at:', video.currentTime);
        chrome.runtime.sendMessage({
            type: 'outgoing-sync',
            action: 'pause',
            time: video.currentTime
        });
    });

    video.addEventListener('seeked', () => {
        if (isRemoteSeeking) {
            isRemoteSeeking = false;
            return;
        }
        console.log('User seeked video to:', video.currentTime);
        chrome.runtime.sendMessage({
            type: 'outgoing-sync',
            action: 'seek',
            time: video.currentTime
        });
    });
}

// Handle incoming sync messages from background script
chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
    if (message.type === 'incoming-sync') {
        console.log('Received sync message:', message);
        handleIncomingSync(message);
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
    }, 100);
}

// Initialize the content script
async function initializeContentScript() {
    try {
        console.log('Content script starting on YouTube page');
        const video = await waitForVideo();
        setupVideoListeners(video);
        console.log('Content script initialized successfully');
    } catch (error) {
        console.error('Failed to initialize content script:', error);
    }
}

// Start the content script
initializeContentScript();


