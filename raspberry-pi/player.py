#!/usr/bin/env python3
"""
PanelSena Raspberry Pi Player
A digital signage player that connects to Firebase and plays scheduled content
"""

import os
import sys
import time
import json
import subprocess
import threading
import requests
from datetime import datetime
from pathlib import Path
import firebase_admin
from firebase_admin import credentials, db, storage
import vlc

# Configuration
CONFIG_FILE = "config.json"
CONTENT_DIR = "content"
CACHE_DIR = "cache"

class PanelSenaPlayer:
    def __init__(self):
        self.config = self.load_config()
        self.device_id = self.config.get("device_id")
        self.device_key = self.config.get("device_key")
        self.display_name = self.config.get("display_name", "Raspberry Pi Display")

        # Will be set after device link verification
        self.user_id = None
        self.display_id = None

        # Initialize Firebase
        self.init_firebase()

        # Authenticate and get device link
        self.authenticate_device()

        # Create content directories
        Path(CONTENT_DIR).mkdir(exist_ok=True)
        Path(CACHE_DIR).mkdir(exist_ok=True)

        # VLC player instance
        self.vlc_instance = vlc.Instance('--no-xlib --quiet')
        self.player = self.vlc_instance.media_player_new()
        self.current_media = None

        # State
        self.is_playing = False
        self.is_paused = False
        self.current_content = None
        self.current_schedule = None
        self.content_queue = []
        self.current_index = 0
        self.volume = 80

        # Heartbeat thread
        self.running = True
        self.heartbeat_thread = threading.Thread(target=self.heartbeat_loop)
        self.heartbeat_thread.daemon = True

        print(f"[INFO] PanelSena Player initialized for display: {self.display_name}")

    def load_config(self):
        """Load configuration from config.json"""
        if not os.path.exists(CONFIG_FILE):
            print(f"[ERROR] Configuration file {CONFIG_FILE} not found!")
            print("Please create a config.json file with your Firebase credentials")
            sys.exit(1)

        with open(CONFIG_FILE, 'r') as f:
            return json.load(f)

    def init_firebase(self):
        """Initialize Firebase Admin SDK"""
        try:
            # Initialize with service account
            cred = credentials.Certificate(self.config.get("service_account_path"))
            firebase_admin.initialize_app(cred, {
                'databaseURL': self.config.get("database_url"),
                'storageBucket': self.config.get("storage_bucket")
            })

            # Get database and storage references
            self.db = db
            self.storage_bucket = storage.bucket()

            print("[INFO] Firebase initialized successfully")
        except Exception as e:
            print(f"[ERROR] Failed to initialize Firebase: {e}")
            sys.exit(1)

    def authenticate_device(self):
        """Authenticate device and get user/display link"""
        try:
            print(f"[INFO] Authenticating device: {self.device_id}")

            # First, register device in registry (or update last seen)
            device_ref = self.db.reference(f'device_registry/{self.device_id}')
            device_data = device_ref.get()

            if device_data:
                # Verify device key
                if device_data.get('deviceKey') != self.device_key:
                    print("[ERROR] Invalid device key!")
                    print("The device key in config.json does not match the registered device.")
                    sys.exit(1)

                # Update last seen
                device_ref.update({'lastSeen': {'".sv"': "timestamp"}})
                print("[INFO] Device authenticated successfully")
            else:
                # Register new device
                print("[INFO] Registering new device...")
                device_ref.set({
                    'deviceId': self.device_id,
                    'deviceKey': self.device_key,
                    'displayName': self.display_name,
                    'registeredAt': {'".sv"': "timestamp"},
                    'lastSeen': {'".sv"': "timestamp"},
                    'linkedToUser': None,
                    'status': 'registered'
                })
                print("[INFO] Device registered. Please link it in the dashboard.")

            # Check if device is linked to a user
            link_ref = self.db.reference(f'device_links/{self.device_id}')
            link_data = link_ref.get()

            if link_data:
                self.user_id = link_data.get('userId')
                self.display_id = link_data.get('displayId')
                print(f"[INFO] Device linked to user: {self.user_id}, display: {self.display_id}")
            else:
                print("[WARN] Device not linked to any user yet")
                print("Please link this device in the dashboard:")
                print(f"  Device ID:  {self.device_id}")
                print(f"  Device Key: {self.device_key}")
                print()
                print("Waiting for device to be linked...")

                # Wait for link
                self.wait_for_device_link()

        except Exception as e:
            print(f"[ERROR] Device authentication failed: {e}")
            sys.exit(1)

    def wait_for_device_link(self):
        """Wait for device to be linked to a user"""
        link_ref = self.db.reference(f'device_links/{self.device_id}')

        print("[INFO] Polling for device link every 5 seconds...")
        while self.running:
            link_data = link_ref.get()
            if link_data:
                self.user_id = link_data.get('userId')
                self.display_id = link_data.get('displayId')
                print(f"[INFO] Device linked! User: {self.user_id}, Display: {self.display_id}")
                break
            time.sleep(5)

    def update_status(self, status="online", error_message=None):
        """Update display status in Firebase Realtime Database"""
        try:
            status_ref = self.db.reference(f'users/{self.user_id}/displays/{self.display_id}/status')

            status_data = {
                'displayId': self.display_id,
                'displayName': self.display_name,
                'status': status,
                'lastHeartbeat': int(time.time() * 1000),
                'volume': self.volume,
            }

            # Add current content if playing
            if self.current_content:
                status_data['currentContent'] = {
                    'id': self.current_content.get('id'),
                    'name': self.current_content.get('name'),
                    'type': self.current_content.get('type'),
                    'url': self.current_content.get('url'),
                    'startedAt': self.current_content.get('startedAt'),
                }
            else:
                status_data['currentContent'] = None

            # Add schedule info if active
            if self.current_schedule:
                status_data['schedule'] = {
                    'id': self.current_schedule.get('id'),
                    'name': self.current_schedule.get('name'),
                    'contentQueue': self.content_queue,
                    'currentIndex': self.current_index,
                }
            else:
                status_data['schedule'] = None

            # Add error message if provided
            if error_message:
                status_data['errorMessage'] = error_message

            status_ref.set(status_data)

        except Exception as e:
            print(f"[ERROR] Failed to update status: {e}")

    def heartbeat_loop(self):
        """Send heartbeat every 10 seconds"""
        while self.running:
            try:
                current_status = "playing" if self.is_playing and not self.is_paused else \
                                "paused" if self.is_paused else "online"
                self.update_status(current_status)
            except Exception as e:
                print(f"[ERROR] Heartbeat failed: {e}")

            time.sleep(10)

    def listen_for_commands(self):
        """Listen for commands from Firebase"""
        commands_ref = self.db.reference(f'users/{self.user_id}/displays/{self.display_id}/commands')

        def command_listener(event):
            """Handle incoming commands"""
            if event.data is None:
                return

            for command_id, command in event.data.items():
                if command.get('status') == 'pending':
                    print(f"[INFO] Received command: {command.get('type')}")
                    self.execute_command(command_id, command)

        commands_ref.listen(command_listener)
        print("[INFO] Listening for commands...")

    def execute_command(self, command_id, command):
        """Execute a playback command"""
        try:
            command_type = command.get('type')
            payload = command.get('payload', {})

            if command_type == 'play':
                if 'scheduleId' in payload:
                    self.load_and_play_schedule(payload['scheduleId'])
                elif 'contentId' in payload:
                    self.play_single_content(payload['contentId'])

            elif command_type == 'pause':
                self.pause_playback()

            elif command_type == 'stop':
                self.stop_playback()

            elif command_type == 'skip':
                self.skip_content()

            elif command_type == 'volume':
                self.set_volume(payload.get('volume', 80))

            elif command_type == 'restart':
                self.restart_device()

            # Mark command as executed
            command_ref = self.db.reference(
                f'users/{self.user_id}/displays/{self.display_id}/commands/{command_id}'
            )
            command_ref.update({
                'status': 'executed',
                'result': 'Command executed successfully'
            })

        except Exception as e:
            print(f"[ERROR] Failed to execute command: {e}")
            # Mark command as failed
            command_ref = self.db.reference(
                f'users/{self.user_id}/displays/{self.display_id}/commands/{command_id}'
            )
            command_ref.update({
                'status': 'failed',
                'result': str(e)
            })

    def load_and_play_schedule(self, schedule_id):
        """Load schedule from Firestore and start playback"""
        try:
            # Note: For simplicity, we're using the schedule_id directly
            # In a real implementation, you'd fetch the schedule from Firestore
            print(f"[INFO] Loading schedule: {schedule_id}")

            # For now, simulate schedule loading
            # You would need to add Firestore client to fetch actual schedule data
            # This is a simplified version

            self.current_schedule = {
                'id': schedule_id,
                'name': f"Schedule {schedule_id}",
            }

            # Start playing the first content
            self.current_index = 0
            if self.content_queue:
                self.play_from_queue()

        except Exception as e:
            print(f"[ERROR] Failed to load schedule: {e}")
            self.update_status("error", str(e))

    def play_single_content(self, content_id):
        """Play a single content item"""
        try:
            print(f"[INFO] Playing content: {content_id}")
            # Fetch content metadata and play
            # This would require fetching from Firestore
            pass
        except Exception as e:
            print(f"[ERROR] Failed to play content: {e}")
            self.update_status("error", str(e))

    def download_content(self, storage_path, local_path):
        """Download content from Firebase Storage"""
        try:
            print(f"[INFO] Downloading: {storage_path}")
            blob = self.storage_bucket.blob(storage_path)
            blob.download_to_filename(local_path)
            print(f"[INFO] Downloaded to: {local_path}")
            return True
        except Exception as e:
            print(f"[ERROR] Failed to download content: {e}")
            return False

    def play_file(self, file_path, content_info):
        """Play a media file using VLC"""
        try:
            if not os.path.exists(file_path):
                print(f"[ERROR] File not found: {file_path}")
                return False

            print(f"[INFO] Playing: {file_path}")

            # Create media
            self.current_media = self.vlc_instance.media_new(file_path)
            self.player.set_media(self.current_media)

            # Set volume
            self.player.audio_set_volume(self.volume)

            # Play
            self.player.play()

            # Update state
            self.is_playing = True
            self.is_paused = False
            self.current_content = {
                **content_info,
                'startedAt': int(time.time() * 1000)
            }

            self.update_status("playing")

            # Monitor playback
            self.monitor_playback()

            return True

        except Exception as e:
            print(f"[ERROR] Failed to play file: {e}")
            self.update_status("error", str(e))
            return False

    def monitor_playback(self):
        """Monitor playback and handle end of media"""
        def check_playback():
            while self.is_playing:
                state = self.player.get_state()
                if state == vlc.State.Ended:
                    print("[INFO] Playback ended")
                    self.skip_content()
                    break
                time.sleep(1)

        monitor_thread = threading.Thread(target=check_playback)
        monitor_thread.daemon = True
        monitor_thread.start()

    def play_from_queue(self):
        """Play next content from queue"""
        if self.current_index < len(self.content_queue):
            content_id = self.content_queue[self.current_index]
            # Fetch content and play
            # This is simplified - you'd fetch actual content metadata
            print(f"[INFO] Playing from queue: {content_id} (index {self.current_index})")
        else:
            # Loop back to start
            self.current_index = 0
            if self.content_queue:
                self.play_from_queue()

    def pause_playback(self):
        """Pause playback"""
        if self.is_playing and not self.is_paused:
            self.player.pause()
            self.is_paused = True
            self.update_status("paused")
            print("[INFO] Playback paused")

    def stop_playback(self):
        """Stop playback"""
        self.player.stop()
        self.is_playing = False
        self.is_paused = False
        self.current_content = None
        self.current_schedule = None
        self.content_queue = []
        self.current_index = 0
        self.update_status("online")
        print("[INFO] Playback stopped")

    def skip_content(self):
        """Skip to next content"""
        if self.content_queue:
            self.current_index += 1
            if self.current_index >= len(self.content_queue):
                self.current_index = 0
            self.play_from_queue()
            print(f"[INFO] Skipped to index {self.current_index}")

    def set_volume(self, volume):
        """Set playback volume"""
        self.volume = max(0, min(100, volume))
        self.player.audio_set_volume(self.volume)
        self.update_status()
        print(f"[INFO] Volume set to {self.volume}%")

    def restart_device(self):
        """Restart the Raspberry Pi"""
        print("[INFO] Restarting device...")
        self.cleanup()
        os.system('sudo reboot')

    def cleanup(self):
        """Cleanup before shutdown"""
        print("[INFO] Cleaning up...")
        self.running = False
        self.stop_playback()
        self.update_status("offline")

    def run(self):
        """Main run loop"""
        try:
            # Initialize status
            self.update_status("online")

            # Start heartbeat
            self.heartbeat_thread.start()

            # Listen for commands
            self.listen_for_commands()

            # Keep running
            print("[INFO] Player is running. Press Ctrl+C to exit.")
            while self.running:
                time.sleep(1)

        except KeyboardInterrupt:
            print("\n[INFO] Shutting down...")
        except Exception as e:
            print(f"[ERROR] Unexpected error: {e}")
        finally:
            self.cleanup()

def main():
    """Main entry point"""
    print("=" * 50)
    print("PanelSena Raspberry Pi Player")
    print("=" * 50)

    player = PanelSenaPlayer()
    player.run()

if __name__ == "__main__":
    main()
