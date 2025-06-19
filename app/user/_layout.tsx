import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

export default function UserLayout() {
  const { user } = useAuth();

  // Giriş yapmamış kullanıcıları login sayfasına yönlendir
  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack>
      <Stack.Screen name="orders" options={{ title: 'Siparişlerim' }} />
      <Stack.Screen name="profile" options={{ title: 'Profil' }} />
      <Stack.Screen name="favorites" options={{ title: 'Favorilerim' }} />
      <Stack.Screen name="addresses" options={{ title: 'Adreslerim' }} />
      <Stack.Screen name="support" options={{ title: 'Destek' }} />
    </Stack>
  );
}
