import type { RevisitItem } from '@/types/revisit';

export const mockRevisitList: RevisitItem[] = [
  {
    id: 'RV001',
    title: '营业执照办理回访',
    matterName: '个体工商户设立登记',
    source: 'window',
    sourceText: '大厅窗口',
    department: '市场监督管理局',
    windowNo: 'A-03',
    createTime: '2026-06-15 09:30:00',
    deadline: '2026-06-18 18:00:00',
    status: 'pending',
    statusText: '待确认',
    dissatisfactionTags: [],
    processNodes: [
      { id: 'n1', title: '事项受理', description: '窗口已受理您的申请', time: '2026-06-15 09:30:00', status: 'done' },
      { id: 'n2', title: '发起回访', description: '系统自动发起回访邀请', time: '2026-06-15 16:00:00', status: 'current' },
      { id: 'n3', title: '群众确认', description: '等待您的反馈', time: '', status: 'pending' }
    ]
  },
  {
    id: 'RV002',
    title: '社保缴费咨询回访',
    matterName: '社会保险缴费查询',
    source: 'hotline',
    sourceText: '服务热线',
    department: '人力资源和社会保障局',
    createTime: '2026-06-14 14:20:00',
    deadline: '2026-06-17 18:00:00',
    status: 'pending',
    statusText: '待确认',
    dissatisfactionTags: [],
    processNodes: [
      { id: 'n1', title: '热线接听', description: '12345热线已记录您的咨询', time: '2026-06-14 14:20:00', status: 'done' },
      { id: 'n2', title: '发起回访', description: '系统自动发起回访邀请', time: '2026-06-15 10:00:00', status: 'current' },
      { id: 'n3', title: '群众确认', description: '等待您的反馈', time: '', status: 'pending' }
    ]
  },
  {
    id: 'RV003',
    title: '不动产权证办理回访',
    matterName: '国有建设用地使用权及房屋所有权首次登记',
    source: 'approval',
    sourceText: '审批事项',
    department: '自然资源和规划局',
    createTime: '2026-06-10 10:00:00',
    deadline: '2026-06-13 18:00:00',
    status: 'partial',
    statusText: '部分解决',
    dissatisfactionTags: ['wait_long', 'repeated_materials'],
    supplementText: '前后跑了三趟，每次都说材料不齐，希望能一次性告知清楚。',
    isOvertime: true,
    improvement: {
      description: '已安排专人对接，梳理材料清单，将在下次办理时一次性告知全部所需材料。已对窗口工作人员进行业务培训。',
      promiseTime: '2026-06-20 18:00:00',
      operator: '李主任'
    },
    processNodes: [
      { id: 'n1', title: '事项受理', description: '窗口已受理您的申请', time: '2026-06-10 10:00:00', status: 'done' },
      { id: 'n2', title: '群众反馈', description: '等待时间久、材料反复补交', time: '2026-06-12 15:30:00', status: 'done' },
      { id: 'n3', title: '部门整改中', description: '已制定整改方案，正在落实', time: '2026-06-14 09:00:00', status: 'current' },
      { id: 'n4', title: '整改完成', description: '等待整改完成并反馈', time: '', status: 'pending' }
    ]
  },
  {
    id: 'RV004',
    title: '户籍迁移办理回访',
    matterName: '市内户口迁移',
    source: 'window',
    sourceText: '大厅窗口',
    department: '公安局',
    windowNo: 'B-01',
    createTime: '2026-06-08 11:00:00',
    deadline: '2026-06-11 18:00:00',
    status: 'unresolved',
    statusText: '仍未解决',
    dissatisfactionTags: ['unclear_info', 'bad_attitude'],
    supplementText: '工作人员态度不好，问了几个问题都不耐烦，而且说的流程和实际办的不一样。',
    isOvertime: true,
    improvement: {
      description: '已对涉事工作人员进行批评教育，将安排服务礼仪培训。如需重新办理，可联系专人绿色通道办理。',
      promiseTime: '2026-06-19 18:00:00',
      operator: '王科长'
    },
    processNodes: [
      { id: 'n1', title: '事项受理', description: '窗口已受理您的申请', time: '2026-06-08 11:00:00', status: 'done' },
      { id: 'n2', title: '群众反馈', description: '告知不清、态度生硬', time: '2026-06-09 16:00:00', status: 'done' },
      { id: 'n3', title: '部门整改', description: '整改措施已制定，正在跟进', time: '2026-06-11 10:00:00', status: 'current' },
      { id: 'n4', title: '整改完成', description: '等待整改完成并反馈', time: '', status: 'pending' }
    ]
  },
  {
    id: 'RV005',
    title: '医疗费用报销回访',
    matterName: '基本医疗保险参保人员医疗费用手工（零星）报销',
    source: 'approval',
    sourceText: '审批事项',
    department: '医疗保障局',
    createTime: '2026-06-05 09:00:00',
    deadline: '2026-06-08 18:00:00',
    status: 'resolved',
    statusText: '已解决',
    dissatisfactionTags: ['wait_long'],
    improvement: {
      description: '已优化报销流程，增加审核人员，缩短办理时限。承诺3个工作日内完成审核。',
      promiseTime: '2026-06-10 18:00:00',
      operator: '张主任'
    },
    processNodes: [
      { id: 'n1', title: '事项受理', description: '窗口已受理您的报销申请', time: '2026-06-05 09:00:00', status: 'done' },
      { id: 'n2', title: '群众反馈', description: '等待时间久', time: '2026-06-07 14:00:00', status: 'done' },
      { id: 'n3', title: '部门整改', description: '优化流程、增派人员', time: '2026-06-08 10:00:00', status: 'done' },
      { id: 'n4', title: '报销到账', description: '报销款项已拨付至您的账户', time: '2026-06-09 16:30:00', status: 'done' }
    ]
  },
  {
    id: 'RV006',
    title: '公积金提取回访',
    matterName: '购买自住住房提取住房公积金',
    source: 'window',
    sourceText: '大厅窗口',
    department: '住房公积金管理中心',
    windowNo: 'C-05',
    createTime: '2026-06-03 14:30:00',
    deadline: '2026-06-06 18:00:00',
    status: 'resolved',
    statusText: '已解决',
    dissatisfactionTags: [],
    reviewRating: 5,
    reviewComment: '办理速度很快，工作人员很耐心，非常满意！',
    processNodes: [
      { id: 'n1', title: '事项受理', description: '窗口已受理您的提取申请', time: '2026-06-03 14:30:00', status: 'done' },
      { id: 'n2', title: '审核通过', description: '提取审核已通过', time: '2026-06-04 10:00:00', status: 'done' },
      { id: 'n3', title: '款项到账', description: '公积金已拨付至您的账户', time: '2026-06-04 16:00:00', status: 'done' },
      { id: 'n4', title: '群众评价', description: '您给出了5星好评', time: '2026-06-05 09:00:00', status: 'done' }
    ]
  },
  {
    id: 'RV007',
    title: '道路运输许可证回访',
    matterName: '道路普通货物运输经营许可',
    source: 'approval',
    sourceText: '审批事项',
    department: '交通运输局',
    createTime: '2026-06-01 10:30:00',
    deadline: '2026-06-04 18:00:00',
    status: 'resolved',
    statusText: '已解决',
    dissatisfactionTags: ['unclear_info'],
    improvement: {
      description: '已在官网更新办事指南，增加流程图解，并提供在线咨询服务。',
      promiseTime: '2026-06-05 18:00:00',
      operator: '赵局长'
    },
    processNodes: [
      { id: 'n1', title: '事项受理', description: '窗口已受理您的许可申请', time: '2026-06-01 10:30:00', status: 'done' },
      { id: 'n2', title: '群众反馈', description: '告知不清', time: '2026-06-02 15:00:00', status: 'done' },
      { id: 'n3', title: '部门整改', description: '更新办事指南、增加图解', time: '2026-06-03 09:00:00', status: 'done' },
      { id: 'n4', title: '许可通过', description: '道路运输许可证已核发', time: '2026-06-04 11:00:00', status: 'done' }
    ]
  },
  {
    id: 'RV008',
    title: '老年人优待证办理回访',
    matterName: '老年人优待证核发',
    source: 'window',
    sourceText: '大厅窗口',
    department: '卫生健康委员会',
    windowNo: 'A-01',
    createTime: '2026-06-12 08:45:00',
    deadline: '2026-06-15 18:00:00',
    status: 'pending',
    statusText: '待确认',
    dissatisfactionTags: [],
    isForElderly: true,
    processNodes: [
      { id: 'n1', title: '事项受理', description: '窗口已受理您的优待证申请', time: '2026-06-12 08:45:00', status: 'done' },
      { id: 'n2', title: '发起回访', description: '系统自动发起回访邀请（适老化模式）', time: '2026-06-13 10:00:00', status: 'current' },
      { id: 'n3', title: '群众确认', description: '等待您的反馈', time: '', status: 'pending' }
    ]
  }
];

export const frequentTips = [
  {
    id: 'tip1',
    title: '办理营业执照须知',
    content: '建议提前在"政务服务网"在线填写申请表，准备好身份证、经营场所证明等材料，可减少窗口等待时间。'
  },
  {
    id: 'tip2',
    title: '社保缴费温馨提示',
    content: '社保缴费可通过"掌上12333"APP线上办理，无需跑大厅。如遇问题可拨打12333热线咨询。'
  },
  {
    id: 'tip3',
    title: '不动产登记材料清单',
    content: '办理不动产权证需准备：身份证、户口本、购房合同、发票、完税证明等，建议先电话咨询确认。'
  },
  {
    id: 'tip4',
    title: '公积金提取小贴士',
    content: '购房、租房、退休等多种情形可提取公积金，具体条件和材料可在公积金中心官网查询。'
  }
];
