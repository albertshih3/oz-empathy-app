const admin = require('firebase-admin');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option('title', {
    type: 'string',
    description: 'Notification title',
    demandOption: true
  })
  .option('body', {
    type: 'string',
    description: 'Notification message body',
    demandOption: true
  })
  .option('topic', {
    type: 'string',
    description: 'Topic to send to',
    default: 'all'
  })
  .option('data', {
    type: 'string',
    description: 'Additional data to send (JSON string)',
    default: '{}'
  })
  .help()
  .alias('help', 'h')
  .argv;

// Path to service account file - replace with your own path
// IMPORTANT: Never commit this file to version control
const serviceAccountPath = './firebase-service-account.json';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountPath)
    });
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    process.exit(1);
  }
}

// Parse data JSON if provided
let dataPayload = {};
try {
  dataPayload = JSON.parse(argv.data);
} catch (error) {
  console.error('Error parsing data JSON:', error);
  process.exit(1);
}

// Construct the notification message
const message = {
  notification: {
    title: argv.title,
    body: argv.body
  },
  data: dataPayload,
  topic: argv.topic, // Send to a specific topic or 'all' for everyone
  android: {
    notification: {
      icon: 'notification_icon',
      color: '#183152'
    }
  },
  apns: {
    payload: {
      aps: {
        sound: 'default'
      }
    }
  }
};

// Send the message
admin.messaging().send(message)
  .then((response) => {
    console.log('Successfully sent notification:');
    console.log(`- Title: ${argv.title}`);
    console.log(`- Body: ${argv.body}`);
    console.log(`- Topic: ${argv.topic}`);
    console.log(`- Message ID: ${response}`);
  })
  .catch((error) => {
    console.error('Error sending notification:', error);
  });