import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword || !firstName || !lastName) {
      Alert.alert('Hata', 'Lütfen zorunlu alanları doldurun');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır');
      return;
    }

    setLoading(true);
    try {
      const profileData = {
        firstName,
        lastName,
        phone,
        company,
      };
      
      await register(email, password, profileData);
      Alert.alert('Başarılı', 'Hesabınız oluşturuldu!', [
        { text: 'Tamam', onPress: () => router.replace('/') }
      ]);
    } catch (error: any) {
      Alert.alert('Kayıt Hatası', error.message);
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    router.back();
  };
  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/images/logo.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.subtitle}>Yeni hesap oluşturun</Text>
        </View>        <View style={styles.formContainer}>
          <View style={styles.rowContainer}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>Ad *</Text>
              <TextInput
                style={styles.input}
                placeholder="Adınız"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>
            
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>Soyad *</Text>
              <TextInput
                style={styles.input}
                placeholder="Soyadınız"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              placeholder="email@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Telefon</Text>
            <TextInput
              style={styles.input}
              placeholder="+90 555 123 4567"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Şirket</Text>
            <TextInput
              style={styles.input}
              placeholder="Şirket adı (isteğe bağlı)"
              value={company}
              onChangeText={setCompany}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Şifre *</Text>
            <TextInput
              style={styles.input}
              placeholder="En az 6 karakter"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Şifre Tekrar *</Text>
            <TextInput
              style={styles.input}
              placeholder="Şifrenizi tekrar girin"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity 
            style={[styles.registerButton, loading && styles.buttonDisabled]} 
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.registerButtonText}>
              {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
            </Text>
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Zaten hesabınız var mı? </Text>
            <TouchableOpacity onPress={navigateToLogin}>
              <Text style={styles.loginLink}>Giriş Yap</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoImage: {
    width: 200,
    height: 80,
    marginBottom: 16,
  },  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },  formContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    // Web uyumlu shadow
    ...Platform.select({
      web: {
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
      },
    }),
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
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
  registerButton: {
    backgroundColor: '#16a34a',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    color: '#6b7280',
    fontSize: 14,
  },
  loginLink: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
  },
});
