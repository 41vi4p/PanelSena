"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Monitor, Mail, Lock, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { ThemeProvider } from "@/components/theme-provider"
import { signIn, signInWithGoogle } from "@/lib/auth"
import { useAuth } from "@/hooks/use-auth"
import { getPairingSession, linkDeviceToUser, completePairingSession, getDeviceRegistration } from "@/lib/realtime-db"
import { createDisplay, grantClientAccess } from "@/lib/firestore"

function PairContent() {
  const params = useSearchParams()
  const code = params.get("code") || ""
  const { user, initializing } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)

  // Once authenticated and a code is present, complete the link automatically.
  useEffect(() => {
    if (!initializing && user && code && !done && !busy) {
      void completeLink()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, initializing, code])

  const completeLink = async () => {
    if (!user) return
    setBusy(true)
    setError("")
    try {
      const session = await getPairingSession(code)
      if (!session) {
        setError("This pairing code is invalid or has expired. Generate a new code on your display.")
        return
      }

      // Create a display for this account and link the TV's device to it.
      const display = await createDisplay(user.uid, {
        name: session.displayName || "TV Display",
        location: "Not Set",
        status: "online",
        resolution: "1920x1080",
        uptime: "0%",
        brightness: 50,
        orientation: "landscape",
        lastUpdate: new Date().toISOString(),
        group: "Uncategorized",
      })

      const result = await linkDeviceToUser(session.deviceId, session.deviceKey, user.uid, display.id, "operator")
      if (!result.success) {
        setError(result.error || "Failed to link the display.")
        return
      }

      // Grant the device's (anonymous) account cross-account read access to this owner's content.
      if (result.clientUid && result.clientUid !== user.uid) {
        const reg = await getDeviceRegistration(session.deviceId)
        await grantClientAccess(user.uid, result.clientUid, {
          clientEmail: reg?.clientEmail ?? null,
          displayId: display.id,
          deviceId: session.deviceId,
          role: "operator",
        })
      }

      await completePairingSession(code, user.uid, display.id)
      setDone(true)
    } catch (err) {
      console.error("Pairing error:", err)
      setError("Something went wrong while linking. Please try again.")
    } finally {
      setBusy(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError("")
    try {
      await signIn(email, password)
      // useAuth picks up the new user and the effect runs completeLink()
    } catch {
      setError("Invalid email or password.")
      setBusy(false)
    }
  }

  const content = () => {
    if (!code) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No pairing code provided. Scan the QR shown on your display.</AlertDescription>
        </Alert>
      )
    }

    if (done) {
      return (
        <div className="text-center py-4">
          <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-1">Device linked successfully</h3>
          <p className="text-sm text-muted-foreground">You can now close this tab. Your display will connect shortly.</p>
        </div>
      )
    }

    if (initializing || (user && busy)) {
      return (
        <div className="text-center py-6">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Linking your display…</p>
        </div>
      )
    }

    // Signed in but the auto-link hasn't completed (e.g. it errored) — let them retry.
    if (user) {
      return (
        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button className="w-full" onClick={completeLink} disabled={busy}>
            Link this display to {user.email}
          </Button>
        </div>
      )
    }

    // Not signed in — show sign-in form.
    return (
      <div className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input id="email" type="email" placeholder="you@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input id="password" type="password" placeholder="••••••••" value={password}
                onChange={(e) => setPassword(e.target.value)} className="pl-10" required />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Signing in…" : "Sign in & link display"}
          </Button>
        </form>
        <Button type="button" variant="outline" className="w-full"
          onClick={async () => { setBusy(true); setError(""); try { await signInWithGoogle() } catch { setError("Google sign-in failed."); setBusy(false) } }}
          disabled={busy}>
          Continue with Google
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8 gap-2">
          <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-lg shadow-lg">
            <Monitor className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            PanelSena
          </span>
        </div>
        <Card className="border-border/50 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-xl">Link your display</CardTitle>
            <CardDescription>
              {code ? `Pairing code: ${code}` : "Connect a TV or tablet to your account"}
            </CardDescription>
          </CardHeader>
          <CardContent>{content()}</CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function PairPage() {
  return (
    <ThemeProvider>
      <Suspense fallback={null}>
        <PairContent />
      </Suspense>
    </ThemeProvider>
  )
}
