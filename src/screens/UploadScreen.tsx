import { pick, types, errorCodes, isErrorWithCode } from '@react-native-documents/picker';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  FileText,
  FolderOpen,
  Sparkles,
  UploadCloud,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Loading } from '../components/Loading';
import type { AppStackScreenProps } from '../navigation/types';
import {
  fetchDocuments,
  seedSampleDocument,
  setCurrentDocument,
  uploadDocument,
} from '../redux/slices/documentSlice';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { documentService } from '../services/documentService';
import { colors } from '../theme';
import type { DocumentRecord, PickedPdf } from '../types';

const MAX_SIZE = 25 * 1024 * 1024;

export const UploadScreen: React.FC<AppStackScreenProps<'Upload'>> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const { isUploading, uploadStatusMessage } = useAppSelector(state => state.documents);
  const [selectedFile, setSelectedFile] = useState<PickedPdf | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [processingDoc, setProcessingDoc] = useState<DocumentRecord | null>(null);
  const [pipelineStep, setPipelineStep] = useState('Uploading PDF...');

  const validateAndSetFile = (file: PickedPdf) => {
    setErrorMsg(null);
    const name = file.name || 'document.pdf';
    const hasPdfExt = name.toLowerCase().endsWith('.pdf');
    const isPdfMime = !file.type || file.type.includes('pdf');
    if (!hasPdfExt && !isPdfMime) {
      setErrorMsg('Invalid file type. Please select a valid PDF document (.pdf).');
      return;
    }
    if (file.size === 0) {
      setErrorMsg('Selected file is empty (0 bytes). Please choose a valid PDF.');
      return;
    }
    if (file.size && file.size > MAX_SIZE) {
      setErrorMsg('File size exceeds the 25MB limit. Please choose a smaller PDF.');
      return;
    }
    setSelectedFile({ ...file, name });
  };

  const handlePick = async () => {
    try {
      const [file] = await pick({
        type: [types.pdf],
        allowMultiSelection: false,
      });
      validateAndSetFile({
        uri: file.uri,
        name: file.name ?? 'document.pdf',
        type: file.type ?? 'application/pdf',
        size: file.size ?? null,
      });
    } catch (err) {
      if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
        return;
      }
      setErrorMsg(err instanceof Error ? err.message : 'Could not open the file picker.');
    }
  };

  const startPolling = (doc: DocumentRecord) => {
    setProcessingDoc(doc);
    setTimeout(() => setPipelineStep('Extracting text & running OCR...'), 800);
    setTimeout(() => setPipelineStep('Splitting text into semantic chunks...'), 1800);
    setTimeout(() => setPipelineStep('Generating Gemini vector embeddings...'), 2800);
    setTimeout(() => setPipelineStep('Indexing vectors in Pinecone...'), 3800);

    const pollInterval = setInterval(async () => {
      try {
        const updated = await documentService.getDocument(doc.id);
        if (updated.status === 'ready') {
          clearInterval(pollInterval);
          setProcessingDoc(updated);
          dispatch(setCurrentDocument(updated));
          setPipelineStep('Indexing complete! Ready to answer questions.');
          dispatch(fetchDocuments());
        } else if (updated.status === 'failed') {
          clearInterval(pollInterval);
          setErrorMsg(updated.error_message || 'Document processing encountered an error.');
          setProcessingDoc(null);
          dispatch(fetchDocuments());
        }
      } catch {
        // Keep polling until timeout.
      }
    }, 1200);

    setTimeout(() => clearInterval(pollInterval), 35000);
  };

  const handleSubmitUpload = async () => {
    if (!selectedFile) {
      setErrorMsg('Please select a PDF file first.');
      return;
    }
    setErrorMsg(null);
    setPipelineStep('Uploading PDF to storage...');
    const resultAction = await dispatch(uploadDocument(selectedFile));
    if (uploadDocument.fulfilled.match(resultAction)) {
      startPolling(resultAction.payload);
    } else {
      setErrorMsg((resultAction.payload as string) || 'Upload failed.');
    }
  };

  const handleSample = async () => {
    setErrorMsg(null);
    setPipelineStep('Creating and indexing sample PDF...');
    const resultAction = await dispatch(seedSampleDocument());
    if (seedSampleDocument.fulfilled.match(resultAction)) {
      startPolling(resultAction.payload);
    } else {
      setErrorMsg((resultAction.payload as string) || 'Failed to load sample document.');
    }
  };

  return (
    <View style={[styles.flex, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.back}>
          <ArrowLeft size={20} color={colors.muted} />
        </Pressable>
        <View>
          <Text style={styles.title}>Upload PDF</Text>
          <Text style={styles.hint}>Add documents to your SimpAns AI knowledge base</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {errorMsg ? (
          <View style={styles.errorBox}>
            <AlertCircle size={16} color={colors.rose} />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        {processingDoc ? (
          <View style={styles.card}>
            {processingDoc.status === 'ready' ? (
              <>
                <View style={styles.readyIcon}>
                  <CheckCircle2 size={28} color={colors.emerald} />
                </View>
                <Text style={styles.readyTitle}>Document Ready!</Text>
                <Text style={styles.readyBody}>
                  {processingDoc.file_name} has been indexed and is ready for questions.
                </Text>
                <Button
                  label="Start Asking Questions"
                  icon={<Sparkles size={16} color={colors.white} />}
                  onPress={() => navigation.replace('Chat', { document: processingDoc })}
                  style={styles.mb}
                />
                <Button
                  label="Back to Documents"
                  variant="outline"
                  onPress={() => navigation.navigate('Home')}
                />
              </>
            ) : (
              <>
                <Loading label={pipelineStep} sublabel={processingDoc.file_name} />
                <Text style={styles.step}>Extracting & cleaning text</Text>
                <Text style={styles.step}>Semantic chunking</Text>
                <Text style={styles.step}>Generating embeddings</Text>
                <Text style={styles.step}>Indexing vectors</Text>
              </>
            )}
          </View>
        ) : (
          <>
            <Pressable onPress={handlePick} style={styles.dropzone}>
              <UploadCloud size={32} color={colors.emerald} />
              {selectedFile ? (
                <>
                  <View style={styles.fileRow}>
                    <FileText size={16} color={colors.emerald} />
                    <Text style={styles.fileName} numberOfLines={1}>
                      {selectedFile.name}
                    </Text>
                  </View>
                  <Text style={styles.fileMeta}>
                    {selectedFile.size
                      ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload`
                      : 'Ready to upload'}
                  </Text>
                  <Text style={styles.tapHint}>Tap to select a different PDF</Text>
                </>
              ) : (
                <>
                  <Text style={styles.dropTitle}>Choose a PDF from your device</Text>
                  <Text style={styles.dropBody}>Standard & scanned PDFs up to 25MB supported</Text>
                  <View style={styles.browse}>
                    <FolderOpen size={14} color={colors.emerald} />
                    <Text style={styles.browseText}>Browse Files</Text>
                  </View>
                </>
              )}
            </Pressable>

            <Button
              label={isUploading ? uploadStatusMessage || 'Uploading...' : 'Upload & Process with AI'}
              size="lg"
              disabled={!selectedFile || isUploading}
              isLoading={isUploading}
              onPress={handleSubmitUpload}
            />
            <Text style={styles.or}>Or test instantly</Text>
            <Button
              label='Upload Sample "React_Native_Overview.pdf"'
              variant="outline"
              disabled={isUploading}
              onPress={handleSample}
              icon={<Sparkles size={16} color={colors.emerald} />}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  back: { padding: 8, marginLeft: -8 },
  title: { color: colors.white, fontSize: 18, fontWeight: '700' },
  hint: { color: colors.muted, fontSize: 12 },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
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
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  readyIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.emeraldSoft,
    borderWidth: 1,
    borderColor: colors.emeraldBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  readyTitle: { color: colors.white, fontSize: 18, fontWeight: '700' },
  readyBody: { color: colors.muted, fontSize: 12, textAlign: 'center', marginVertical: 12 },
  mb: { width: '100%', marginBottom: 10 },
  step: { color: colors.muted, fontSize: 12, marginTop: 6 },
  dropzone: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    backgroundColor: 'rgba(24,24,27,0.45)',
    gap: 8,
  },
  dropTitle: { color: colors.text, fontWeight: '600', textAlign: 'center' },
  dropBody: { color: colors.muted, fontSize: 12, textAlign: 'center' },
  browse: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  browseText: { color: colors.text, fontSize: 12, fontWeight: '500' },
  fileRow: { flexDirection: 'row', alignItems: 'center', gap: 8, maxWidth: '90%' },
  fileName: { color: colors.text, fontWeight: '600', flexShrink: 1 },
  fileMeta: { color: colors.emerald, fontSize: 12, fontWeight: '500' },
  tapHint: { color: colors.mutedStrong, fontSize: 11 },
  or: { color: colors.mutedStrong, fontSize: 12, textAlign: 'center' },
});
