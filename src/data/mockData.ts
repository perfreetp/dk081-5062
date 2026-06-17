import type { RevisitItem } from '@/types/revisit';

export const mockRevisitList: RevisitItem[] = [
  {
    id: 'RV001',
    title: '不动产登记中心服务质量回访',
    matterName: '不动产权证办理',
    source: 'window',
    sourceText: '大厅窗口',
    department: '市自然资源和规划局',
    windowNo: '3号窗口',
    createTime: '2026-06-10 09:30:00',
    deadline: '2026-06-15 18:00:00',
    status: 'pending',
    statusText: '待确认',
    stage: 'stage_pending',
    stageText: '群众确认',
    currentHandler: '您',
    currentHandlerDept: '办事群众',
    nextAction: '请确认问题是否已解决',
    dissatisfactionTags: [],
    reviewCount: 0,
    supervisionLevel: 0,
    reviewHistory: [],
    processNodes: [
      {
        id: 'node-1',
        title: '回访邀请发起',
        description: '您在3号窗口办理业务后，系统自动发起服务质量回访',
        time: '2026-06-10 09:30:00',
        status: 'done',
        department: '市自然资源和规划局',
        nodeType: 'mass_confirm'
      },
      {
        id: 'node-2',
        title: '等待群众确认',
        description: '请您确认办事过程中的问题是否已得到妥善解决',
        time: '',
        status: 'current',
        department: '办事群众',
        nodeType: 'mass_confirm'
      }
    ]
  },
  {
    id: 'RV002',
    title: '社保转移办理进度回访',
    matterName: '社保关系转移接续',
    source: 'approval',
    sourceText: '审批事项',
    department: '市人力资源和社会保障局',
    createTime: '2026-06-08 14:20:00',
    deadline: '2026-06-13 18:00:00',
    status: 'pending',
    statusText: '待确认',
    stage: 'stage_pending',
    stageText: '群众确认',
    currentHandler: '您',
    currentHandlerDept: '办事群众',
    nextAction: '请确认社保转移是否顺利完成',
    dissatisfactionTags: [],
    reviewCount: 0,
    supervisionLevel: 0,
    reviewHistory: [],
    processNodes: [
      {
        id: 'node-1',
        title: '回访邀请发起',
        description: '社保转移事项办结后，系统自动发起回访',
        time: '2026-06-08 14:20:00',
        status: 'done',
        department: '市人力资源和社会保障局',
        nodeType: 'mass_confirm'
      },
      {
        id: 'node-2',
        title: '等待群众确认',
        description: '请您确认社保转移办理是否顺畅、结果是否满意',
        time: '',
        status: 'current',
        department: '办事群众',
        nodeType: 'mass_confirm'
      }
    ]
  },
  {
    id: 'RV003',
    title: '不动产权证办理超时整改',
    matterName: '不动产权证办理',
    source: 'window',
    sourceText: '大厅窗口',
    department: '市自然资源和规划局',
    windowNo: '5号窗口',
    createTime: '2026-06-05 10:00:00',
    deadline: '2026-06-10 18:00:00',
    status: 'partial',
    statusText: '部分解决',
    stage: 'stage_department',
    stageText: '部门整改',
    currentHandler: '李主任',
    currentHandlerDept: '不动产登记中心',
    nextAction: '等待承办单位完成整改',
    dissatisfactionTags: ['wait_long', 'repeated_materials'],
    supplementText: '去了三趟才把材料交齐，每次都说的不一样。',
    reviewCount: 0,
    supervisionLevel: 0,
    reviewHistory: [],
    improvement: {
      description: '已安排专人对接，梳理材料清单，将在下次办理时一次性告知全部所需材料。已对窗口工作人员进行业务培训。',
      promiseTime: '2026-06-15 18:00:00',
      operator: '李主任'
    },
    processNodes: [
      {
        id: 'node-1',
        title: '群众反馈：部分解决',
        description: '群众反馈等待时间久、材料反复补交，问题部分解决',
        time: '2026-06-06 11:00:00',
        status: 'done',
        department: '办事群众',
        nodeType: 'mass_confirm'
      },
      {
        id: 'node-2',
        title: '部门受理整改',
        description: '不动产登记中心已受理，正在研究整改方案',
        time: '2026-06-07 09:00:00',
        status: 'done',
        department: '市自然资源和规划局',
        operator: '李主任',
        nodeType: 'department_rectify'
      },
      {
        id: 'node-3',
        title: '整改措施落实中',
        description: '已安排专人对接，梳理材料清单，将在下次办理时一次性告知全部所需材料',
        time: '2026-06-08 14:00:00',
        status: 'current',
        department: '不动产登记中心',
        operator: '李主任',
        nodeType: 'department_rectify'
      },
      {
        id: 'node-4',
        title: '整改完成待复核',
        description: '整改完成后将邀请群众复核评价',
        time: '',
        status: 'pending',
        department: '办事群众',
        nodeType: 'review_pending'
      }
    ]
  },
  {
    id: 'RV004',
    title: '户籍迁移服务态度整改',
    matterName: '户籍迁移',
    source: 'hotline',
    sourceText: '服务热线',
    department: '市公安局',
    createTime: '2026-06-06 16:45:00',
    deadline: '2026-06-11 18:00:00',
    status: 'unresolved',
    statusText: '仍未解决',
    stage: 'stage_department',
    stageText: '部门整改',
    currentHandler: '王科长',
    currentHandlerDept: '户政科',
    nextAction: '等待承办单位进一步整改',
    dissatisfactionTags: ['unclear_info', 'bad_attitude'],
    supplementText: '工作人员态度不好，问了几个问题都不耐烦，而且说的流程和实际办的不一样。',
    reviewCount: 0,
    supervisionLevel: 0,
    reviewHistory: [],
    improvement: {
      description: '已对涉事工作人员进行批评教育，将安排服务礼仪培训。如需重新办理，可联系专人绿色通道办理。',
      promiseTime: '2026-06-16 18:00:00',
      operator: '王科长'
    },
    processNodes: [
      {
        id: 'node-1',
        title: '群众反馈：仍未解决',
        description: '群众反馈告知不清、态度生硬，问题仍未解决',
        time: '2026-06-07 10:00:00',
        status: 'done',
        department: '办事群众',
        nodeType: 'mass_confirm'
      },
      {
        id: 'node-2',
        title: '部门受理整改',
        description: '户政科已受理，对涉事人员进行批评教育',
        time: '2026-06-08 09:00:00',
        status: 'done',
        department: '市公安局',
        operator: '王科长',
        nodeType: 'department_rectify'
      },
      {
        id: 'node-3',
        title: '整改措施落实中',
        description: '已对涉事工作人员进行批评教育，将安排服务礼仪培训',
        time: '2026-06-09 14:00:00',
        status: 'current',
        department: '户政科',
        operator: '王科长',
        nodeType: 'department_rectify'
      }
    ]
  },
  {
    id: 'RV005',
    title: '工商营业执照办理回访',
    matterName: '个体工商户注册',
    source: 'window',
    sourceText: '大厅窗口',
    department: '市市场监督管理局',
    windowNo: '8号窗口',
    createTime: '2026-06-01 10:30:00',
    deadline: '2026-06-06 18:00:00',
    status: 'resolved',
    statusText: '已解决',
    stage: 'stage_review',
    stageText: '复核评价',
    currentHandler: '您',
    currentHandlerDept: '办事群众',
    nextAction: '请对整改效果进行复核评价',
    dissatisfactionTags: ['wait_long'],
    reviewCount: 0,
    supervisionLevel: 0,
    reviewHistory: [],
    improvement: {
      description: '已优化叫号系统，增加高峰时段窗口，平均等待时间缩短至15分钟以内。',
      promiseTime: '2026-06-05 18:00:00',
      operator: '张科长'
    },
    processNodes: [
      {
        id: 'node-1',
        title: '群众反馈：已解决',
        description: '群众反馈等待时间久问题已得到解决',
        time: '2026-06-02 15:00:00',
        status: 'done',
        department: '办事群众',
        nodeType: 'mass_confirm'
      },
      {
        id: 'node-2',
        title: '部门整改完成',
        description: '已优化叫号系统，增加高峰时段窗口',
        time: '2026-06-04 10:00:00',
        status: 'done',
        department: '市市场监督管理局',
        operator: '张科长',
        nodeType: 'department_rectify'
      },
      {
        id: 'node-3',
        title: '等待群众复核',
        description: '整改已完成，请群众复核评价整改效果',
        time: '',
        status: 'current',
        department: '办事群众',
        nodeType: 'review_pending'
      }
    ]
  },
  {
    id: 'RV006',
    title: '公积金提取回访',
    matterName: '住房公积金提取',
    source: 'approval',
    sourceText: '审批事项',
    department: '市住房公积金管理中心',
    createTime: '2026-05-20 09:00:00',
    deadline: '2026-05-25 18:00:00',
    status: 'closed_good',
    statusText: '已办结(认可)',
    stage: 'stage_closed',
    stageText: '已办结',
    currentHandler: '—',
    currentHandlerDept: '已办结归档',
    nextAction: '事项已办结，可查看历史记录',
    dissatisfactionTags: ['unclear_info'],
    reviewCount: 1,
    reviewRating: 5,
    reviewIsImproved: true,
    reviewComment: '办理速度很快，工作人员很耐心，非常满意！',
    supervisionLevel: 0,
    reviewHistory: [{ id: 'review-rv006-1', round: 1, rating: 5, isImproved: true, comment: '办理速度快了很多，非常满意！', time: '2026-05-25 10:00:00' }],
    improvement: {
      description: '已制作办理流程图和材料清单，在大厅和官网同步公示。',
      promiseTime: '2026-05-24 18:00:00',
      operator: '陈主任'
    },
    closed: true,
    closedTime: '2026-05-26 10:00:00',
    processNodes: [
      {
        id: 'node-1',
        title: '群众反馈：部分解决',
        description: '群众反馈办理流程告知不清，问题部分解决',
        time: '2026-05-21 11:00:00',
        status: 'done',
        department: '办事群众',
        nodeType: 'mass_confirm'
      },
      {
        id: 'node-2',
        title: '部门整改完成',
        description: '已制作办理流程图和材料清单，在大厅和官网同步公示',
        time: '2026-05-23 14:00:00',
        status: 'done',
        department: '市住房公积金管理中心',
        operator: '陈主任',
        nodeType: 'department_rectify'
      },
      {
        id: 'node-3',
        title: '群众复核评价',
        description: '群众给出5星评价，认可整改效果，问题已真正改善',
        time: '2026-05-25 16:00:00',
        status: 'done',
        department: '办事群众',
        nodeType: 'review_done'
      },
      {
        id: 'node-4',
        title: '办结归档',
        description: '群众认可整改效果，事项办结归档',
        time: '2026-05-26 10:00:00',
        status: 'done',
        department: '市政务服务管理局',
        nodeType: 'closed'
      }
    ]
  },
  {
    id: 'RV007',
    title: '医保报销办理超时督办',
    matterName: '医疗保险报销',
    source: 'hotline',
    sourceText: '服务热线',
    department: '市医疗保障局',
    createTime: '2026-06-03 11:00:00',
    deadline: '2026-06-08 18:00:00',
    status: 'rehandling',
    statusText: '再次整改中',
    stage: 'stage_supervision',
    stageText: '督查督办',
    currentHandler: '督查二组',
    currentHandlerDept: '市督查办',
    nextAction: '督查部门督办中，等待承办单位二次整改反馈',
    dissatisfactionTags: ['wait_long', 'unclear_info'],
    supplementText: '报销等了一个月还没到账，打电话问每次都说在办。',
    reviewCount: 1,
    supervisionApplied: true,
    supervisionLevel: 1,
    reviewHistory: [{ id: 'review-rv007-1', round: 1, rating: 2, isImproved: false, comment: '等了一个月了还没到账，根本没改善。', time: '2026-06-11 14:30:00' }],
    improvement: {
      description: '因系统升级导致处理延迟，已加快处理进度。',
      promiseTime: '2026-06-10 18:00:00',
      operator: '刘局长'
    },
    reimprovement: {
      description: '督查介入后，已成立专项小组，承诺3个工作日内完成全部报销审核并打款。',
      promiseTime: '2026-06-18 18:00:00',
      operator: '刘局长'
    },
    processNodes: [
      {
        id: 'node-1',
        title: '群众反馈：仍未解决',
        description: '群众反馈等待时间久、告知不清，问题仍未解决',
        time: '2026-06-04 15:00:00',
        status: 'done',
        department: '办事群众',
        nodeType: 'mass_confirm'
      },
      {
        id: 'node-2',
        title: '部门受理整改',
        description: '市医保局受理，称因系统升级导致处理延迟',
        time: '2026-06-05 10:00:00',
        status: 'done',
        department: '市医疗保障局',
        operator: '刘局长',
        nodeType: 'department_rectify'
      },
      {
        id: 'node-3',
        title: '首次整改完成',
        description: '已加快处理进度，承诺6月10日前完成',
        time: '2026-06-06 14:00:00',
        status: 'done',
        department: '市医疗保障局',
        operator: '刘局长',
        nodeType: 'department_rectify'
      },
      {
        id: 'node-4',
        title: '群众申请再次督办',
        description: '因整改超时，群众申请上级督办',
        time: '2026-06-12 09:00:00',
        status: 'done',
        department: '办事群众',
        nodeType: 'supervision_apply'
      },
      {
        id: 'node-5',
        title: '督查部门受理',
        description: '市督查办已受理督办申请，介入调查处理',
        time: '2026-06-12 14:00:00',
        status: 'done',
        department: '市督查办',
        operator: '督查二组',
        nodeType: 'supervision_accept'
      },
      {
        id: 'node-6',
        title: '督查督办中',
        description: '督查部门已约谈承办单位，要求限期再次整改',
        time: '2026-06-13 10:00:00',
        status: 'current',
        department: '市督查办',
        operator: '督查二组',
        nodeType: 'supervision_handle'
      },
      {
        id: 'node-7',
        title: '二次整改进行中',
        description: '承办单位成立专项小组推进二次整改',
        time: '',
        status: 'pending',
        department: '市医疗保障局',
        operator: '刘局长',
        nodeType: 'rehandle_start'
      },
      {
        id: 'node-8',
        title: '等待群众复核',
        description: '二次整改完成后将邀请群众再次复核',
        time: '',
        status: 'pending',
        department: '办事群众',
        nodeType: 'review_pending'
      }
    ]
  },
  {
    id: 'RV008',
    title: '税务登记回访',
    matterName: '税务登记证办理',
    source: 'window',
    sourceText: '大厅窗口',
    department: '市税务局',
    windowNo: '12号窗口',
    createTime: '2026-05-15 09:30:00',
    deadline: '2026-05-20 18:00:00',
    status: 'closed_bad',
    statusText: '整改中(未认可)',
    stage: 'stage_department',
    stageText: '部门整改',
    currentHandler: '赵科长',
    currentHandlerDept: '市税务局',
    nextAction: '等待承办单位二次整改，完成后将再次邀请您复核',
    dissatisfactionTags: ['bad_attitude'],
    reviewCount: 1,
    reviewRating: 2,
    reviewIsImproved: false,
    reviewComment: '态度还是那样，没感觉到有改善。',
    supervisionLevel: 0,
    reviewHistory: [{ id: 'review-rv008-1', round: 1, rating: 2, isImproved: false, comment: '态度还是那样，没感觉到有改善。', time: '2026-05-20 11:00:00' }],
    improvement: {
      description: '已对窗口工作人员进行服务培训，要求微笑服务。',
      promiseTime: '2026-05-18 18:00:00',
      operator: '赵科长'
    },
    reimprovement: {
      description: '针对群众反映的态度问题，正在制定针对性整改方案',
      promiseTime: '2026-06-20 18:00:00',
      operator: '赵科长'
    },
    closed: false,
    processNodes: [
      {
        id: 'node-1',
        title: '群众反馈：仍未解决',
        description: '群众反馈工作人员态度生硬',
        time: '2026-05-16 10:00:00',
        status: 'done',
        department: '办事群众',
        nodeType: 'mass_confirm'
      },
      {
        id: 'node-2',
        title: '部门整改完成',
        description: '已对窗口工作人员进行服务培训',
        time: '2026-05-17 16:00:00',
        status: 'done',
        department: '市税务局',
        operator: '赵科长',
        nodeType: 'department_rectify'
      },
      {
        id: 'node-3',
        title: '群众复核评价',
        description: '群众给出2星评价，认为整改后问题尚未真正改善',
        time: '2026-05-20 11:00:00',
        status: 'done',
        department: '办事群众',
        nodeType: 'review_done'
      },
      {
        id: 'node-4',
        title: '二次整改已启动',
        description: '群众对整改效果不满意，启动二次整改程序',
        time: '2026-05-20 11:30:00',
        status: 'current',
        department: '市税务局',
        operator: '赵科长',
        nodeType: 'rehandle_start'
      },
      {
        id: 'node-5',
        title: '二次整改完成后复核',
        description: '二次整改完成后将邀请群众再次复核',
        time: '',
        status: 'pending',
        department: '办事群众',
        nodeType: 'review_pending'
      }
    ]
  }
];

