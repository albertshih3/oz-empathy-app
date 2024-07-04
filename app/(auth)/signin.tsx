import React, { useState, useEffect } from 'react';
import { View, Text, Image, TextField, Button, Incubator, LoaderScreen } from 'react-native-ui-lib';
import auth from '@react-native-firebase/auth';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useRouter, useFocusEffect } from 'expo-router';

const SignIn = () => {

  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const router = useRouter();

  const {Toast} = Incubator;

  function onAuthStateChanged(user: any): void {
    setUser(user);
    if (initializing) setInitializing(false);
    if (user) router.replace('/home'); // Redirect if user is logged in
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  if (initializing) return (<LoaderScreen message={'Give me a second :)'} color="gray" />);

  const handleLogin = (email: any, password: any) => {

    if (email === '' || password === '') {
      console.error('Email or password cannot be empty');
      setToastVisible(true);
      return;
    }

    console.log('Logging in...');
    auth()
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        console.log('User has been successfully signed in!');
        // router.push('/home'); // Correct path
      })
      .catch(error => {
        console.error(error);
        setToastVisible(true);
      });
  };   

  return (
    <GestureHandlerRootView style={{ flex: 1, flexDirection: "column", alignContent: "center", padding: 5, margin: 10 }}>
      <Text style={{ fontWeight: "bold", fontSize: 30 }}>Welcome Back!</Text>
      <Text style={{ color: "gray", fontSize: 20, marginBottom: 20 }}>Please sign in.</Text>
      <TextField
        text60
        placeholder="Email"
        floatingPlaceholder
        onChangeText={setEmail}
        value={email}
        grey10
        marginB-16

        style={{ padding: 5, borderBottomWidth: 2, borderColor: "lightgray", borderRadius: 5 }}
      />
      <TextField
        text60
        placeholder="Password"
        floatingPlaceholder
        onChangeText={setPassword}
        value={password}
        secureTextEntry
        grey10

        style={{ padding: 5, borderBottomWidth: 2, borderColor: "lightgray", borderRadius: 5 }}
      />
      <View marginT-24>
        <Button label="Login" onPress={() => handleLogin(email, password)} text70 white background-primary />
      </View>
      <Toast
        visible={toastVisible}
        position={'bottom'}
        autoDismiss={5000}
        enableHapticFeedback={true}
        message="There was an error signing in. Please make sure your email and password are correct. Reach out to your supervisor if you need assistance."
        preset='failure'
        onDismiss={() => setToastVisible(false)}
      />
    </GestureHandlerRootView>
  );
};

export default SignIn;
