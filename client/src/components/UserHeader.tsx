import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Wifi } from 'lucide-react'

interface UserHeaderProps {
  username: string
  isConnected?: boolean
  onReady?: () => void
}

export function UserHeader({ username, isConnected = true, onReady }: UserHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-background border-b border-border">
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
            {username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">{username}</span>
          <div className="flex items-center gap-1">
            <Wifi className="w-3 h-3 text-green-500" />
            <span className="text-xs text-muted-foreground">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>
      
      {onReady && (
        <Button 
          size="sm" 
          variant="outline"
          className="text-xs px-3 py-1 h-7"
          onClick={onReady}
        >
          Ready
        </Button>
      )}
    </div>
  )
}