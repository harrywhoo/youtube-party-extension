import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Play, Users, Zap, Sparkles } from 'lucide-react'

interface WelcomeProps {
  onComplete: (username: string) => void
}

export function Welcome({ onComplete }: WelcomeProps) {
  const [username, setUsername] = useState('')
  const [step, setStep] = useState<'intro' | 'username'>('intro')
  const [error, setError] = useState('')

  const handleGetStarted = () => {
    setStep('username')
  }

  const handleSubmit = () => {
    if (!username.trim()) {
      setError('Please enter a username')
      return
    }
    
    if (username.trim().length < 2) {
      setError('Username must be at least 2 characters')
      return
    }
    
    setError('')
    onComplete(username.trim())
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }


  if (step === 'intro') {
    return (
      <div className="h-full bg-background flex flex-col">
        {/* Header */}
        <div className="flex flex-col items-center text-center pt-6 pb-4">
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mb-3">
            <Play className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground mb-1">YouTube Party</h1>
          <p className="text-muted-foreground text-sm">Watch videos together with friends</p>
        </div>

        {/* Features */}
        <div className="px-6 space-y-3 mb-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Play className="w-4 h-4 text-primary" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-medium text-foreground">Synchronized Playback</h3>
              <p className="text-xs text-muted-foreground">Perfect video sync</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-medium text-foreground">Watch Parties</h3>
              <p className="text-xs text-muted-foreground">Private rooms with friends</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-medium text-foreground">Secure Authentication</h3>
              <p className="text-xs text-muted-foreground">Safe and secure login</p>
            </div>
          </div>

          {/* Welcome Info */}
          <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-medium text-foreground">Welcome!</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Transform your YouTube experience with synchronized watch parties.
            </p>
          </div>
        </div>

        {/* Action */}
        <div className="px-6 pb-6 mt-auto">
          <Button 
            onClick={handleGetStarted}
            className="w-full h-12"
            size="lg"
          >
            <Users className="w-5 h-5 mr-2" />
            Log In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Header */}
      <div className="flex flex-col items-center text-center pt-6 pb-6">
        <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mb-4">
          <Users className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-xl font-bold text-foreground mb-2">Log In</h1>
        <p className="text-muted-foreground text-sm">Create your YouTube Party account</p>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 space-y-4">
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Username</label>
          <Input
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={handleKeyPress}
            className={error ? "border-destructive" : ""}
          />
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        {/* Login Info */}
        <div className="p-3 bg-muted/20 rounded-lg">
          <h3 className="text-sm font-medium text-foreground mb-2">🔐 Secure Login</h3>
          <p className="text-xs text-muted-foreground">
            Your account will be saved securely and you'll stay logged in across sessions.
          </p>
        </div>

        {/* Benefits */}
        <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
          <h3 className="text-sm font-medium text-foreground mb-2">✨ Account Benefits</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Persistent login across sessions</li>
            <li>• Save your watch party preferences</li>
            <li>• Host and join unlimited parties</li>
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
          <Users className="w-5 h-5 mr-2" />
          Create Account
        </Button>
        <Button 
          variant="ghost" 
          onClick={() => setStep('intro')}
          className="w-full"
        >
          ← Back
        </Button>
      </div>
    </div>
  )
}