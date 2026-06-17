import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useRevisitStore } from '@/store/revisitStore';
import StatusCard from '@/components/StatusCard';
import ElderlyToggle from '@/components/ElderlyToggle';
import TagSelector from '@/components/TagSelector';
import { frequentTips } from '@/data/mockData';
import type { RevisitStatus, DissatisfactionTag } from '@/types/revisit';

const PendingPage: React.FC = () => {
  const { elderlyMode, getPendingList, updateStatus, revisitList } = useRevisitStore();
  const [selectedTagsMap, setSelectedTagsMap] = useState<Record<string, DissatisfactionTag[]>>({});

  useDidShow(() => {
    console.log('[PendingPage] page show, pending count:', getPendingList().length);
  });

  const pendingList = useMemo(() => getPendingList(), [revisitList]);

  const stats = useMemo(() => ({
    pending: pendingList.length,
    inProgress: revisitList.filter(i => i.status === 'partial' || i.status === 'unresolved').length,
    resolved: revisitList.filter(i => i.status === 'resolved').length
  }), [revisitList, pendingList]);

  const handleStatusSelect = (id: string, status: RevisitStatus) => {
    const selectedTags = selectedTagsMap[id] || [];
    const tagsToSubmit = status !== 'resolved' ? selectedTags : undefined;
    updateStatus(id, status, tagsToSubmit);
    Taro.showToast({
      title: '反馈已提交',
      icon: 'success'
    });
    console.log('[PendingPage] status selected', { id, status, tags: tagsToSubmit });
  };

  const handleToggleTag = (id: string, tag: DissatisfactionTag) => {
    setSelectedTagsMap(prev => {
      const current = prev[id] || [];
      const next = current.includes(tag)
        ? current.filter(t => t !== tag)
        : [...current, tag];
      return { ...prev, [id]: next };
    });
  };

  const handleSupplement = (id: string) => {
    Taro.navigateTo({ url: `/pages/supplement/index?id=${id}` });
  };

  return (
    <View className={classnames(styles.page, elderlyMode && 'elderlyMode')}>
      <View className={styles.header}>
        <View className={styles.headerTop}>
          <View className={styles.headerContent}>
            <Text className={classnames(styles.pageTitle, 'pageTitle')}>您好</Text>
            <Text className={classnames(styles.pageSubtitle, 'smallText')}>
              您有 {pendingList.length} 项回访待确认，您的反馈将帮助我们改进服务
            </Text>
          </View>
          <ElderlyToggle />
        </View>
        <View className={styles.statsRow}>
          <View className={styles.statCard}>
            <Text className={styles.statNumber}>{stats.pending}</Text>
            <Text className={classnames(styles.statLabel, 'smallText')}>待确认</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statNumber}>{stats.inProgress}</Text>
            <Text className={classnames(styles.statLabel, 'smallText')}>处理中</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statNumber}>{stats.resolved}</Text>
            <Text className={classnames(styles.statLabel, 'smallText')}>已解决</Text>
          </View>
        </View>
      </View>

      <ScrollView scrollY className={styles.content}>
        <Text className={classnames(styles.sectionTitle, 'cardTitle')}>待确认回访</Text>

        {pendingList.length === 0 ? (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>🎉</Text>
            <Text className={classnames(styles.emptyTitle, 'cardTitle')}>暂无待确认事项</Text>
            <Text className={classnames(styles.emptyDesc, 'smallText')}>
              您所有的回访都已处理完成，感谢您的参与！
            </Text>
          </View>
        ) : (
          pendingList.map(item => (
            <View key={item.id}>
              <StatusCard
                item={item}
                showActions
                onStatusSelect={handleStatusSelect}
                onSupplement={handleSupplement}
              />
              {(item.status === 'partial' || item.status === 'unresolved') && (
                <View style={{ padding: '0 0 24rpx' }}>
                  <TagSelector
                    selectedTags={selectedTagsMap[item.id] || []}
                    onToggle={(tag) => handleToggleTag(item.id, tag)}
                  />
                </View>
              )}
            </View>
          ))
        )}

        <View className={styles.tipsSection}>
          <Text className={classnames(styles.sectionTitle, 'cardTitle')}>办事温馨提示</Text>
          {frequentTips.slice(0, 2).map(tip => (
            <View key={tip.id} className={styles.tipsCard}>
              <Text className={classnames(styles.tipsTitle, 'normalText')}>💡 {tip.title}</Text>
              <Text className={classnames(styles.tipsContent, 'smallText')}>{tip.content}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default PendingPage;
