import { AlertCircle, ArrowLeft, Lock, Mail, Sparkles, UserPlus } from 'lucide-react-native';
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
import type { AuthStackScreenProps } from '../navigation/types';
import { clearAuthError, signUpUser } from '../redux/slices/authSlice';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { colors } from '../theme';

export const SignupScreen: React.FC<AuthStackScreenProps<'Signup'>> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector(state => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSignup = () => {
    setLocalError(null);
    if (!email.trim() || !password) {
      setLocalError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }
    dispatch(signUpUser({ email: email.trim(), password }));
  };

  const displayError = localError || error;

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
          <Text style={styles.subtitle}>Create an account to start asking PDFs.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create account</Text>
          {displayError ? (
            <View style={styles.errorBox}>
              <AlertCircle size={16} color={colors.rose} />
              <Text style={styles.errorText}>{displayError}</Text>
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
                setLocalError(null);
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
              placeholder="At least 6 characters"
              placeholderTextColor={colors.mutedStrong}
              style={styles.input}
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.inputWrap}>
            <Lock size={16} color={colors.mutedStrong} />
            <TextInput
              secureTextEntry
              placeholder="Repeat password"
              placeholderTextColor={colors.mutedStrong}
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          <Button
            label="Create Account"
            onPress={handleSignup}
            isLoading={isLoading}
            icon={<UserPlus size={16} color={colors.white} />}
          />

          <Pressable style={styles.back} onPress={() => navigation.navigate('Login')}>
            <ArrowLeft size={14} color={colors.emerald} />
            <Text style={styles.link}>Back to sign in</Text>
          </Pressable>
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
  subtitle: { color: colors.muted, fontSize: 14, marginTop: 8, textAlign: 'center' },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    padding: 24,
  },
  cardTitle: { color: colors.text, fontSize: 18, fontWeight: '600', marginBottom: 16 },
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
  back: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 20 },
  link: { color: colors.emerald, fontSize: 12, fontWeight: '700' },
});
