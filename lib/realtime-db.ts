import { realtimeDb } from './firebase'
import {
  ref,
  set,
  get,
  update,
  remove,
  onValue,
  push,
  serverTimestamp,
  DatabaseReference,
  Unsubscribe,
} from 'firebase/database'
import { LivePlaybackStatus, PlaybackCommand, DeviceRegistration } from './types'

// Realtime Database paths
const PATHS = {
  displays: (userId: string) => `users/${userId}/displays`,
  displayStatus: (userId: string, displayId: string) =>
    `users/${userId}/displays/${displayId}/status`,
  commands: (userId: string, displayId: string) =>
    `users/${userId}/displays/${displayId}/commands`,
  devices: (userId: string) => `users/${userId}/devices`,
  // Device registration paths (independent of user)
  deviceRegistry: () => `device_registry`,
  deviceAuth: (deviceId: string) => `device_registry/${deviceId}`,
  deviceLinks: () => `device_links`,
  deviceLink: (deviceId: string) => `device_links/${deviceId}`,
  // Cross-account grant: lets a different client account heartbeat/read the owner's display subtree
  authorizedClient: (ownerUid: string, clientUid: string) =>
    `users/${ownerUid}/authorizedClients/${clientUid}`,
  // QR "sign in with code" pairing: TV writes a short code here; the phone/browser completes it
  pairingSession: (code: string) => `pairing_sessions/${code}`,
}

// Update display live status
export async function updateDisplayStatus(
  userId: string,
  displayId: string,
  status: Partial<LivePlaybackStatus>
): Promise<void> {
  const statusRef = ref(realtimeDb, PATHS.displayStatus(userId, displayId))
  await update(statusRef, {
    ...status,
    lastHeartbeat: serverTimestamp(),
  })
}

// Get display live status
export async function getDisplayStatus(
  userId: string,
  displayId: string
): Promise<LivePlaybackStatus | null> {
  const statusRef = ref(realtimeDb, PATHS.displayStatus(userId, displayId))
  const snapshot = await get(statusRef)
  return snapshot.exists() ? snapshot.val() : null
}

// Listen to display status changes
export function listenToDisplayStatus(
  userId: string,
  displayId: string,
  callback: (status: LivePlaybackStatus | null) => void
): Unsubscribe {
  const statusRef = ref(realtimeDb, PATHS.displayStatus(userId, displayId))
  return onValue(statusRef, (snapshot) => {
    callback(snapshot.exists() ? snapshot.val() : null)
  })
}

// Listen to all displays status
export function listenToAllDisplaysStatus(
  userId: string,
  callback: (displays: Record<string, LivePlaybackStatus>) => void
): Unsubscribe {
  const displaysRef = ref(realtimeDb, PATHS.displays(userId))
  return onValue(displaysRef, (snapshot) => {
    const data = snapshot.val()
    if (data) {
      // Extract status from each display
      const statuses: Record<string, LivePlaybackStatus> = {}
      Object.keys(data).forEach((displayId) => {
        if (data[displayId].status) {
          statuses[displayId] = data[displayId].status
        }
      })
      callback(statuses)
    } else {
      callback({})
    }
  })
}

// Send command to display
export async function sendPlaybackCommand(
  userId: string,
  displayId: string,
  command: Omit<PlaybackCommand, 'commandId' | 'timestamp' | 'status'>
): Promise<string> {
  const commandsRef = ref(realtimeDb, PATHS.commands(userId, displayId))
  const newCommandRef = push(commandsRef)

  const fullCommand: PlaybackCommand = {
    ...command,
    commandId: newCommandRef.key!,
    timestamp: Date.now(),
    status: 'pending',
  }

  await set(newCommandRef, fullCommand)
  return fullCommand.commandId
}

// Listen to commands for a display (for device to receive)
export function listenToCommands(
  userId: string,
  displayId: string,
  callback: (commands: Record<string, PlaybackCommand>) => void
): Unsubscribe {
  const commandsRef = ref(realtimeDb, PATHS.commands(userId, displayId))
  return onValue(commandsRef, (snapshot) => {
    callback(snapshot.exists() ? snapshot.val() : {})
  })
}

// Update command status (when device executes it)
export async function updateCommandStatus(
  userId: string,
  displayId: string,
  commandId: string,
  status: 'executed' | 'failed',
  result?: string
): Promise<void> {
  const commandRef = ref(
    realtimeDb,
    `${PATHS.commands(userId, displayId)}/${commandId}`
  )
  await update(commandRef, { status, result })
}

