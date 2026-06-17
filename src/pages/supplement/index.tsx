import React, { useState } from 'react';
import { View, Text, Textarea, Input, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useRevisitStore } from '@/store/revisitStore';
import TagSelector from '@/components/TagSelector';
import type { DissatisfactionTag } from '@/types/revisit';

const timeOptions = [
  { key: 'morning', label: '今日上午 9:00-12:00' },
  { key: 'afternoon', label: '今日下午 14:00-18:00' },
  { key: 'tomorrow', label: '明日全天' },
  { key: 'weekday', label: '工作日联系' },
  { key: 'anytime', label: '随时可联系' }
];

const SupplementPage: React.FC = () => {
  const router = useRouter();
  const id = router.params.id as string;
  const { elderlyMode, getById, submitSupplement, updateStatus } = useRevisitStore();
  const item = getById(id);

  const [selectedTags, setSelectedTags] = useState<DissatisfactionTag[]>([]);
  const [text, setText] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [contactTime, setContactTime] = useState('');
  const [isElderly, setIsElderly] = useState(false);
  const [delegateName, setDelegateName] = useState('');

  const handleToggleTag = (tag: DissatisfactionTag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleChooseImage = () => {
    Taro.chooseImage({
      count: 3 - images.length,
      success: (res) => {
        const newImages = res.tempFilePaths;
        setImages(prev => [...prev, ...newImages].slice(0, 3));
        console.log('[SupplementPage] images selected:', newImages);
      },
      fail: (err) => {
        console.error('[SupplementPage] chooseImage failed:', err);
      }
    });
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!item) return;

    if (selectedTags.length === 0 && !text.trim()) {
      Taro.showToast({ title: '请选择不满点或填写说明', icon: 'none' });
      return;
    }

    if (isElderly && !delegateName.trim()) {
      Taro.showToast({ title: '请填写代填家属姓名', icon: 'none' });
      return;
    }

    // 同步更新状态为部分解决（因为有补充说明说明有问题）
    if (item.status === 'pending') {
      updateStatus(id, 'partial', selectedTags);
    }

    submitSupplement(id, {
      text: text.trim() || undefined,
      images: images.length > 0 ? images : undefined,
      contactTime: contactTime || undefined,
      isForElderly: isElderly,
      delegateName: delegateName.trim() || undefined
    });

    Taro.showToast({ title: '补充说明已提交', icon: 'success' });
    console.log('[SupplementPage] supplement submitted:', {
      id,
      tags: selectedTags,
      text,
      images,
      contactTime,
      isElderly,
      delegateName
    });

    setTimeout(() => {
      Taro.navigateBack();
    }, 1500);
  };

  if (!item) {
    return (
      <View className={styles.page}>
        <View style={{ padding: 100, textAlign: 'center' }}>
          <Text>未找到回访记录</Text>
        </View>
      </View>
    );
  }

  return (
    <View className={classnames(styles.page, elderlyMode && 'elderlyMode')}>
      <View className={styles.content}>
        <View className={styles.itemHeader}>
          <Text className={classnames(styles.itemTitle, 'cardTitle')}>{item.title}</Text>
          <Text className={classnames(styles.itemMatter, 'smallText')}>{item.matterName}</Text>
          <View className={styles.itemMeta}>
            <Text className={classnames(styles.metaText, 'smallText')}>{item.department}</Text>
            <Text className={classnames(styles.metaText, 'smallText')}>{item.sourceText}</Text>
            <Text className={classnames(styles.metaText, 'smallText')}>{item.createTime}</Text>
          </View>
        </View>

        <View className={styles.section}>
          <TagSelector
            selectedTags={selectedTags}
            onToggle={handleToggleTag}
            title="请选择问题类型（可多选）"
          />
        </View>

        <View className={styles.section}>
          <Text className={classnames(styles.sectionTitle, 'normalText')}>详细说明（选填）</Text>
          <Textarea
            className={styles.textInput}
            placeholder="请详细描述您遇到的问题和诉求，方便我们更好地为您解决..."
            value={text}
            onInput={(e) => setText(e.detail.value)}
            maxlength={500}
          />
          <Text className={classnames(styles.inputHint, 'smallText')}>
            已输入 {text.length}/500 字
          </Text>
        </View>

        <View className={styles.section}>
          <Text className={classnames(styles.sectionTitle, 'normalText')}>上传图片凭证（选填，最多3张）</Text>
          <View className={styles.imageUploader}>
            {images.map((img, idx) => (
              <View key={idx} className={styles.uploadItem}>
                <Image
                  className={styles.uploadedImage}
                  src={img}
                  mode="aspectFill"
                />
                <View
                  className={styles.removeBtn}
                  onClick={() => handleRemoveImage(idx)}
                >
                  <Text className={styles.removeText}>×</Text>
                </View>
              </View>
            ))}
            {images.length < 3 && (
              <View className={styles.uploadItem} onClick={handleChooseImage}>
                <Text className={styles.uploadIcon}>+</Text>
                <Text className={classnames(styles.uploadText, 'smallText')}>上传图片</Text>
              </View>
            )}
          </View>
        </View>

        <View className={styles.section}>
          <Text className={classnames(styles.sectionTitle, 'normalText')}>期望再次联系时间（选填）</Text>
          <View className={styles.timeSelector}>
            {timeOptions.map(opt => (
              <View
                key={opt.key}
                className={classnames(
                  styles.timeOption,
                  contactTime === opt.key && styles.timeOptionActive
                )}
                onClick={() => setContactTime(opt.key === contactTime ? '' : opt.key)}
              >
                <Text className={classnames(styles.timeOptionText, 'smallText')}>{opt.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.elderlySection}>
          <Text className={classnames(styles.elderlyTitle, 'normalText')}>👴 适老化服务</Text>
          <Text className={classnames(styles.inputHint, 'smallText')} style={{ marginBottom: 16, color: '#1565C0' }}>
            如果您或您的家属是老年人，可开启以下协助服务
          </Text>
          <View className={styles.elderlyOptions}>
            <View
              className={classnames(
                styles.elderlyOption,
                !isElderly && styles.elderlyOptionActive
              )}
              onClick={() => setIsElderly(false)}
            >
              <Text className={styles.elderlyOptionText}>本人填写</Text>
            </View>
            <View
              className={classnames(
                styles.elderlyOption,
                isElderly && styles.elderlyOptionActive
              )}
              onClick={() => setIsElderly(true)}
            >
              <Text className={styles.elderlyOptionText}>家属代填</Text>
            </View>
          </View>
          {isElderly && (
            <>
              <Text className={classnames(styles.delegateLabel, 'smallText')}>代填家属姓名：</Text>
              <Input
                className={styles.delegateInput}
                placeholder="请输入家属姓名"
                value={delegateName}
                onInput={(e) => setDelegateName(e.detail.value)}
              />
            </>
          )}
        </View>
      </View>

      <View className={styles.footerBar}>
        <View className={styles.cancelBtn} onClick={() => Taro.navigateBack()}>
          <Text className={styles.cancelBtnText}>取消</Text>
        </View>
        <View className={styles.submitBtn} onClick={handleSubmit}>
          <Text className={styles.submitBtnText}>提交补充说明</Text>
        </View>
      </View>
    </View>
  );
};

export default SupplementPage;
