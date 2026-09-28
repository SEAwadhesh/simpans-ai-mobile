export type DocumentStatus = 'uploading' | 'processing' | 'ready' | 'failed';

export interface User {
  id: string;
  email: string;
}

export interface DocumentRecord {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  status: DocumentStatus;
  page_count?: number;
  chunk_count?: number;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface SourceReference {
  pageNumber: number;
  chunkIndex?: number;
  snippet?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  sources?: SourceReference[];
  timestamp: string;
  isError?: boolean;
}

export interface AuthSession {
  user: User;
  token: string;
}

export interface PickedPdf {
  uri: string;
  name: string;
  type: string;
  size: number | null;
}
