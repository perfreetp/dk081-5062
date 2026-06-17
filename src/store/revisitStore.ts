import { create } from 'zustand';
import type { RevisitItem, RevisitStatus, DissatisfactionTag } from '@/types/revisit';
import { mockRevisitList } from '@/data/mockData';

interface RevisitState {
  revisitList: RevisitItem[];
  elderlyMode: boolean;
  voiceMode: boolean;
  getPendingList: () => RevisitItem[];
  getProgressList: () => RevisitItem[];
  getRecordsList: () => RevisitItem[];
  getReviewList: () => RevisitItem[];
  getById: (id: string) => RevisitItem | undefined;
  updateStatus: (id: string, status: RevisitStatus, tags?: DissatisfactionTag[]) => void;
  submitSupplement: (id: string, data: {
    text?: string;
    images?: string[];
    contactTime?: string;
    isForElderly?: boolean;
    delegateName?: string;
  }) => void;
  submitReview: (id: string, rating: number, comment?: string) => void;
  applySupervision: (id: string) => void;
  toggleElderlyMode: () => void;
  toggleVoiceMode: () => void;
  speakText: (text: string) => void;
}

export const useRevisitStore = create<RevisitState>((set, get) => ({
  revisitList: mockRevisitList,
  elderlyMode: false,
  voiceMode: false,

  getPendingList: () => {
    return get().revisitList.filter(item => item.status === 'pending');
  },

  getProgressList: () => {
    return get().revisitList.filter(item =>
      item.status === 'partial' || item.status === 'unresolved'
    );
  },

  getRecordsList: () => {
    return get().revisitList.filter(item => item.status !== 'pending');
  },

  getReviewList: () => {
    return get().revisitList.filter(item =>
      item.status === 'resolved' && !item.reviewRating
    );
  },

  getById: (id) => {
    return get().revisitList.find(item => item.id === id);
  },

  updateStatus: (id, status, tags) => {
    set(state => ({
      revisitList: state.revisitList.map(item => {
        if (item.id === id) {
          const statusTextMap: Record<RevisitStatus, string> = {
            pending: '待确认',
            resolved: '已解决',
            partial: '部分解决',
            unresolved: '仍未解决'
          };
          return {
            ...item,
            status,
            statusText: statusTextMap[status],
            dissatisfactionTags: tags ? [...item.dissatisfactionTags, ...tags] : item.dissatisfactionTags,
            processNodes: [
              ...item.processNodes,
              {
                id: `node-${Date.now()}`,
                title: '群众确认',
                description: `群众反馈：${statusTextMap[status]}`,
                time: new Date().toLocaleString('zh-CN'),
                status: 'done' as const
              }
            ]
          };
        }
        return item;
      })
    }));
    console.log('[RevisitStore] updateStatus', { id, status, tags });
  },

  submitSupplement: (id, data) => {
    set(state => ({
      revisitList: state.revisitList.map(item => {
        if (item.id === id) {
          return {
            ...item,
            supplementText: data.text || item.supplementText,
            supplementImages: data.images || item.supplementImages,
            contactTime: data.contactTime || item.contactTime,
            isForElderly: data.isForElderly ?? item.isForElderly,
            delegateName: data.delegateName || item.delegateName,
            processNodes: [
              ...item.processNodes,
              {
                id: `node-${Date.now()}`,
                title: '补充说明已提交',
                description: '群众已提交补充材料和说明',
                time: new Date().toLocaleString('zh-CN'),
                status: 'done' as const
              }
            ]
          };
        }
        return item;
      })
    }));
    console.log('[RevisitStore] submitSupplement', { id, data });
  },

  submitReview: (id, rating, comment) => {
    set(state => ({
      revisitList: state.revisitList.map(item => {
        if (item.id === id) {
          return {
            ...item,
            reviewRating: rating,
            reviewComment: comment,
            processNodes: [
              ...item.processNodes,
              {
                id: `node-${Date.now()}`,
                title: '复核评价完成',
                description: `群众给出${rating}星评价`,
                time: new Date().toLocaleString('zh-CN'),
                status: 'done' as const
              }
            ]
          };
        }
        return item;
      })
    }));
    console.log('[RevisitStore] submitReview', { id, rating, comment });
  },

  applySupervision: (id) => {
    set(state => ({
      revisitList: state.revisitList.map(item => {
        if (item.id === id) {
          return {
            ...item,
            processNodes: [
              ...item.processNodes,
              {
                id: `node-${Date.now()}`,
                title: '已申请再次督办',
                description: '群众申请上级督办，已转交相关部门',
                time: new Date().toLocaleString('zh-CN'),
                status: 'current' as const
              }
            ]
          };
        }
        return item;
      })
    }));
    console.log('[RevisitStore] applySupervision', { id });
  },

  toggleElderlyMode: () => {
    set(state => ({ elderlyMode: !state.elderlyMode }));
  },

  toggleVoiceMode: () => {
    set(state => ({ voiceMode: !state.voiceMode }));
  },

  speakText: (text) => {
    if (get().voiceMode) {
      console.log('[RevisitStore] speakText', text);
    }
  }
}));
