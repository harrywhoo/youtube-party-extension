import { useState, useEffect } from 'react'
import './App.css'
import { socketService } from './services/socket'

type Member = {
  socketId: string;
  username: string;
};

function App() {
  const [roomCode, setRoomCode] = useState('')
  const [username, setUsername] = useState('')
  const [showJoinInput, setShowJoinInput] = useState(false)
  const [showUsernameInput, setShowUsernameInput] = useState(false)
  const [actionType, setActionType] = useState<'create' | 'join' | null>(null)
  const [currentRoom, setCurrentRoom] = useState<string | null>(null)
  const [roomMembers, setRoomMembers] = useState<Member[]>([])
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

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
    socketService.onRoomCreated((data) => {
      setCurrentRoom(data.roomId);
      setRoomMembers(data.members);
      setRoomCode(data.roomId);
      setErrorMessage(null);
      setShowUsernameInput(false);
      console.log('Successfully created room:', data.roomId);
    });

    socketService.onRoomJoined((data) => {
      setCurrentRoom(data.roomId);
      setRoomMembers(data.members);
      setErrorMessage(null);
      setShowJoinInput(false);
      setShowUsernameInput(false);
      console.log('Successfully joined room:', data.roomId);
    });

    socketService.onRoomLeft((roomId) => {
      setCurrentRoom(null);
      setRoomMembers([]);
      setRoomCode('');
      setErrorMessage(null);
      setShowJoinInput(false);
      setShowUsernameInput(false);
      console.log('Successfully left room:', roomId);
    });

    socketService.onUserJoined((data) => {
      setRoomMembers(data.members);
      console.log(`${data.username} joined the room`);
    });

    socketService.onUserLeft((data) => {
      setRoomMembers(data.members);
      console.log('User left the room');
    });

    socketService.onRoomError((error) => {
      setErrorMessage(error);
      console.error('Room error:', error);
    });

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, []);

  const handleStartParty = () => {
    setActionType('create');
    setShowUsernameInput(true);
    setErrorMessage(null);
  };

  const handleJoinPartyClick = () => {
    setShowJoinInput(true);
    setErrorMessage(null);
  };

  const handleJoinParty = () => {
    if (roomCode.trim()) {
      setActionType('join');
      setShowUsernameInput(true);
      setShowJoinInput(false);
      setErrorMessage(null);
    }
  };

  const handleUsernameSubmit = () => {
    if (!username.trim()) {
      setErrorMessage('Please enter a username');
      return;
    }

    if (actionType === 'create') {
      console.log('Creating new party...');
      socketService.createRoom(username.trim());
    } else if (actionType === 'join') {
      console.log('Joining party with code:', roomCode);
      socketService.joinRoom(roomCode.trim(), username.trim());
    }
  };

  const handleLeaveRoom = () => {
    console.log('Leaving current room...');
    setErrorMessage(null);
    socketService.leaveRoom();
  };

  const handleBack = () => {
    setShowJoinInput(false);
    setShowUsernameInput(false);
    setActionType(null);
    setRoomCode('');
    setUsername('');
    setErrorMessage(null);
  };

  // Main lobby view (not in a room)
  const renderLobby = () => (
    <>
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
            onClick={handleJoinPartyClick}
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
                Next
              </button>
            </div>
            <button 
              className="back-btn"
              onClick={handleBack}
            >
              ← Back
            </button>
          </div>
        )}
      </div>
    </>
  );

  // Username input view
  const renderUsernameInput = () => (
    <>
      <div className="title-section">
        <h1 className="app-title">👤 Enter Your Name</h1>
        <p className="app-subtitle">
          {actionType === 'create' ? 'Creating a new room' : `Joining room: ${roomCode}`}
        </p>
      </div>

      <div className="actions-section">
        <div className="username-section">
          <input
            type="text"
            placeholder="Enter your name..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="username-input"
            maxLength={20}
          />
          <button 
            className="username-submit-btn"
            onClick={handleUsernameSubmit}
            disabled={!username.trim()}
          >
            {actionType === 'create' ? '🎪 Create Room' : '🚪 Join Room'}
          </button>
        </div>
        
        <button 
          className="back-btn"
          onClick={handleBack}
        >
          ← Back
        </button>
      </div>
    </>
  );

  // Room view (when in a room)
  const renderRoom = () => (
    <>
      <div className="title-section">
        <h1 className="app-title">🎬 Room: {currentRoom}</h1>
        <p className="app-subtitle">{roomMembers.length} member{roomMembers.length !== 1 ? 's' : ''} watching together</p>
      </div>

      {/* Member List */}
      <div className="members-section">
        <h3 className="members-title">👥 Members</h3>
        <div className="members-list">
          {roomMembers.map((member, index) => (
            <div key={member.socketId} className="member-item">
              <div className="member-avatar">
                {member.username.charAt(0).toUpperCase()}
              </div>
              <span className="member-name">{member.username}</span>
              {index === 0 && <span className="host-badge">HOST</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Room Actions */}
      <div className="room-actions">
        <button 
          className="leave-room-btn"
          onClick={handleLeaveRoom}
        >
          🚪 Leave Room
        </button>
      </div>
    </>
  );

  return (
    <div className="popup-container">
      {/* Profile Section */}
      <div className="profile-section">
        <div className="profile-avatar">
          <div className="avatar-circle">
            {currentRoom ? username.charAt(0).toUpperCase() : 'G'}
          </div>
        </div>
        <div className="profile-info">
          <h3 className="username">{currentRoom ? username : 'Guest User'}</h3>
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

      {/* Dynamic Content Based on State */}
      {currentRoom ? renderRoom() : 
       showUsernameInput ? renderUsernameInput() : 
       renderLobby()}

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