export interface FrequentTip {
  id: string;
  title: string;
  content: string;
  category: string;
  tag: string;
}

export const frequentTips: FrequentTip[] = [
  {
    id: 'tip001',
    title: '办理不动产权证，材料一次性备齐',
    content: '办理不动产权证需准备：身份证、户口本、购房合同、完税证明、房屋平面图共5类材料。建议提前在"政务服务网"下载材料清单，避免反复跑窗口。',
    category: '不动产',
    tag: '材料反复补交'
  },
  {
    id: 'tip002',
    title: '高峰时段办理，建议预约错峰',
    content: '周一上午、周五下午为办事高峰期，平均等待时间约40分钟。建议通过"政务服务"小程序预约办理，预约号优先叫号，可节省约70%等待时间。',
    category: '通用',
    tag: '等待时间久'
  },
  {
    id: 'tip003',
    title: '社保转移接续，先查再办更省心',
    content: '办理社保转移前，可先在"掌上社保"APP查询原参保地缴费记录是否完整。记录有缺失的先联系原参保地补录，避免转移后发现问题来回折腾。',
    category: '社保',
    tag: '告知不清'
  },
  {
    id: 'tip004',
    title: '营业执照变更，网上办最快3个工作日',
    content: '个体工商户营业执照变更可在"政务服务网"全程网办，无需到窗口。上传材料后3个工作日内完成审核，新执照可免费邮寄到家。',
    category: '工商',
    tag: '等待时间久'
  }
];