// Delete old commands
export async function deleteCommand(
  userId: string,
  displayId: string,
  commandId: string
): Promise<void> {
  const commandRef = ref(
    realtimeDb,
    `${PATHS.commands(userId, displayId)}/${commandId}`
  )
  await remove(commandRef)
}

// Register device
export async function registerDevice(
  userId: string,
  displayId: string,
  deviceInfo: Omit<DeviceRegistration, 'lastSeen'>
): Promise<void> {
  const deviceRef = ref(realtimeDb, `${PATHS.devices(userId)}/${displayId}`)
  await set(deviceRef, {
    ...deviceInfo,
    lastSeen: serverTimestamp(),
  })
}

// Update device heartbeat
export async function updateDeviceHeartbeat(
  userId: string,
  displayId: string
): Promise<void> {
  const deviceRef = ref(realtimeDb, `${PATHS.devices(userId)}/${displayId}`)
  await update(deviceRef, {
    lastSeen: serverTimestamp(),
  })
}

// Initialize display status (when device first connects)
export async function initializeDisplayStatus(
  userId: string,
  displayId: string,
  displayName: string
): Promise<void> {
  const statusRef = ref(realtimeDb, PATHS.displayStatus(userId, displayId))
  const initialStatus: LivePlaybackStatus = {
    displayId,
    displayName,
    status: 'online',
    currentContent: null,
    schedule: null,
    lastHeartbeat: Date.now(),
    volume: 80,
  }
  await set(statusRef, initialStatus)
}

// Clean up old commands (older than 1 hour)
export async function cleanupOldCommands(
  userId: string,
  displayId: string
): Promise<void> {
  const commandsRef = ref(realtimeDb, PATHS.commands(userId, displayId))
  const snapshot = await get(commandsRef)

  if (snapshot.exists()) {
    const commands = snapshot.val()
    const oneHourAgo = Date.now() - 60 * 60 * 1000

    const updates: Record<string, null> = {}
    Object.entries(commands).forEach(([commandId, command]: [string, any]) => {
      if (command.timestamp < oneHourAgo && command.status !== 'pending') {
        updates[commandId] = null
      }
    })

    if (Object.keys(updates).length > 0) {
      await update(commandsRef, updates)
    }
  }
}

// ===== Device-Based Authentication Functions =====

// Register a new device with device_id and device_key
export async function registerDeviceWithKey(
  deviceId: string,
  deviceKey: string,
  deviceInfo: {
    displayName: string
    ipAddress?: string
    macAddress?: string
    osVersion?: string
  }
): Promise<void> {
  const deviceAuthRef = ref(realtimeDb, PATHS.deviceAuth(deviceId))
  await set(deviceAuthRef, {
    deviceId,
    deviceKey, // Stored securely - will be used for authentication
    displayName: deviceInfo.displayName,
    registeredAt: serverTimestamp(),
    lastSeen: serverTimestamp(),
    ipAddress: deviceInfo.ipAddress || '',
    macAddress: deviceInfo.macAddress || '',
    osVersion: deviceInfo.osVersion || '',
    linkedToUser: null, // Not linked to any user yet
    status: 'registered', // registered, linked, active
  })
}

// Verify device credentials
export async function verifyDeviceCredentials(
  deviceId: string,
  deviceKey: string
): Promise<boolean> {
  const deviceAuthRef = ref(realtimeDb, PATHS.deviceAuth(deviceId))
  const snapshot = await get(deviceAuthRef)

  if (!snapshot.exists()) {
    return false
  }

  const deviceData = snapshot.val()
  return deviceData.deviceKey === deviceKey
}

// Get the device registry entry (includes the client app's signed-in account, if any)
export async function getDeviceRegistration(
  deviceId: string
): Promise<{
  clientUid?: string | null
  clientEmail?: string | null
  linkedToUser?: string | null
  displayName?: string
} | null> {
  const snapshot = await get(ref(realtimeDb, PATHS.deviceAuth(deviceId)))
  return snapshot.exists() ? snapshot.val() : null
}

