import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Textarea } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useRevisitStore } from '@/store/revisitStore';
import ElderlyToggle from '@/components/ElderlyToggle';
import RatingStars from '@/components/RatingStars';
import type { RevisitItem, ReviewRecord } from '@/types/revisit';

interface PendingReviewItem extends RevisitItem {
  rating?: number;
  isImproved?: boolean;
  comment?: string;
}

type ReviewedTabType = 'rehandling' | 'closed';

const ReviewPage: React.FC = () => {
  const { elderlyMode, voiceMode, getReviewList, submitReview, revisitList, speakText, speakItemDetails } = useRevisitStore();
  const [reviewMap, setReviewMap] = useState<Record<string, PendingReviewItem>>({});
  const [reviewedTab, setReviewedTab] = useState<ReviewedTabType>('rehandling');

  useDidShow(() => {
    console.log('[ReviewPage] page show');
  });

  const pendingList = useMemo(() => getReviewList(), [revisitList]);

  const rehandlingList = useMemo(
    () => revisitList.filter(r => r.status === 'rehandling' || r.status === 'closed_bad'),
    [revisitList]
  );

  const closedList = useMemo(
    () => revisitList.filter(r => r.status === 'closed_good'),
    [revisitList]
  );

  const stats = useMemo(() => ({
    pending: pendingList.length,
    closed: closedList.length,
    rehandling: rehandlingList.length
  }), [pendingList, closedList, rehandlingList]);

  const currentReviewedList = useMemo(
    () => (reviewedTab === 'rehandling' ? rehandlingList : closedList),
    [reviewedTab, rehandlingList, closedList]
  );

  const getLastReviewRecord = (item: RevisitItem): ReviewRecord | undefined => {
    if (!item.reviewHistory || item.reviewHistory.length === 0) return undefined;
    return item.reviewHistory[item.reviewHistory.length - 1];
  };

  const isSecondReview = (item: RevisitItem): boolean => {
    return !!(item.reimprovement?.feedbackTime && item.reviewIsImproved === false);
  };

  const updateReview = (id: string, patch: Partial<PendingReviewItem>) => {
    setReviewMap(prev => ({
      ...prev,
      [id]: { ...(prev[id] || (revisitList.find(r => r.id === id) as RevisitItem)), ...patch }
    }));
    if (voiceMode) {
      if (patch.rating !== undefined) {
        speakText(`已选择${patch.rating}星评价`);
      }
      if (patch.isImproved !== undefined) {
        speakText(patch.isImproved ? '已选择：问题真正得到改善' : '已选择：问题尚未改善');
      }
    }
  };

  const handleSubmit = (item: RevisitItem) => {
    const reviewData = reviewMap[item.id];
    if (!reviewData?.rating) {
      Taro.showToast({ title: '请先评分', icon: 'none' });
      if (voiceMode) speakText('请先给出星级评价，再提交');
      return;
    }
    if (reviewData.isImproved === undefined) {
      Taro.showToast({ title: '请确认是否真正改善', icon: 'none' });
      if (voiceMode) speakText('请选择问题是否真正得到改善');
      return;
    }

    Taro.showModal({
      title: '提交评价',
      content: '确认提交本次复核评价？提交后不可修改。',
      confirmText: '确认提交',
      success: (res) => {
        if (res.confirm) {
          submitReview(item.id, {
            rating: reviewData.rating!,
            isImproved: reviewData.isImproved!,
            comment: reviewData.comment
          });
          Taro.showToast({ title: '评价已提交', icon: 'success' });
          if (voiceMode) {
            speakText(
              reviewData.isImproved
                ? '复核评价已提交，事项已办结，感谢您的反馈'
                : '复核评价已提交，已启动二次整改程序，感谢您的反馈'
            );
          }
          console.log('[ReviewPage] review submitted:', {
            id: item.id,
            rating: reviewData.rating,
            isImproved: reviewData.isImproved
          });
        }
      }
    });
  };

  const canSubmit = (id: string) => {
    const d = reviewMap[id];
    return d?.rating && d?.isImproved !== undefined;
  };

  const handleCardVoiceClick = (e: any, item: RevisitItem) => {
    e.stopPropagation();
    if (voiceMode) {
      speakItemDetails(item);
    }
  };

  const handleReviewedClick = (item: RevisitItem) => {
    if (voiceMode) {
      speakText(`正在查看：${item.title}，${item.status === 'closed_good' ? '群众认可，已办结' : '二次整改中'}`);
    }
    Taro.navigateTo({ url: `/pages/detail/index?id=${item.id}` });
  };

  const handleTrackClick = (e: any, item: RevisitItem) => {
    e.stopPropagation();
    if (voiceMode) {
      speakText('正在进入详情页，查看二次整改进展');
    }
    Taro.navigateTo({ url: `/pages/detail/index?id=${item.id}` });
  };

  const handleStatVoice = (type: string) => {
    if (!voiceMode) return;
    const textMap: Record<string, string> = {
      pending: `待评价事项${stats.pending}件`,
      closed: `已办结事项${stats.closed}件`,
      rehandling: `整改中事项${stats.rehandling}件`
    };
    speakText(textMap[type] || '');
  };

  const handleTabChange = (tab: ReviewedTabType) => {
    setReviewedTab(tab);
    if (voiceMode) {
      speakText(tab === 'rehandling' ? '已切换到整改中列表' : '已切换到已办结列表');
    }
  };

  const getReviewRoundText = (item: RevisitItem): string => {
    if (!isSecondReview(item)) return '首次复核';
    const round = item.reviewCount + 1;
    return `第${round}次复核`;
  };

  const ratingText = (rating: number): string => {
    const texts = ['', '非常不满意', '不满意', '一般', '满意', '非常满意'];
    return texts[rating] || '';
  };

  return (
    <View className={classnames(styles.page, elderlyMode && styles.elderlyMode)}>
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
          <View className={classnames(styles.statItem, styles.statItemPending)} onClick={() => handleStatVoice('pending')}>
            <Text className={styles.statNum}>{stats.pending}</Text>
            <Text className={classnames(styles.statLabel, 'smallText')}>待评价</Text>
          </View>
          <View className={classnames(styles.statItem, styles.statItemClosed)} onClick={() => handleStatVoice('closed')}>
            <Text className={styles.statNum}>{stats.closed}</Text>
            <Text className={classnames(styles.statLabel, 'smallText')}>已办结</Text>
          </View>
          <View className={classnames(styles.statItem, styles.statItemRehandling)} onClick={() => handleStatVoice('rehandling')}>
            <Text className={styles.statNum}>{stats.rehandling}</Text>
            <Text className={classnames(styles.statLabel, 'smallText')}>整改中</Text>
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
            const isSecond = isSecondReview(item);
            const lastReview = getLastReviewRecord(item);

            return (
              <View key={item.id} className={styles.reviewCard}>
                <View
                  className={styles.reviewHeader}
                  onClick={(e) => handleCardVoiceClick(e, item)}
                >
                  <View className={styles.reviewTitleRow}>
                    <Text className={classnames(styles.reviewTitle, 'cardTitle')}>{item.title}</Text>
                    <View className={classnames(
                      styles.reviewBadge,
                      isSecond ? styles.reviewBadgeSecondary : styles.reviewBadgePrimary
                    )}>
                      <Text className={styles.reviewBadgeText}>{getReviewRoundText(item)}</Text>
                    </View>
                  </View>
                  {voiceMode && (
                    <View className={styles.voiceIcon}>
                      <Text className={styles.voiceIconText}>🔊</Text>
                    </View>
                  )}
                </View>
                <Text className={classnames(styles.reviewMatter, 'smallText')}>{item.matterName}</Text>

                {isSecond && lastReview && (
                  <View className={styles.lastReviewBox}>
                    <Text className={classnames(styles.lastReviewLabel, 'smallText')}>前一次评价结论：</Text>
                    <View className={styles.lastReviewContent}>
                      <View className={styles.lastReviewRating}>
                        <RatingStars value={lastReview.rating} readonly size="sm" />
                        <Text className={classnames(styles.lastReviewRatingText, 'smallText')}>
                          {ratingText(lastReview.rating)}
                        </Text>
                      </View>
                      <Text className={classnames(styles.lastReviewResult, 'smallText')}>
                        整改效果：{lastReview.isImproved ? '群众认可' : '群众未认可'}
                      </Text>
                      {lastReview.comment && (
                        <Text className={classnames(styles.lastReviewComment, 'smallText')}>
                          评价："{lastReview.comment}"
                        </Text>
                      )}
                      <Text className={classnames(styles.lastReviewTime, 'smallText')}>
                        评价时间：{lastReview.time}
                      </Text>
                    </View>
                  </View>
                )}

                {item.reimprovement && isSecond ? (
                  <View className={styles.improvementBox}>
                    <Text className={classnames(styles.improvementLabel, 'smallText')}>二次整改措施：</Text>
                    <Text className={classnames(styles.improvementText, 'smallText')}>
                      {item.reimprovement.description}
                    </Text>
                  </View>
                ) : item.improvement && (
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

        {(rehandlingList.length > 0 || closedList.length > 0) && (
          <View className={styles.reviewedSection}>
            <Text className={classnames(styles.sectionTitle, 'cardTitle')}>已评价事项</Text>

            <View className={styles.tabBar}>
              <View
                className={classnames(
                  styles.tabItem,
                  reviewedTab === 'rehandling' && styles.tabItemActive
                )}
                onClick={() => handleTabChange('rehandling')}
              >
                <Text className={classnames(styles.tabText, 'normalText')}>整改中</Text>
                {rehandlingList.length > 0 && (
                  <View className={styles.tabBadge}>
                    <Text className={styles.tabBadgeText}>{rehandlingList.length}</Text>
                  </View>
                )}
              </View>
              <View
                className={classnames(
                  styles.tabItem,
                  reviewedTab === 'closed' && styles.tabItemActive
                )}
                onClick={() => handleTabChange('closed')}
              >
                <Text className={classnames(styles.tabText, 'normalText')}>已办结</Text>
                {closedList.length > 0 && (
                  <View className={styles.tabBadge}>
                    <Text className={styles.tabBadgeText}>{closedList.length}</Text>
                  </View>
                )}
              </View>
            </View>

            {currentReviewedList.length === 0 ? (
              <View className={styles.emptyState}>
                <Text className={styles.emptyIcon}>
                  {reviewedTab === 'rehandling' ? '🔄' : '✅'}
                </Text>
                <Text className={classnames(styles.emptyTitle, 'cardTitle')}>
                  {reviewedTab === 'rehandling' ? '暂无整改中事项' : '暂无已办结事项'}
                </Text>
                <Text className={classnames(styles.emptyDesc, 'smallText')}>
                  {reviewedTab === 'rehandling'
                    ? '群众未认可整改效果的事项会出现在这里，进入二次整改流程。'
                    : '群众认可整改效果的事项会出现在这里，完成办结归档。'}
                </Text>
              </View>
            ) : (
              currentReviewedList.map(item => {
                const isRehandling = item.status === 'rehandling' || item.status === 'closed_bad';
                const lastReview = getLastReviewRecord(item);

                return (
                  <View
                    key={item.id}
                    className={classnames(
                      styles.reviewedCard,
                      isRehandling && styles.reviewedCardRehandling,
                      !isRehandling && styles.reviewedCardClosed
                    )}
                    onClick={() => handleReviewedClick(item)}
                  >
                    <View className={styles.reviewedHeader}>
                      <Text className={classnames(styles.reviewedTitle, 'normalText')}>{item.title}</Text>
                      <View className={classnames(
                        styles.reviewedBadge,
                        isRehandling ? styles.reviewedBadgeRehandling : styles.reviewedBadgeClosed
                      )}>
                        <Text className={styles.reviewedBadgeText}>
                          {isRehandling ? '二次整改中' : '群众认可'}
                        </Text>
                      </View>
                    </View>

                    {lastReview && (
                      <View className={styles.reviewedRatingRow}>
                        <RatingStars value={lastReview.rating || 0} readonly size="sm" />
                        <Text className={classnames(styles.reviewedRatingText, 'smallText')}>
                          {ratingText(lastReview.rating)}
                        </Text>
                      </View>
                    )}

                    <View className={styles.reviewedImproved}>
                      <Text className={classnames(
                        styles.reviewedImprovedText,
                        isRehandling ? styles.textWarning : styles.textGood,
                        'smallText'
                      )}>
                        {isRehandling
                          ? '群众认为整改后问题尚未真正改善，已启动二次整改'
                          : '群众认为整改后问题已真正改善，事项已办结'}
                      </Text>
                    </View>

                    {lastReview?.comment && (
                      <Text className={classnames(styles.reviewedComment, 'smallText')}>
                        "{lastReview.comment}"
                      </Text>
                    )}

                    {isRehandling && (
                      <View
                        className={styles.trackEntry}
                        onClick={(e) => handleTrackClick(e, item)}
                      >
                        <View className={styles.trackEntryLeft}>
                          <Text className={styles.trackEntryIcon}>🔄</Text>
                          <View>
                            <Text className={classnames(styles.trackEntryTitle, 'normalText')}>追踪入口</Text>
                            <Text className={classnames(styles.trackEntryDesc, 'smallText')}>
                              承办单位正在再次整改，点击查看进展
                            </Text>
                          </View>
                        </View>
                        <Text className={styles.trackEntryArrow}>›</Text>
                      </View>
                    )}

                    {!isRehandling && (
                      <View className={styles.closedInfo}>
                        <Text className={classnames(styles.closedInfoText, 'smallText')}>
                          办结时间：{item.closedTime || '--'}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default ReviewPage;
