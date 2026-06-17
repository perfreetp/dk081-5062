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
  const {
    elderlyMode,
    voiceMode,
    getProgressList,
    checkIsOvertime,
    applySupervision,
    speakText,
    speakItemDetails,
    revisitList
  } = useRevisitStore();
  const [filter, setFilter] = useState<'all' | 'overtime' | 'supervision' | 'rehandling'>('all');

  useDidShow(() => {
    console.log('[ProgressPage] page show');
  });

  const progressList = useMemo(() => {
    const list = getProgressList();
    switch (filter) {
      case 'overtime':
        return list.filter(i => checkIsOvertime(i) && !i.supervisionApplied && i.stage === 'stage_department');
      case 'supervision':
        return list.filter(i => i.stage === 'stage_supervision');
      case 'rehandling':
        return list.filter(i => i.status === 'rehandling');
      default:
        return list;
    }
  }, [revisitList, filter]);

  const overtimeList = useMemo(
    () => getProgressList().filter(i => checkIsOvertime(i) && !i.supervisionApplied && i.stage === 'stage_department'),
    [revisitList]
  );

  const supervisionList = useMemo(
    () => getProgressList().filter(i => i.stage === 'stage_supervision'),
    [revisitList]
  );

  const handleApplySupervision = (item: RevisitItem) => {
    Taro.showModal({
      title: '申请再次督办',
      content: `确认对「${item.title}」申请上级督办？督查部门将在24小时内介入处理。`,
      confirmText: '确认申请',
      confirmColor: '#E5484D',
      success: (res) => {
        if (res.confirm) {
          applySupervision(item.id);
          Taro.showToast({ title: '督办申请已提交', icon: 'success' });
          if (voiceMode) speakText('督办申请已提交，督查部门已受理');
        }
      }
    });
  };

  const tabs = [
    { key: 'all' as const, label: '全部' },
    { key: 'overtime' as const, label: '超时待督办' },
    { key: 'supervision' as const, label: '督办中' },
    { key: 'rehandling' as const, label: '二次整改' }
  ];

  const handleTabClick = (key: typeof tabs[number]['key']) => {
    setFilter(key);
    if (voiceMode) {
      const tabLabels: Record<string, string> = {
        all: '显示全部处理中事项',
        overtime: '显示超时待督办事项',
        supervision: '显示督查督办中的事项',
        rehandling: '显示二次整改中的事项'
      };
      speakText(tabLabels[key]);
    }
  };

  const handleCardClick = (item: RevisitItem) => {
    if (voiceMode) speakItemDetails(item);
    setTimeout(() => {
      Taro.navigateTo({ url: `/pages/detail/index?id=${item.id}` });
    }, 300);
  };

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
              onClick={() => handleTabClick(tab.key)}
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
          <View
            className={styles.superviseCard}
            onClick={() => {
              setFilter('overtime');
              if (voiceMode) speakText(`您有${overtimeList.length}项事项已超出整改时限，可申请再次督办`);
            }}
          >
            <Text className={classnames(styles.superviseTitle, 'normalText')}>
              ⚠ 您有 {overtimeList.length} 项事项已超出整改时限
            </Text>
            <Text className={classnames(styles.superviseDesc, 'smallText')}>
              超时未整改的事项，可申请再次督办，上级部门将介入督促办理。点击查看全部超时事项
            </Text>
          </View>
        )}

        {supervisionList.length > 0 && filter === 'all' && (
          <View className={styles.supervisionRemindCard}>
            <Text className={classnames(styles.supervisionRemindTitle, 'normalText')}>
              🔍 {supervisionList.length} 项正在督查督办
            </Text>
            <Text className={classnames(styles.supervisionRemindDesc, 'smallText')}>
              督办事项由督查部门跟进，承办单位需限期完成二次整改
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
          progressList.map(item => {
            const isOver = checkIsOvertime(item);
            const showSuperviseBtn = isOver && !item.supervisionApplied && item.stage === 'stage_department';
            return (
              <View key={item.id}>
                <View onClick={() => handleCardClick(item)}>
                  <StatusCard item={item} />
                </View>
                {item.stage === 'stage_supervision' && (
                  <View className={styles.supervisionStatus}>
                    <Text className={styles.supervisionStatusText}>
                      🔍 督查部门督办中，等待承办单位二次整改反馈
                    </Text>
                  </View>
                )}
                {item.status === 'rehandling' && item.stage === 'stage_department' && (
                  <View className={styles.rehandlingStatus}>
                    <Text className={styles.rehandlingStatusText}>
                      🔄 二次整改中，承办单位正在制定深入整改方案
                    </Text>
                  </View>
                )}
                {showSuperviseBtn && (
                  <View
                    className={styles.superviseBtn}
                    onClick={() => handleApplySupervision(item)}
                  >
                    <Text className={styles.superviseBtnText}>⚠ 超时未整改，申请再次督办</Text>
                  </View>
                )}
                {item.supervisionApplied && (
                  <View className={styles.supervisionDone}>
                    <Text className={styles.supervisionDoneText}>✓ 已申请上级督办，督查部门处理中</Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

export default ProgressPage;
