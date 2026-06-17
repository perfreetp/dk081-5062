import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import { DISSATISFACTION_TAGS } from '@/types/revisit';
import type { DissatisfactionTag } from '@/types/revisit';

interface TagSelectorProps {
  selectedTags: DissatisfactionTag[];
  onToggle: (tag: DissatisfactionTag) => void;
  title?: string;
}

const TagSelector: React.FC<TagSelectorProps> = ({ selectedTags, onToggle, title = '选择不满点（可多选）' }) => {
  return (
    <View className={styles.container}>
      <Text className={classnames(styles.title, 'normalText')}>{title}</Text>
      <View className={styles.tagList}>
        {DISSATISFACTION_TAGS.map(tag => {
          const isSelected = selectedTags.includes(tag.value);
          return (
            <View
              key={tag.value}
              className={classnames(styles.tag, isSelected && styles.tagSelected)}
              style={{
                background: isSelected ? tag.bgColor : '#F5F5F5',
                borderColor: isSelected ? tag.textColor : 'transparent'
              }}
              onClick={() => onToggle(tag.value)}
            >
              <Text
                className={styles.tagText}
                style={{ color: isSelected ? tag.textColor : '#8C8C8C' }}
              >
                {isSelected && '✓ '}
                {tag.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default TagSelector;
