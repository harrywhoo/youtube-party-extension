import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Play, Plus, Users2, Wifi, WifiOff, Loader2, LogOut, Clock, Shield } from 'lucide-react'

interface LobbyProps {
  username: string
  status: 'connected' | 'connecting' | 'disconnected'
  onStart: () => void
  onJoin: (code: string) => void
  onLogout: () => void
}

export function Lobby({ username, status, onStart, onJoin, onLogout }: LobbyProps) {
  const [showJoin, setShowJoin] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const handleJoin = () => {
    if (!code.trim()) {
      setError('Please enter a room code')
      return
    }
    
    if (code.trim().length < 3) {
      setError('Room code must be at least 3 characters')
      return
    }
    
    setError('')
    onJoin(code.trim().toUpperCase())
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJoin()
    }
  }


  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <Wifi className="w-4 h-4 text-green-500" />
      case 'connecting':
        return <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />
      case 'disconnected':
        return <WifiOff className="w-4 h-4 text-red-500" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Connected'
      case 'connecting':
        return 'Connecting...'
      case 'disconnected':
        return 'Disconnected'
    }
  }

  const getStatusBadge = () => {
    switch (status) {
      case 'connected':
        return <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">Ready</Badge>
      case 'connecting':
        return <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200">Connecting</Badge>
      case 'disconnected':
        return <Badge variant="destructive">Offline</Badge>
    }
  }

  return (
    <div className="h-full bg-background flex flex-col">{/* Removed relative positioning and logout button */}

      {/* User Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground font-medium">
              {username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-foreground truncate">{username}</h2>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              {getStatusIcon()}
              <span>{getStatusText()}</span>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </div>

      {!showJoin ? (
        <>
          {/* App Header */}
          <div className="flex flex-col items-center text-center pt-6 pb-4">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mb-4">
              <Play className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground mb-2">YouTube Party</h1>
            <p className="text-muted-foreground text-sm">Watch videos together with friends</p>
          </div>

          {/* Features & Stats */}
          <div className="px-6 mb-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center py-3 px-4 bg-muted/40 rounded-lg">
                <Clock className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Real-time Sync</p>
              </div>
              <div className="text-center py-3 px-4 bg-muted/40 rounded-lg">
                <Shield className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Secure Rooms</p>
              </div>
            </div>


{/* Connection quality section removed */}
          </div>

          {/* Actions */}
          <div className="flex-1 flex flex-col justify-end px-6 pb-6 space-y-3">
            <Button 
              onClick={onStart}
              disabled={status !== 'connected'}
              className="w-full h-12"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Party
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setShowJoin(true)}
              disabled={status !== 'connected'}
              className="w-full h-12"
              size="lg"
            >
              <Users2 className="w-5 h-5 mr-2" />
              Join Existing Party
            </Button>

            <Button 
              variant="ghost" 
              onClick={onLogout}
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </Button>
          </div>
        </>
      ) : (
        <>
          {/* Join Header */}
          <div className="flex flex-col items-center text-center pt-6 pb-6">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mb-4">
              <Users2 className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground mb-2">Join Party</h1>
            <p className="text-muted-foreground text-sm px-4">Enter the room code shared by your friend</p>
          </div>

          {/* Join Form */}
          <div className="flex-1 px-6 flex flex-col justify-center space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Room Code</label>
              <Input
                placeholder="Enter room code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                className={`text-center font-mono text-lg h-12 ${error ? "border-destructive" : ""}`}
              />
              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}
              <p className="text-xs text-muted-foreground text-center">
                Room codes are typically 4-6 characters long
              </p>
            </div>

            {/* Join Tips */}
            <div className="p-4 bg-muted/20 rounded-lg">
              <h3 className="text-sm font-medium text-foreground mb-2">💡 Quick Tips</h3>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Make sure you're on a YouTube video page</li>
                <li>• The host will share a room code with you</li>
                <li>• Everyone will watch in perfect sync</li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 pb-6 space-y-3">
            <Button 
              onClick={handleJoin}
              disabled={!code.trim()}
              className="w-full h-12"
              size="lg"
            >
              <Users2 className="w-5 h-5 mr-2" />
              Join Party
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => {
                setShowJoin(false)
                setCode('')
                setError('')
              }}
              className="w-full"
            >
              ← Back to Lobby
            </Button>
          </div>
        </>
      )}
    </div>
  )
}