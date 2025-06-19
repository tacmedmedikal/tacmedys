import React from 'react';
import { StyleSheet, View } from 'react-native';
import CalendarSettingsScreen from '../../components/visits/CalendarSettingsScreen';

export default function CalendarSettingsPageScreen() {
  return (
    <View style={styles.container}>
      <CalendarSettingsScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
