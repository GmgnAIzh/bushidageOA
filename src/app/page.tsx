"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { LoginForm } from "@/components/LoginForm"
import { toast } from "sonner"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (username: string, password: string) => {
    setIsLoading(true)

    // Mock authentication
    await new Promise(resolve => setTimeout(resolve, 1000));

    if ((username === 'admin' && password === '123456') ||
        (username === 'user' && password === '123456')) {

      const user = {
        id: username === 'admin' ? 'admin' : 'user-1',
        name: username === 'admin' ? 'System Administrator' : 'Standard User',
        role: username === 'admin' ? 'admin' : 'user',
      }

      // In a real app, you'd use a session library or JWTs.
      // For now, we'll use localStorage to simulate a session.
      localStorage.setItem('oa_current_user', JSON.stringify(user));

      toast.success(`[OK] Authentication successful. Welcome, ${user.name}.`, {
        description: 'Redirecting to secure dashboard...',
      });

      router.push('/dashboard');

    } else {
      toast.error("[FAIL] Access Denied. Invalid credentials.", {
        description: 'Please check your USER_ID and ACCESS_KEY.',
      });
      setIsLoading(false)
    }
  }

  return (
    <main className="flex items-center justify-center min-h-screen p-4">
      <LoginForm onLogin={handleLogin} isLoading={isLoading} />
    </main>
  )
}
