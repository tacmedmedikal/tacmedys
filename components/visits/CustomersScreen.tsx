import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebaseConfig';

interface Customer {
  id: string;
  name: string;
  type: 'hastane' | 'ozel_hastane' | 'ozel_klinik' | 'poliklinik';
  address: string;
  city: string;
  phone: string;
  email: string;
  contactPerson: string;
  status: 'active' | 'inactive';
  createdAt: any;
  notes: string;
}

export default function CustomersScreen() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'hastane' | 'ozel_hastane' | 'ozel_klinik' | 'poliklinik'>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'hastane' as Customer['type'],
    address: '',
    city: '',
    phone: '',
    email: '',
    contactPerson: '',
    notes: '',
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [customers, searchText, filterType]);
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const customersQuery = query(
        collection(db, 'customers'),
        where('userId', '==', user?.uid),
        orderBy('name', 'asc')
      );
      const querySnapshot = await getDocs(customersQuery);
      
      const customersData: Customer[] = [];
      querySnapshot.forEach((doc) => {
        customersData.push({ id: doc.id, ...doc.data() } as Customer);
      });
      
      setCustomers(customersData);
    } catch (error) {
      console.error('Error fetching customers:', error);
      Alert.alert('Hata', 'Müşteriler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const filterCustomers = () => {
    let filtered = customers;

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(customer => customer.type === filterType);
    }

    // Search filter
    if (searchText) {
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(searchText.toLowerCase()) ||
        customer.city.toLowerCase().includes(searchText.toLowerCase()) ||
        customer.contactPerson.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredCustomers(filtered);
  };

  const openAddModal = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      type: 'hastane',
      address: '',
      city: '',
      phone: '',
      email: '',
      contactPerson: '',
      notes: '',
    });
    setModalVisible(true);
  };

  const openEditModal = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      type: customer.type,
      address: customer.address,
      city: customer.city,
      phone: customer.phone,
      email: customer.email,
      contactPerson: customer.contactPerson,
      notes: customer.notes,
    });
    setModalVisible(true);
  };

  const saveCustomer = async () => {
    if (!formData.name || !formData.type || !formData.city) {
      Alert.alert('Hata', 'Lütfen zorunlu alanları doldurun.');
      return;
    }

    try {
      if (editingCustomer) {
        // Update existing customer
        await updateDoc(doc(db, 'customers', editingCustomer.id), {
          ...formData,
          updatedAt: new Date(),
        });
        Alert.alert('Başarılı', 'Müşteri bilgileri güncellendi.');
      } else {
        // Add new customer
        await addDoc(collection(db, 'customers'), {
          ...formData,
          status: 'active',
          createdAt: new Date(),
          createdBy: user?.uid,
        });
        Alert.alert('Başarılı', 'Yeni müşteri eklendi.');
      }

      setModalVisible(false);
      fetchCustomers();
    } catch (error) {
      console.error('Error saving customer:', error);
      Alert.alert('Hata', 'Müşteri kaydedilirken bir hata oluştu.');
    }
  };

  const deleteCustomer = (customer: Customer) => {
    Alert.alert(
      'Müşteriyi Sil',
      `${customer.name} müşterisini silmek istediğinizden emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'customers', customer.id));
              Alert.alert('Başarılı', 'Müşteri silindi.');
              fetchCustomers();
            } catch (error) {
              Alert.alert('Hata', 'Müşteri silinirken bir hata oluştu.');
            }
          }
        }
      ]
    );
  };

  const getTypeLabel = (type: Customer['type']) => {
    const labels = {
      hastane: 'Hastane',
      ozel_hastane: 'Özel Hastane',
      ozel_klinik: 'Özel Klinik',
      poliklinik: 'Poliklinik',
    };
    return labels[type];
  };

  const getTypeColor = (type: Customer['type']) => {
    const colors = {
      hastane: '#3b82f6',
      ozel_hastane: '#8b5cf6',
      ozel_klinik: '#10b981',
      poliklinik: '#f59e0b',
    };
    return colors[type];
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Müşteriler yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Müşteriler</Text>
          <Text style={styles.subtitle}>Toplam {customers.length} müşteri</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Text style={styles.addButtonText}>+ Yeni Müşteri</Text>
        </TouchableOpacity>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Müşteri ara..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <ScrollView horizontal style={styles.filterContainer} showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          style={[styles.filterButton, filterType === 'all' && styles.filterButtonActive]}
          onPress={() => setFilterType('all')}
        >
          <Text style={[styles.filterButtonText, filterType === 'all' && styles.filterButtonTextActive]}>
            Hepsi
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filterType === 'hastane' && styles.filterButtonActive]}
          onPress={() => setFilterType('hastane')}
        >
          <Text style={[styles.filterButtonText, filterType === 'hastane' && styles.filterButtonTextActive]}>
            Hastane
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filterType === 'ozel_hastane' && styles.filterButtonActive]}
          onPress={() => setFilterType('ozel_hastane')}
        >
          <Text style={[styles.filterButtonText, filterType === 'ozel_hastane' && styles.filterButtonTextActive]}>
            Özel Hastane
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filterType === 'ozel_klinik' && styles.filterButtonActive]}
          onPress={() => setFilterType('ozel_klinik')}
        >
          <Text style={[styles.filterButtonText, filterType === 'ozel_klinik' && styles.filterButtonTextActive]}>
            Özel Klinik
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filterType === 'poliklinik' && styles.filterButtonActive]}
          onPress={() => setFilterType('poliklinik')}
        >
          <Text style={[styles.filterButtonText, filterType === 'poliklinik' && styles.filterButtonTextActive]}>
            Poliklinik
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Customers List */}
      <ScrollView style={styles.customersList}>
        {filteredCustomers.map((customer) => (
          <View key={customer.id} style={styles.customerCard}>
            <View style={styles.customerHeader}>
              <View style={styles.customerInfo}>
                <Text style={styles.customerName}>{customer.name}</Text>
                <View style={[styles.typeBadge, { backgroundColor: getTypeColor(customer.type) }]}>
                  <Text style={styles.typeText}>{getTypeLabel(customer.type)}</Text>
                </View>
              </View>
            </View>
            
            <Text style={styles.customerAddress}>📍 {customer.address}, {customer.city}</Text>
            <Text style={styles.customerContact}>👤 {customer.contactPerson}</Text>
            {customer.phone && <Text style={styles.customerPhone}>📞 {customer.phone}</Text>}
            {customer.email && <Text style={styles.customerEmail}>✉️ {customer.email}</Text>}

            <View style={styles.customerActions}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => openEditModal(customer)}
              >
                <Text style={styles.editButtonText}>Düzenle</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteCustomer(customer)}
              >
                <Text style={styles.deleteButtonText}>Sil</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {filteredCustomers.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {searchText || filterType !== 'all' 
                ? 'Arama kriterlerinize uygun müşteri bulunamadı.' 
                : 'Henüz müşteri eklenmemiş.'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingCustomer ? 'Müşteri Düzenle' : 'Yeni Müşteri'}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Müşteri Adı *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({...formData, name: text})}
                placeholder="Hastane/Klinik adı"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tür *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.typeButtons}>
                  {(['hastane', 'ozel_hastane', 'ozel_klinik', 'poliklinik'] as const).map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeButton,
                        formData.type === type && styles.typeButtonActive
                      ]}
                      onPress={() => setFormData({...formData, type})}
                    >
                      <Text style={[
                        styles.typeButtonText,
                        formData.type === type && styles.typeButtonTextActive
                      ]}>
                        {getTypeLabel(type)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Şehir *</Text>
              <TextInput
                style={styles.input}
                value={formData.city}
                onChangeText={(text) => setFormData({...formData, city: text})}
                placeholder="Şehir"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Adres</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.address}
                onChangeText={(text) => setFormData({...formData, address: text})}
                placeholder="Tam adres"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>İletişim Kişisi</Text>
              <TextInput
                style={styles.input}
                value={formData.contactPerson}
                onChangeText={(text) => setFormData({...formData, contactPerson: text})}
                placeholder="Ana iletişim kişisi"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Telefon</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) => setFormData({...formData, phone: text})}
                placeholder="Telefon numarası"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>E-posta</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => setFormData({...formData, email: text})}
                placeholder="E-posta adresi"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notlar</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.notes}
                onChangeText={(text) => setFormData({...formData, notes: text})}
                placeholder="Ek notlar"
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={saveCustomer}>
              <Text style={styles.saveButtonText}>
                {editingCustomer ? 'Güncelle' : 'Kaydet'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
  searchContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchInput: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  filterContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginRight: 8,
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
  customersList: {
    flex: 1,
    padding: 16,
  },
  customerCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
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
  customerHeader: {
    marginBottom: 12,
  },
  customerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  customerAddress: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  customerContact: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  customerEmail: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  customerActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  editButton: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  modalClose: {
    fontSize: 24,
    color: '#64748b',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  typeButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: 'white',
  },
  saveButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
