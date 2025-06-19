import React from 'react';
import { StyleSheet, View } from 'react-native';
import CustomersScreen from '../../components/visits/CustomersScreen';

export default function CustomersPageScreen() {
  return (
    <View style={styles.container}>
      <CustomersScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
