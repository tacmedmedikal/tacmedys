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

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'Lütfen email ve şifre alanlarını doldurun');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      router.replace('/');
    } catch (error: any) {
      Alert.alert('Giriş Hatası', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      router.replace('/');
    } catch (error: any) {
      Alert.alert('Google Giriş Hatası', 'Google ile giriş yapılamadı. Lütfen tekrar deneyin.');
    } finally {
      setGoogleLoading(false);
    }
  };
  const navigateToRegister = () => {
    router.push('/(tabs)/../register' as any);
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
          <Text style={styles.subtitle}>Hesabınıza giriş yapın</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
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
            <Text style={styles.label}>Şifre</Text>
            <TextInput
              style={styles.input}
              placeholder="Şifrenizi girin"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>          <TouchableOpacity 
            style={[styles.loginButton, loading && styles.buttonDisabled]} 
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </Text>
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>veya</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity 
            style={[styles.googleButton, googleLoading && styles.buttonDisabled]} 
            onPress={handleGoogleLogin}
            disabled={googleLoading}
          >
            <Text style={styles.googleButtonText}>
              {googleLoading ? 'Google ile giriş yapılıyor...' : '🔍 Google ile Giriş Yap'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Şifremi Unuttum</Text>
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Hesabınız yok mu? </Text>
            <TouchableOpacity onPress={navigateToRegister}>
              <Text style={styles.registerLink}>Kayıt Ol</Text>
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
  },
  formContainer: {
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
  loginButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 16,
  },
  forgotPasswordText: {
    color: '#2563eb',
    fontSize: 14,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerText: {
    color: '#6b7280',
    fontSize: 14,
  },  registerLink: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#d1d5db',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#6b7280',
    fontSize: 14,
  },
  googleButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  googleButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
});
