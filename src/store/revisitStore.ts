import { create } from 'zustand';
import Taro from '@tarojs/taro';
import type {
  RevisitItem,
  RevisitStatus,
  DissatisfactionTag,
  ProcessNode,
  RevisitStage
} from '@/types/revisit';
import { mockRevisitList } from '@/data/mockData';

const STORAGE_KEY = 'revisit_app_data_v2';
const STORAGE_SETTINGS_KEY = 'revisit_app_settings_v1';

type PersistedData = {
  revisitList: RevisitItem[];
  savedAt: number;
};

type PersistedSettings = {
  elderlyMode: boolean;
  voiceMode: boolean;
};

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

const loadPersistedList = (): RevisitItem[] => {
  try {
    const raw = Taro.getStorageSync(STORAGE_KEY);
    if (raw) {
      const parsed: PersistedData = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (parsed && Array.isArray(parsed.revisitList) && parsed.revisitList.length > 0) {
        console.log('[RevisitStore] loaded from storage, items:', parsed.revisitList.length);
        return parsed.revisitList;
      }
    }
  } catch (e) {
    console.warn('[RevisitStore] loadPersistedList error:', e);
  }
  console.log('[RevisitStore] using mock data as initial');
  return JSON.parse(JSON.stringify(mockRevisitList));
};

const loadPersistedSettings = (): { elderlyMode: boolean; voiceMode: boolean } => {
  try {
    const raw = Taro.getStorageSync(STORAGE_SETTINGS_KEY);
    if (raw) {
      const parsed: PersistedSettings = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (parsed) {
        return { elderlyMode: !!parsed.elderlyMode, voiceMode: !!parsed.voiceMode };
      }
    }
  } catch (e) {
    console.warn('[RevisitStore] loadPersistedSettings error:', e);
  }
  return { elderlyMode: false, voiceMode: false };
};

const saveListToStorage = (list: RevisitItem[]) => {
  try {
    const data: PersistedData = { revisitList: list, savedAt: Date.now() };
    Taro.setStorageSync(STORAGE_KEY, JSON.stringify(data));
    console.log('[RevisitStore] saved to storage, items:', list.length);
  } catch (e) {
    console.warn('[RevisitStore] saveListToStorage error:', e);
  }
};

