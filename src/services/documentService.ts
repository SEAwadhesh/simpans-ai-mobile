import { request } from './api';
import type { DocumentRecord, PickedPdf, SourceReference } from '../types';

export interface ChatApiResponse {
  answer: string;
  sources: SourceReference[];
}

export const documentService = {
  async getDocuments(): Promise<DocumentRecord[]> {
    const data = await request<{ documents: DocumentRecord[] }>('/documents');
    return data.documents || [];
  },

  async getDocument(id: string): Promise<DocumentRecord> {
    const data = await request<{ document: DocumentRecord }>(`/documents/${id}`);
    return data.document;
  },

  async uploadDocument(file: PickedPdf): Promise<DocumentRecord> {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.type || 'application/pdf',
    } as unknown as Blob);

    const data = await request<{ message: string; document: DocumentRecord }>('/documents', {
      method: 'POST',
      body: formData,
    });

    return data.document;
  },

  async seedSampleDocument(): Promise<DocumentRecord> {
    const data = await request<{ message: string; document: DocumentRecord }>(
      '/documents/seed',
      { method: 'POST' },
    );
    return data.document;
  },

  async retryDocument(id: string): Promise<DocumentRecord> {
    const data = await request<{ message: string; document: DocumentRecord }>(
      `/documents/${id}/retry`,
      { method: 'POST' },
    );
    return data.document;
  },

  async deleteDocument(id: string): Promise<void> {
    await request(`/documents/${id}`, { method: 'DELETE' });
  },

  async askQuestion(documentId: string, question: string): Promise<ChatApiResponse> {
    return request<ChatApiResponse>('/chat', {
      method: 'POST',
      body: JSON.stringify({ documentId, question }),
    });
  },
};
