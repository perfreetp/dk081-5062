import { create } from 'zustand';
import type { RevisitItem, RevisitStatus, DissatisfactionTag } from '@/types/revisit';
import { mockRevisitList } from '@/data/mockData';

const isPromiseOvertime = (item: RevisitItem): boolean => {
  if (!item.improvement?.promiseTime) return false;
  try {
    const promiseDate = new Date(item.improvement.promiseTime.replace(/-/g, '/'));
    return promiseDate < new Date();
  } catch {
    return false;
  }
};

let speechSynthesisInstance: SpeechSynthesis | null = null;
let currentUtterance: SpeechSynthesisUtterance | null = null;

const getSpeechSynthesis = (): SpeechSynthesis | null => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    speechSynthesisInstance = window.speechSynthesis;
  }
  return speechSynthesisInstance;
};

interface RevisitState {
  revisitList: RevisitItem[];
  elderlyMode: boolean;
  voiceMode: boolean;
  isSpeaking: boolean;
  getPendingList: () => RevisitItem[];
  getProgressList: () => RevisitItem[];
  getOvertimeList: () => RevisitItem[];
  getRecordsList: () => RevisitItem[];
  getReviewList: () => RevisitItem[];
  getById: (id: string) => RevisitItem | undefined;
  checkIsOvertime: (item: RevisitItem) => boolean;
  updateStatus: (id: string, status: RevisitStatus, tags?: DissatisfactionTag[]) => void;
  submitSupplement: (id: string, data: {
    text?: string;
    images?: string[];
    contactTime?: string;
    isForElderly?: boolean;
    delegateName?: string;
  }) => void;
  submitReview: (id: string, rating: number, isImproved: boolean, comment?: string) => void;
  applySupervision: (id: string) => void;
  toggleElderlyMode: () => void;
  toggleVoiceMode: () => void;
  speakText: (text: string, force?: boolean) => void;
  speakItemDetails: (item: RevisitItem) => void;
  stopSpeaking: () => void;
}

