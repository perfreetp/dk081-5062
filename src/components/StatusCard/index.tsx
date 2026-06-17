import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import type { RevisitItem, RevisitStatus } from '@/types/revisit';

interface StatusCardProps {
  item: RevisitItem;
  showActions?: boolean;
  onStatusSelect?: (id: string, status: RevisitStatus) => void;
  onSupplement?: (id: string) => void;
  onClick?: (id: string) => void;
}

const StatusCard: React.FC<StatusCardProps> = ({
  item,
  showActions = false,
  onStatusSelect,
  onSupplement,
  onClick
}) => {
  const handleCardClick = () => {
    if (onClick) {
      onClick(item.id);
    } else {
      Taro.navigateTo({ url: `/pages/detail/index?id=${item.id}` });
    }
  };

  const statusClassMap: Record<RevisitStatus, string> = {
    pending: styles.statusPending,
    resolved: styles.statusResolved,
    partial: styles.statusPartial,
    unresolved: styles.statusUnresolved,
    rehandling: styles.statusRehandling,
    closed_good: styles.statusClosedGood,
    closed_bad: styles.statusClosedBad
  };

  return (
    <View className={styles.card} onClick={handleCardClick}>
      <View className={styles.cardHeader}>
        <View className={styles.titleRow}>
          <Text className={classnames(styles.title, 'cardTitle')}>{item.title}</Text>
          <View className={classnames(styles.statusBadge, statusClassMap[item.status] || styles.statusPending)}>
            <Text className={styles.statusText}>{item.statusText}</Text>
          </View>
        </View>
        <Text className={classnames(styles.matterName, 'smallText')}>{item.matterName}</Text>
        {item.stageText && (
          <View className={styles.stageRow}>
            <Text className={styles.stageText}>📍 {item.stageText}</Text>
            {item.currentHandlerDept && (
              <Text className={styles.handlerText}> · {item.currentHandlerDept}</Text>
            )}
          </View>
        )}
      </View>

      {item.dissatisfactionTags.length > 0 && (
        <View className={styles.tagRow}>
          {item.dissatisfactionTags.slice(0, 3).map(tag => {
            const tagColorMap: Record<string, { bg: string; color: string }> = {
              wait_long: { bg: '#FFF3E0', color: '#E65100' },
              unclear_info: { bg: '#E3F2FD', color: '#0D47A1' },
              repeated_materials: { bg: '#FCE4EC', color: '#B71C1C' },
              bad_attitude: { bg: '#F3E5F5', color: '#6A1B9A' },
              other: { bg: '#F5F5F5', color: '#424242' }
            };
            const labelMap: Record<string, string> = {
              wait_long: '等待久',
              unclear_info: '告知不清',
              repeated_materials: '材料补交',
              bad_attitude: '态度生硬',
              other: '其他'
            };
            const c = tagColorMap[tag] || tagColorMap.other;
            return (
              <View key={tag} className={styles.tagPill} style={{ background: c.bg }}>
                <Text className={styles.tagPillText} style={{ color: c.color }}>
                  {labelMap[tag] || tag}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      <View className={styles.infoRow}>
        <View className={styles.infoItem}>
          <Text className={classnames(styles.infoLabel, 'smallText')}>来源</Text>
          <Text className={classnames(styles.infoValue, 'normalText')}>{item.sourceText}</Text>
        </View>
        <View className={styles.infoItem}>
          <Text className={classnames(styles.infoLabel, 'smallText')}>承办单位</Text>
          <Text className={classnames(styles.infoValue, 'normalText')}>{item.department}</Text>
        </View>
        {item.windowNo && (
          <View className={styles.infoItem}>
            <Text className={classnames(styles.infoLabel, 'smallText')}>窗口</Text>
            <Text className={classnames(styles.infoValue, 'normalText')}>{item.windowNo}</Text>
          </View>
        )}
      </View>

      {(item.improvement || item.reimprovement) && (
        <View className={styles.improvementSection}>
          <Text className={classnames(styles.improvementTitle, 'normalText')}>
            {item.reimprovement ? '二次整改方案' : '整改说明'}
          </Text>
          <Text className={classnames(styles.improvementDesc, 'smallText')}>
            {(item.reimprovement || item.improvement)?.description}
          </Text>
          {(item.reimprovement || item.improvement)?.promiseTime && (
            <View className={styles.improvementMeta}>
              <Text className={classnames(styles.improvementMetaText, 'smallText')}>
                承诺完成：{(item.reimprovement || item.improvement)!.promiseTime}
              </Text>
              {(item.reimprovement || item.improvement)?.operator && (
                <Text className={classnames(styles.improvementMetaText, 'smallText')}>
                  负责人：{(item.reimprovement || item.improvement)!.operator}
                </Text>
              )}
            </View>
          )}
        </View>
      )}

      <View className={styles.footer}>
        <Text className={classnames(styles.time, 'smallText')}>发起时间：{item.createTime}</Text>
        {item.nextAction && item.stage !== 'stage_closed' && (
          <Text className={classnames(styles.nextHint, 'smallText')}>
            → {item.nextAction}
          </Text>
        )}
      </View>

      {showActions && item.status === 'pending' && (
        <View className={styles.actionSection}>
          <Text className={classnames(styles.actionTip, 'normalText')}>请选择办理情况：</Text>
          <View className={styles.actionButtons}>
            <View
              className={classnames(styles.actionBtn, styles.btnResolved)}
              onClick={(e) => {
                e.stopPropagation();
                onStatusSelect?.(item.id, 'resolved');
              }}
            >
              <Text className={styles.btnText}>✓ 已解决</Text>
            </View>
            <View
              className={classnames(styles.actionBtn, styles.btnPartial)}
              onClick={(e) => {
                e.stopPropagation();
                onStatusSelect?.(item.id, 'partial');
              }}
            >
              <Text className={styles.btnText}>○ 部分解决</Text>
            </View>
            <View
              className={classnames(styles.actionBtn, styles.btnUnresolved)}
              onClick={(e) => {
                e.stopPropagation();
                onStatusSelect?.(item.id, 'unresolved');
              }}
            >
              <Text className={styles.btnText}>✕ 仍未解决</Text>
            </View>
          </View>
          <View
            className={styles.supplementBtn}
            onClick={(e) => {
              e.stopPropagation();
              onSupplement?.(item.id);
            }}
          >
            <Text className={styles.supplementBtnText}>补充说明 / 上传图片</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default StatusCard;
