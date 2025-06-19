import {
    collection,
    deleteDoc,
    doc,
    getDocs,
    orderBy,
    query,
    updateDoc
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { db } from '../../firebaseConfig';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  company: string;
  role: 'admin' | 'user';
  createdAt: string;
}

interface UserItemProps {
  user: User;
  onEdit: () => void;
  onDelete: () => void;
  onChangeRole: () => void;
}

const UserItem: React.FC<UserItemProps> = ({ user, onEdit, onDelete, onChangeRole }) => (
  <View style={styles.userItem}>
    <View style={styles.userInfo}>
      <View style={styles.userHeader}>
        <Text style={styles.userName}>{user.firstName} {user.lastName}</Text>
        <View style={[styles.roleBadge, { backgroundColor: user.role === 'admin' ? '#ef4444' : '#10b981' }]}>
          <Text style={styles.roleText}>{user.role === 'admin' ? 'Admin' : 'Kullanıcı'}</Text>
        </View>
      </View>
      <Text style={styles.userEmail}>{user.email}</Text>
      {user.phone && <Text style={styles.userPhone}>{user.phone}</Text>}
      {user.company && <Text style={styles.userCompany}>{user.company}</Text>}
      <Text style={styles.userDate}>Kayıt: {new Date(user.createdAt).toLocaleDateString('tr-TR')}</Text>
    </View>

    <View style={styles.userActions}>
      <TouchableOpacity style={styles.roleButton} onPress={onChangeRole}>
        <Text style={styles.roleButtonText}>Rol Değiştir</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.editButton} onPress={onEdit}>
        <Text style={styles.editButtonText}>Düzenle</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
        <Text style={styles.deleteButtonText}>Sil</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default function UsersScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'admin' | 'user'>('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(usersQuery);
      
      const usersData: User[] = [];
      querySnapshot.forEach((doc) => {
        usersData.push({
          id: doc.id,
          ...doc.data()
        } as User);
      });
      
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Hata', 'Kullanıcılar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (userId: string, currentRole: 'admin' | 'user') => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    
    Alert.alert(
      'Rol Değiştir',
      `Bu kullanıcının rolünü ${newRole === 'admin' ? 'Yönetici' : 'Kullanıcı'} olarak değiştirmek istediğinizden emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Değiştir',
          onPress: async () => {
            try {
              await updateDoc(doc(db, 'users', userId), { role: newRole });
              setUsers(users.map(user => 
                user.id === userId ? { ...user, role: newRole } : user
              ));
              Alert.alert('Başarılı', 'Kullanıcı rolü güncellendi.');
            } catch (error) {
              Alert.alert('Hata', 'Rol güncellenirken bir hata oluştu.');
            }
          }
        }
      ]
    );
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    Alert.alert(
      'Kullanıcıyı Sil',
      `${userEmail} kullanıcısını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'users', userId));
              setUsers(users.filter(user => user.id !== userId));
              Alert.alert('Başarılı', 'Kullanıcı silindi.');
            } catch (error) {
              Alert.alert('Hata', 'Kullanıcı silinirken bir hata oluştu.');
            }
          }
        }
      ]
    );
  };

  const handleEditUser = (userId: string) => {
    Alert.alert('Bilgi', 'Kullanıcı düzenleme özelliği yakında eklenecek.');
  };

  const filteredUsers = users.filter(user => {
    if (filter === 'all') return true;
    return user.role === filter;
  });

  const getStats = () => {
    const totalUsers = users.length;
    const adminCount = users.filter(u => u.role === 'admin').length;
    const userCount = users.filter(u => u.role === 'user').length;
    return { totalUsers, adminCount, userCount };
  };

  const stats = getStats();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Kullanıcılar yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Kullanıcı Yönetimi</Text>
          <Text style={styles.subtitle}>Toplam {stats.totalUsers} kullanıcı</Text>
        </View>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Yeni Kullanıcı</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.totalUsers}</Text>
          <Text style={styles.statLabel}>Toplam</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.adminCount}</Text>
          <Text style={styles.statLabel}>Yönetici</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.userCount}</Text>
          <Text style={styles.statLabel}>Kullanıcı</Text>
        </View>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}>
            Hepsi
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'admin' && styles.filterButtonActive]}
          onPress={() => setFilter('admin')}
        >
          <Text style={[styles.filterButtonText, filter === 'admin' && styles.filterButtonTextActive]}>
            Yöneticiler
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'user' && styles.filterButtonActive]}
          onPress={() => setFilter('user')}
        >
          <Text style={[styles.filterButtonText, filter === 'user' && styles.filterButtonTextActive]}>
            Kullanıcılar
          </Text>
        </TouchableOpacity>
      </View>

      {/* Users List */}
      <ScrollView style={styles.usersList}>
        {filteredUsers.map((user) => (
          <UserItem
            key={user.id}
            user={user}
            onEdit={() => handleEditUser(user.id)}
            onDelete={() => handleDeleteUser(user.id, user.email)}
            onChangeRole={() => handleChangeRole(user.id, user.role)}
          />
        ))}
        {filteredUsers.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Kullanıcı bulunamadı</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    backgroundColor: 'white',
    flexDirection: 'row',
    padding: 20,
    marginTop: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  filterContainer: {
    backgroundColor: 'white',
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  usersList: {
    flex: 1,
    padding: 16,
  },
  userItem: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    ...Platform.select({
      web: {
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
      },
    }),
  },
  userInfo: {
    flex: 1,
    marginBottom: 12,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 2,
  },
  userCompany: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  userDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  roleButton: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  roleButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9ca3af',
  },
});
