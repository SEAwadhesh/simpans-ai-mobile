import { ArrowLeft, FileText, Send, Sparkles } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { ChatMessage } from '../components/ChatMessage';
import type { AppStackScreenProps } from '../navigation/types';
import { askQuestion, clearMessages } from '../redux/slices/chatSlice';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { colors } from '../theme';

export const ChatScreen: React.FC<AppStackScreenProps<'Chat'>> = ({
  navigation,
  route,
}) => {
  const { document } = route.params;
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const { messages, isAsking } = useAppSelector(state => state.chat);
  const [question, setQuestion] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, isAsking]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isAsking) {
      return;
    }
    setQuestion('');
    dispatch(askQuestion({ documentId: document.id, question: trimmed }));
  };

  const handleRetry = (msgIndex: number) => {
    if (isAsking) {
      return;
    }
    for (let i = msgIndex - 1; i >= 0; i -= 1) {
      if (messages[i].sender === 'user') {
        dispatch(
          askQuestion({ documentId: document.id, question: messages[i].text }),
        );
        break;
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.navigate('Home')}
          style={styles.iconBtn}
        >
          <ArrowLeft size={20} color={colors.muted} />
        </Pressable>
        <View style={styles.docIcon}>
          <FileText size={16} color={colors.emerald} />
        </View>
        <View style={styles.headerMeta}>
          <Text style={styles.fileName} numberOfLines={1}>
            {document.file_name}
          </Text>
          <Text style={styles.status}>
            Pinecone RAG Active
            {document.page_count ? `  •  ${document.page_count} pages` : ''}
          </Text>
        </View>
        <Pressable onPress={() => dispatch(clearMessages())}>
          <Text style={styles.clear}>Clear</Text>
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.flex}
        contentContainerStyle={styles.messages}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        {messages.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Sparkles size={24} color={colors.emerald} />
            </View>
            <Text style={styles.emptyTitle}>
              Ask anything about this document
            </Text>
            <Text style={styles.emptyBody}>
              SimpAns AI retrieves the most relevant chunks and generates
              answers grounded in your document.
            </Text>
            {[
              'What is this document about?',
              'Summarize the key points in this document.',
              'What are the main concepts or topics discussed?',
            ].map(prompt => (
              <Pressable
                key={prompt}
                style={styles.prompt}
                onPress={() => send(prompt)}
              >
                <Text style={styles.promptText}>{prompt}</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          messages.map((msg, idx) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              onRetry={() => handleRetry(idx)}
              isAsking={isAsking}
            />
          ))
        )}
        {isAsking ? (
          <View style={styles.thinking}>
            <ActivityIndicator size="small" color={colors.emerald} />
            <Text style={styles.thinkingText}>
              Thinking... searching vector context
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <View
        style={[
          styles.composer,
          { paddingBottom: Math.max(insets.bottom, 12) },
        ]}
      >
        <TextInput
          style={styles.input}
          placeholder="Ask something about this PDF..."
          placeholderTextColor={colors.mutedStrong}
          value={question}
          onChangeText={setQuestion}
          editable={!isAsking}
          onSubmitEditing={() => send(question)}
          returnKeyType="send"
          multiline={false}
        />
        <Button
          label="Send"
          disabled={!question.trim() || isAsking}
          isLoading={isAsking}
          icon={<Send size={16} color={colors.white} />}
          onPress={() => send(question)}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  iconBtn: { padding: 6 },
  docIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.emeraldSoft,
    borderWidth: 1,
    borderColor: colors.emeraldBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerMeta: { flex: 1 },
  fileName: { color: colors.text, fontSize: 14, fontWeight: '600' },
  status: { color: colors.muted, fontSize: 11, marginTop: 2 },
  clear: { color: colors.muted, fontSize: 12 },
  messages: { padding: 16, paddingBottom: 24, flexGrow: 1 },
  empty: { alignItems: 'center', paddingVertical: 32 },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.emeraldSoft,
    borderWidth: 1,
    borderColor: colors.emeraldBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyBody: {
    color: colors.muted,
    fontSize: 12,
    textAlign: 'center',
    marginVertical: 12,
  },
  prompt: {
    width: '100%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  promptText: { color: colors.text, fontSize: 12 },
  thinking: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  thinkingText: { color: colors.emerald, fontSize: 12, fontWeight: '500' },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 12,
    color: colors.text,
    paddingHorizontal: 14,
    height: 48,
  },
});
