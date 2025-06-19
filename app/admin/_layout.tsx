import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminLayout() {
  const { user, userRole } = useAuth();

  // Admin olmayan kullanıcıları ana sayfaya yönlendir
  if (!user || userRole !== 'admin') {
    return <Redirect href="/" />;
  }

  return (
    <Stack>
      <Stack.Screen name="users" options={{ title: 'Kullanıcı Yönetimi' }} />
      <Stack.Screen name="products" options={{ title: 'Ürün Yönetimi' }} />
      <Stack.Screen name="orders" options={{ title: 'Sipariş Yönetimi' }} />
      <Stack.Screen name="reports" options={{ title: 'Raporlar' }} />
      <Stack.Screen name="settings" options={{ title: 'Ayarlar' }} />
    </Stack>
  );
}