const saveSettingsToStorage = (elderlyMode: boolean, voiceMode: boolean) => {
  try {
    const data: PersistedSettings = { elderlyMode, voiceMode };
    Taro.setStorageSync(STORAGE_SETTINGS_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('[RevisitStore] saveSettingsToStorage error:', e);
  }
};

const initialSettings = loadPersistedSettings();

const nowStr = () => new Date().toLocaleString('zh-CN');

const buildTagLabels = (tags: DissatisfactionTag[]): string => {
  const tagMap: Record<string, string> = {
    wait_long: '等待时间久',
    unclear_info: '告知不清',
    repeated_materials: '材料反复补交',
    bad_attitude: '态度生硬',
    other: '其他问题'
  };
  return tags.map(t => tagMap[t] || t).join('、');
};

const markAllCurrentAsDone = (nodes: ProcessNode[]): ProcessNode[] => {
  return nodes.map(n => (n.status === 'current' ? { ...n, status: 'done' as const } : n));
};

const finalizeNodesForStage = (nodes: ProcessNode[]): ProcessNode[] => {
  const result = [...nodes];
  for (let i = result.length - 1; i >= 0; i--) {
    if (result[i].status === 'current') {
      result[i] = { ...result[i], status: 'done' as const };
      break;
    }
  }
  return result;
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
  getClosedList: () => RevisitItem[];
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
  submitReview: (id: string, data: { rating: number; isImproved: boolean; comment?: string }) => void;
  applySupervision: (id: string) => void;
  requestRehandle: (id: string) => void;

  toggleElderlyMode: () => void;
  toggleVoiceMode: () => void;
  speakText: (text: string, force?: boolean) => void;
  speakItemDetails: (item: RevisitItem) => void;
  stopSpeaking: () => void;

  resetAllData: () => void;
}

export const useRevisitStore = create<RevisitState>((set, get) => ({
  revisitList: loadPersistedList(),
  elderlyMode: initialSettings.elderlyMode,
  voiceMode: initialSettings.voiceMode,
  isSpeaking: false,

  getPendingList: () => get().revisitList.filter(i => i.stage === 'stage_pending'),
  getProgressList: () => get().revisitList.filter(i =>
    i.stage === 'stage_department' || i.stage === 'stage_supervision' || i.stage === 'stage_review'
  ),
  getOvertimeList: () => get()
    .getProgressList()
    .filter(i => isPromiseOvertime(i) && !i.supervisionApplied && i.stage === 'stage_department'),
  getRecordsList: () => get().revisitList.filter(i => i.stage !== 'stage_pending'),
  getReviewList: () => get().revisitList.filter(i => i.stage === 'stage_review' && !i.reviewRating),
  getClosedList: () => get().revisitList.filter(i => i.stage === 'stage_closed'),
  getById: (id) => get().revisitList.find(i => i.id === id),
  checkIsOvertime: isPromiseOvertime,

  updateStatus: (id, status, tags) => {
    const newList = get().revisitList.map(item => {
      if (item.id !== id) return item;

      const statusTextMap: Record<RevisitStatus, string> = {
        pending: '待确认',
        resolved: '已解决',
        partial: '部分解决',
        unresolved: '仍未解决',
        rehandling: '再次整改中',
        closed_good: '已办结(认可)',
        closed_bad: '已办结(未认可)'
      };

      const selectedTags = tags ? [...new Set([...item.dissatisfactionTags, ...tags])] : item.dissatisfactionTags;
      const tagLabels = buildTagLabels(selectedTags);

      let stage: RevisitStage = 'stage_pending';
      let stageText = '群众确认';
      let currentHandler = '您';
      let currentHandlerDept = '办事群众';
      let nextAction = '';
      const newNodes: ProcessNode[] = finalizeNodesForStage(item.processNodes);

      if (status === 'resolved') {
        stage = 'stage_review';
        stageText = '复核评价';
        currentHandler = '您';
        currentHandlerDept = '办事群众';
        nextAction = '请对整改效果进行复核评价';
        newNodes.push({
          id: `node-${Date.now()}-confirm`,
          title: '群众反馈：已解决',
          description: '群众确认问题已解决，即将进入复核评价环节',
          time: nowStr(),
          status: 'done',
          department: '办事群众',
          nodeType: 'mass_confirm'
        });
        newNodes.push({
          id: `node-${Date.now()}-review`,
          title: '等待群众复核评价',
          description: '请对整改效果进行复核评价',
          time: '',
          status: 'current',
          department: '办事群众',
          nodeType: 'review_pending'
        });
      } else if (status === 'partial' || status === 'unresolved') {
        stage = 'stage_department';
        stageText = '部门整改';
        currentHandler = item.improvement?.operator || '相关负责人';
        currentHandlerDept = item.department;
        nextAction = '等待承办单位整改反馈';
        const confirmDesc = tagLabels
          ? `群众反馈：${statusTextMap[status]}；不满点：${tagLabels}`
          : `群众反馈：${statusTextMap[status]}`;
        newNodes.push({
          id: `node-${Date.now()}-confirm`,
          title: '群众确认',
          description: confirmDesc,
          time: nowStr(),
          status: 'done',
          department: '办事群众',
          nodeType: 'mass_confirm'
        });
        newNodes.push({
          id: `node-${Date.now()}-dept`,
          title: '部门受理整改',
          description: `${item.department}已受理，正在研究整改方案`,
          time: '',
          status: 'current',
          department: item.department,
          operator: currentHandler,
          nodeType: 'department_rectify'
        });
      }

      return {
        ...item,
        status,
        statusText: statusTextMap[status],
        stage,
        stageText,
        currentHandler,
        currentHandlerDept,
        nextAction,
        dissatisfactionTags: selectedTags,
        processNodes: newNodes
      };
    });

    set({ revisitList: newList });
    saveListToStorage(newList);
    console.log('[RevisitStore] updateStatus persisted', { id, status, tags });
  },

  submitSupplement: (id, data) => {
    const newList = get().revisitList.map(item => {
      if (item.id !== id) return item;
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
            time: nowStr(),
            status: 'done',
            department: '办事群众',
            nodeType: 'mass_confirm'
          }
        ]
      };
    });
    set({ revisitList: newList });
    saveListToStorage(newList);
    console.log('[RevisitStore] submitSupplement persisted', { id, data });
  },

  submitReview: (id, { rating, isImproved, comment }) => {
    const ratingTexts = ['', '非常不满意', '不满意', '一般', '满意', '非常满意'];
    const newList = get().revisitList.map(item => {
      if (item.id !== id) return item;

      const newNodes = finalizeNodesForStage(item.processNodes);
      const reviewDesc = [
        `群众给出${rating}星评价（${ratingTexts[rating] || ''}）`,
        `整改效果：${isImproved ? '群众认可，问题已真正改善' : '群众未认可，问题尚未真正改善'}`
      ];
      if (comment) reviewDesc.push(`评价内容：${comment}`);
      newNodes.push({
        id: `node-${Date.now()}-review-done`,
        title: '复核评价完成',
        description: reviewDesc.join('；'),
        time: nowStr(),
        status: 'done',
        department: '办事群众',
        nodeType: 'review_done'
      });

      const newReviewCount = item.reviewCount + 1;

      if (isImproved) {
        newNodes.push({
          id: `node-${Date.now()}-closed`,
          title: '办结归档',
          description: '群众认可整改效果，事项办结归档',
          time: nowStr(),
          status: 'done',
          department: '市政务服务管理局',
          nodeType: 'closed'
        });
        return {
          ...item,
          reviewRating: rating,
          reviewIsImproved: true,
          reviewComment: comment,
          reviewCount: newReviewCount,
          status: 'closed_good' as RevisitStatus,
          statusText: '已办结(认可)',
          stage: 'stage_closed' as RevisitStage,
          stageText: '已办结',
          currentHandler: '—',
          currentHandlerDept: '已办结归档',
          nextAction: '事项已办结，可查看历史记录',
          closed: true,
          closedTime: nowStr(),
          processNodes: newNodes
        };
      } else {
        newNodes.push({
          id: `node-${Date.now()}-rehandle`,
          title: '二次整改已启动',
          description: '群众对整改效果不满意，启动二次整改程序',
          time: nowStr(),
          status: 'current',
          department: item.department,
          operator: item.improvement?.operator || '相关负责人',
          nodeType: 'rehandle_start'
        });
        newNodes.push({
          id: `node-${Date.now()}-rehandle-end`,
          title: '二次整改完成后复核',
          description: '二次整改完成后将邀请群众再次复核',
          time: '',
          status: 'pending',
          department: '办事群众',
          nodeType: 'review_pending'
        });
        return {
          ...item,
          reviewRating: rating,
          reviewIsImproved: false,
          reviewComment: comment,
          reviewCount: newReviewCount,
          status: 'rehandling' as RevisitStatus,
          statusText: '再次整改中',
          stage: 'stage_department' as RevisitStage,
          stageText: '部门整改',
          currentHandler: item.improvement?.operator || '相关负责人',
          currentHandlerDept: item.department,
          nextAction: '等待承办单位二次整改，完成后将再次邀请您复核',
          reimprovement: item.reimprovement || {
            description: '针对群众不满意的问题，正在制定更深入的整改方案',
            promiseTime: '',
            operator: item.improvement?.operator || ''
          },
          processNodes: newNodes
        };
      }
    });

    set({ revisitList: newList });
    saveListToStorage(newList);
    console.log('[RevisitStore] submitReview persisted', { id, rating, isImproved, comment });
  },

  applySupervision: (id) => {
    const newList = get().revisitList.map(item => {
      if (item.id !== id) return item;

      const newNodes = finalizeNodesForStage(item.processNodes);
      newNodes.push({
        id: `node-${Date.now()}-apply`,
        title: '群众申请再次督办',
        description: '因整改超时，群众申请上级督办',
        time: nowStr(),
        status: 'done',
        department: '办事群众',
        nodeType: 'supervision_apply'
      });
      newNodes.push({
        id: `node-${Date.now()}-accept`,
        title: '督查部门受理',
        description: '市督查办已受理督办申请，正在介入调查',
        time: nowStr(),
        status: 'done',
        department: '市督查办',
        operator: '督查一组',
        nodeType: 'supervision_accept'
      });
      newNodes.push({
        id: `node-${Date.now()}-handle`,
        title: '督查督办中',
        description: '督查部门已约谈承办单位，要求限期再次整改',
        time: nowStr(),
        status: 'current',
        department: '市督查办',
        operator: '督查一组',
        nodeType: 'supervision_handle'
      });
      newNodes.push({
        id: `node-${Date.now()}-rehandle`,
        title: '二次整改进行中',
        description: '承办单位在督查督促下推进二次整改',
        time: '',
        status: 'pending',
        department: item.department,
        operator: item.improvement?.operator || '',
        nodeType: 'rehandle_start'
      });
      newNodes.push({
        id: `node-${Date.now()}-recheck`,
        title: '等待群众二次复核',
        description: '二次整改完成后将邀请群众再次复核评价',
        time: '',
        status: 'pending',
        department: '办事群众',
        nodeType: 'review_pending'
      });

      const nextLevel = (item.supervisionLevel || 0) + 1;

      return {
        ...item,
        supervisionApplied: true,
        supervisionLevel: Math.min(nextLevel, 2) as 0 | 1 | 2,
        status: 'rehandling',
        statusText: '再次整改中',
        stage: 'stage_supervision',
        stageText: '督查督办',
        currentHandler: '督查一组',
        currentHandlerDept: '市督查办',
        nextAction: '督查部门督办中，等待承办单位二次整改反馈',
        reimprovement: item.reimprovement || {
          description: '督查介入后，已成立专项小组推进整改。',
          promiseTime: '',
          operator: item.improvement?.operator || ''
        },
        processNodes: newNodes
      };
    });

    set({ revisitList: newList });
    saveListToStorage(newList);
    console.log('[RevisitStore] applySupervision persisted', { id });
  },

  requestRehandle: (id) => {
    const newList = get().revisitList.map(item => {
      if (item.id !== id) return item;
      const newNodes = finalizeNodesForStage(item.processNodes);
      newNodes.push({
        id: `node-${Date.now()}`,
        title: '群众申请继续跟进',
        description: '群众对整改效果不满意，申请继续跟进处理',
        time: nowStr(),
        status: 'current',
        department: '办事群众',
        nodeType: 'rehandle_start'
      });
      return {
        ...item,
        status: 'rehandling',
        statusText: '再次整改中',
        stage: 'stage_department',
        stageText: '部门整改',
        currentHandler: item.improvement?.operator || '相关负责人',
        currentHandlerDept: item.department,
        nextAction: '等待承办单位二次整改反馈',
        processNodes: newNodes
      };
    });
    set({ revisitList: newList });
    saveListToStorage(newList);
    console.log('[RevisitStore] requestRehandle persisted', { id });
  },

  toggleElderlyMode: () => {
    const willEnable = !get().elderlyMode;
    set(state => ({ elderlyMode: !state.elderlyMode }));
    saveSettingsToStorage(willEnable, get().voiceMode);
    if (get().voiceMode) {
      get().speakText(willEnable ? '已开启大字版模式' : '已关闭大字版模式');
    }
  },

  toggleVoiceMode: () => {
    const willEnable = !get().voiceMode;
    set(state => ({ voiceMode: !state.voiceMode }));
    saveSettingsToStorage(get().elderlyMode, willEnable);
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
    if (!voiceMode && !force) return;
    if (!text || !text.trim()) return;

    const synth = getSpeechSynthesis();
    if (!synth) return;

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
    parts.push(`当前阶段：${item.stageText}`);
    if (item.currentHandler && item.currentHandlerDept) {
      parts.push(`当前处理人：${item.currentHandler}，来自${item.currentHandlerDept}`);
    }
    if (item.nextAction) {
      parts.push(`下一步：${item.nextAction}`);
    }
    if (item.dissatisfactionTags.length > 0) {
      parts.push(`您反馈的问题：${buildTagLabels(item.dissatisfactionTags)}`);
    }
    if (item.improvement) {
      parts.push(`整改说明：${item.improvement.description}`);
      parts.push(`承诺完成时间：${item.improvement.promiseTime}`);
    }
    if (item.status === 'pending') {
      parts.push('操作提示：请点击下方按钮，选择已解决、部分解决或仍未解决。');
    }
    get().speakText(parts.join('。'), true);
  },

  stopSpeaking: () => {
    const synth = getSpeechSynthesis();
    if (synth) synth.cancel();
    set({ isSpeaking: false });
    currentUtterance = null;
  },

  resetAllData: () => {
    const freshData = JSON.parse(JSON.stringify(mockRevisitList));
    set({ revisitList: freshData });
    saveListToStorage(freshData);
    try {
      Taro.removeStorageSync(STORAGE_SETTINGS_KEY);
    } catch (e) {
      console.warn('[RevisitStore] reset settings error:', e);
    }
    set({ elderlyMode: false, voiceMode: false });
    console.log('[RevisitStore] all data reset to mock');
  }
}));
