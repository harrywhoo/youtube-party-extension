import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { UserHeader } from '@/components/UserHeader'
import { Plus, Users2, Settings, Globe, Lock, Gamepad2 } from 'lucide-react'

interface NameInputProps {
  username: string
  onSubmit: () => void
  onBack: () => void
  actionType: 'create' | 'join'
}

export function NameInput({ 
  username, 
  onSubmit, 
  onBack, 
  actionType
}: NameInputProps) {
  const [isPrivate, setIsPrivate] = useState(true)
  const [allowControl, setAllowControl] = useState(false)
  const [roomName, setRoomName] = useState('')
  const [joinRoomCode, setJoinRoomCode] = useState('')

  const handleSubmit = () => {
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
        <UserHeader username={username} />
        
        {/* Header */}
        <div className="flex flex-col items-center text-center pt-6 pb-4">
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mb-4">
            <Plus className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2">Create Party</h1>
          <p className="text-muted-foreground text-sm px-4">Set up your watch party and invite friends</p>
        </div>

        {/* Form Content */}
        <div className="flex-1 px-6 space-y-3">
          {/* Room Name */}
          <div className="space-y-5">
            <label className="text-lg font-semibold text-foreground pl-1">
              Room Name
            </label>
            
            <Input
              placeholder="optional"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="mt-2"
            />
          </div>

          {/* Party Settings Title */}
          <div className="">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 pl-1">
              <Settings className="w-5 h-5 text-muted-foreground" />
              Party Settings
            </h2>
          </div>

          {/* Party Settings */}
          <div className="space-y-4 p-4 bg-muted/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isPrivate ? <Lock className="w-4 h-4 text-muted-foreground" /> : <Globe className="w-4 h-4 text-muted-foreground" />}
                <span className="text-sm text-foreground">Private Room</span>
              </div>
              <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
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

        {/* Actions */}
        <div className="px-6 pb-6 space-y-2 mt-2">
          <Button 
            onClick={handleSubmit}
            className="w-full h-12"
            size="lg"
          >
            <Plus className="w-4 h-5 mr-2" />
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
      <UserHeader username={username} />
      
      {/* Header */}
      <div className="flex flex-col items-center text-center pt-6 pb-4">
        <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mb-4">
          <Users2 className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-xl font-bold text-foreground mb-2">Join Party</h1>
        <p className="text-muted-foreground text-sm px-4">
          Enter the room code shared by your friend
        </p>
      </div>

      {/* Form Content */}
      <div className="flex-1 px-6 space-y-3">
        {/* Room Code */}
        <div className="space-y-5">
          
          <Input
            placeholder="Enter room code"
            value={joinRoomCode}
            onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            className="text-center font-bold text-lg h-12"
          />
        </div>

        {/* Quick Tips */}
        <div className="">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 pl-1">
            💡 Quick Tips
          </h2>
        </div>

        {/* Tips Content */}
        <div className="p-4 bg-muted/20 rounded-lg">
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• Make sure you're on a YouTube video page</li>
            <li>• The host will share a room code with you</li>
            <li>• Everyone will watch in perfect sync</li>
          </ul>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 pb-6 space-y-2 mt-2">
        <Button 
          onClick={handleSubmit}
          className="w-full h-12"
          size="lg"
        >
          <Users2 className="w-4 h-5 mr-2" />
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