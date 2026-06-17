import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useRevisitStore } from '@/store/revisitStore';
import StatusCard from '@/components/StatusCard';
import ElderlyToggle from '@/components/ElderlyToggle';
import type { RevisitItem } from '@/types/revisit';

const ProgressPage: React.FC = () => {
  const { elderlyMode, getProgressList, applySupervision, revisitList } = useRevisitStore();
  const [filter, setFilter] = useState<'all' | 'overtime' | 'partial' | 'unresolved'>('all');

  useDidShow(() => {
    console.log('[ProgressPage] page show');
  });

  const progressList = useMemo(() => {
    const list = getProgressList();
    switch (filter) {
      case 'overtime':
        return list.filter(i => i.isOvertime);
      case 'partial':
        return list.filter(i => i.status === 'partial');
      case 'unresolved':
        return list.filter(i => i.status === 'unresolved');
      default:
        return list;
    }
  }, [revisitList, filter]);

  const overtimeList = useMemo(
    () => getProgressList().filter(i => i.isOvertime),
    [revisitList]
  );

  const handleApplySupervision = (item: RevisitItem) => {
    Taro.showModal({
      title: '申请再次督办',
      content: `确认对「${item.title}」申请上级督办？相关部门将在24小时内介入处理。`,
      confirmText: '确认申请',
      confirmColor: '#E5484D',
      success: (res) => {
        if (res.confirm) {
          applySupervision(item.id);
          Taro.showToast({
            title: '督办申请已提交',
            icon: 'success'
          });
          console.log('[ProgressPage] supervision applied:', item.id);
        }
      }
    });
  };

  const tabs = [
    { key: 'all', label: '全部' },
    { key: 'overtime', label: '已超时' },
    { key: 'partial', label: '部分解决' },
    { key: 'unresolved', label: '仍未解决' }
  ] as const;

  return (
    <View className={classnames(styles.page, elderlyMode && 'elderlyMode')}>
      <View className={styles.header}>
        <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <Text className={classnames(styles.pageTitle, 'pageTitle')}>整改进度</Text>
            <Text className={classnames(styles.pageSubtitle, 'smallText')}>
              实时跟踪承办单位的整改措施和完成情况
            </Text>
          </View>
          <ElderlyToggle />
        </View>
        <ScrollView scrollX className={styles.filterTabs}>
          {tabs.map(tab => (
            <View
              key={tab.key}
              className={classnames(
                styles.filterTab,
                filter === tab.key && styles.filterTabActive
              )}
              onClick={() => setFilter(tab.key)}
            >
              <Text className={classnames(styles.filterTabText, 'smallText')}>
                {tab.label}
                {tab.key === 'overtime' && overtimeList.length > 0 && (
                  <Text className={styles.countdownText}> ({overtimeList.length})</Text>
                )}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <ScrollView scrollY className={styles.content}>
        {overtimeList.length > 0 && filter === 'all' && (
          <View className={styles.superviseCard}>
            <Text className={classnames(styles.superviseTitle, 'normalText')}>
              ⚠ 您有 {overtimeList.length} 项事项已超出整改时限
            </Text>
            <Text className={classnames(styles.superviseDesc, 'smallText')}>
              超时未整改的事项，您可以申请再次督办，上级部门将介入督促办理。
            </Text>
          </View>
        )}

        <Text className={classnames(styles.sectionTitle, 'cardTitle')}>
          处理中的事项
          <Text className={styles.countdownText}> ({progressList.length})</Text>
        </Text>

        {progressList.length === 0 ? (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>✅</Text>
            <Text className={classnames(styles.emptyTitle, 'cardTitle')}>暂无处理中的事项</Text>
            <Text className={classnames(styles.emptyDesc, 'smallText')}>
              您反馈的问题都已处理完成或无需跟进。
              {'\n'}如有新的问题，会在此处展示整改进度。
            </Text>
          </View>
        ) : (
          progressList.map(item => (
            <View key={item.id}>
              <StatusCard item={item} />
              {item.isOvertime && (
                <View
                  className={styles.superviseBtn}
                  onClick={() => handleApplySupervision(item)}
                  style={{ marginBottom: 24 }}
                >
                  <Text className={styles.superviseBtnText}>申请再次督办</Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default ProgressPage;
