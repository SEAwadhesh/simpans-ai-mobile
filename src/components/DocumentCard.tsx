import React from 'react';
import { AlertCircle, ArrowRight, CheckCircle2, FileText, Loader2, RotateCcw, Trash2 } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import type { DocumentRecord } from '../types';

interface DocumentCardProps {
  document: DocumentRecord;
  onSelect: (doc: DocumentRecord) => void;
  onDelete: (id: string) => void;
  onRetry?: (id: string) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onSelect,
  onDelete,
  onRetry,
}) => {
  const isReady = document.status === 'ready';
  const isProcessing = document.status === 'processing' || document.status === 'uploading';
  const isFailed = document.status === 'failed';

  const formatFileSize = (bytes: number) => {
    if (!bytes) {
      return '';
    }
    if (bytes < 1024 * 1024) {
      return `${Math.round(bytes / 1024)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  const iconColor = isReady ? colors.emerald : isProcessing ? colors.amber : colors.rose;

  return (
    <Pressable
      onPress={() => isReady && onSelect(document)}
      style={[
        styles.card,
        isFailed ? styles.failedCard : null,
        isReady ? styles.readyCard : null,
      ]}>
      <View style={styles.topRow}>
        <View style={[styles.iconWrap, { borderColor: iconColor }]}>
          <FileText size={20} color={iconColor} />
        </View>
        <View style={styles.meta}>
          <Text style={styles.title} numberOfLines={1}>
            {document.file_name}
          </Text>
          <Text style={styles.sub} numberOfLines={1}>
            {[
              formatDate(document.created_at),
              document.file_size > 0 ? formatFileSize(document.file_size) : null,
              document.page_count ? `${document.page_count} pages` : null,
            ]
              .filter(Boolean)
              .join('  •  ')}
          </Text>
        </View>
        <Pressable hitSlop={8} onPress={() => onDelete(document.id)} accessibilityLabel="Delete document">
          <Trash2 size={16} color={colors.mutedStrong} />
        </Pressable>
      </View>

      <View style={styles.footer}>
        {document.status === 'ready' ? (
          <View style={[styles.badge, styles.readyBadge]}>
            <CheckCircle2 size={14} color={colors.emerald} />
            <Text style={[styles.badgeText, { color: colors.emerald }]}>Ready</Text>
          </View>
        ) : null}
        {document.status === 'processing' ? (
          <View style={[styles.badge, styles.processBadge]}>
            <Loader2 size={14} color={colors.amber} />
            <Text style={[styles.badgeText, { color: colors.amber }]}>Processing</Text>
          </View>
        ) : null}
        {document.status === 'uploading' ? (
          <View style={[styles.badge, styles.processBadge]}>
            <Loader2 size={14} color="#60a5fa" />
            <Text style={[styles.badgeText, { color: '#60a5fa' }]}>Uploading</Text>
          </View>
        ) : null}
        {isFailed ? (
          <View style={styles.failedRow}>
            <View style={[styles.badge, styles.failedBadge]}>
              <AlertCircle size={14} color={colors.rose} />
              <Text style={[styles.badgeText, { color: colors.rose }]}>Failed</Text>
            </View>
            {onRetry ? (
              <Pressable style={styles.retry} onPress={() => onRetry(document.id)}>
                <RotateCcw size={12} color={colors.amber} />
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
        {isReady ? (
          <View style={styles.askRow}>
            <Text style={styles.askText}>Ask Questions</Text>
            <ArrowRight size={14} color={colors.muted} />
          </View>
        ) : null}
      </View>
      {isFailed && document.error_message ? (
        <Text style={styles.error} numberOfLines={2}>
          {document.error_message}
        </Text>
      ) : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
  },
  readyCard: {
    borderColor: colors.border,
  },
  failedCard: {
    backgroundColor: 'rgba(69, 10, 31, 0.25)',
    borderColor: colors.roseBorder,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.emeraldSoft,
  },
  meta: { flex: 1 },
  title: { color: colors.text, fontSize: 14, fontWeight: '600' },
  sub: { color: colors.muted, fontSize: 12, marginTop: 4 },
  footer: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  readyBadge: { backgroundColor: colors.emeraldSoft, borderColor: colors.emeraldBorder },
  processBadge: { backgroundColor: colors.amberSoft, borderColor: colors.amberBorder },
  failedBadge: { backgroundColor: colors.roseSoft, borderColor: colors.roseBorder },
  badgeText: { fontSize: 12, fontWeight: '600' },
  failedRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  retry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.amberBorder,
  },
  retryText: { color: colors.amber, fontSize: 12, fontWeight: '600' },
  askRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  askText: { color: colors.muted, fontSize: 12, fontWeight: '500' },
  error: { color: colors.rose, fontSize: 12, marginTop: 8 },
});
