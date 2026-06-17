import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useRevisitStore } from '@/store/revisitStore';
import ElderlyToggle from '@/components/ElderlyToggle';
import RatingStars from '@/components/RatingStars';
import type { RevisitStatus } from '@/types/revisit';

const RecordsPage: React.FC = () => {
  const { elderlyMode, getRecordsList, revisitList } = useRevisitStore();
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

  const handleCardClick = (id: string) => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${id}` });
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
              onClick={() => setFilter(f.key as any)}
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
                onClick={() => handleCardClick(item.id)}
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
                {item.reviewRating && (
                  <View className={styles.recordRating}>
                    <Text className={classnames(styles.ratingLabel, 'smallText')}>您的评价：</Text>
                    <RatingStars value={item.reviewRating} readonly size="sm" showText={false} />
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
      </ScrollView>
    </View>
  );
};

export default RecordsPage;
