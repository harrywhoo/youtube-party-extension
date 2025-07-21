import { useState, useEffect } from 'react';
import { Welcome } from './pages/Welcome';
import { Lobby } from './pages/Lobby';
import { NameInput } from './pages/NameInput';
import { RoomView } from './pages/RoomView';

type AppPhase = 'welcome' | 'lobby' | 'name' | 'room';

export default function App() {
  const [phase, setPhase] = useState<AppPhase>('welcome');
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [actionType, setActionType] = useState<'create' | 'join'>('create');
  const [status] = useState<'connected' | 'connecting' | 'disconnected'>('connected');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Mock members data for testing
  const [members] = useState([
    { socketId: '1', username: 'Alice' },
    { socketId: '2', username: 'Bob' },
    { socketId: '3', username: 'Charlie' }
  ]);

  // Check if user is already logged in
  useEffect(() => {
    const savedUsername = localStorage.getItem('youtube-party-username');
    const loginTimestamp = localStorage.getItem('youtube-party-login-time');
    
    if (savedUsername && loginTimestamp) {
      // Check if login is still valid (optional: add expiration logic here)
      setUsername(savedUsername);
      setIsLoggedIn(true);
      setPhase('lobby');
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

  const handleJoin = (code: string) => {
    setRoomCode(code);
    setActionType('join');
    setPhase('name');
  };

  const handleNameSubmit = () => {
    if (username.trim()) {
      // Save updated username
      localStorage.setItem('youtube-party-username', username);
      setPhase('room');
      
      // Generate room code if creating
      if (actionType === 'create') {
        setRoomCode(generateRoomCode());
      }
    }
  };

  const handleBack = () => {
    if (phase === 'name') {
      setPhase('lobby');
      setRoomCode('');
    }
  };

  const handleLeaveRoom = () => {
    setPhase('lobby');
    setRoomCode('');
  };

  // Utility function to generate room codes
  const generateRoomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

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
          onChange={setUsername}
          onSubmit={handleNameSubmit}
          onBack={handleBack}
          actionType={actionType}
          roomCode={roomCode}
        />
      );
    }

    if (phase === 'room') {
      // Add current user to members list for testing
      const allMembers = actionType === 'create' 
        ? [{ socketId: 'user', username }, ...members.slice(0, 2)]
        : [members[0], { socketId: 'user', username }, ...members.slice(1, 2)];
      
      return (
        <RoomView
          username={username}
          status={status}
          roomCode={roomCode || 'ABC123'}
          members={allMembers}
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
        onJoin={handleJoin}
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


