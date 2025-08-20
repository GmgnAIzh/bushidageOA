"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Loader2, Terminal } from "lucide-react"

interface LoginFormProps {
  onLogin: (username: string, password: string) => void;
  isLoading: boolean;
}

export function LoginForm({ onLogin, isLoading }: LoginFormProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onLogin(username, password)
  }

  return (
    <Card className="w-full max-w-md bg-terminus-bg-secondary border-terminus-border shadow-2xl shadow-terminus-accent/10">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4">
          <Terminal size={48} className="text-terminus-accent" />
        </div>
        <CardTitle className="text-2xl font-bold text-terminus-accent tracking-widest">
          BUSHIDAGE//OA
        </CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username">USER_ID</Label>
            <Input
              id="username"
              type="text"
              placeholder="[Enter your designation]"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="bg-terminus-bg-primary border-terminus-border focus:ring-terminus-accent h-12"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">ACCESS_KEY</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="[Enter your secret key]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-terminus-bg-primary border-terminus-border focus:ring-terminus-accent h-12 pr-10"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 text-terminus-text-primary/50 hover:text-terminus-accent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              disabled={isLoading}
              className="border-terminus-accent data-[state=checked]:bg-terminus-accent data-[state=checked]:text-terminus-bg-primary"
            />
            <Label htmlFor="remember" className="text-sm font-normal text-terminus-text-primary/80">
              // Keep session active
            </Label>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full h-12 bg-terminus-accent text-terminus-bg-primary font-bold text-base hover:bg-terminus-accent/90 transition-all duration-300 hover:shadow-lg hover:shadow-terminus-accent/20"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                AUTHENTICATING...
              </>
            ) : (
              "INITIATE_CONNECTION"
            )}
          </Button>
          <div className="text-center text-xs text-terminus-text-primary/40 pt-4">
            <p>// Unauthorized access is strictly prohibited.</p>
            <p>// All activities are monitored and logged.</p>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
