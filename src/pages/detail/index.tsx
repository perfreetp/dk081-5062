import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useRevisitStore } from '@/store/revisitStore';
import Timeline from '@/components/Timeline';
import RatingStars from '@/components/RatingStars';
import { DISSATISFACTION_TAGS } from '@/types/revisit';

const DetailPage: React.FC = () => {
  const router = useRouter();
  const id = router.params.id as string;
  const { elderlyMode, getById } = useRevisitStore();
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

  const getTagStyle = (tagValue: string) => {
    const found = DISSATISFACTION_TAGS.find(t => t.value === tagValue);
    return found || { bgColor: '#F5F5F5', textColor: '#424242', label: tagValue };
  };

  return (
    <View className={classnames(styles.page, elderlyMode && 'elderlyMode')}>
      <View className={styles.content}>
        <View className={styles.statusHeader}>
          <View className={styles.statusBadgeRow}>
            <View className={styles.statusBadge}>
              <Text className={styles.statusBadgeText}>
                {item.statusText}
              </Text>
            </View>
            {item.isOvertime && (
              <View className={styles.overtimeTag}>
                <Text className={styles.overtimeTagText}>已超时</Text>
              </View>
            )}
            {item.isForElderly && (
              <View className={styles.elderlyBadge}>
                <Text className={styles.elderlyBadgeText}>👴 适老化服务</Text>
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
              <Text className={styles.descText}>{item.supplementText}</Text>
              {item.supplementImages && item.supplementImages.length > 0 && (
                <View className={styles.imageList}>
                  {item.supplementImages.map((img, idx) => (
                    <Image
                      key={idx}
                      className={styles.suppImage}
                      src={img}
                      mode="aspectFill"
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
              <Text className={styles.improvementText}>{item.improvement.description}</Text>
              <View className={styles.improvementMeta}>
                <Text className={styles.improvementMetaText}>
                  承诺完成：{item.improvement.promiseTime}
                </Text>
                <Text className={styles.improvementMetaText}>
                  负责人：{item.improvement.operator}
                </Text>
              </View>
            </View>
          </View>
        )}

        {item.reviewRating && (
          <View className={styles.card}>
            <Text className={classnames(styles.cardTitle, 'normalText')}>复核评价</Text>
            <View className={styles.reviewBox}>
              <Text className={styles.reviewLabel}>您的评价</Text>
              <RatingStars value={item.reviewRating} readonly size="lg" />
              {item.reviewComment && (
                <Text className={styles.reviewText}>"{item.reviewComment}"</Text>
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
