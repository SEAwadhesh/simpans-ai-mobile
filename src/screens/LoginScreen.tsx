import { AlertCircle, ArrowRight, Lock, Mail, Sparkles } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Button } from '../components/Button';
import { clearAuthError, demoLoginUser, loginUser } from '../redux/slices/authSlice';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { colors } from '../theme';
import type { AuthStackScreenProps } from '../navigation/types';

export const LoginScreen: React.FC<AuthStackScreenProps<'Login'>> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector(state => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!email.trim() || !password) {
      return;
    }
    dispatch(loginUser({ email: email.trim(), password }));
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.brand}>
          <View style={styles.logo}>
            <Sparkles size={28} color={colors.emerald} />
          </View>
          <Text style={styles.title}>SimpAns AI</Text>
          <Text style={styles.subtitle}>Upload a PDF. Ask anything about it.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome back</Text>
          <Text style={styles.cardHint}>Sign in with your account to continue</Text>

          {error ? (
            <View style={styles.errorBox}>
              <AlertCircle size={16} color={colors.rose} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>Email Address</Text>
          <View style={styles.inputWrap}>
            <Mail size={16} color={colors.mutedStrong} />
            <TextInput
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="you@example.com"
              placeholderTextColor={colors.mutedStrong}
              style={styles.input}
              value={email}
              onChangeText={value => {
                setEmail(value);
                if (error) {
                  dispatch(clearAuthError());
                }
              }}
            />
          </View>

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrap}>
            <Lock size={16} color={colors.mutedStrong} />
            <TextInput
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor={colors.mutedStrong}
              style={styles.input}
              value={password}
              onChangeText={value => {
                setPassword(value);
                if (error) {
                  dispatch(clearAuthError());
                }
              }}
            />
          </View>

          <Button
            label="Sign In"
            onPress={handleLogin}
            isLoading={isLoading}
            icon={<ArrowRight size={16} color={colors.white} />}
            style={styles.mt}
          />

          <View style={styles.dividerRow}>
            <View style={styles.line} />
            <Text style={styles.or}>Or</Text>
            <View style={styles.line} />
          </View>

          <Button
            label="Instant Demo Mode"
            variant="outline"
            onPress={() => {
              dispatch(clearAuthError());
              dispatch(demoLoginUser());
            }}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Pressable onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.link}>Create Account</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: { flexGrow: 1, justifyContent: 'center', padding: 16 },
  brand: { alignItems: 'center', marginBottom: 32 },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.emeraldSoft,
    borderWidth: 1,
    borderColor: colors.emeraldBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: { color: colors.white, fontSize: 24, fontWeight: '700' },
  subtitle: { color: colors.muted, fontSize: 14, marginTop: 8 },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    padding: 24,
  },
  cardTitle: { color: colors.text, fontSize: 18, fontWeight: '600' },
  cardHint: { color: colors.muted, fontSize: 12, marginBottom: 20, marginTop: 4 },
  errorBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.roseSoft,
    borderWidth: 1,
    borderColor: colors.roseBorder,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: colors.rose, fontSize: 12, flex: 1 },
  label: { color: colors.text, fontSize: 12, fontWeight: '500', marginBottom: 6 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  input: { flex: 1, color: colors.text, height: 44 },
  mt: { marginTop: 8 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 20 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  or: { color: colors.mutedStrong, fontSize: 12 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: colors.muted, fontSize: 12 },
  link: { color: colors.emerald, fontSize: 12, fontWeight: '700' },
});