export const useRevisitStore = create<RevisitState>((set, get) => ({
  revisitList: mockRevisitList,
  elderlyMode: false,
  voiceMode: false,
  isSpeaking: false,

  getPendingList: () => {
    return get().revisitList.filter(item => item.status === 'pending');
  },

  getProgressList: () => {
    return get().revisitList.filter(item =>
      item.status === 'partial' || item.status === 'unresolved'
    );
  },

  getOvertimeList: () => {
    return get()
      .getProgressList()
      .filter(item => isPromiseOvertime(item) && !item.supervisionApplied);
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

  checkIsOvertime: (item) => {
    return isPromiseOvertime(item);
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
          const tagLabels = (tags || [])
            .map(t => {
              const tagMap: Record<string, string> = {
                wait_long: '等待时间久',
                unclear_info: '告知不清',
                repeated_materials: '材料反复补交',
                bad_attitude: '态度生硬',
                other: '其他问题'
              };
              return tagMap[t] || t;
            })
            .join('、');
          const descParts = [`群众反馈：${statusTextMap[status]}`];
          if (tagLabels) descParts.push(`不满点：${tagLabels}`);
          return {
            ...item,
            status,
            statusText: statusTextMap[status],
            dissatisfactionTags: tags ? [...new Set([...item.dissatisfactionTags, ...tags])] : item.dissatisfactionTags,
            processNodes: [
              ...item.processNodes.filter(n => n.status !== 'pending').map(n => ({ ...n, status: 'done' as const })),
              {
                id: `node-${Date.now()}`,
                title: '群众确认',
                description: descParts.join('；'),
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
          const extraParts: string[] = [];
          if (data.text) extraParts.push('已补充文字说明');
          if (data.images && data.images.length > 0) extraParts.push(`已上传${data.images.length}张图片`);
          if (data.isForElderly && data.delegateName) extraParts.push(`家属${data.delegateName}代填`);
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
                description: extraParts.length > 0 ? extraParts.join('；') : '群众已提交补充材料',
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

  submitReview: (id, rating, isImproved, comment) => {
    const ratingTexts = ['', '非常不满意', '不满意', '一般', '满意', '非常满意'];
    set(state => ({
      revisitList: state.revisitList.map(item => {
        if (item.id === id) {
          const parts = [
            `群众给出${rating}星评价（${ratingTexts[rating] || ''}）`,
            `整改效果：${isImproved ? '群众认可，问题已真正改善' : '群众未认可，问题尚未真正改善'}`
          ];
          if (comment) parts.push(`评价内容：${comment}`);
          return {
            ...item,
            reviewRating: rating,
            reviewIsImproved: isImproved,
            reviewComment: comment,
            processNodes: [
              ...item.processNodes,
              {
                id: `node-${Date.now()}`,
                title: '复核评价完成',
                description: parts.join('；'),
                time: new Date().toLocaleString('zh-CN'),
                status: 'done' as const
              }
            ]
          };
        }
        return item;
      })
    }));
    console.log('[RevisitStore] submitReview', { id, rating, isImproved, comment });
  },

  applySupervision: (id) => {
    set(state => ({
      revisitList: state.revisitList.map(item => {
        if (item.id === id) {
          const updatedNodes = [...item.processNodes];
          for (let i = updatedNodes.length - 1; i >= 0; i--) {
            if (updatedNodes[i].status === 'current') {
              updatedNodes[i] = { ...updatedNodes[i], status: 'done' };
              break;
            }
          }
          return {
            ...item,
            supervisionApplied: true,
            processNodes: [
              ...updatedNodes,
              {
                id: `node-${Date.now()}-s`,
                title: '再次督办已申请',
                description: '群众因整改超时申请上级督办，已转交督查部门处理',
                time: new Date().toLocaleString('zh-CN'),
                status: 'current' as const
              },
              {
                id: `node-${Date.now()}-e`,
                title: '督查部门处理中',
                description: '等待督查部门介入并反馈处理结果',
                time: '',
                status: 'pending' as const
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
    const willEnable = !get().elderlyMode;
    set(state => ({ elderlyMode: !state.elderlyMode }));
    if (get().voiceMode) {
      get().speakText(willEnable ? '已开启大字版模式' : '已关闭大字版模式');
    }
  },

  toggleVoiceMode: () => {
    const willEnable = !get().voiceMode;
    set(state => ({ voiceMode: !state.voiceMode }));
    if (willEnable) {
      setTimeout(() => {
        get().speakText('语音播报已开启，点击相关内容即可收听', true);
      }, 100);
    } else {
      get().stopSpeaking();
    }
  },

  speakText: (text, force = false) => {
    const { voiceMode } = get();
    if (!voiceMode && !force) {
      console.log('[RevisitStore] speakText skipped: voice mode off');
      return;
    }
    if (!text || !text.trim()) return;

    const synth = getSpeechSynthesis();
    if (!synth) {
      console.log('[RevisitStore] speakText: SpeechSynthesis not available');
      return;
    }

    try {
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => set({ isSpeaking: true });
      utterance.onend = () => set({ isSpeaking: false });
      utterance.onerror = () => set({ isSpeaking: false });

      currentUtterance = utterance;
      synth.speak(utterance);
      console.log('[RevisitStore] speakText:', text);
    } catch (err) {
      console.error('[RevisitStore] speakText error:', err);
    }
  },

  speakItemDetails: (item) => {
    const { voiceMode } = get();
    if (!voiceMode) return;

    const parts: string[] = [];
    parts.push(`事项标题：${item.title}`);
    parts.push(`事项名称：${item.matterName}`);
    parts.push(`承办单位：${item.department}`);

    if (item.dissatisfactionTags.length > 0) {
      const tagMap: Record<string, string> = {
        wait_long: '等待时间久',
        unclear_info: '告知不清',
        repeated_materials: '材料反复补交',
        bad_attitude: '态度生硬',
        other: '其他问题'
      };
      const labels = item.dissatisfactionTags.map(t => tagMap[t] || t).join('、');
      parts.push(`您反馈的问题：${labels}`);
    }

    if (item.improvement) {
      parts.push(`承办单位整改说明：${item.improvement.description}`);
      parts.push(`承诺完成时间：${item.improvement.promiseTime}`);
    }

    if (item.status === 'pending') {
      parts.push('操作提示：请点击下方按钮，选择已解决、部分解决或仍未解决。如需补充说明，请点击补充说明按钮。');
    }

    const fullText = parts.join('。');
    get().speakText(fullText, true);
  },

  stopSpeaking: () => {
    const synth = getSpeechSynthesis();
    if (synth) {
      synth.cancel();
    }
    set({ isSpeaking: false });
    currentUtterance = null;
  }
}));
