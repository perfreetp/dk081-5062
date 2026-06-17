import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useRevisitStore } from '@/store/revisitStore';
import ElderlyToggle from '@/components/ElderlyToggle';
import { DISSATISFACTION_TAGS, STAGE_TEXT_MAP } from '@/types/revisit';
import type { RevisitStage, RevisitStatus } from '@/types/revisit';

const RecordsPage: React.FC = () => {
  const { elderlyMode, voiceMode, getRecordsList, getClosedList, speakText, revisitList, resetAllData } = useRevisitStore();
  const [filter, setFilter] = useState<'all' | RevisitStage | 'closed_good' | 'closed_bad'>('all');

  useDidShow(() => {
    console.log('[RecordsPage] page show');
  });

  const allRecords = useMemo(() => getRecordsList(), [revisitList]);
  const closedList = useMemo(() => getClosedList(), [revisitList]);

  const filteredRecords = useMemo(() => {
    if (filter === 'all') return allRecords;
    if (filter === 'closed_good') return allRecords.filter(r => r.status === 'closed_good');
    if (filter === 'closed_bad') return allRecords.filter(r => r.status === 'closed_bad');
    return allRecords.filter(r => r.stage === filter);
  }, [allRecords, filter]);

  const summary = useMemo(() => ({
    total: allRecords.length,
    closedGood: closedList.filter(r => r.status === 'closed_good').length,
    closedBad: closedList.filter(r => r.status === 'closed_bad').length,
    inProgress: allRecords.filter(r => r.stage !== 'stage_closed').length
  }), [allRecords, closedList]);

  const statusClassMap: Record<RevisitStatus, string> = {
    pending: styles.statusPending,
    resolved: styles.statusResolved,
    partial: styles.statusPartial,
    unresolved: styles.statusUnresolved,
    rehandling: styles.statusRehandling,
    closed_good: styles.statusClosedGood,
    closed_bad: styles.statusClosedBad
  };

  const filters = [
    { key: 'all', label: '全部' },
    { key: 'stage_department', label: '部门整改' },
    { key: 'stage_supervision', label: '督查督办' },
    { key: 'stage_review', label: '复核评价' },
    { key: 'closed_good', label: '已认可办结' },
    { key: 'closed_bad', label: '未认可办结' }
  ] as const;

  const handleCardClick = (id: string, title?: string) => {
    if (voiceMode && title) {
      speakText(`正在查看：${title}`);
    }
    Taro.navigateTo({ url: `/pages/detail/index?id=${id}` });
  };

  const handleFilterClick = (key: typeof filters[number]['key']) => {
    setFilter(key as any);
    if (voiceMode) {
      const labelMap: Record<string, string> = {
        all: '显示全部回访记录',
        stage_department: '显示部门整改中的事项',
        stage_supervision: '显示督查督办中的事项',
        stage_review: '显示等待复核评价的事项',
        closed_good: '显示群众认可办结的事项',
        closed_bad: '显示群众未认可办结的事项'
      };
      speakText(labelMap[key] || '');
    }
  };

  const getTagStyle = (tagValue: string) => {
    const found = DISSATISFACTION_TAGS.find(t => t.value === tagValue);
    return found || { bgColor: '#F5F5F5', textColor: '#424242', label: tagValue };
  };

  const getStageBadgeClass = (stage: RevisitStage): string => {
    const stageClassMap: Record<RevisitStage, string> = {
      stage_pending: styles.stagePending,
      stage_department: styles.stageDepartment,
      stage_supervision: styles.stageSupervision,
      stage_review: styles.stageReview,
      stage_closed: styles.stageClosed
    };
    return stageClassMap[stage] || styles.stagePending;
  };

  return (
    <View className={classnames(styles.page, elderlyMode && 'elderlyMode')}>
      <View className={styles.header}>
        <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <Text className={classnames(styles.pageTitle, 'pageTitle')}>回访记录</Text>
            <Text className={classnames(styles.pageSubtitle, 'smallText')}>
              查看历次回访和处理节点详情
            </Text>
          </View>
          <ElderlyToggle />
        </View>
        <View className={styles.summaryCards}>
          <View className={styles.summaryCard}>
            <Text className={styles.summaryNumber}>{summary.total}</Text>
            <Text className={classnames(styles.summaryLabel, 'smallText')}>总记录</Text>
          </View>
          <View className={styles.summaryCard}>
            <Text className={styles.summaryNumber}>{summary.inProgress}</Text>
            <Text className={classnames(styles.summaryLabel, 'smallText')}>办理中</Text>
          </View>
          <View className={styles.summaryCard}>
            <Text className={styles.summaryNumber}>{summary.closedGood}</Text>
            <Text className={classnames(styles.summaryLabel, 'smallText')}>已认可</Text>
          </View>
        </View>
      </View>

      <ScrollView scrollY className={styles.content}>
        <View className={styles.filterRow}>
          {filters.map(f => (
            <View
              key={f.key}
              className={classnames(
                styles.filterChip,
                filter === f.key && styles.filterChipActive
              )}
              onClick={() => handleFilterClick(f.key)}
            >
              <Text className={classnames(styles.filterChipText, 'smallText')}>{f.label}</Text>
            </View>
          ))}
        </View>

        {filteredRecords.length === 0 ? (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📋</Text>
            <Text className={classnames(styles.emptyTitle, 'cardTitle')}>暂无回访记录</Text>
            <Text className={classnames(styles.emptyDesc, 'smallText')}>
              完成的回访会在此处展示，您可以随时查看历史记录
            </Text>
          </View>
        ) : (
          filteredRecords.map(item => {
            const statusClass = statusClassMap[item.status] || statusClassMap.pending;
            return (
              <View
                key={item.id}
                className={styles.recordCard}
                onClick={() => handleCardClick(item.id, item.title)}
              >
                <View className={styles.cardHeader}>
                  <View className={styles.titleRow}>
                    <Text className={classnames(styles.recordTitle, 'cardTitle')}>{item.title}</Text>
                    <View className={classnames(styles.statusBadge, statusClass)}>
                      <Text className={styles.statusText}>{item.statusText}</Text>
                    </View>
                  </View>
                  <Text className={classnames(styles.recordMatter, 'smallText')}>{item.matterName}</Text>
                  {item.stageText && (
                    <View className={styles.stageRow}>
                      <View className={classnames(styles.stageBadge, getStageBadgeClass(item.stage))}>
                        <Text className={styles.stageBadgeText}>📍 {item.stageText}</Text>
                      </View>
                      {item.currentHandlerDept && (
                        <Text className={styles.handlerText}> · {item.currentHandlerDept}</Text>
                      )}
                    </View>
                  )}
                </View>

                {item.dissatisfactionTags.length > 0 && (
                  <View className={styles.tagList}>
                    {item.dissatisfactionTags.slice(0, 3).map(tag => {
                      const st = getTagStyle(tag);
                      return (
                        <View
                          key={tag}
                          className={styles.tagPill}
                          style={{ background: st.bgColor }}
                        >
                          <Text className={styles.tagPillText} style={{ color: st.textColor }}>
                            {st.label}
                          </Text>
                        </View>
                      );
                    })}
                    {item.dissatisfactionTags.length > 3 && (
                      <View className={styles.tagPill} style={{ background: '#F5F5F5' }}>
                        <Text className={styles.tagPillText} style={{ color: '#757575' }}>
                          +{item.dissatisfactionTags.length - 3}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {(item.improvement || item.reimprovement) && (
                  <View className={styles.improvementSection}>
                    <Text className={classnames(styles.improvementTitle, 'normalText')}>
                      {item.reimprovement ? '二次整改方案' : '改善结论'}
                    </Text>
                    <Text className={classnames(styles.improvementDesc, 'smallText')}>
                      {(item.reimprovement || item.improvement)?.description}
                    </Text>
                  </View>
                )}

                {item.reviewIsImproved !== undefined && item.stage === 'stage_closed' && (
                  <View className={styles.conclusionRow}>
                    <Text className={classnames(
                      styles.conclusionText,
                      item.reviewIsImproved ? styles.conclusionGood : styles.conclusionBad,
                      'smallText'
                    )}>
                      {item.reviewIsImproved ? '✓ 群众认可改善' : '✕ 尚未真正改善'}
                    </Text>
                  </View>
                )}

                <View className={styles.cardFooter}>
                  <Text className={classnames(styles.metaItem, 'smallText')}>{item.department}</Text>
                  <Text className={classnames(styles.metaItem, 'smallText')}>{item.createTime}</Text>
                </View>
              </View>
            );
          })
        )}

        <View className={styles.debugSection}>
          <View
            className={styles.resetBtn}
            onClick={() => {
              Taro.showModal({
                title: '重置演示数据',
                content: '确认将所有数据重置为初始状态？此操作不可恢复。',
                confirmText: '确认重置',
                confirmColor: '#E5484D',
                success: (res) => {
                  if (res.confirm) {
                    resetAllData();
                    Taro.showToast({ title: '数据已重置', icon: 'success' });
                  }
                }
              });
            }}
          >
            <Text className={styles.resetBtnText}>🔄 重置演示数据</Text>
          </View>
          <Text className={classnames(styles.debugHint, 'smallText')}>
            （用于重新测试，正式发布可移除此入口）
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default RecordsPage;
