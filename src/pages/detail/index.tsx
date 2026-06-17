import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useRevisitStore } from '@/store/revisitStore';
import Timeline from '@/components/Timeline';
import RatingStars from '@/components/RatingStars';
import ElderlyToggle from '@/components/ElderlyToggle';
import { DISSATISFACTION_TAGS } from '@/types/revisit';

const DetailPage: React.FC = () => {
  const router = useRouter();
  const id = router.params.id as string;
  const {
    elderlyMode,
    voiceMode,
    getById,
    checkIsOvertime,
    speakText,
    speakItemDetails,
    applySupervision
  } = useRevisitStore();
  const item = getById(id);

  if (!item) {
    return (
      <View className={styles.page}>
        <View style={{ padding: 100, textAlign: 'center' }}>
          <Text>未找到回访记录</Text>
        </View>
      </View>
    );
  }

  const isOvertime = checkIsOvertime(item);

  const getTagStyle = (tagValue: string) => {
    const found = DISSATISFACTION_TAGS.find(t => t.value === tagValue);
    return found || { bgColor: '#F5F5F5', textColor: '#424242', label: tagValue };
  };

  const handleApplySupervision = () => {
    Taro.showModal({
      title: '申请再次督办',
      content: '该事项已超过承诺完成时间，确认申请上级部门督办？',
      confirmText: '确认申请',
      success: (res) => {
        if (res.confirm) {
          applySupervision(item.id);
          Taro.showToast({ title: '督办申请已提交', icon: 'success' });
          if (voiceMode) speakText('督办申请已提交，已转交督查部门处理');
        }
      }
    });
  };

  return (
    <View className={classnames(styles.page, elderlyMode && 'elderlyMode')}>
      <View className={styles.header}>
        <View className={styles.headerBar}>
          <View
            className={styles.backBtn}
            onClick={() => {
              Taro.navigateBack();
              if (voiceMode) speakText('返回上一页');
            }}
          >
            <Text className={styles.backBtnText}>← 返回</Text>
          </View>
          <ElderlyToggle />
        </View>
      </View>

      <View className={styles.content}>
        <View
          className={styles.statusHeader}
          onClick={() => {
            if (voiceMode) speakItemDetails(item);
          }}
        >
          <View className={styles.speakHint}>
            {voiceMode && (
              <Text className={styles.speakHintText}>🔊 点击此区域可朗读事项详情</Text>
            )}
          </View>

          <View className={styles.statusBadgeRow}>
            <View className={classnames(styles.statusBadge, styles[`status_${item.status}`])}>
              <Text className={styles.statusBadgeText}>{item.statusText}</Text>
            </View>
            {isOvertime && (
              <View className={styles.overtimeTag}>
                <Text className={styles.overtimeTagText}>已超时</Text>
              </View>
            )}
            {item.isForElderly && (
              <View className={styles.elderlyBadge}>
                <Text className={styles.elderlyBadgeText}>👴 适老化服务</Text>
              </View>
            )}
            {item.supervisionApplied && (
              <View className={styles.supervisionBadge}>
                <Text className={styles.supervisionBadgeText}>督办中</Text>
              </View>
            )}
          </View>

          <Text className={classnames(styles.detailTitle, 'pageTitle')}>{item.title}</Text>
          <Text className={classnames(styles.detailMatter, 'normalText')}>{item.matterName}</Text>

          <View className={styles.infoGrid}>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>承办单位</Text>
              <Text className={styles.infoValue}>{item.department}</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>来源</Text>
              <Text className={styles.infoValue}>{item.sourceText}</Text>
            </View>
            {item.windowNo && (
              <View className={styles.infoItem}>
                <Text className={styles.infoLabel}>窗口号</Text>
                <Text className={styles.infoValue}>{item.windowNo}</Text>
              </View>
            )}
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>发起时间</Text>
              <Text className={styles.infoValue}>{item.createTime}</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>截止时间</Text>
              <Text className={styles.infoValue}>{item.deadline}</Text>
            </View>
            {item.delegateName && (
              <View className={styles.infoItem}>
                <Text className={styles.infoLabel}>代填家属</Text>
                <Text className={styles.infoValue}>{item.delegateName}</Text>
              </View>
            )}
          </View>
        </View>

        {item.dissatisfactionTags.length > 0 && (
          <View className={styles.card}>
            <Text className={classnames(styles.cardTitle, 'normalText')}>反馈的问题</Text>
            <View className={styles.tagList}>
              {item.dissatisfactionTags.map(tag => {
                const style = getTagStyle(tag);
                return (
                  <View
                    key={tag}
                    className={styles.tag}
                    style={{ background: style.bgColor }}
                    onClick={() => {
                      if (voiceMode) speakText(`不满点：${style.label}`);
                    }}
                  >
                    <Text className={styles.tagText} style={{ color: style.textColor }}>
                      {style.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {item.supplementText && (
          <View className={styles.card}>
            <Text className={classnames(styles.cardTitle, 'normalText')}>补充说明</Text>
            <View className={styles.supplementBox}>
              <Text className={styles.supplementLabel}>群众补充描述</Text>
              <Text
                className={styles.descText}
                onClick={() => {
                  if (voiceMode) speakText(`补充说明：${item.supplementText}`);
                }}
              >
                {item.supplementText}
              </Text>
              {item.contactTime && (
                <Text className={styles.contactTimeText}>期望联系时间：{item.contactTime}</Text>
              )}
              {item.supplementImages && item.supplementImages.length > 0 && (
                <View className={styles.imageList}>
                  {item.supplementImages.map((img, idx) => (
                    <Image
                      key={idx}
                      className={styles.suppImage}
                      src={img}
                      mode="aspectFill"
                      onClick={() => {
                        if (voiceMode) speakText(`第${idx + 1}张图片`);
                      }}
                    />
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        {item.improvement && (
          <View className={styles.card}>
            <Text className={classnames(styles.cardTitle, 'normalText')}>整改说明</Text>
            <View className={styles.improvementBox}>
              <Text className={styles.improvementLabel}>承办单位整改措施</Text>
              <Text
                className={styles.improvementText}
                onClick={() => {
                  if (voiceMode) speakText(`整改说明：${item.improvement!.description}。承诺完成时间：${item.improvement!.promiseTime}。负责人：${item.improvement!.operator}`);
                }}
              >
                {item.improvement.description}
              </Text>
              <View className={styles.improvementMeta}>
                <View className={styles.metaItem}>
                  <Text className={styles.metaLabel}>承诺完成</Text>
                  <Text className={classnames(
                    styles.metaValue,
                    isOvertime && styles.metaValueOvertime
                  )}>
                    {item.improvement.promiseTime}
                    {isOvertime && '（已超时）'}
                  </Text>
                </View>
                <View className={styles.metaItem}>
                  <Text className={styles.metaLabel}>负责人</Text>
                  <Text className={styles.metaValue}>{item.improvement.operator}</Text>
                </View>
              </View>
            </View>
            {isOvertime && !item.supervisionApplied && (
              <View
                className={styles.supervisionBtn}
                onClick={handleApplySupervision}
              >
                <Text className={styles.supervisionBtnText}>⚠ 超时未整改，申请再次督办</Text>
              </View>
            )}
            {item.supervisionApplied && (
              <View className={styles.supervisionDone}>
                <Text className={styles.supervisionDoneText}>✓ 已申请上级督办，督查部门处理中</Text>
              </View>
            )}
          </View>
        )}

        {item.reviewRating !== undefined && (
          <View className={styles.card}>
            <Text className={classnames(styles.cardTitle, 'normalText')}>复核评价</Text>
            <View className={styles.reviewBox}>
              <Text className={styles.reviewLabel}>您的评价</Text>
              <View className={styles.reviewRatingRow}>
                <RatingStars value={item.reviewRating} readonly size="lg" />
              </View>
              <View className={classnames(
                styles.improvementConclusion,
                item.reviewIsImproved ? styles.conclusionGood : styles.conclusionBad
              )}>
                <Text className={styles.conclusionIcon}>
                  {item.reviewIsImproved ? '✓' : '✕'}
                </Text>
                <Text className={styles.conclusionText}>
                  {item.reviewIsImproved
                    ? '群众认可：整改后问题已真正改善'
                    : '群众未认可：整改后问题尚未真正改善'}
                </Text>
              </View>
              {item.reviewComment && (
                <Text
                  className={styles.reviewText}
                  onClick={() => {
                    if (voiceMode) speakText(`评价内容：${item.reviewComment}`);
                  }}
                >
                  "{item.reviewComment}"
                </Text>
              )}
            </View>
          </View>
        )}

        <View className={styles.card}>
          <Text className={classnames(styles.cardTitle, 'normalText')}>处理流程</Text>
          <Timeline nodes={item.processNodes} />
        </View>
      </View>
    </View>
  );
};

export default DetailPage;
