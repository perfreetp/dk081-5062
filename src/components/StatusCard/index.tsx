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

const statusConfig: Record<RevisitStatus, { label: string; className: string; dotClass: string }> = {
  pending: { label: '待确认', className: styles.statusPending, dotClass: styles.dotPending },
  resolved: { label: '已解决', className: styles.statusResolved, dotClass: styles.dotResolved },
  partial: { label: '部分解决', className: styles.statusPartial, dotClass: styles.dotPartial },
  unresolved: { label: '仍未解决', className: styles.statusUnresolved, dotClass: styles.dotUnresolved }
};

const StatusCard: React.FC<StatusCardProps> = ({
  item,
  showActions = false,
  onStatusSelect,
  onSupplement,
  onClick
}) => {
  const status = statusConfig[item.status];

  const handleCardClick = () => {
    if (onClick) {
      onClick(item.id);
    } else {
      Taro.navigateTo({ url: `/pages/detail/index?id=${item.id}` });
    }
  };

  return (
    <View className={styles.card} onClick={handleCardClick}>
      <View className={styles.cardHeader}>
        <View className={styles.titleRow}>
          <Text className={classnames(styles.title, 'cardTitle')}>{item.title}</Text>
          <View className={classnames(styles.statusBadge, status.className)}>
            <View className={classnames(styles.statusDot, status.dotClass)} />
            <Text className={styles.statusText}>{status.label}</Text>
          </View>
        </View>
        <Text className={classnames(styles.matterName, 'smallText')}>{item.matterName}</Text>
      </View>

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

      {item.isOvertime && (
        <View className={styles.overtimeBanner}>
          <Text className={styles.overtimeText}>⚠ 该事项已超出整改时限，可申请再次督办</Text>
        </View>
      )}

      {item.improvement && (
        <View className={styles.improvementSection}>
          <Text className={classnames(styles.improvementTitle, 'normalText')}>整改说明</Text>
          <Text className={classnames(styles.improvementDesc, 'smallText')}>
            {item.improvement.description}
          </Text>
          <View className={styles.improvementMeta}>
            <Text className={classnames(styles.improvementMetaText, 'smallText')}>
              承诺完成：{item.improvement.promiseTime}
            </Text>
            <Text className={classnames(styles.improvementMetaText, 'smallText')}>
              负责人：{item.improvement.operator}
            </Text>
          </View>
        </View>
      )}

      <View className={styles.footer}>
        <Text className={classnames(styles.time, 'smallText')}>发起时间：{item.createTime}</Text>
        <Text className={classnames(styles.deadline, 'smallText')}>截止：{item.deadline}</Text>
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
