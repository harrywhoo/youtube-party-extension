import { useState, useEffect } from 'react';
import { Welcome } from './pages/Welcome';
import { Lobby } from './pages/Lobby';
import { NameInput } from './pages/NameInput';
import { RoomView } from './pages/RoomView';
import { socketService } from './services/socket';

type AppPhase = 'welcome' | 'lobby' | 'name' | 'room';

export default function App() {
  const [phase, setPhase] = useState<AppPhase>('welcome');
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [actionType, setActionType] = useState<'create' | 'join'>('create');
  const [status, setStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [members, setMembers] = useState<Array<{ socketId: string; username: string }>>([]);

  // Check if user is already logged in and setup socket listeners
  useEffect(() => {
    const savedUsername = localStorage.getItem('youtube-party-username');
    const loginTimestamp = localStorage.getItem('youtube-party-login-time');
    
    if (savedUsername && loginTimestamp) {
      // Check if login is still valid (optional: add expiration logic here)
      setUsername(savedUsername);
      setIsLoggedIn(true);
      setPhase('lobby');
    }

    // Setup socket connection status monitoring  
    const checkConnectionStatus = async () => {
      try {
        const connectionStatus = await socketService.getConnectionStatus();
        console.log('🔍 Connection status received:', connectionStatus);
        setStatus(connectionStatus.connected ? 'connected' : 'disconnected');
        
        // Restore room state if user is in a room during current session
        if (connectionStatus.currentRoom && connectionStatus.roomMembers && connectionStatus.roomMembers.length > 0) {
          console.log('✅ Restoring room state:', connectionStatus.currentRoom);
          setRoomCode(connectionStatus.currentRoom);
          setMembers(connectionStatus.roomMembers);
          setPhase('room');
        } else {
          console.log('🏠 No active room - staying in lobby');
        }
      } catch (error) {
        console.error('Failed to get connection status:', error);
        setStatus('disconnected');
      }
    };

    checkConnectionStatus();
    
    // Setup background message listeners for real-time updates
    const messageListener = (message: any) => {
      console.log('App received background message:', message);
      switch (message.type) {
        case 'connection-status':
          setStatus(message.status === 'connected' ? 'connected' : 'disconnected');
          break;
        case 'room-created':
        case 'room-joined':
          setRoomCode(message.data.roomId);
          setMembers(message.data.members);
          setPhase('room');
          break;
        case 'room-left':
          setRoomCode('');
          setMembers([]);
          setPhase('lobby');
          break;
        case 'user-joined':
        case 'user-left':
          setMembers(message.data.members);
          break;
        case 'room-error':
          console.error('Room error:', message.data);
          // Handle error (could show a toast or error message)
          break;
      }
    };

    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.onMessage.addListener(messageListener);
      return () => {
        chrome.runtime.onMessage.removeListener(messageListener);
      };
    }
  }, []);

  const handleLogin = (newUsername: string) => {
    setUsername(newUsername);
    setIsLoggedIn(true);
    localStorage.setItem('youtube-party-username', newUsername);
    localStorage.setItem('youtube-party-login-time', Date.now().toString());
    setPhase('lobby');
  };

  const handleLogout = () => {
    localStorage.removeItem('youtube-party-username');
    localStorage.removeItem('youtube-party-login-time');
    setIsLoggedIn(false);
    setUsername('');
    setPhase('welcome');
    setRoomCode('');
  };

  const handleStart = () => {
    setActionType('create');
    setPhase('name');
  };

  const handleJoin = () => {
    setActionType('join');
    setPhase('name');
  };

  const handleNameSubmit = async (roomCodeToJoin?: string) => {
    if (username.trim()) {
      // Save updated username
      localStorage.setItem('youtube-party-username', username);
      setStatus('connecting');
      
      try {
        if (actionType === 'create') {
          await socketService.createRoom(username.trim());
          // Room created response will be handled by the message listener
        } else if (roomCodeToJoin) {
          await socketService.joinRoom(roomCodeToJoin, username.trim());
          // Room joined response will be handled by the message listener
        }
      } catch (error) {
        console.error('Failed to create/join room:', error);
        setStatus('disconnected');
        // Could show error message to user
      }
    }
  };

  const handleBack = () => {
    if (phase === 'name') {
      setPhase('lobby');
      setRoomCode('');
    }
  };

  const handleLeaveRoom = async () => {
    try {
      await socketService.leaveRoom();
      // Room left response will be handled by the message listener
    } catch (error) {
      console.error('Failed to leave room:', error);
      // Fallback - go to lobby anyway
      setPhase('lobby');
      setRoomCode('');
      setMembers([]);
    }
  };

  // Remove old utility function - room codes now generated by server

  // Render different pages based on current phase and login state
  const currentPage = (() => {
    // If not logged in, show welcome/login flow
    if (!isLoggedIn) {
      return <Welcome onComplete={handleLogin} />;
    }

    // If logged in, show main app flow
    if (phase === 'name') {
      return (
        <NameInput
          username={username}
          onSubmit={handleNameSubmit}
          onBack={handleBack}
          actionType={actionType}
        />
      );
    }

    if (phase === 'room') {
      return (
        <RoomView
          username={username}
          status={status}
          roomCode={roomCode}
          members={members}
          onLeave={handleLeaveRoom}
        />
      );
    }

    // Default to lobby for logged-in users
    return (
      <Lobby
        username={username}
        status={status}
        onStart={handleStart}
        onJoinClick={handleJoin}
        onLogout={handleLogout}
      />
    );
  })();

  return (
    <div className="dark">
      {currentPage}
    </div>
  );
}


