import React, { useState } from 'react';
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

interface AddressItemProps {
  id: string;
  title: string;
  address: string;
  city: string;
  district: string;
  postalCode: string;
  isDefault: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
}

const AddressItem: React.FC<AddressItemProps> = ({ 
  title, 
  address, 
  city, 
  district, 
  postalCode,
  isDefault,
  onEdit, 
  onDelete,
  onSetDefault
}) => (
  <View style={styles.addressItem}>
    <View style={styles.addressHeader}>
      <Text style={styles.addressTitle}>{title}</Text>
      {isDefault && (
        <View style={styles.defaultBadge}>
          <Text style={styles.defaultBadgeText}>Varsayılan</Text>
        </View>
      )}
    </View>
    
    <Text style={styles.addressText}>{address}</Text>
    <Text style={styles.addressLocation}>{district} / {city} - {postalCode}</Text>

    <View style={styles.addressActions}>
      {!isDefault && (
        <TouchableOpacity style={styles.defaultButton} onPress={onSetDefault}>
          <Text style={styles.defaultButtonText}>Varsayılan Yap</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.editButton} onPress={onEdit}>
        <Text style={styles.editButtonText}>Düzenle</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
        <Text style={styles.deleteButtonText}>Sil</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default function AddressesScreen() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    title: '',
    address: '',
    city: '',
    district: '',
    postalCode: '',
  });

  // Mock data
  const [addresses, setAddresses] = useState([
    {
      id: '1',
      title: 'Ev Adresi',
      address: 'Atatürk Cad. No:123 Daire:5',
      city: 'İstanbul',
      district: 'Şişli',
      postalCode: '34360',
      isDefault: true,
    },
    {
      id: '2',
      title: 'İş Adresi',
      address: 'Cumhuriyet Mah. İş Merkezi A Blok Kat:3',
      city: 'İstanbul',
      district: 'Şişli',
      postalCode: '34367',
      isDefault: false,
    },
  ]);

  const handleEditAddress = (addressId: string) => {
    console.log('Edit address:', addressId);
    // TODO: Open edit address modal
  };

  const handleDeleteAddress = (addressId: string) => {
    Alert.alert(
      'Adresi Sil',
      'Bu adresi silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Sil', 
          style: 'destructive',
          onPress: () => {
            setAddresses(addresses.filter(addr => addr.id !== addressId));
          }
        },
      ]
    );
  };

  const handleSetDefault = (addressId: string) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    })));
  };

  const handleAddAddress = () => {
    if (!newAddress.title || !newAddress.address || !newAddress.city || !newAddress.district) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    const id = Date.now().toString();
    setAddresses([...addresses, {
      ...newAddress,
      id,
      isDefault: addresses.length === 0,
    }]);

    setNewAddress({
      title: '',
      address: '',
      city: '',
      district: '',
      postalCode: '',
    });
    setShowAddForm(false);
  };

  const handleCancelAdd = () => {
    setNewAddress({
      title: '',
      address: '',
      city: '',
      district: '',
      postalCode: '',
    });
    setShowAddForm(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Adreslerim</Text>
          <Text style={styles.subtitle}>{addresses.length} adres</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => setShowAddForm(true)}
        >
          <Text style={styles.addButtonText}>+ Yeni Adres</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Add Address Form */}
        {showAddForm && (
          <View style={styles.addForm}>
            <Text style={styles.formTitle}>Yeni Adres Ekle</Text>
            
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Adres Başlığı</Text>
              <TextInput
                style={styles.fieldInput}
                value={newAddress.title}
                onChangeText={(text) => setNewAddress({...newAddress, title: text})}
                placeholder="Ev, İş, vb."
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Adres</Text>
              <TextInput
                style={[styles.fieldInput, styles.fieldInputMultiline]}
                value={newAddress.address}
                onChangeText={(text) => setNewAddress({...newAddress, address: text})}
                placeholder="Mahalle, cadde, sokak, apartman no"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formRow}>
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>İl</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={newAddress.city}
                  onChangeText={(text) => setNewAddress({...newAddress, city: text})}
                  placeholder="İl"
                />
              </View>
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>İlçe</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={newAddress.district}
                  onChangeText={(text) => setNewAddress({...newAddress, district: text})}
                  placeholder="İlçe"
                />
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Posta Kodu</Text>
              <TextInput
                style={styles.fieldInput}
                value={newAddress.postalCode}
                onChangeText={(text) => setNewAddress({...newAddress, postalCode: text})}
                placeholder="Posta kodu"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancelAdd}>
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleAddAddress}>
                <Text style={styles.saveButtonText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Addresses List */}
        {addresses.length > 0 ? (
          addresses.map((address) => (
            <AddressItem
              key={address.id}
              id={address.id}
              title={address.title}
              address={address.address}
              city={address.city}
              district={address.district}
              postalCode={address.postalCode}
              isDefault={address.isDefault}
              onEdit={() => handleEditAddress(address.id)}
              onDelete={() => handleDeleteAddress(address.id)}
              onSetDefault={() => handleSetDefault(address.id)}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📍</Text>
            <Text style={styles.emptyStateTitle}>Henüz adres eklememişsiniz</Text>
            <Text style={styles.emptyStateSubtitle}>
              Hızlı teslimat için adres bilgilerinizi ekleyin.
            </Text>
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
  content: {
    flex: 1,
  },
  addForm: {
    backgroundColor: 'white',
    margin: 16,
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
  formTitle: {
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
  fieldInputMultiline: {
    height: 80,
    textAlignVertical: 'top',
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#6b7280',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  addressItem: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 8,
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
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  defaultBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  addressText: {
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 8,
    lineHeight: 24,
  },
  addressLocation: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  addressActions: {
    flexDirection: 'row',
    gap: 8,
  },
  defaultButton: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  defaultButtonText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 12,
    paddingVertical: 8,
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
    paddingVertical: 8,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 100,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
});
