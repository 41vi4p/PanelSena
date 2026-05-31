# Changelog

All notable changes to PanelSena are documented here.

## [1.8.0] - 2026-05-31

### Added — Android Client Integration
The Kotlin Android client (`client_app/`) is now a first-class PanelSena player, on par with
the Raspberry Pi player. Any Android display, phone, or tablet can be linked to an account and
controlled centrally from the dashboard.

- **Device-link protocol** matching the Raspberry Pi and dashboard contract:
  - `DeviceIdentityManager` generates and persists a `DEVICE_<timestamp>_<random>` Device ID
    and a 32-char secret Device Key (same format as `setup_device.py`).
  - `RealtimeDataSource` registers the device in `device_registry/{deviceId}`, observes
    `device_links/{deviceId}` to discover its `{userId, displayId}`, writes live status, and
    listens for + acknowledges playback commands.
  - `FirestoreDataSource` resolves content the same way as the Pi player
    (`schedules/{id}.contentIds` → `content/{id}.url`, or a single `content/{id}`).
- **Live heartbeat** to `users/{userId}/displays/{displayId}/status` every 10s, so the device
  shows as online in the dashboard's Live Control.
- **Remote command execution**: `play` (schedule or single content), `pause`, `stop`, `skip`,
  `volume`, `brightness`, `restart` — with results written back to the command.
- The fullscreen player is now driven by shared playback state, so dashboard `play` commands
  open the player automatically and `stop` returns to the app.
- Device ID and Device Key are surfaced in the Display Info tab and Profile & Settings
  (with copy actions) for easy linking.

### Fixed
- **Critical:** the Android app's `google-services.json` pointed at the wrong Firebase project
  (`panelsena-de907`) instead of `panelsena-r2`, so it could never communicate with the
  dashboard or Pi. Re-pointed to `panelsena-r2` (real public Web API key + RTDB URL).
  *Note:* `mobilesdk_app_id` and the OAuth client are placeholders — see `client_app/README.md`
  for downloading the real file from the Firebase Console and adding the signing SHA-1.
- Android Google Sign-In no longer uses a hardcoded (wrong-project) web client ID; it now reads
  `R.string.default_web_client_id` generated from `google-services.json`.
- Dashboard "Link Device" dialog now passes `onOpenChange` to the `Dialog`, so ESC/overlay
  dismissal works (guarded while linking/success).
- Raspberry Pi `set_volume` now controls the system mixer (`pactl`/`amixer`) instead of an
  unused python-vlc instance, so volume commands take effect with subprocess-based playback.
- Removed the obsolete random "Client ID" identity system from the Android app (it relied on a
  Firestore document shape the dashboard never wrote).

### Changed — Android Branding
- App name set to **PanelSena** (was "PanelSenaClient").
- Brand color palette (`colors.xml`) and launch theme (`themes.xml`) aligned to the PanelSena
  identity (navy `#1A1A2E`, purple `#6C63FF`, yellow `#F5C842`, warm background `#F7F6F2`).
- New branded adaptive launcher icon (navy backdrop + display/play mark).
- In-app copy updated (player watermark, FAQ) to reflect Device ID/Key linking.
- Android app version bumped to `1.8.0` (versionCode 2). Added `firebase-database-ktx`.
