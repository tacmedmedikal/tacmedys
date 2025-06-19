import React, { useEffect, useState } from 'react';
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfileScreen() {
  const { user, userProfile, logout, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    company: '',
    taxNumber: '',
    address: '',
  });

  // Kullanıcı profil verilerini yükle
  useEffect(() => {
    if (userProfile) {
      setProfileData({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        email: userProfile.email || user?.email || '',
        phone: userProfile.phone || '',
        company: userProfile.company || '',
        taxNumber: userProfile.taxNumber || '',
        address: userProfile.address || '',
      });
    }
  }, [userProfile, user]);

  const handleSave = async () => {
    try {
      await updateProfile(profileData);
      setIsEditing(false);
      Alert.alert('Başarılı', 'Profil bilgileriniz güncellendi.');
    } catch (error) {
      Alert.alert('Hata', 'Profil güncellenirken bir hata oluştu.');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original values
    if (userProfile) {
      setProfileData({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        email: userProfile.email || user?.email || '',
        phone: userProfile.phone || '',
        company: userProfile.company || '',
        taxNumber: userProfile.taxNumber || '',
        address: userProfile.address || '',
      });
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Çıkış Yap', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
            }
          }
        },
      ]
    );
  };

  const handleChangePassword = () => {
    Alert.alert('Şifre Değiştir', 'Şifre değiştirme özelliği yakında eklenecek.');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Profil</Text>
          <Text style={styles.subtitle}>Hesap bilgilerinizi yönetin</Text>
        </View>
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={() => setIsEditing(!isEditing)}
        >
          <Text style={styles.editButtonText}>
            {isEditing ? 'İptal' : 'Düzenle'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>
          
          <View style={styles.formRow}>
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Ad</Text>
              <TextInput
                style={[styles.fieldInput, !isEditing && styles.fieldInputDisabled]}
                value={profileData.firstName}
                onChangeText={(text) => setProfileData({...profileData, firstName: text})}
                editable={isEditing}
                placeholder="Adınız"
              />
            </View>
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Soyad</Text>
              <TextInput
                style={[styles.fieldInput, !isEditing && styles.fieldInputDisabled]}
                value={profileData.lastName}
                onChangeText={(text) => setProfileData({...profileData, lastName: text})}
                editable={isEditing}
                placeholder="Soyadınız"
              />
            </View>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>E-posta</Text>
            <TextInput
              style={[styles.fieldInput, styles.fieldInputDisabled]}
              value={profileData.email}
              editable={false}
              placeholder="E-posta adresiniz"
            />
            <Text style={styles.fieldNote}>E-posta adresi değiştirilemez</Text>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Telefon</Text>
            <TextInput
              style={[styles.fieldInput, !isEditing && styles.fieldInputDisabled]}
              value={profileData.phone}
              onChangeText={(text) => setProfileData({...profileData, phone: text})}
              editable={isEditing}
              placeholder="Telefon numaranız"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Company Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Şirket Bilgileri</Text>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Şirket Adı</Text>
            <TextInput
              style={[styles.fieldInput, !isEditing && styles.fieldInputDisabled]}
              value={profileData.company}
              onChangeText={(text) => setProfileData({...profileData, company: text})}
              editable={isEditing}
              placeholder="Şirket adı"
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Vergi Numarası</Text>
            <TextInput
              style={[styles.fieldInput, !isEditing && styles.fieldInputDisabled]}
              value={profileData.taxNumber}
              onChangeText={(text) => setProfileData({...profileData, taxNumber: text})}
              editable={isEditing}
              placeholder="Vergi numarası"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Adres</Text>
            <TextInput
              style={[styles.fieldInput, styles.fieldInputMultiline, !isEditing && styles.fieldInputDisabled]}
              value={profileData.address}
              onChangeText={(text) => setProfileData({...profileData, address: text})}
              editable={isEditing}
              placeholder="Şirket adresi"
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hesap İşlemleri</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleChangePassword}>
            <Text style={styles.actionButtonText}>Şifre Değiştir</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.logoutButton]} onPress={handleLogout}>
            <Text style={[styles.actionButtonText, styles.logoutButtonText]}>Çıkış Yap</Text>
          </TouchableOpacity>
        </View>

        {/* Save/Cancel Buttons */}
        {isEditing && (
          <View style={styles.saveContainer}>
            <TouchableOpacity 
              style={[styles.saveButton, styles.cancelButton]} 
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Kaydet</Text>
            </TouchableOpacity>
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
  editButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    margin: 16,
    marginBottom: 8,
    padding: 20,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formField: {
    flex: 1,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1e293b',
    backgroundColor: 'white',
  },
  fieldInputDisabled: {
    backgroundColor: '#f9fafb',
    color: '#6b7280',
  },
  fieldInputMultiline: {
    height: 80,
    textAlignVertical: 'top',
  },
  fieldNote: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  actionArrow: {
    fontSize: 18,
    color: '#9ca3af',
  },
  logoutButton: {
    borderBottomWidth: 0,
  },
  logoutButtonText: {
    color: '#ef4444',
  },
  saveContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#6b7280',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
