export type RevisitStatus = 'pending' | 'resolved' | 'partial' | 'unresolved';

export type RevisitSource = 'window' | 'approval' | 'hotline';

export type DissatisfactionTag =
  | 'wait_long'
  | 'unclear_info'
  | 'repeated_materials'
  | 'bad_attitude'
  | 'other';

export interface ProcessNode {
  id: string;
  title: string;
  description: string;
  time: string;
  status: 'done' | 'current' | 'pending';
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
  isOvertime?: boolean;
  reviewRating?: number;
  reviewComment?: string;
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
  unresolved: '仍未解决'
};
