"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface LoginFormProps {
  onLogin: (username: string, password: string) => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [loginAttempts, setLoginAttempts] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username.trim() || !password.trim()) {
      setError("请输入用户名和密码")
      return
    }

    if (loginAttempts >= 3) {
      setError("登录失败次数过多，请稍后再试")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // 模拟登录延迟
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 验证登录
      if ((username === "admin" && password === "123456") ||
          (username === "user" && password === "123456")) {

        // 保存登录状态
        if (rememberMe) {
          localStorage.setItem("rememberLogin", "true")
          localStorage.setItem("lastUsername", username)
        }

        onLogin(username, password)
      } else {
        setLoginAttempts(prev => prev + 1)
        setError("用户名或密码错误")
      }
    } catch (error) {
      setError("登录失败，请检查网络连接")
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = () => {
    alert("请联系系统管理员重置密码")
  }

  const handleQuickLogin = (type: "admin" | "user") => {
    if (type === "admin") {
      setUsername("admin")
      setPassword("123456")
    } else {
      setUsername("user")
      setPassword("123456")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-zinc-50 px-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="space-y-1 text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-white">OA</span>
          </div>
          <CardTitle className="text-2xl font-bold text-zinc-900">智慧OA系统</CardTitle>
          <CardDescription className="text-zinc-600">
            欢迎使用企业办公自动化系统
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <Input
                id="username"
                type="text"
                placeholder="请输入用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-11"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pr-10"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                disabled={isLoading}
              />
              <Label htmlFor="remember" className="text-sm font-normal">
                记住登录状态
              </Label>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full h-11 bg-zinc-900 hover:bg-zinc-800"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  登录中...
                </>
              ) : (
                "登录"
              )}
            </Button>

            <div className="flex space-x-2 w-full">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleQuickLogin("admin")}
                disabled={isLoading}
              >
                管理员登录
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleQuickLogin("user")}
                disabled={isLoading}
              >
                普通用户登录
              </Button>
            </div>

            <div className="text-center space-y-2">
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={handleForgotPassword}
                disabled={isLoading}
                className="text-sm text-zinc-600 hover:text-zinc-900"
              >
                忘记密码？
              </Button>

              <div className="text-xs text-zinc-500 space-y-1">
                <p>演示账号：</p>
                <p>管理员: admin / 123456</p>
                <p>普通用户: user / 123456</p>
              </div>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