// Link device to user (called from dashboard when user enters device_id and device_key).
// `role` is the access level granted to the linked client account (e.g. "viewer" | "operator").
export async function linkDeviceToUser(
  deviceId: string,
  deviceKey: string,
  userId: string,
  displayId: string,
  role: string = 'operator'
): Promise<{ success: boolean; error?: string; clientUid?: string | null }> {
  try {
    // Verify device credentials first
    const isValid = await verifyDeviceCredentials(deviceId, deviceKey)
    if (!isValid) {
      return { success: false, error: 'Invalid device credentials' }
    }

    // Check if device is already linked
    const deviceAuthRef = ref(realtimeDb, PATHS.deviceAuth(deviceId))
    const deviceSnapshot = await get(deviceAuthRef)
    const deviceData = deviceSnapshot.val()

    if (deviceData.linkedToUser && deviceData.linkedToUser !== userId) {
      return { success: false, error: 'Device already linked to another user' }
    }

    // The account the display client app is signed into (may differ from the dashboard owner)
    const clientUid: string | null = deviceData.clientUid ?? null
    const clientEmail: string | null = deviceData.clientEmail ?? null

    // Create device link
    const deviceLinkRef = ref(realtimeDb, PATHS.deviceLink(deviceId))
    await set(deviceLinkRef, {
      deviceId,
      userId,
      displayId,
      clientUid,
      role,
      linkedAt: serverTimestamp(),
      status: 'active',
    })

    // Grant the client account cross-account access to the owner's display subtree.
    // Without this, RTDB rules deny the app's heartbeat when it is signed into a different account.
    if (clientUid && clientUid !== userId) {
      await set(ref(realtimeDb, PATHS.authorizedClient(userId, clientUid)), {
        clientUid,
        clientEmail,
        deviceId,
        displayId,
        role,
        grantedAt: serverTimestamp(),
      })
    }

    // Update device registry
    await update(deviceAuthRef, {
      linkedToUser: userId,
      linkedDisplayId: displayId,
      status: 'linked',
      lastLinked: serverTimestamp(),
    })

    return { success: true, clientUid }
  } catch (error) {
    console.error('Error linking device:', error)
    return { success: false, error: 'Failed to link device' }
  }
}

// Get user ID and display ID for a device (used by Pi to find where to write status)
export async function getDeviceLink(
  deviceId: string
): Promise<{ userId: string; displayId: string } | null> {
  const deviceLinkRef = ref(realtimeDb, PATHS.deviceLink(deviceId))
  const snapshot = await get(deviceLinkRef)

  if (snapshot.exists()) {
    const data = snapshot.val()
    return {
      userId: data.userId,
      displayId: data.displayId,
    }
  }

  return null
}

// Unlink device from user
export async function unlinkDevice(deviceId: string): Promise<void> {
  const deviceLinkRef = ref(realtimeDb, PATHS.deviceLink(deviceId))
  const deviceAuthRef = ref(realtimeDb, PATHS.deviceAuth(deviceId))

  // Remove the cross-account access grant, if one was created on link
  const linkSnap = await get(deviceLinkRef)
  if (linkSnap.exists()) {
    const link = linkSnap.val()
    if (link.userId && link.clientUid && link.clientUid !== link.userId) {
      await remove(ref(realtimeDb, PATHS.authorizedClient(link.userId, link.clientUid)))
    }
  }

  await remove(deviceLinkRef)
  await update(deviceAuthRef, {
    linkedToUser: null,
    linkedDisplayId: null,
    status: 'registered',
    lastUnlinked: serverTimestamp(),
  })
}

// Update device last seen timestamp
export async function updateDeviceLastSeen(deviceId: string): Promise<void> {
  const deviceAuthRef = ref(realtimeDb, PATHS.deviceAuth(deviceId))
  await update(deviceAuthRef, {
    lastSeen: serverTimestamp(),
  })
}

// ===== QR "sign in with code" pairing =====
// The TV/tablet (anonymously authed) creates pairing_sessions/{code} with its deviceId/deviceKey.
// The phone/browser reads it, links the device to the signed-in account, then marks it linked.

export interface PairingSession {
  deviceId: string
  deviceKey: string
  displayName?: string
  status: 'pending' | 'linked'
  createdAt: number
}

export async function getPairingSession(code: string): Promise<PairingSession | null> {
  const snapshot = await get(ref(realtimeDb, PATHS.pairingSession(code)))
  return snapshot.exists() ? (snapshot.val() as PairingSession) : null
}

// Mark the session linked so the TV can show success (the TV is already watching device_links).
export async function completePairingSession(
  code: string,
  userId: string,
  displayId: string
): Promise<void> {
  await update(ref(realtimeDb, PATHS.pairingSession(code)), {
    status: 'linked',
    userId,
    displayId,
    linkedAt: serverTimestamp(),
  })
}
