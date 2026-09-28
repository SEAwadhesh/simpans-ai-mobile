import { AlertCircle, FileText, LogOut, Plus, RefreshCw, Sparkles } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { DocumentCard } from '../components/DocumentCard';
import type { AppStackScreenProps } from '../navigation/types';
import { logoutUser } from '../redux/slices/authSlice';
import { clearMessages } from '../redux/slices/chatSlice';
import {
  deleteDocument,
  fetchDocuments,
  retryDocumentProcessing,
  seedSampleDocument,
  setCurrentDocument,
} from '../redux/slices/documentSlice';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { colors } from '../theme';

export const HomeScreen: React.FC<AppStackScreenProps<'Home'>> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const { user } = useAppSelector(state => state.auth);
  const { documents, isLoading, error } = useAppSelector(state => state.documents);

  useEffect(() => {
    dispatch(fetchDocuments());
  }, [dispatch]);

  useEffect(() => {
    const hasPendingDocs = documents.some(
      d => d.status === 'processing' || d.status === 'uploading',
    );
    if (!hasPendingDocs) {
      return;
    }
    const interval = setInterval(() => {
      dispatch(fetchDocuments());
    }, 3000);
    return () => clearInterval(interval);
  }, [documents, dispatch]);

  const handleLogout = () => {
    dispatch(clearMessages());
    dispatch(logoutUser());
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete document',
      'Are you sure you want to delete this document and its vector embeddings?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => dispatch(deleteDocument(id)) },
      ],
    );
  };

  return (
    <View style={[styles.flex, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.logo}>
            <Sparkles size={20} color={colors.emerald} />
          </View>
          <View>
            <Text style={styles.title}>SimpAns AI</Text>
            <Text style={styles.email} numberOfLines={1}>
              {user?.email || 'Logged in'}
            </Text>
          </View>
        </View>
        <View style={styles.actions}>
          <Pressable onPress={() => dispatch(fetchDocuments())} style={styles.iconBtn}>
            <RefreshCw size={16} color={colors.muted} />
          </Pressable>
          <Pressable onPress={handleLogout} style={styles.iconBtn}>
            <LogOut size={16} color={colors.muted} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => dispatch(fetchDocuments())}
            tintColor={colors.emerald}
          />
        }>
        <Button
          label="Upload PDF"
          size="lg"
          icon={<Plus size={20} color={colors.white} />}
          onPress={() => navigation.navigate('Upload')}
        />

        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>My Documents</Text>
          <Text style={styles.count}>
            {documents.length} {documents.length === 1 ? 'document' : 'documents'}
          </Text>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <AlertCircle size={16} color={colors.rose} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {documents.length > 0 ? (
          documents.map(doc => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onSelect={selected => {
                dispatch(setCurrentDocument(selected));
                navigation.navigate('Chat', { document: selected });
              }}
              onDelete={handleDelete}
              onRetry={id => dispatch(retryDocumentProcessing(id))}
            />
          ))
        ) : (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <FileText size={24} color={colors.muted} />
            </View>
            <Text style={styles.emptyTitle}>No documents yet</Text>
            <Text style={styles.emptyBody}>
              Upload any PDF document to extract text, create vector embeddings, and ask questions.
            </Text>
            <Button
              label="Upload PDF"
              icon={<Plus size={16} color={colors.white} />}
              onPress={() => navigation.navigate('Upload')}
              style={styles.emptyBtn}
            />
            <Button
              label="Try Sample PDF"
              variant="outline"
              icon={<Sparkles size={16} color={colors.emerald} />}
              onPress={() => dispatch(seedSampleDocument())}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.emeraldSoft,
    borderWidth: 1,
    borderColor: colors.emeraldBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: colors.white, fontSize: 18, fontWeight: '700' },
  email: { color: colors.muted, fontSize: 11, maxWidth: 180 },
  actions: { flexDirection: 'row', gap: 4 },
  iconBtn: { padding: 8 },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  listTitle: { color: colors.text, fontSize: 16, fontWeight: '600' },
  count: { color: colors.muted, fontSize: 12 },
  errorBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.roseSoft,
    borderWidth: 1,
    borderColor: colors.roseBorder,
    borderRadius: 12,
    padding: 12,
  },
  errorText: { color: colors.rose, fontSize: 12, flex: 1 },
  empty: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    backgroundColor: 'rgba(24,24,27,0.4)',
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: { color: colors.text, fontWeight: '600' },
  emptyBody: { color: colors.muted, fontSize: 12, textAlign: 'center', marginVertical: 8 },
  emptyBtn: { width: '100%', marginTop: 8, marginBottom: 8 },
});
