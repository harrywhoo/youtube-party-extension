import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Plus, Users2, Crown, Settings, Globe, Lock, Gamepad2 } from 'lucide-react'

interface NameInputProps {
  username: string
  onChange: (username: string) => void
  onSubmit: () => void
  onBack: () => void
  actionType: 'create' | 'join'
  roomCode?: string
}

export function NameInput({ 
  username, 
  onChange, 
  onSubmit, 
  onBack, 
  actionType, 
  roomCode 
}: NameInputProps) {
  const [error, setError] = useState('')
  const [isPrivate, setIsPrivate] = useState(true)
  const [autoSync, setAutoSync] = useState(true)
  const [allowControl, setAllowControl] = useState(false)

  const handleSubmit = () => {
    if (!username.trim()) {
      setError('Please enter your username')
      return
    }
    
    if (username.trim().length < 2) {
      setError('Username must be at least 2 characters')
      return
    }
    
    setError('')
    onSubmit()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  const actionText = actionType === 'create' ? 'Create Party' : 'Join Party'

  if (actionType === 'create') {
    return (
      <div className="h-full bg-background flex flex-col">
        {/* Header */}
        <div className="flex flex-col items-center text-center pt-6 pb-4">
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mb-4">
            <Plus className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2">Create Party</h1>
          <p className="text-muted-foreground text-sm px-4">Set up your watch party and invite friends</p>
        </div>

        {/* Form Content */}
        <div className="flex-1 px-6 space-y-4">
          {/* Username Section */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Your Username</label>
            <Input
              placeholder="Enter your username"
              value={username}
              onChange={(e) => onChange(e.target.value)}
              onKeyPress={handleKeyPress}
              className={error ? "border-destructive" : ""}
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          {/* Preview */}
          {username.trim() && (
            <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                  {username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{username}</p>
                  <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">
                    <Crown className="w-3 h-3 mr-1" />
                    Host
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">You'll be the party host</p>
              </div>
            </div>
          )}

          {/* Party Settings */}
          <div className="space-y-3 p-4 bg-muted/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Party Settings</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isPrivate ? <Lock className="w-4 h-4 text-muted-foreground" /> : <Globe className="w-4 h-4 text-muted-foreground" />}
                  <span className="text-sm text-foreground">Private Room</span>
                </div>
                <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Auto-sync playback</span>
                <Switch checked={autoSync} onCheckedChange={setAutoSync} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">Guest controls</span>
                </div>
                <Switch checked={allowControl} onCheckedChange={setAllowControl} />
              </div>
            </div>
          </div>

          {/* Party Features */}
          <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
            <h3 className="text-sm font-medium text-foreground mb-2">🎉 What you'll get</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Perfect video synchronization</li>
              <li>• Easy sharing with room codes</li>
              <li>• Host controls and moderation</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 space-y-3">
          <Button 
            onClick={handleSubmit}
            disabled={!username.trim()}
            className="w-full h-12"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            {actionText}
          </Button>
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="w-full"
          >
            ← Back
          </Button>
        </div>
      </div>
    )
  }

  // Join Party Flow (simplified)
  return (
    <div className="h-full bg-background flex flex-col">
      {/* Header */}
      <div className="flex flex-col items-center text-center pt-8 pb-6">
        <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mb-4">
          <Users2 className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-xl font-bold text-foreground mb-2">Join Party</h1>
        <p className="text-muted-foreground text-sm px-4">
          Joining room <span className="font-mono font-bold text-primary">{roomCode}</span>
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 flex flex-col justify-center space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Your Username</label>
          <Input
            placeholder="Enter your username"
            value={username}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={handleKeyPress}
            className={error ? "border-destructive" : ""}
          />
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        {/* Preview */}
        {username.trim() && (
          <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                {username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs text-muted-foreground">Preview</p>
              <p className="text-sm font-medium text-foreground">{username}</p>
            </div>
          </div>
        )}

        {/* Join Info */}
        <div className="p-4 bg-muted/20 rounded-lg">
          <h3 className="text-sm font-medium text-foreground mb-2">✨ Ready to join?</h3>
          <p className="text-xs text-muted-foreground">
            You'll be connected to the party and can start watching together instantly.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 pb-6 space-y-3">
        <Button 
          onClick={handleSubmit}
          disabled={!username.trim()}
          className="w-full h-12"
          size="lg"
        >
          <Users2 className="w-5 h-5 mr-2" />
          {actionText}
        </Button>
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="w-full"
        >
          ← Back
        </Button>
      </div>
    </div>
  )
}