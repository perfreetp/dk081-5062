import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useRevisitStore } from '@/store/revisitStore';
import ElderlyToggle from '@/components/ElderlyToggle';
import RatingStars from '@/components/RatingStars';
import { DISSATISFACTION_TAGS } from '@/types/revisit';
import type { RevisitStatus } from '@/types/revisit';

const RecordsPage: React.FC = () => {
  const { elderlyMode, voiceMode, getRecordsList, speakText, revisitList, resetAllData } = useRevisitStore();
  const [filter, setFilter] = useState<'all' | RevisitStatus>('all');

  useDidShow(() => {
    console.log('[RecordsPage] page show');
  });

  const allRecords = useMemo(() => getRecordsList(), [revisitList]);

  const filteredRecords = useMemo(() => {
    if (filter === 'all') return allRecords;
    return allRecords.filter(r => r.status === filter);
  }, [allRecords, filter]);

  const summary = useMemo(() => ({
    total: allRecords.length,
    resolved: allRecords.filter(r => r.status === 'resolved').length,
    reviewed: allRecords.filter(r => r.reviewRating).length
  }), [allRecords]);

  const statusConfig: Record<string, { className: string; textClass: string }> = {
    pending: { className: styles.statusPending, textClass: styles.statusTextPending },
    resolved: { className: styles.statusResolved, textClass: styles.statusTextResolved },
    partial: { className: styles.statusPartial, textClass: styles.statusTextPartial },
    unresolved: { className: styles.statusUnresolved, textClass: styles.statusTextUnresolved }
  };

  const statusTextMap: Record<string, string> = {
    pending: '待确认',
    resolved: '已解决',
    partial: '部分解决',
    unresolved: '仍未解决'
  };

  const filters = [
    { key: 'all', label: '全部' },
    { key: 'resolved', label: '已解决' },
    { key: 'partial', label: '部分解决' },
    { key: 'unresolved', label: '仍未解决' }
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
        resolved: '显示已解决的事项',
        partial: '显示部分解决的事项',
        unresolved: '显示仍未解决的事项'
      };
      speakText(labelMap[key]);
    }
  };

  const getTagStyle = (tagValue: string) => {
    const found = DISSATISFACTION_TAGS.find(t => t.value === tagValue);
    return found || { bgColor: '#F5F5F5', textColor: '#424242', label: tagValue };
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
            <Text className={classnames(styles.summaryLabel, 'smallText')}>总回访</Text>
          </View>
          <View className={styles.summaryCard}>
            <Text className={styles.summaryNumber}>{summary.resolved}</Text>
            <Text className={classnames(styles.summaryLabel, 'smallText')}>已解决</Text>
          </View>
          <View className={styles.summaryCard}>
            <Text className={styles.summaryNumber}>{summary.reviewed}</Text>
            <Text className={classnames(styles.summaryLabel, 'smallText')}>已评价</Text>
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
            const cfg = statusConfig[item.status] || statusConfig.pending;
            return (
              <View
                key={item.id}
                className={styles.recordCard}
                onClick={() => handleCardClick(item.id, item.title)}
              >
                <View className={styles.recordHeader}>
                  <Text className={classnames(styles.recordTitle, 'cardTitle')}>{item.title}</Text>
                  <View className={classnames(styles.statusBadge, cfg.className)}>
                    <Text className={classnames(styles.statusText, cfg.textClass, 'smallText')}>
                      {statusTextMap[item.status]}
                    </Text>
                  </View>
                </View>
                <Text className={classnames(styles.recordMatter, 'smallText')}>{item.matterName}</Text>

                {item.dissatisfactionTags.length > 0 && (
                  <View className={styles.tagList}>
                    {item.dissatisfactionTags.slice(0, 4).map(tag => {
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
                    {item.dissatisfactionTags.length > 4 && (
                      <View className={styles.tagPill} style={{ background: '#F5F5F5' }}>
                        <Text className={styles.tagPillText} style={{ color: '#757575' }}>
                          +{item.dissatisfactionTags.length - 4}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {item.reviewRating && (
                  <View className={styles.recordRating}>
                    <RatingStars value={item.reviewRating} readonly size="sm" showText={false} />
                    {item.reviewIsImproved !== undefined && (
                      <Text className={classnames(
                        styles.reviewConclusion,
                        item.reviewIsImproved ? styles.conclusionGood : styles.conclusionBad,
                        'smallText'
                      )}>
                        {item.reviewIsImproved ? '✓ 群众认可改善' : '✕ 尚未真正改善'}
                      </Text>
                    )}
                  </View>
                )}

                <View className={styles.recordMeta}>
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
