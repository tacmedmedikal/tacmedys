import React from 'react';
import { StyleSheet, View } from 'react-native';
import VisitTrackingDashboard from '../../components/visits/VisitTrackingDashboard';

export default function VisitTrackingScreen() {
  return (
    <View style={styles.container}>
      <VisitTrackingDashboard />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
