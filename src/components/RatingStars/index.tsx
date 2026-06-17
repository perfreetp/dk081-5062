import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface RatingStarsProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const ratingTexts = ['非常不满意', '不满意', '一般', '满意', '非常满意'];

const RatingStars: React.FC<RatingStarsProps> = ({
  value,
  onChange,
  readonly = false,
  size = 'md',
  showText = true
}) => {
  const sizeClass = size === 'sm' ? styles.starSm : size === 'lg' ? styles.starLg : styles.starMd;

  return (
    <View className={styles.container}>
      <View className={styles.stars}>
        {[1, 2, 3, 4, 5].map(star => (
          <View
            key={star}
            className={classnames(
              styles.star,
              sizeClass,
              star <= value && styles.starActive,
              !readonly && styles.starClickable
            )}
            onClick={() => !readonly && onChange?.(star)}
          >
            <Text className={styles.starText}>
              {star <= value ? '★' : '☆'}
            </Text>
          </View>
        ))}
      </View>
      {showText && value > 0 && (
        <Text className={classnames(styles.ratingText, 'normalText')}>
          {ratingTexts[value - 1]}
        </Text>
      )}
    </View>
  );
};

export default RatingStars;
