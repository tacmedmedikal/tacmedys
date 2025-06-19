import React, { useState } from 'react';
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface OrderItemProps {
  id: string;
  customerName: string;
  customerEmail: string;
  orderDate: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  itemCount: number;
  onViewDetails: () => void;
  onUpdateStatus: () => void;
}

const OrderItem: React.FC<OrderItemProps> = ({ 
  id,
  customerName, 
  customerEmail,
  orderDate, 
  status, 
  total, 
  itemCount,
  onViewDetails, 
  onUpdateStatus 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'processing': return '#3b82f6';
      case 'shipped': return '#8b5cf6';
      case 'delivered': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Bekliyor';
      case 'processing': return 'İşleniyor';
      case 'shipped': return 'Kargoya Verildi';
      case 'delivered': return 'Teslim Edildi';
      case 'cancelled': return 'İptal Edildi';
      default: return status;
    }
  };

  return (
    <View style={styles.orderItem}>
      <View style={styles.orderHeader}>
        <View style={styles.orderIdContainer}>
          <Text style={styles.orderId}>#{id}</Text>
          <Text style={styles.orderDate}>{orderDate}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
          <Text style={styles.statusText}>{getStatusText(status)}</Text>
        </View>
      </View>
      
      <View style={styles.orderInfo}>
        <Text style={styles.customerName}>{customerName}</Text>
        <Text style={styles.customerEmail}>{customerEmail}</Text>
        <View style={styles.orderMeta}>
          <Text style={styles.itemCount}>{itemCount} ürün</Text>
          <Text style={styles.orderTotal}>₺{total.toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.orderActions}>
        <TouchableOpacity style={styles.detailsButton} onPress={onViewDetails}>
          <Text style={styles.detailsButtonText}>Detaylar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.updateButton} onPress={onUpdateStatus}>
          <Text style={styles.updateButtonText}>Durum Güncelle</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function OrdersScreen() {
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Mock data
  const orders = [
    {
      id: 'ORD001',
      customerName: 'Ahmet Yılmaz',
      customerEmail: 'ahmet@example.com',
      orderDate: '15.06.2025',
      status: 'pending' as const,
      total: 1250,
      itemCount: 3,
    },
    {
      id: 'ORD002',
      customerName: 'Mehmet Kaya',
      customerEmail: 'mehmet@example.com',
      orderDate: '14.06.2025',
      status: 'processing' as const,
      total: 890,
      itemCount: 2,
    },
    {
      id: 'ORD003',
      customerName: 'Ayşe Demir',
      customerEmail: 'ayse@example.com',
      orderDate: '13.06.2025',
      status: 'shipped' as const,
      total: 2100,
      itemCount: 5,
    },
    {
      id: 'ORD004',
      customerName: 'Fatma Şahin',
      customerEmail: 'fatma@example.com',
      orderDate: '12.06.2025',
      status: 'delivered' as const,
      total: 650,
      itemCount: 1,
    },
    {
      id: 'ORD005',
      customerName: 'Ali Özkan',
      customerEmail: 'ali@example.com',
      orderDate: '11.06.2025',
      status: 'cancelled' as const,
      total: 450,
      itemCount: 2,
    },
  ];

  const statusOptions = [
    { key: 'all', label: 'Tümü' },
    { key: 'pending', label: 'Bekliyor' },
    { key: 'processing', label: 'İşleniyor' },
    { key: 'shipped', label: 'Kargoya Verildi' },
    { key: 'delivered', label: 'Teslim Edildi' },
    { key: 'cancelled', label: 'İptal Edildi' },
  ];

  const filteredOrders = selectedStatus === 'all' 
    ? orders 
    : orders.filter(o => o.status === selectedStatus);

  const handleViewDetails = (orderId: string) => {
    console.log('View order details:', orderId);
  };

  const handleUpdateStatus = (orderId: string) => {
    console.log('Update order status:', orderId);
  };

  const getTotalRevenue = () => {
    return orders
      .filter(o => o.status === 'delivered')
      .reduce((sum, order) => sum + order.total, 0);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Sipariş Yönetimi</Text>
          <Text style={styles.subtitle}>Toplam {orders.length} sipariş</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{orders.filter(o => o.status === 'pending').length}</Text>
          <Text style={styles.statLabel}>Bekliyor</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{orders.filter(o => o.status === 'processing').length}</Text>
          <Text style={styles.statLabel}>İşleniyor</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{orders.filter(o => o.status === 'delivered').length}</Text>
          <Text style={styles.statLabel}>Teslim</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>₺{getTotalRevenue().toLocaleString()}</Text>
          <Text style={styles.statLabel}>Gelir</Text>
        </View>
      </View>

      {/* Status Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {statusOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.filterButton,
              selectedStatus === option.key && styles.filterButtonActive
            ]}
            onPress={() => setSelectedStatus(option.key)}
          >
            <Text style={[
              styles.filterButtonText,
              selectedStatus === option.key && styles.filterButtonTextActive
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Orders List */}
      <ScrollView style={styles.ordersList}>
        {filteredOrders.map((order) => (
          <OrderItem
            key={order.id}
            id={order.id}
            customerName={order.customerName}
            customerEmail={order.customerEmail}
            orderDate={order.orderDate}
            status={order.status}
            total={order.total}
            itemCount={order.itemCount}
            onViewDetails={() => handleViewDetails(order.id)}
            onUpdateStatus={() => handleUpdateStatus(order.id)}
          />
        ))}
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
    fontSize: 18,
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  filterButtonActive: {
    backgroundColor: '#3b82f6',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  ordersList: {
    flex: 1,
    padding: 16,
  },
  orderItem: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
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
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderIdContainer: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  orderDate: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  orderInfo: {
    marginBottom: 16,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  customerEmail: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  orderMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemCount: {
    fontSize: 14,
    color: '#64748b',
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  orderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  detailsButton: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  detailsButtonText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  },
  updateButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  updateButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
