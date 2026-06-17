export type RevisitStatus =
  | 'pending'
  | 'resolved'
  | 'partial'
  | 'unresolved'
  | 'rehandling'
  | 'closed_good'
  | 'closed_bad';

export type RevisitStage =
  | 'stage_pending'
  | 'stage_department'
  | 'stage_supervision'
  | 'stage_review'
  | 'stage_closed';

export type RevisitSource = 'window' | 'approval' | 'hotline';

export type DissatisfactionTag =
  | 'wait_long'
  | 'unclear_info'
  | 'repeated_materials'
  | 'bad_attitude'
  | 'other';

export interface ReviewRecord {
  id: string;
  round: number;
  rating: number;
  isImproved: boolean;
  comment?: string;
  time: string;
}

export interface ProcessNode {
  id: string;
  title: string;
  description: string;
  time: string;
  status: 'done' | 'current' | 'pending';
  department?: string;
  operator?: string;
  nodeType?:
    | 'mass_confirm'
    | 'department_rectify'
    | 'supervision_apply'
    | 'supervision_accept'
    | 'supervision_handle'
    | 'rehandle_start'
    | 'rehandle_feedback'
    | 'rehandle_done'
    | 'review_pending'
    | 'review_done'
    | 'closed';
}

export interface RevisitItem {
  id: string;
  title: string;
  matterName: string;
  source: RevisitSource;
  sourceText: string;
  department: string;
  windowNo?: string;
  createTime: string;
  deadline: string;
  status: RevisitStatus;
  statusText: string;
  stage: RevisitStage;
  stageText: string;
  currentHandler?: string;
  currentHandlerDept?: string;
  nextAction?: string;
  dissatisfactionTags: DissatisfactionTag[];
  supplementText?: string;
  supplementImages?: string[];
  contactTime?: string;
  isForElderly?: boolean;
  delegateName?: string;
  improvement?: {
    description: string;
    promiseTime: string;
    operator: string;
  };
  reimprovement?: {
    description: string;
    promiseTime: string;
    operator: string;
    feedbackTime?: string;
  };
  reviewCount: number;
  reviewRating?: number;
  reviewComment?: string;
  reviewIsImproved?: boolean;
  reviewHistory: ReviewRecord[];
  supervisionApplied?: boolean;
  supervisionLevel?: 0 | 1 | 2;
  closed?: boolean;
  closedTime?: string;
  processNodes: ProcessNode[];
}

export interface DissatisfactionTagOption {
  value: DissatisfactionTag;
  label: string;
  bgColor: string;
  textColor: string;
}

export const DISSATISFACTION_TAGS: DissatisfactionTagOption[] = [
  { value: 'wait_long', label: '等待时间久', bgColor: '#FFF3E0', textColor: '#E65100' },
  { value: 'unclear_info', label: '告知不清', bgColor: '#E3F2FD', textColor: '#0D47A1' },
  { value: 'repeated_materials', label: '材料反复补交', bgColor: '#FCE4EC', textColor: '#B71C1C' },
  { value: 'bad_attitude', label: '态度生硬', bgColor: '#F3E5F5', textColor: '#6A1B9A' },
  { value: 'other', label: '其他问题', bgColor: '#F5F5F5', textColor: '#424242' }
];

export const SOURCE_TEXT_MAP: Record<RevisitSource, string> = {
  window: '大厅窗口',
  approval: '审批事项',
  hotline: '服务热线'
};

export const STATUS_TEXT_MAP: Record<RevisitStatus, string> = {
  pending: '待确认',
  resolved: '已解决',
  partial: '部分解决',
  unresolved: '仍未解决',
  rehandling: '二次整改中',
  closed_good: '已办结(认可)',
  closed_bad: '整改中(未认可)'
};

export const STAGE_TEXT_MAP: Record<RevisitStage, string> = {
  stage_pending: '群众确认',
  stage_department: '部门整改',
  stage_supervision: '督查督办',
  stage_review: '复核评价',
  stage_closed: '已办结'
};

export const STAGE_FLOW: { key: RevisitStage; label: string; icon: string }[] = [
  { key: 'stage_pending', label: '群众反馈', icon: '👤' },
  { key: 'stage_department', label: '部门整改', icon: '🏢' },
  { key: 'stage_supervision', label: '督查督办', icon: '🔍' },
  { key: 'stage_review', label: '复核评价', icon: '⭐' },
  { key: 'stage_closed', label: '办结归档', icon: '✅' }
];
