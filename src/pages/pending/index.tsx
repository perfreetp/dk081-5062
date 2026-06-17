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
import type { RevisitStatus, DissatisfactionTag, RevisitItem } from '@/types/revisit';

const PendingPage: React.FC = () => {
  const {
    elderlyMode,
    voiceMode,
    getPendingList,
    updateStatus,
    revisitList,
    speakText,
    speakItemDetails
  } = useRevisitStore();
  const [selectedTagsMap, setSelectedTagsMap] = useState<Record<string, DissatisfactionTag[]>>({});
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});

  useDidShow(() => {
    console.log('[PendingPage] page show, pending count:', getPendingList().length);
  });

  const pendingList = useMemo(() => getPendingList(), [revisitList]);

  const stats = useMemo(() => ({
    pending: pendingList.length,
    inProgress: revisitList.filter(i => i.status === 'partial' || i.status === 'unresolved').length,
    resolved: revisitList.filter(i => i.status === 'resolved').length
  }), [revisitList, pendingList]);

  const toggleExpand = (id: string) => {
    setExpandedMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleStatusSelect = (id: string, status: RevisitStatus) => {
    const selectedTags = selectedTagsMap[id] || [];

    if (status !== 'resolved' && selectedTags.length === 0) {
      Taro.showToast({
        title: '请先选择不满点标签',
        icon: 'none',
        duration: 2000
      });
      if (voiceMode) speakText('请先选择不满点标签，再提交反馈');
      setExpandedMap(prev => ({ ...prev, [id]: true }));
      return;
    }

    const tagsToSubmit = status !== 'resolved' ? selectedTags : undefined;
    updateStatus(id, status, tagsToSubmit);
    Taro.showToast({
      title: '反馈已提交',
      icon: 'success'
    });
    if (voiceMode) {
      const statusText: Record<RevisitStatus, string> = {
        pending: '待确认',
        resolved: '已解决',
        partial: '部分解决',
        unresolved: '仍未解决'
      };
      speakText(`反馈已提交，感谢您的配合。您选择的状态是：${statusText[status]}`);
    }
    console.log('[PendingPage] status selected', { id, status, tags: tagsToSubmit });
  };

  const handleToggleTag = (id: string, tag: DissatisfactionTag) => {
    setSelectedTagsMap(prev => {
      const current = prev[id] || [];
      const next = current.includes(tag)
        ? current.filter(t => t !== tag)
        : [...current, tag];
      if (voiceMode) {
        const labelMap: Record<string, string> = {
          wait_long: '等待时间久',
          unclear_info: '告知不清',
          repeated_materials: '材料反复补交',
          bad_attitude: '态度生硬',
          other: '其他问题'
        };
        const action = next.includes(tag) ? '已选中' : '已取消';
        speakText(`${action}：${labelMap[tag]}`);
      }
      return { ...prev, [id]: next };
    });
  };

  const handleSupplement = (id: string) => {
    if (voiceMode) speakText('正在跳转至补充说明页面');
    Taro.navigateTo({ url: `/pages/supplement/index?id=${id}` });
  };

  const handleSpeakItem = (item: RevisitItem) => {
    if (voiceMode) {
      speakItemDetails(item);
    }
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
              <View onClick={() => handleSpeakItem(item)}>
                <StatusCard
                  item={item}
                  showActions
                  onStatusSelect={handleStatusSelect}
                  onSupplement={handleSupplement}
                />
              </View>
              <View className={styles.tagSection}>
                <View
                  className={styles.tagHeader}
                  onClick={() => {
                    toggleExpand(item.id);
                    if (voiceMode) speakText(expandedMap[item.id] ? '已收起不满点选择' : '请选择您的不满点');
                  }}
                >
                  <Text className={classnames(styles.tagHeaderText, 'normalText')}>
                    {expandedMap[item.id] ? '▼ ' : '▶ '}
                    选择不满点（部分解决/仍未解决需先选）
                    {selectedTagsMap[item.id]?.length > 0 && `（已选${selectedTagsMap[item.id].length}项）`}
                  </Text>
                </View>
                {expandedMap[item.id] && (
                  <View className={styles.tagContent}>
                    <TagSelector
                      selectedTags={selectedTagsMap[item.id] || []}
                      onToggle={(tag) => handleToggleTag(item.id, tag)}
                    />
                    <Text className={classnames(styles.tagHint, 'smallText')}>
                      请先勾选以上不满点，再点击"部分解决"或"仍未解决"按钮
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}

        <View className={styles.tipsSection}>
          <Text className={classnames(styles.sectionTitle, 'cardTitle')}>办事温馨提示</Text>
          {frequentTips.slice(0, 2).map(tip => (
            <View
              key={tip.id}
              className={styles.tipsCard}
              onClick={() => {
                if (voiceMode) speakText(`办事提示：${tip.title}。${tip.content}`);
              }}
            >
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
