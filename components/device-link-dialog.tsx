"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle, Key, Monitor, Mail, Shield } from "lucide-react"
import { linkDeviceToUser, getDeviceRegistration } from "@/lib/realtime-db"
import { grantClientAccess } from "@/lib/firestore"

interface DeviceLinkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  displayId: string
  displayName: string
  onSuccess?: (deviceId: string) => void // Pass deviceId to success callback
}

export function DeviceLinkDialog({
  open,
  onOpenChange,
  userId,
  displayId,
  displayName,
  onSuccess,
}: DeviceLinkDialogProps) {
  const [deviceId, setDeviceId] = useState("")
  const [deviceKey, setDeviceKey] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [role, setRole] = useState("operator")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // The display app publishes the account it is signed into. Verify the email the owner
      // entered matches that account so access is granted to the intended person.
      const registration = await getDeviceRegistration(deviceId)
      if (!registration) {
        setError("Device not found. Open the app so it can register, then try again.")
        setLoading(false)
        return
      }

      const enteredEmail = clientEmail.trim().toLowerCase()
      const registeredEmail = (registration.clientEmail ?? "").toLowerCase()

      // App devices publish the account they're signed into. When present, confirm the email
      // matches so cross-account access is granted to the intended person. Raspberry Pi devices
      // use the Admin SDK (no app account) and link directly without an email.
      if (registeredEmail) {
        if (!enteredEmail) {
          setError("Enter the email the display app is signed in with.")
          setLoading(false)
          return
        }
        if (enteredEmail !== registeredEmail) {
          setError("Email doesn't match the account signed into this device.")
          setLoading(false)
          return
        }
      }

      const result = await linkDeviceToUser(deviceId, deviceKey, userId, displayId, role)

      if (result.success) {
        // Grant the linked client account cross-account read access in Firestore (displays/content/schedules)
        if (result.clientUid && result.clientUid !== userId) {
          await grantClientAccess(userId, result.clientUid, {
            clientEmail: registration.clientEmail,
            displayId,
            deviceId,
            role,
          })
        }

        setSuccess(true)

        // Call success handler immediately (before closing dialog)
        if (onSuccess) {
          await onSuccess(deviceId)
        }

        // Wait a bit to show success message, then close
        setTimeout(() => {
          // Reset form
          setDeviceId("")
          setDeviceKey("")
          setClientEmail("")
          setRole("operator")
          setSuccess(false)

          // Don't call onOpenChange(false) - parent handles closing
        }, 1500)
      } else {
        setError(result.error || "Failed to link device")
      }
    } catch (err) {
      setError("An error occurred while linking the device")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!loading && !success) onOpenChange(next) }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Link Device
          </DialogTitle>
          <DialogDescription>
            Link a device (Android display or Raspberry Pi) to <strong>{displayName}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Device ID Input */}
            <div className="space-y-2">
              <Label htmlFor="device-id" className="flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                Device ID
              </Label>
              <Input
                id="device-id"
                placeholder="DEVICE_001"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                required
                disabled={loading || success}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                The unique ID shown on the device (Android app: Display Info tab; Raspberry Pi: player console)
              </p>
            </div>

            {/* Device Key Input */}
            <div className="space-y-2">
              <Label htmlFor="device-key" className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                Device Key
              </Label>
              <Input
                id="device-key"
                type="password"
                placeholder="Enter device secret key"
                value={deviceKey}
                onChange={(e) => setDeviceKey(e.target.value)}
                required
                disabled={loading || success}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                The secret key generated for this device
              </p>
            </div>

            {/* App Account Email Input */}
            <div className="space-y-2">
              <Label htmlFor="client-email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                App Account Email
              </Label>
              <Input
                id="client-email"
                type="email"
                placeholder="display-user@example.com"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                disabled={loading || success}
              />
              <p className="text-xs text-muted-foreground">
                The email the display app is signed in with — it can differ from yours. Leave blank for a Raspberry Pi.
              </p>
            </div>

            {/* Role Select */}
            <div className="space-y-2">
              <Label htmlFor="role" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Role
              </Label>
              <Select value={role} onValueChange={setRole} disabled={loading || success}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer — play assigned content only</SelectItem>
                  <SelectItem value="operator">Operator — play + report status</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Access level granted to the linked app account for this display.
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Success Alert */}
            {success && (
              <Alert className="bg-green-500/10 border-green-500/20 text-green-500">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Device linked successfully! Your device should connect shortly.
                </AlertDescription>
              </Alert>
            )}

            {/* Instructions */}
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <p className="text-sm font-medium">Where to find these values:</p>
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Android app: open the Display Info tab (or Profile &amp; Settings)</li>
                <li>Raspberry Pi: run the player; values appear in the console</li>
                <li>Copy the Device ID and Device Key and paste them here</li>
                <li>Click "Link Device" to connect</li>
              </ol>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading || success}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || success || !deviceId || !deviceKey}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {success && <CheckCircle className="mr-2 h-4 w-4" />}
              {loading ? "Linking..." : success ? "Linked!" : "Link Device"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
