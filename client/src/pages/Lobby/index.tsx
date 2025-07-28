import { Button } from '@/components/ui/button'
import { UserHeader } from '@/components/UserHeader'
import { Play, Plus, Users2, LogOut, Clock, Shield } from 'lucide-react'

interface LobbyProps {
  username: string
  status: 'connected' | 'connecting' | 'disconnected'
  onStart: () => void
  onJoinClick: () => void
  onLogout: () => void
}

export function Lobby({ username, status, onStart, onJoinClick, onLogout }: LobbyProps) {



  return (
    <div className="h-full bg-background flex flex-col">
      <UserHeader 
        username={username} 
        isConnected={status === 'connected'} 
        onReady={status === 'connected' ? () => {} : undefined}
      />

      {/* App Header */}
      <div className="flex flex-col items-center text-center pt-6 pb-4">
        <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mb-4">
          <Play className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-xl font-bold text-foreground mb-2">YouTube Party</h1>
        <p className="text-muted-foreground text-sm">Watch videos together with friends</p>
      </div>

      {/* Features & Stats */}
      <div className="px-6 mb-4 space-y-4">
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
      </div>

      {/* Actions */}
      <div className="flex-1 flex flex-col justify-end px-6 pb-6 space-y-3">
        <Button 
          onClick={onStart}
          className="w-full h-12"
          size="lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create New Party
        </Button>
        
        <Button 
          variant="outline" 
          onClick={onJoinClick}
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
    </div>
  )
}