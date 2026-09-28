import React, { useState } from 'react';
import { AlertCircle, BookOpen, Check, Copy, RotateCcw, Sparkles, User as UserIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { colors } from '../theme';
import type { ChatMessage as ChatMessageType } from '../types';

interface ChatMessageProps {
  message: ChatMessageType;
  onRetry?: () => void;
  isAsking?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onRetry, isAsking }) => {
  const isUser = message.sender === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!message.text) {
      return;
    }
    Clipboard.setString(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pages = (message.sources || [])
    .map(s => s.pageNumber)
    .filter(p => typeof p === 'number' && p > 0);
  const uniquePages = Array.from(new Set(pages)).sort((a, b) => a - b);
  const pagesLabel =
    uniquePages.length === 1 ? `Page ${uniquePages[0]}` : `Pages ${uniquePages.join(', ')}`;

  return (
    <View style={[styles.row, isUser ? styles.rowEnd : styles.rowStart]}>
      <View style={[styles.inner, isUser ? styles.innerReverse : null]}>
        <View
          style={[
            styles.avatar,
            isUser ? styles.userAvatar : message.isError ? styles.errorAvatar : styles.aiAvatar,
          ]}>
          {isUser ? (
            <UserIcon size={16} color={colors.white} />
          ) : message.isError ? (
            <AlertCircle size={16} color={colors.rose} />
          ) : (
            <Sparkles size={16} color={colors.emerald} />
          )}
        </View>
        <View
          style={[
            styles.bubble,
            isUser ? styles.userBubble : message.isError ? styles.errorBubble : styles.aiBubble,
          ]}>
          <View style={styles.header}>
            <Text
              style={[
                styles.sender,
                { color: isUser ? colors.emeraldText : message.isError ? colors.rose : colors.emerald },
              ]}>
              {isUser ? 'You' : 'SimpAns AI'}
            </Text>
            {!isUser && !message.isError ? (
              <Pressable onPress={handleCopy} hitSlop={8}>
                {copied ? <Check size={14} color={colors.emerald} /> : <Copy size={14} color={colors.muted} />}
              </Pressable>
            ) : null}
          </View>
          <Text style={[styles.body, isUser ? styles.userBody : null]}>{message.text}</Text>
          {message.isError && onRetry ? (
            <Pressable disabled={isAsking} onPress={onRetry} style={styles.retry}>
              <RotateCcw size={12} color={colors.rose} />
              <Text style={styles.retryText}>Retry Question</Text>
            </Pressable>
          ) : null}
          {uniquePages.length > 0 ? (
            <View style={styles.sources}>
              <BookOpen size={14} color={colors.emerald} />
              <Text style={styles.sourcesText}>Sources: {pagesLabel}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { width: '100%', marginBottom: 16 },
  rowEnd: { alignItems: 'flex-end' },
  rowStart: { alignItems: 'flex-start' },
  inner: { flexDirection: 'row', maxWidth: '88%', gap: 10 },
  innerReverse: { flexDirection: 'row-reverse' },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  userAvatar: { backgroundColor: colors.emeraldBg },
  aiAvatar: { backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.borderStrong },
  errorAvatar: { backgroundColor: '#4c0519', borderWidth: 1, borderColor: '#9f1239' },
  bubble: { flexShrink: 1, borderRadius: 16, padding: 14 },
  userBubble: { backgroundColor: colors.emeraldBg, borderTopRightRadius: 4 },
  aiBubble: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopLeftRadius: 4,
  },
  errorBubble: {
    backgroundColor: colors.roseSoft,
    borderWidth: 1,
    borderColor: colors.roseBorder,
    borderTopLeftRadius: 4,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  sender: { fontSize: 11, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase' },
  body: { color: colors.text, fontSize: 14, lineHeight: 20 },
  userBody: { color: colors.white },
  retry: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.roseBorder,
  },
  retryText: { color: colors.rose, fontSize: 12, fontWeight: '600' },
  sources: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sourcesText: { color: colors.emerald, fontSize: 12, fontWeight: '600' },
});
