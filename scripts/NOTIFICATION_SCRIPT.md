# Notification Testing Script

This script allows testing push notifications for the Oakland Zoo Empathy App from a server or command line.

## Prerequisites

- Node.js installed
- Firebase Admin SDK credentials
- Access to the Firebase project

## Setup

1. Make sure you have the Firebase Admin SDK credentials JSON file
2. Place the credentials file in a secure location
3. Update the `serviceAccountPath` in the script to point to your credentials file

## Usage

```bash
# Install dependencies if you haven't already
npm install firebase-admin

# Run the script
node send-notification.js --title "Your Title" --body "Your notification message"
```

## Options

- `--title`: The notification title (required)
- `--body`: The notification message body (required)
- `--topic`: Send to a specific topic instead of all devices (optional, defaults to "all")
- `--data`: Additional data to send with the notification in JSON format (optional)

## Example

```bash
# Send a simple notification to all devices
node send-notification.js --title "Important Update" --body "The zoo will be closing early today at 4pm"

# Send with additional data
node send-notification.js --title "New Animal" --body "Meet our new giraffe!" --data '{"type":"animal","id":"giraffe1"}'
```

## Security Note

This script should only be used by authorized administrators. The service account credentials grant full access to your Firebase project, so handle them with care and never commit them to version control.