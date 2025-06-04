import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [roomCode, setRoomCode] = useState('')
  const [showJoinInput, setShowJoinInput] = useState(false)
  const username = 'Guest User' // Simplified since we're not changing it

  // Test server connection on load
  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await fetch("http://localhost:8080/api");
        const data = await response.json();
        console.log('Server connected:', data);
      } catch (err) {
        console.log('Server not connected:', err);
      }
    };
    testConnection();
  }, []);

  const handleStartParty = () => {
    const newRoomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    console.log('Starting party with code:', newRoomCode);
    // TODO: Connect to server and create room
  };

  const handleJoinParty = () => {
    if (roomCode.trim()) {
      console.log('Joining party with code:', roomCode);
      // TODO: Connect to server and join room
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
          <p className="status">Ready to watch</p>
        </div>
      </div>

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
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="room-input"
                maxLength={6}
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
