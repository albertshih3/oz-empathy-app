import { View, Text } from 'react-native'
import { useLocalSearchParams, Stack, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import React from 'react'

const Details = () => {

  const { id }: { id?: string } = useLocalSearchParams();
  const navigation = useNavigation();

  useEffect(() => {
    if (id) {
        navigation.setOptions({ title: `${id}` });
        navigation.setOptions({ presentation: 'modal' });
    }
}, [id, navigation]);

  return (
    <View>
      <Text>Details</Text>
    </View>
  )
}

export default Details