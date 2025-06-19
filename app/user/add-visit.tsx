import React from 'react';
import { StyleSheet, View } from 'react-native';
import AddVisitScreen from '../../components/visits/AddVisitScreen';

export default function AddVisitPageScreen() {
  return (
    <View style={styles.container}>
      <AddVisitScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
