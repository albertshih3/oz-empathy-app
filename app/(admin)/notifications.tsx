import { Redirect } from 'expo-router';

// This file redirects from the admin notifications page to the new notifications history page
export default function AdminNotificationsRedirect() {
  return <Redirect href="/home/notifications" />;
}