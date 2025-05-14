import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Image, ScrollView, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { View, Text, TextField, Button, Incubator } from 'react-native-ui-lib';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useRouter, Link } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';

const { Toast } = Incubator;

const SignUp = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string): boolean => {
    // Check if the email ends with @oaklandzoo.org
    return email.toLowerCase().endsWith('@oaklandzoo.org');
  };

  const handleSignUp = async () => {
    try {
      // Reset errors
      setToastVisible(false);
      
      // Validate inputs
      if (!email || !password || !confirmPassword || !fullName) {
        setToastMessage('All fields are required');
        setToastVisible(true);
        return;
      }

      if (!validateEmail(email)) {
        setToastMessage('Please use your @oaklandzoo.org email address');
        setToastVisible(true);
        return;
      }

      if (password !== confirmPassword) {
        setToastMessage('Passwords do not match');
        setToastVisible(true);
        return;
      }

      if (password.length < 8) {
        setToastMessage('Password must be at least 8 characters long');
        setToastVisible(true);
        return;
      }

      setIsLoading(true);

      // Create user with Firebase auth
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // Update user profile
      await user.updateProfile({
        displayName: fullName,
      });

      // Save additional user data to Firestore
      await firestore().collection('users').doc(user.uid).set({
        email: email,
        fullName: fullName,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      console.log('User account created & signed in!');
      // Router will automatically redirect to home due to auth state change
      
    } catch (error: any) {
      console.error(error);
      let errorMessage = 'Error creating account. Please try again.';
      
      // Handle Firebase auth error codes
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'That email address is already in use.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Account creation is currently disabled.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please choose a stronger password.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection and try again.';
          break;
      }
      
      setToastMessage(errorMessage);
      setToastVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <GestureHandlerRootView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/images/icon.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the Oakland Zoo team</Text>
          
          <View style={styles.formContainer}>
            <TextField
              placeholder="Full Name"
              floatingPlaceholder
              onChangeText={setFullName}
              value={fullName}
              autoCapitalize="none"
              style={styles.input}
            />

            <TextField
              placeholder="Email"
              floatingPlaceholder
              onChangeText={setEmail}
              value={email}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />

            <TextField
              placeholder="Password"
              floatingPlaceholder
              onChangeText={setPassword}
              value={password}
              secureTextEntry
              autoCapitalize="none"
              style={styles.input}
            />

            <TextField
              placeholder="Confirm Password"
              floatingPlaceholder
              onChangeText={setConfirmPassword}
              value={confirmPassword}
              secureTextEntry
              autoCapitalize="none"
              style={styles.input}
            />
            
            <Button 
              label={isLoading ? "Creating Account..." : "Sign Up"}
              onPress={handleSignUp} 
              style={styles.button}
              backgroundColor={theme.tint}
              disabled={isLoading}
            />
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/signin" asChild>
              <TouchableOpacity>
                <Text style={[styles.linkText, {color: theme.tint}]}>Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
        
        <Toast
          visible={toastVisible}
          position={'bottom'}
          autoDismiss={5000}
          enableHapticFeedback={true}
          message={toastMessage}
          preset='failure'
          onDismiss={() => setToastVisible(false)}
        />
      </GestureHandlerRootView>
    </TouchableWithoutFeedback>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  formContainer: {
    marginBottom: 30,
  },
  input: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 8,
  },
  button: {
    height: 50,
    borderRadius: 10,
    marginTop: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  linkText: {
    fontSize: 14,
    fontWeight: 'bold',
  }
});