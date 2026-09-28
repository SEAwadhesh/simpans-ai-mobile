import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { documentService } from '../../services/documentService';
import type { DocumentRecord, DocumentStatus, PickedPdf } from '../../types';

interface DocumentState {
  documents: DocumentRecord[];
  currentDocument: DocumentRecord | null;
  isLoading: boolean;
  isUploading: boolean;
  uploadStatusMessage: string;
  error: string | null;
}

const initialState: DocumentState = {
  documents: [],
  currentDocument: null,
  isLoading: false,
  isUploading: false,
  uploadStatusMessage: '',
  error: null,
};

export const fetchDocuments = createAsyncThunk(
  'documents/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await documentService.getDocuments();
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to fetch documents');
    }
  },
);

export const uploadDocument = createAsyncThunk(
  'documents/upload',
  async (file: PickedPdf, { rejectWithValue }) => {
    try {
      return await documentService.uploadDocument(file);
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to upload PDF');
    }
  },
);

export const seedSampleDocument = createAsyncThunk(
  'documents/seed',
  async (_, { rejectWithValue }) => {
    try {
      return await documentService.seedSampleDocument();
    } catch (err: unknown) {
      return rejectWithValue(
        err instanceof Error ? err.message : 'Failed to load sample document',
      );
    }
  },
);

export const retryDocumentProcessing = createAsyncThunk(
  'documents/retry',
  async (id: string, { rejectWithValue }) => {
    try {
      return await documentService.retryDocument(id);
    } catch (err: unknown) {
      return rejectWithValue(
        err instanceof Error ? err.message : 'Failed to retry document processing',
      );
    }
  },
);

export const deleteDocument = createAsyncThunk(
  'documents/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await documentService.deleteDocument(id);
      return id;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to delete document');
    }
  },
);

const documentSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    setCurrentDocument(state, action: PayloadAction<DocumentRecord | null>) {
      state.currentDocument = action.payload;
    },
    updateDocumentStatus(
      state,
      action: PayloadAction<{
        id: string;
        status: DocumentStatus;
        pageCount?: number;
        chunkCount?: number;
        error?: string;
      }>,
    ) {
      const doc = state.documents.find(d => d.id === action.payload.id);
      if (doc) {
        doc.status = action.payload.status;
        if (action.payload.pageCount) {
          doc.page_count = action.payload.pageCount;
        }
        if (action.payload.chunkCount) {
          doc.chunk_count = action.payload.chunkCount;
        }
        if (action.payload.error) {
          doc.error_message = action.payload.error;
        }
      }
      if (state.currentDocument?.id === action.payload.id) {
        state.currentDocument.status = action.payload.status;
        if (action.payload.pageCount) {
          state.currentDocument.page_count = action.payload.pageCount;
        }
        if (action.payload.chunkCount) {
          state.currentDocument.chunk_count = action.payload.chunkCount;
        }
        if (action.payload.error) {
          state.currentDocument.error_message = action.payload.error;
        }
      }
    },
    setUploadStatusMessage(state, action: PayloadAction<string>) {
      state.uploadStatusMessage = action.payload;
    },
    clearDocumentError(state) {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchDocuments.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.documents = action.payload;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'Failed to fetch documents';
      })
      .addCase(uploadDocument.pending, state => {
        state.isUploading = true;
        state.uploadStatusMessage = 'Uploading PDF...';
        state.error = null;
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.isUploading = false;
        state.uploadStatusMessage = '';
        state.documents.unshift(action.payload);
        state.currentDocument = action.payload;
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.isUploading = false;
        state.uploadStatusMessage = '';
        state.error = (action.payload as string) || 'Upload failed';
      })
      .addCase(seedSampleDocument.pending, state => {
        state.isUploading = true;
        state.uploadStatusMessage = 'Creating and indexing sample PDF...';
        state.error = null;
      })
      .addCase(seedSampleDocument.fulfilled, (state, action) => {
        state.isUploading = false;
        state.uploadStatusMessage = '';
        const exists = state.documents.some(d => d.id === action.payload.id);
        if (!exists) {
          state.documents.unshift(action.payload);
        }
        state.currentDocument = action.payload;
      })
      .addCase(seedSampleDocument.rejected, (state, action) => {
        state.isUploading = false;
        state.uploadStatusMessage = '';
        state.error = (action.payload as string) || 'Failed to seed sample document';
      })
      .addCase(retryDocumentProcessing.fulfilled, (state, action) => {
        const docIndex = state.documents.findIndex(d => d.id === action.payload.id);
        if (docIndex !== -1) {
          state.documents[docIndex].status = 'processing';
          state.documents[docIndex].error_message = undefined;
        }
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.documents = state.documents.filter(d => d.id !== action.payload);
        if (state.currentDocument?.id === action.payload) {
          state.currentDocument = null;
        }
      });
  },
});

export const {
  setCurrentDocument,
  updateDocumentStatus,
  setUploadStatusMessage,
  clearDocumentError,
} = documentSlice.actions;
export default documentSlice.reducer;
