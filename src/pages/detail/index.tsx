import React, { useMemo } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useRevisitStore } from '@/store/revisitStore';
import Timeline from '@/components/Timeline';
import RatingStars from '@/components/RatingStars';
import ElderlyToggle from '@/components/ElderlyToggle';
import { DISSATISFACTION_TAGS, STAGE_FLOW } from '@/types/revisit';

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

  const currentStageIndex = useMemo(() => {
    if (!item) return 0;
    const idx = STAGE_FLOW.findIndex(s => s.key === item.stage);
    return idx >= 0 ? idx : 0;
  }, [item]);

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

  const stageColorMap: Record<string, string> = {
    stage_pending: '#1D6FE0',
    stage_department: '#F5A623',
    stage_supervision: '#E5484D',
    stage_review: '#00A870',
    stage_closed: '#9E9E9E'
  };

  return (
    <View className={classnames(styles.page, elderlyMode && 'elderlyMode')}>
      <View className={styles.topBar}>
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

      <ScrollView scrollY className={styles.content}>
        <View
          className={styles.heroCard}
          onClick={() => {
            if (voiceMode) speakItemDetails(item);
          }}
        >
          <View className={styles.heroStageBadge}>
            <Text
              className={styles.heroStageText}
              style={{ color: stageColorMap[item.stage] }}
            >
              {STAGE_FLOW[currentStageIndex]?.icon} {item.stageText}
            </Text>
          </View>
          <Text className={classnames(styles.heroTitle, 'pageTitle')}>{item.title}</Text>
          <Text className={classnames(styles.heroMatter, 'normalText')}>{item.matterName}</Text>

          <View className={styles.heroInfoRow}>
            <View className={styles.heroInfoItem}>
              <Text className={styles.heroInfoLabel}>承办单位</Text>
              <Text className={styles.heroInfoValue}>{item.department}</Text>
            </View>
            <View className={styles.heroInfoItem}>
              <Text className={styles.heroInfoLabel}>来源</Text>
              <Text className={styles.heroInfoValue}>{item.sourceText}</Text>
            </View>
          </View>
        </View>

        <View className={styles.flowCard}>
          <Text className={classnames(styles.sectionTitle, 'cardTitle')}>办理闭环</Text>
          <View className={styles.flowSteps}>
            {STAGE_FLOW.map((stage, idx) => {
              const isDone = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              return (
                <React.Fragment key={stage.key}>
                  <View className={styles.flowStep}>
                    <View className={classnames(
                      styles.flowStepIcon,
                      isDone && styles.flowStepDone,
                      isCurrent && styles.flowStepCurrent
                    )}>
                      <Text className={styles.flowStepIconText}>
                        {isDone ? '✓' : stage.icon}
                      </Text>
                    </View>
                    <Text className={classnames(
                      styles.flowStepLabel,
                      (isDone || isCurrent) && styles.flowStepLabelActive
                    )}>
                      {stage.label}
                    </Text>
                  </View>
                  {idx < STAGE_FLOW.length - 1 && (
                    <View className={classnames(
                      styles.flowConnector,
                      idx < currentStageIndex && styles.flowConnectorDone
                    )} />
                  )}
                </React.Fragment>
              );
            })}
          </View>
        </View>

        <View className={styles.statusCard}>
          <View className={styles.statusRow}>
            <View className={styles.statusLabelCol}>
              <Text className={classnames(styles.statusLabel, 'smallText')}>当前状态</Text>
              <Text className={classnames(styles.statusValue, 'cardTitle')}>{item.statusText}</Text>
            </View>
            {isOvertime && item.stage !== 'stage_closed' && (
              <View className={styles.overtimeBadge}>
                <Text className={styles.overtimeText}>⚠ 已超时</Text>
              </View>
            )}
            {item.supervisionApplied && (
              <View className={styles.supervisionBadge}>
                <Text className={styles.supervisionText}>🔍 已督办</Text>
              </View>
            )}
          </View>

          <View className={styles.handlerRow}>
            <View className={styles.handlerCol}>
              <Text className={classnames(styles.handlerLabel, 'smallText')}>当前处理方</Text>
              <Text className={classnames(styles.handlerValue, 'normalText')}>
                {item.currentHandlerDept || '-'}
                {' '}
                <Text className={styles.handlerName}>
                  {item.currentHandler ? `· ${item.currentHandler}` : ''}
                </Text>
              </Text>
            </View>
          </View>

          {item.nextAction && (
            <View className={styles.nextActionRow}>
              <Text className={styles.nextActionIcon}>👉</Text>
              <Text className={classnames(styles.nextActionText, 'normalText')}>
                下一步：{item.nextAction}
              </Text>
            </View>
          )}
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
                    className={styles.tagPill}
                    style={{ background: style.bgColor }}
                    onClick={() => {
                      if (voiceMode) speakText(`不满点：${style.label}`);
                    }}
                  >
                    <Text className={styles.tagPillText} style={{ color: style.textColor }}>
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
              {item.delegateName && (
                <Text className={styles.delegateText}>👴 家属代填：{item.delegateName}</Text>
              )}
              {item.supplementImages && item.supplementImages.length > 0 && (
                <View className={styles.imageList}>
                  {item.supplementImages.map((img, idx) => (
                    <Image key={idx} className={styles.suppImage} src={img} mode="aspectFill" />
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        {(item.improvement || item.reimprovement) && (
          <View className={styles.card}>
            <Text className={classnames(styles.cardTitle, 'normalText')}>整改说明</Text>

            {item.improvement && (
              <View className={styles.improvementBox}>
                <Text className={styles.improvementLabel}>首次整改方案</Text>
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
                      isOvertime && !item.reimprovement && styles.metaValueOvertime
                    )}>
                      {item.improvement.promiseTime}
                      {isOvertime && !item.reimprovement && '（已超时）'}
                    </Text>
                  </View>
                  <View className={styles.metaItem}>
                    <Text className={styles.metaLabel}>负责人</Text>
                    <Text className={styles.metaValue}>{item.improvement.operator}</Text>
                  </View>
                </View>
              </View>
            )}

            {item.reimprovement && (
              <View className={classnames(styles.improvementBox, styles.reimprovementBox)}>
                <Text className={classnames(styles.improvementLabel, styles.reimproveLabel)}>
                  二次整改方案 {item.supervisionApplied ? '(督查督办)' : ''}
                </Text>
                <Text
                  className={styles.improvementText}
                  onClick={() => {
                    if (voiceMode && item.reimprovement) {
                      speakText(`二次整改说明：${item.reimprovement.description}。负责人：${item.reimprovement.operator}`);
                    }
                  }}
                >
                  {item.reimprovement.description}
                </Text>
                {item.reimprovement.promiseTime && (
                  <View className={styles.improvementMeta}>
                    <View className={styles.metaItem}>
                      <Text className={styles.metaLabel}>二次承诺</Text>
                      <Text className={styles.metaValue}>{item.reimprovement.promiseTime}</Text>
                    </View>
                    <View className={styles.metaItem}>
                      <Text className={styles.metaLabel}>负责人</Text>
                      <Text className={styles.metaValue}>{item.reimprovement.operator}</Text>
                    </View>
                  </View>
                )}
              </View>
            )}

            {isOvertime && !item.supervisionApplied && item.stage === 'stage_department' && (
              <View className={styles.superviseBtn} onClick={handleApplySupervision}>
                <Text className={styles.superviseBtnText}>⚠ 超时未整改，申请再次督办</Text>
              </View>
            )}

            {item.supervisionApplied && (
              <View className={styles.supervisionDone}>
                <Text className={styles.supervisionDoneText}>
                  ✓ 已申请上级督办，督查部门正在处理中
                </Text>
              </View>
            )}
          </View>
        )}

        {item.reviewRating !== undefined && (
          <View className={styles.card}>
            <Text className={classnames(styles.cardTitle, 'normalText')}>复核评价</Text>
            <View className={styles.reviewBox}>
              <View className={styles.reviewHeader}>
                <Text className={styles.reviewLabel}>您的评价</Text>
                <Text className={styles.reviewCountBadge}>第 {item.reviewCount} 次评价</Text>
              </View>
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
              {item.reviewIsImproved === false && item.stage !== 'stage_closed' && (
                <View className={styles.reviewTrackHint}>
                  <Text className={styles.reviewTrackText}>
                    🔄 已重新进入整改流程，承办单位将进行二次整改
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        <View className={styles.card}>
          <Text className={classnames(styles.cardTitle, 'normalText')}>处理流程</Text>
          <Timeline nodes={item.processNodes} />
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {(item.stage === 'stage_pending' || item.stage === 'stage_department' || item.stage === 'stage_review') && (
        <View className={styles.bottomBar}>
          {item.stage === 'stage_pending' && (
            <>
              <View
                className={classnames(styles.bottomBtn, styles.bottomBtnSecondary)}
                onClick={() => {
                  Taro.navigateTo({ url: `/pages/supplement/index?id=${item.id}` });
                  if (voiceMode) speakText('前往补充说明页面');
                }}
              >
                <Text className={styles.bottomBtnText}>补充说明</Text>
              </View>
              <View
                className={classnames(styles.bottomBtn, styles.bottomBtnPrimary)}
                onClick={() => {
                  Taro.switchTab({ url: '/pages/pending/index' });
                  if (voiceMode) speakText('前往待确认页面');
                }}
              >
                <Text className={styles.bottomBtnTextPrimary}>去确认</Text>
              </View>
            </>
          )}
          {item.stage === 'stage_department' && isOvertime && (
            <View
              className={classnames(styles.bottomBtn, styles.bottomBtnDanger)}
              onClick={handleApplySupervision}
            >
              <Text className={styles.bottomBtnTextPrimary}>申请再次督办</Text>
            </View>
          )}
          {item.stage === 'stage_department' && !isOvertime && (
            <View
              className={classnames(styles.bottomBtn, styles.bottomBtnDisabled)}
            >
              <Text className={styles.bottomBtnText}>部门整改中，请耐心等待</Text>
            </View>
          )}
          {item.stage === 'stage_review' && !item.reviewRating && (
            <View
              className={classnames(styles.bottomBtn, styles.bottomBtnPrimary)}
              onClick={() => {
                Taro.switchTab({ url: '/pages/review/index' });
                if (voiceMode) speakText('前往结果评价页面');
              }}
            >
              <Text className={styles.bottomBtnTextPrimary}>去评价</Text>
            </View>
          )}
          {item.stage === 'stage_review' && item.reviewRating && (
            <View
              className={classnames(styles.bottomBtn, styles.bottomBtnDisabled)}
            >
              <Text className={styles.bottomBtnText}>已完成评价</Text>
            </View>
          )}
        </View>
      )}

      {item.stage === 'stage_supervision' && (
        <View className={styles.bottomBar}>
          <View
            className={classnames(styles.bottomBtn, styles.bottomBtnSupervision)}
          >
            <Text className={styles.bottomBtnTextPrimary}>督查部门督办中</Text>
          </View>
        </View>
      )}

      {item.stage === 'stage_closed' && (
        <View className={styles.bottomBar}>
          <View
            className={classnames(styles.bottomBtn, styles.bottomBtnClosed)}
          >
            <Text className={styles.bottomBtnTextPrimary}>
              {item.status === 'closed_good' ? '✓ 已办结（群众认可）' : '✕ 已办结（未认可）'}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default DetailPage;
