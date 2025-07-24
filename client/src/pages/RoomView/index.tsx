import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Play, Users, Copy, Check, LogOut, Crown, Wifi, WifiOff, Loader2 } from 'lucide-react'

interface Member {
  socketId: string
  username: string
}

interface RoomViewProps {
  username: string
  status: 'connected' | 'connecting' | 'disconnected'
  roomCode: string
  members: Member[]
  onLeave: () => void
}

export function RoomView({ username, status, roomCode, members, onLeave }: RoomViewProps) {
  const [showShareCode, setShowShareCode] = useState(false)
  const [copied, setCopied] = useState(false)
  
  const isHost = members.length > 0 && members[0].username === username

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
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
        return 'Synced'
      case 'connecting':
        return 'Syncing...'
      case 'disconnected':
        return 'Offline'
    }
  }

  const getStatusBadge = () => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-50 text-green-700 border-green-200">Synced</Badge>
      case 'connecting':
        return <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200">Syncing</Badge>
      case 'disconnected':
        return <Badge variant="destructive">Offline</Badge>
    }
  }

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Room Header */}
      <div className="p-4 border-b">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto">
            <Play className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Room {roomCode}</h1>
            <p className="text-sm text-muted-foreground">
              {members.length} member{members.length !== 1 ? 's' : ''} watching together
            </p>
          </div>
          
          {/* Room Actions */}
          <div className="flex gap-2 justify-center">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowShareCode(!showShareCode)}
            >
              <Copy className="w-4 h-4 mr-2" />
              Share Code
            </Button>
            {isHost && (
              <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">
                <Crown className="w-3 h-3 mr-1" />
                Host
              </Badge>
            )}
          </div>

          {/* Share Code Section */}
          {showShareCode && (
            <div className="space-y-2 p-3 bg-muted/40 rounded-lg">
              <p className="text-xs text-muted-foreground">Share this code:</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-background rounded px-3 py-2 font-mono text-sm font-bold text-primary text-center border">
                  {roomCode}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleCopyCode}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Connection Status */}
      <div className="p-4">
        <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <p className="text-sm font-medium text-foreground">Connection Status</p>
              <p className="text-xs text-muted-foreground">{getStatusText()}</p>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </div>

      {/* Members List */}
      <div className="flex-1 px-4 pb-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Members ({members.length})
            </h3>
            {members.length > 1 && (
              <Badge variant="outline" className="text-xs">
                {members.length > 4 ? 'Crowded' : members.length > 2 ? 'Active' : 'Cozy'}
              </Badge>
            )}
          </div>
          
          <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
            {members.map((member, index) => (
              <div 
                key={member.socketId} 
                className="flex items-center gap-2 p-2 bg-muted/40 rounded-lg"
              >
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                    {member.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{member.username}</p>
                  <p className="text-xs text-muted-foreground">
                    {member.username === username ? 'You' : index === 0 ? 'Host' : 'Member'}
                  </p>
                </div>
                {index === 0 && (
                  <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs px-1.5 py-0.5">
                    <Crown className="w-2.5 h-2.5 mr-1" />
                    Host
                  </Badge>
                )}
                {member.username === username && index !== 0 && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5">You</Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Separator />

      {/* Leave Room */}
      <div className="p-4">
        <Button 
          variant="destructive" 
          onClick={onLeave}
          className="w-full"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Leave Party
        </Button>
      </div>
    </div>
  )
}