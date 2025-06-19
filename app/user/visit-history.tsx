import React from 'react';
import { StyleSheet, View } from 'react-native';
import VisitHistoryScreen from '../../components/visits/VisitHistoryScreen';

export default function VisitHistoryPageScreen() {
  return (
    <View style={styles.container}>
      <VisitHistoryScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
