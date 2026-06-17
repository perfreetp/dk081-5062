import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Textarea } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useRevisitStore } from '@/store/revisitStore';
import ElderlyToggle from '@/components/ElderlyToggle';
import RatingStars from '@/components/RatingStars';
import type { RevisitItem } from '@/types/revisit';

interface PendingReviewItem extends RevisitItem {
  rating?: number;
  isImproved?: boolean;
  comment?: string;
}

const ReviewPage: React.FC = () => {
  const { elderlyMode, getReviewList, submitReview, revisitList } = useRevisitStore();
  const [reviewMap, setReviewMap] = useState<Record<string, PendingReviewItem>>({});

  useDidShow(() => {
    console.log('[ReviewPage] page show');
  });

  const pendingList = useMemo(() => getReviewList(), [revisitList]);

  const reviewedList = useMemo(
    () => revisitList.filter(r => r.reviewRating),
    [revisitList]
  );

  const stats = useMemo(() => ({
    pending: pendingList.length,
    reviewed: reviewedList.length,
    avgRating: reviewedList.length > 0
      ? (reviewedList.reduce((sum, r) => sum + (r.reviewRating || 0), 0) / reviewedList.length).toFixed(1)
      : '0.0'
  }), [pendingList, reviewedList]);

  const updateReview = (id: string, patch: Partial<PendingReviewItem>) => {
    setReviewMap(prev => ({
      ...prev,
      [id]: { ...(prev[id] || (revisitList.find(r => r.id === id) as RevisitItem)), ...patch }
    }));
  };

  const handleSubmit = (item: RevisitItem) => {
    const reviewData = reviewMap[item.id];
    if (!reviewData?.rating) {
      Taro.showToast({ title: '请先评分', icon: 'none' });
      return;
    }
    if (reviewData.isImproved === undefined) {
      Taro.showToast({ title: '请确认是否真正改善', icon: 'none' });
      return;
    }

    Taro.showModal({
      title: '提交评价',
      content: '确认提交本次复核评价？提交后不可修改。',
      confirmText: '确认提交',
      success: (res) => {
        if (res.confirm) {
          submitReview(item.id, reviewData.rating, reviewData.comment);
          Taro.showToast({ title: '评价已提交', icon: 'success' });
          console.log('[ReviewPage] review submitted:', { id: item.id, rating: reviewData.rating });
        }
      }
    });
  };

  const canSubmit = (id: string) => {
    const d = reviewMap[id];
    return d?.rating && d?.isImproved !== undefined;
  };

  return (
    <View className={classnames(styles.page, elderlyMode && 'elderlyMode')}>
      <View className={styles.header}>
        <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <Text className={classnames(styles.pageTitle, 'pageTitle')}>结果评价</Text>
            <Text className={classnames(styles.pageSubtitle, 'smallText')}>
              对已解决的事项进行复核评价，确认整改是否真正到位
            </Text>
          </View>
          <ElderlyToggle />
        </View>
        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{stats.pending}</Text>
            <Text className={classnames(styles.statLabel, 'smallText')}>待评价</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{stats.reviewed}</Text>
            <Text className={classnames(styles.statLabel, 'smallText')}>已评价</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{stats.avgRating}</Text>
            <Text className={classnames(styles.statLabel, 'smallText')}>平均星级</Text>
          </View>
        </View>
      </View>

      <ScrollView scrollY className={styles.content}>
        <Text className={classnames(styles.sectionTitle, 'cardTitle')}>待评价事项</Text>

        {pendingList.length === 0 ? (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>⭐</Text>
            <Text className={classnames(styles.emptyTitle, 'cardTitle')}>暂无待评价事项</Text>
            <Text className={classnames(styles.emptyDesc, 'smallText')}>
              已解决的事项会出现在这里，邀请您进行复核评价。
              {'\n'}您的评价是我们改进服务的动力！
            </Text>
          </View>
        ) : (
          pendingList.map(item => {
            const reviewData = reviewMap[item.id] || {};
            return (
              <View key={item.id} className={styles.reviewCard}>
                <View className={styles.reviewHeader}>
                  <Text className={classnames(styles.reviewTitle, 'cardTitle')}>{item.title}</Text>
                </View>
                <Text className={classnames(styles.reviewMatter, 'smallText')}>{item.matterName}</Text>

                {item.improvement && (
                  <View className={styles.improvementBox}>
                    <Text className={classnames(styles.improvementLabel, 'smallText')}>承办单位整改措施：</Text>
                    <Text className={classnames(styles.improvementText, 'smallText')}>
                      {item.improvement.description}
                    </Text>
                  </View>
                )}

                <View className={styles.ratingSection}>
                  <Text className={classnames(styles.ratingLabel, 'normalText')}>请为整改效果打分：</Text>
                  <View className={styles.bigRating}>
                    <RatingStars
                      value={reviewData.rating || 0}
                      onChange={(v) => updateReview(item.id, { rating: v })}
                      size="lg"
                    />
                  </View>
                </View>

                <Text className={classnames(styles.confirmQuestion, 'normalText')}>问题是否真正得到改善？</Text>
                <View className={styles.confirmOptions}>
                  <View
                    className={classnames(
                      styles.confirmOption,
                      styles.confirmOptionYes,
                      reviewData.isImproved === true && styles.confirmOptionActive
                    )}
                    onClick={() => updateReview(item.id, { isImproved: true })}
                  >
                    <Text className={styles.confirmOptionText}>✓ 真正改善</Text>
                  </View>
                  <View
                    className={classnames(
                      styles.confirmOption,
                      styles.confirmOptionNo,
                      reviewData.isImproved === false && styles.confirmOptionActive
                    )}
                    onClick={() => updateReview(item.id, { isImproved: false })}
                  >
                    <Text className={styles.confirmOptionText}>✕ 尚未改善</Text>
                  </View>
                </View>

                <View className={styles.commentSection}>
                  <Text className={classnames(styles.commentLabel, 'normalText')}>补充评价（选填）：</Text>
                  <Textarea
                    className={styles.commentInput}
                    placeholder="请输入您的评价或建议..."
                    value={reviewData.comment || ''}
                    onInput={(e) => updateReview(item.id, { comment: e.detail.value })}
                    maxlength={200}
                  />
                  <Text className={classnames(styles.commentHint, 'smallText')}>
                    最多200字，您的建议将帮助我们持续改进
                  </Text>
                </View>

                <View
                  className={classnames(
                    styles.submitBtn,
                    !canSubmit(item.id) && styles.submitBtnDisabled
                  )}
                  onClick={() => canSubmit(item.id) && handleSubmit(item)}
                >
                  <Text className={styles.submitBtnText}>提交复核评价</Text>
                </View>
              </View>
            );
          })
        )}

        {reviewedList.length > 0 && (
          <>
            <Text className={classnames(styles.sectionTitle, 'cardTitle')} style={{ marginTop: 32 }}>
              已完成的评价
            </Text>
            {reviewedList.map(item => (
              <View key={item.id} className={styles.reviewedCard}>
                <View className={styles.reviewedHeader}>
                  <Text className={classnames(styles.reviewedTitle, 'normalText')}>{item.title}</Text>
                  <View className={styles.reviewedBadge}>
                    <Text className={styles.reviewedBadgeText}>已评价</Text>
                  </View>
                </View>
                <View className={styles.reviewedRating}>
                  <RatingStars value={item.reviewRating || 0} readonly size="sm" />
                </View>
                {item.reviewComment && (
                  <Text className={classnames(styles.reviewedComment, 'smallText')}>
                    "{item.reviewComment}"
                  </Text>
                )}
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default ReviewPage;
