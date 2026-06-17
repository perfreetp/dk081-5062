import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useRevisitStore } from '@/store/revisitStore';
import ElderlyToggle from '@/components/ElderlyToggle';
import { DISSATISFACTION_TAGS } from '@/types/revisit';
import type { RevisitStage, RevisitStatus, RevisitItem } from '@/types/revisit';

type TabType = 'inProgress' | 'closed';
type StageFilterType = 'all' | 'stage_department' | 'stage_supervision' | 'stage_review';

const RecordsPage: React.FC = () => {
  const { elderlyMode, voiceMode, getRecordsList, getClosedList, speakText, revisitList, resetAllData } = useRevisitStore();
  const [activeTab, setActiveTab] = useState<TabType>('inProgress');
  const [stageFilter, setStageFilter] = useState<StageFilterType>('all');

  useDidShow(() => {
    console.log('[RecordsPage] page show');
  });

  const inProgressList = useMemo(() => {
    return getRecordsList().filter(r => r.status !== 'closed_good');
  }, [revisitList]);

  const closedList = useMemo(() => {
    return getClosedList().sort((a, b) => {
      if (!a.closedTime) return 1;
      if (!b.closedTime) return -1;
      return new Date(b.closedTime.replace(/-/g, '/')).getTime() - new Date(a.closedTime.replace(/-/g, '/')).getTime();
    });
  }, [revisitList]);

  const filteredInProgressList = useMemo(() => {
    if (stageFilter === 'all') return inProgressList;
    return inProgressList.filter(r => r.stage === stageFilter);
  }, [inProgressList, stageFilter]);

  const displayList = useMemo(() => {
    return activeTab === 'inProgress' ? filteredInProgressList : closedList;
  }, [activeTab, filteredInProgressList, closedList]);

  const summary = useMemo(() => ({
    inProgress: inProgressList.length,
    closed: closedList.length
  }), [inProgressList, closedList]);

  const statusClassMap: Record<RevisitStatus, string> = {
    pending: styles.statusPending,
    resolved: styles.statusResolved,
    partial: styles.statusPartial,
    unresolved: styles.statusUnresolved,
    rehandling: styles.statusRehandling,
    closed_good: styles.statusClosedGood,
    closed_bad: styles.statusClosedBad
  };

  const tabOptions = [
    { key: 'inProgress' as TabType, label: '办理中', count: summary.inProgress },
    { key: 'closed' as TabType, label: '已办结', count: summary.closed }
  ];

  const stageFilters = [
    { key: 'all' as StageFilterType, label: '全部' },
    { key: 'stage_department' as StageFilterType, label: '部门整改' },
    { key: 'stage_supervision' as StageFilterType, label: '督查督办' },
    { key: 'stage_review' as StageFilterType, label: '复核评价' }
  ];

  const handleTabClick = (tab: TabType) => {
    setActiveTab(tab);
    if (voiceMode) {
      const text = tab === 'inProgress' 
        ? `切换到办理中，共${summary.inProgress}件` 
        : `切换到已办结，共${summary.closed}件`;
      speakText(text);
    }
  };

  const handleStageFilterClick = (filter: StageFilterType) => {
    setStageFilter(filter);
    if (voiceMode) {
      const labelMap: Record<StageFilterType, string> = {
        all: '显示办理中全部事项',
        stage_department: '显示部门整改中的事项',
        stage_supervision: '显示督查督办中的事项',
        stage_review: '显示等待复核评价的事项'
      };
      speakText(labelMap[filter]);
    }
  };

  const handleCardClick = (item: RevisitItem) => {
    if (voiceMode && item.title) {
      const parts = [item.title, item.statusText];
      if (item.closedTime) {
        parts.push(`办结时间${item.closedTime}`);
      }
      speakText(`正在查看：${parts.join('，')}`);
    }
    Taro.navigateTo({ url: `/pages/detail/index?id=${item.id}` });
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

  const getLatestReview = (item: RevisitItem) => {
    if (!item.reviewHistory || item.reviewHistory.length === 0) return null;
    return item.reviewHistory[item.reviewHistory.length - 1];
  };

  const getRatingText = (rating: number) => {
    const texts = ['', '非常不满意', '不满意', '一般', '满意', '非常满意'];
    return texts[rating] || '';
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
          <View 
            className={classnames(styles.summaryCard, activeTab === 'inProgress' && styles.summaryCardActive)}
            onClick={() => handleTabClick('inProgress')}
          >
            <Text className={styles.summaryNumber}>{summary.inProgress}</Text>
            <Text className={classnames(styles.summaryLabel, 'smallText')}>办理中</Text>
          </View>
          <View 
            className={classnames(styles.summaryCard, activeTab === 'closed' && styles.summaryCardActive)}
            onClick={() => handleTabClick('closed')}
          >
            <Text className={styles.summaryNumber}>{summary.closed}</Text>
            <Text className={classnames(styles.summaryLabel, 'smallText')}>已办结</Text>
          </View>
        </View>

        <View className={styles.tabRow}>
          {tabOptions.map(tab => (
            <View
              key={tab.key}
              className={classnames(
                styles.tabItem,
                activeTab === tab.key && styles.tabItemActive
              )}
              onClick={() => handleTabClick(tab.key)}
            >
              <Text className={classnames(styles.tabText, activeTab === tab.key && styles.tabTextActive)}>
                {tab.label}
              </Text>
              <View className={classnames(
                styles.tabBadge,
                activeTab === tab.key ? styles.tabBadgeActive : styles.tabBadgeDefault
              )}>
                <Text className={classnames(
                  styles.tabBadgeText,
                  activeTab === tab.key ? styles.tabBadgeTextActive : styles.tabBadgeTextDefault
                )}>
                  {tab.count}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <ScrollView scrollY className={styles.content}>
        {activeTab === 'inProgress' && (
          <View className={styles.filterRow}>
            {stageFilters.map(f => (
              <View
                key={f.key}
                className={classnames(
                  styles.filterChip,
                  stageFilter === f.key && styles.filterChipActive
                )}
                onClick={() => handleStageFilterClick(f.key)}
              >
                <Text className={classnames(styles.filterChipText, 'smallText')}>{f.label}</Text>
              </View>
            ))}
          </View>
        )}

        {displayList.length === 0 ? (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📋</Text>
            <Text className={classnames(styles.emptyTitle, 'cardTitle')}>
              {activeTab === 'inProgress' ? '暂无办理中记录' : '暂无已办结记录'}
            </Text>
            <Text className={classnames(styles.emptyDesc, 'smallText')}>
              {activeTab === 'inProgress' 
                ? '正在办理的事项会在此处展示' 
                : '群众认可办结的事项会在此处归档展示'}
            </Text>
          </View>
        ) : (
          displayList.map(item => {
            const statusClass = statusClassMap[item.status] || statusClassMap.pending;
            const latestReview = getLatestReview(item);
            const isClosedGood = item.status === 'closed_good';

            return (
              <View
                key={item.id}
                className={styles.recordCard}
                onClick={() => handleCardClick(item)}
              >
                <View className={styles.cardHeader}>
                  <View className={styles.titleRow}>
                    <Text className={classnames(styles.recordTitle, 'cardTitle')}>{item.title}</Text>
                    <View className={classnames(styles.statusBadge, statusClass)}>
                      <Text className={styles.statusText}>{item.statusText}</Text>
                    </View>
                  </View>
                  <Text className={classnames(styles.recordMatter, 'smallText')}>{item.matterName}</Text>
                  
                  {isClosedGood ? (
                    <View className={styles.closedBadgeRow}>
                      <View className={styles.closedApprovedBadge}>
                        <Text className={styles.closedApprovedText}>✓ 已办结·群众认可</Text>
                      </View>
                      {item.closedTime && (
                        <Text className={classnames(styles.closedTime, 'smallText')}>
                          办结时间：{item.closedTime}
                        </Text>
                      )}
                    </View>
                  ) : (
                    item.stageText && (
                      <View className={styles.stageRow}>
                        <View className={classnames(styles.stageBadge, getStageBadgeClass(item.stage))}>
                          <Text className={styles.stageBadgeText}>📍 {item.stageText}</Text>
                        </View>
                        {item.currentHandlerDept && (
                          <Text className={styles.handlerText}> · {item.currentHandlerDept}</Text>
                        )}
                      </View>
                    )
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

                {latestReview && (
                  <View className={styles.reviewSection}>
                    <Text className={classnames(styles.reviewTitle, 'normalText')}>
                      最近评价（第{latestReview.round}次）
                    </Text>
                    <View className={styles.reviewContent}>
                      <Text className={classnames(styles.reviewRating, 'smallText')}>
                        {'⭐'.repeat(latestReview.rating)} {getRatingText(latestReview.rating)}
                      </Text>
                      <Text className={classnames(
                        styles.reviewConclusion,
                        latestReview.isImproved ? styles.reviewGood : styles.reviewBad,
                        'smallText'
                      )}>
                        {latestReview.isImproved ? '✓ 认可改善' : '✕ 尚未改善'}
                      </Text>
                    </View>
                    {latestReview.comment && (
                      <Text className={classnames(styles.reviewComment, 'smallText')}>
                        "{latestReview.comment}"
                      </Text>
                    )}
                    <Text className={classnames(styles.reviewTime, 'smallText')}>
                      {latestReview.time}
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
