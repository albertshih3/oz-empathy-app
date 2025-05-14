import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Image, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { View, Text, TextField, Button, Incubator, LoaderScreen } from 'react-native-ui-lib';
import auth from '@react-native-firebase/auth';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useRouter, Link } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';

const SignIn = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { Toast } = Incubator;

  function onAuthStateChanged(user: any): void {
    setUser(user);
    if (initializing) setInitializing(false);
    if (user) router.replace('/home'); // Redirect if user is logged in
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  if (initializing) return (<LoaderScreen message={'Loading...'} color={theme.tint} />);

  const validateEmail = (email: string): boolean => {
    // Check if the email ends with @oaklandzoo.org
    return email.toLowerCase().endsWith('@oaklandzoo.org');
  };

  const handleLogin = (email: string, password: string) => {
    if (!email || !password) {
      setToastMessage('Email and password cannot be empty');
      setToastVisible(true);
      return;
    }

    if (!validateEmail(email)) {
      setToastMessage('Please use your @oaklandzoo.org email address');
      setToastVisible(true);
      return;
    }

    console.log('Logging in...');
    setIsLoading(true);
    
    auth()
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        console.log('User has been successfully signed in!');
        setIsLoading(false);
      })
      .catch(error => {
        console.error(error);
        let errorMessage = 'There was an error signing in. Please check your email and password.';
        
        // Handle specific Firebase auth errors
        switch (error.code) {
          case 'auth/invalid-email':
            errorMessage = 'Please enter a valid email address.';
            break;
          case 'auth/user-disabled':
            errorMessage = 'This account has been disabled. Please contact an administrator.';
            break;
          case 'auth/user-not-found':
            errorMessage = 'No account found with this email. Please check your email or sign up.';
            break;
          case 'auth/wrong-password':
            errorMessage = 'Incorrect password. Please try again.';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Too many unsuccessful login attempts. Please try again later.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your connection and try again.';
            break;
        }
        
        setToastMessage(errorMessage);
        setToastVisible(true);
        setIsLoading(false);
      });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <GestureHandlerRootView style={styles.container}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/images/icon.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        
        <Text style={styles.title}>Oakland Zoo</Text>
        <Text style={styles.subtitle}>Sign in with your Oakland Zoo email</Text>
        
        <View style={styles.formContainer}>
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
          
          <Button 
            label={isLoading ? "Signing In..." : "Sign In"}
            onPress={() => handleLogin(email, password)} 
            style={styles.button}
            backgroundColor={theme.tint}
            disabled={isLoading}
          />
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Link href="/signup" asChild>
            <TouchableOpacity>
              <Text style={[styles.linkText, {color: theme.tint}]}>Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>
        
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

export default SignIn;

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
    width: 120,
    height: 120,
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
