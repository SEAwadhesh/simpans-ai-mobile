import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { documentService } from '../../services/documentService';
import type { ChatMessage } from '../../types';

interface ChatState {
  messages: ChatMessage[];
  isAsking: boolean;
  error: string | null;
}

const initialState: ChatState = {
  messages: [],
  isAsking: false,
  error: null,
};

export const askQuestion = createAsyncThunk(
  'chat/askQuestion',
  async (
    { documentId, question }: { documentId: string; question: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await documentService.askQuestion(documentId, question);
      return {
        question,
        answer: response.answer,
        sources: response.sources || [],
      };
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to get answer');
    }
  },
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage(state, action: PayloadAction<ChatMessage>) {
      state.messages.push(action.payload);
    },
    clearMessages(state) {
      state.messages = [];
      state.error = null;
    },
    setChatError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(askQuestion.pending, (state, action) => {
        state.isAsking = true;
        state.error = null;
        state.messages.push({
          id: `user-${Date.now()}`,
          sender: 'user',
          text: action.meta.arg.question,
          timestamp: new Date().toISOString(),
        });
      })
      .addCase(askQuestion.fulfilled, (state, action) => {
        state.isAsking = false;
        state.messages.push({
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: action.payload.answer,
          sources: action.payload.sources,
          timestamp: new Date().toISOString(),
        });
      })
      .addCase(askQuestion.rejected, (state, action) => {
        state.isAsking = false;
        const errorMsg = (action.payload as string) || 'Could not process question.';
        state.error = errorMsg;
        state.messages.push({
          id: `err-${Date.now()}`,
          sender: 'ai',
          text: `Error: ${errorMsg}`,
          isError: true,
          timestamp: new Date().toISOString(),
        });
      });
  },
});

export const { addMessage, clearMessages, setChatError } = chatSlice.actions;
export default chatSlice.reducer;
