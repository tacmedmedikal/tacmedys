import React from 'react';
import { StyleSheet, View } from 'react-native';
import AdminReportsScreen from '../../components/admin/AdminReportsScreen';

export default function AdminReportsPageScreen() {
  return (
    <View style={styles.container}>
      <AdminReportsScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
