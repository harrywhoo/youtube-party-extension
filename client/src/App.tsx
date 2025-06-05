import { useState, useEffect } from 'react'
import './App.css'
import { socketService } from './services/socket'

function App() {
  const [roomCode, setRoomCode] = useState('')
  const [showJoinInput, setShowJoinInput] = useState(false)
  const [currentRoom, setCurrentRoom] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const username = 'Guest User' // Simplified since we're not changing it

  // Connect to server on component mount
  useEffect(() => {
    const socket = socketService.connect();
    
    socket.on('connect', () => {
      setConnectionStatus('connected');
    });

    socket.on('disconnect', () => {
      setConnectionStatus('disconnected');
    });

    socket.on('connect_error', () => {
      setConnectionStatus('disconnected');
    });

    // Listen for room events
    socketService.onRoomCreated((roomId: string) => {
      setCurrentRoom(roomId);
      setRoomCode(roomId);
      setErrorMessage(null);
      console.log('Successfully created room:', roomId);
    });

    socketService.onRoomJoined((roomId: string) => {
      setCurrentRoom(roomId);
      setErrorMessage(null);
      setShowJoinInput(false); // Close join input on success
      console.log('Successfully joined room:', roomId);
    });

    socketService.onUserJoined((userId: string) => {
      console.log('User joined room:', userId);
    });

    socketService.onUserLeft((userId: string) => {
      console.log('User left room:', userId);
    });

    socketService.onRoomError((error: string) => {
      setErrorMessage(error);
      console.error('Room error:', error);
    });

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, []);

  const handleStartParty = () => {
    console.log('Creating new party...');
    setErrorMessage(null);
    socketService.createRoom();
  };

  const handleJoinParty = () => {
    if (roomCode.trim()) {
      console.log('Joining party with code:', roomCode);
      setErrorMessage(null);
      socketService.joinRoom(roomCode.trim());
    }
  };

  return (
    <div className="popup-container">
      {/* Profile Section */}
      <div className="profile-section">
        <div className="profile-avatar">
          <div className="avatar-circle">
            {username.charAt(0).toUpperCase()}
          </div>
        </div>
        <div className="profile-info">
          <h3 className="username">{username}</h3>
          <p className="status">
            {connectionStatus === 'connected' ? '🟢 Connected' : 
             connectionStatus === 'connecting' ? '🟡 Connecting...' : 
             '🔴 Disconnected'}
          </p>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="error-message">
          <p>❌ {errorMessage}</p>
        </div>
      )}

      {/* Current Room Display */}
      {currentRoom && (
        <div className="current-room">
          <p>📺 Current Room: <strong>{currentRoom}</strong></p>
        </div>
      )}

      {/* Main Title */}
      <div className="title-section">
        <h1 className="app-title">🎬 YouTube Party</h1>
        <p className="app-subtitle">Watch videos together with friends</p>
      </div>

      {/* Main Actions */}
      <div className="actions-section">
        <button 
          className="action-btn start-btn"
          onClick={handleStartParty}
        >
          <span className="btn-icon">🎪</span>
          <div className="btn-content">
            <div className="btn-title">Start Party</div>
            <div className="btn-subtitle">Create a new watch party</div>
          </div>
        </button>

        {!showJoinInput ? (
          <button 
            className="action-btn join-btn"
            onClick={() => setShowJoinInput(true)}
          >
            <span className="btn-icon">🚪</span>
            <div className="btn-content">
              <div className="btn-title">Join Party</div>
              <div className="btn-subtitle">Enter a room code</div>
            </div>
          </button>
        ) : (
          <div className="join-section">
            <div className="input-group">
              <input
                type="text"
                placeholder="Enter room code..."
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                className="room-input"
              />
              <button 
                className="join-submit-btn"
                onClick={handleJoinParty}
                disabled={!roomCode.trim()}
              >
                Join
              </button>
            </div>
            <button 
              className="back-btn"
              onClick={() => {
                setShowJoinInput(false);
                setRoomCode('');
              }}
            >
              ← Back
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="footer-section">
        <p className="footer-text">
          Navigate to a YouTube video to start watching together!
        </p>
      </div>
    </div>
  )
}

export default App


