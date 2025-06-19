import React, { useState } from 'react';
import {
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface ProductItemProps {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive';
  image?: string;
  onEdit: () => void;
  onDelete: () => void;
}

const ProductItem: React.FC<ProductItemProps> = ({ 
  name, 
  category, 
  price, 
  stock, 
  status, 
  image,
  onEdit, 
  onDelete 
}) => (
  <View style={styles.productItem}>
    <View style={styles.productImage}>
      {image ? (
        <Image source={{ uri: image }} style={styles.image} />
      ) : (
        <View style={styles.placeholderImage}>
          <Text style={styles.placeholderText}>📦</Text>
        </View>
      )}
    </View>
    <View style={styles.productInfo}>
      <Text style={styles.productName}>{name}</Text>
      <Text style={styles.productCategory}>{category}</Text>
      <View style={styles.productMeta}>
        <Text style={styles.productPrice}>₺{price.toLocaleString()}</Text>
        <Text style={[styles.productStock, { color: stock > 10 ? '#10b981' : stock > 0 ? '#f59e0b' : '#ef4444' }]}>
          Stok: {stock}
        </Text>
        <Text style={[styles.productStatus, { color: status === 'active' ? '#10b981' : '#6b7280' }]}>
          {status === 'active' ? 'Aktif' : 'Pasif'}
        </Text>
      </View>
    </View>
    <View style={styles.productActions}>
      <TouchableOpacity style={styles.editButton} onPress={onEdit}>
        <Text style={styles.editButtonText}>Düzenle</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
        <Text style={styles.deleteButtonText}>Sil</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default function ProductsScreen() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock data
  const products = [
    {
      id: '1',
      name: 'Dijital Tansiyon Aleti',
      category: 'Tanı ve Ölçüm',
      price: 299,
      stock: 15,
      status: 'active' as const,
    },
    {
      id: '2',
      name: 'Stetoskop Classic',
      category: 'Tanı ve Ölçüm',
      price: 450,
      stock: 8,
      status: 'active' as const,
    },
    {
      id: '3',
      name: 'Ateş Ölçer',
      category: 'Tanı ve Ölçüm',
      price: 75,
      stock: 25,
      status: 'active' as const,
    },
    {
      id: '4',
      name: 'Ameliyat Eldiveni (100\'lü)',
      category: 'Sarf Malzemeler',
      price: 85,
      stock: 0,
      status: 'inactive' as const,
    },
    {
      id: '5',
      name: 'Diyabet Test Şeridi',
      category: 'Test ve Tahlil',
      price: 120,
      stock: 12,
      status: 'active' as const,
    },
  ];

  const categories = ['all', 'Tanı ve Ölçüm', 'Sarf Malzemeler', 'Test ve Tahlil', 'Ortez ve Protez'];

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const handleEditProduct = (productId: string) => {
    console.log('Edit product:', productId);
  };

  const handleDeleteProduct = (productId: string) => {
    console.log('Delete product:', productId);
  };

  const handleAddProduct = () => {
    console.log('Add new product');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Ürün Yönetimi</Text>
          <Text style={styles.subtitle}>Toplam {products.length} ürün</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
          <Text style={styles.addButtonText}>+ Yeni Ürün</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{products.filter(p => p.status === 'active').length}</Text>
          <Text style={styles.statLabel}>Aktif</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{products.filter(p => p.stock === 0).length}</Text>
          <Text style={styles.statLabel}>Tükendi</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{products.filter(p => p.stock > 0 && p.stock <= 10).length}</Text>
          <Text style={styles.statLabel}>Az Stok</Text>
        </View>
      </View>

      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryButtonText,
              selectedCategory === category && styles.categoryButtonTextActive
            ]}>
              {category === 'all' ? 'Tümü' : category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Products List */}
      <ScrollView style={styles.productsList}>
        {filteredProducts.map((product) => (
          <ProductItem
            key={product.id}
            id={product.id}
            name={product.name}
            category={product.category}
            price={product.price}
            stock={product.stock}
            status={product.status}
            onEdit={() => handleEditProduct(product.id)}
            onDelete={() => handleDeleteProduct(product.id)}
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
  categoriesContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  categoryButtonActive: {
    backgroundColor: '#3b82f6',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: 'white',
  },
  productsList: {
    flex: 1,
    padding: 16,
  },
  productItem: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
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
  productImage: {
    marginRight: 16,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
  },
  productMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  productStock: {
    fontSize: 12,
    fontWeight: '600',
  },
  productStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  productActions: {
    flexDirection: 'row',
    gap: 8,
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
});
