import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useRevisitStore } from '@/store/revisitStore';

const ElderlyToggle: React.FC = () => {
  const { elderlyMode, voiceMode, toggleElderlyMode, toggleVoiceMode, speakText } = useRevisitStore();

  return (
    <View className={styles.container}>
      <View
        className={classnames(styles.toggleItem, elderlyMode && styles.toggleActive)}
        onClick={() => {
          toggleElderlyMode();
          speakText(elderlyMode ? '已关闭大字版' : '已开启大字版');
        }}
      >
        <Text className={styles.toggleIcon}>A+</Text>
        <Text className={styles.toggleText}>大字版</Text>
      </View>
      <View
        className={classnames(styles.toggleItem, voiceMode && styles.toggleActive)}
        onClick={() => {
          toggleVoiceMode();
          speakText(voiceMode ? '已关闭语音播报' : '已开启语音播报');
        }}
      >
        <Text className={styles.toggleIcon}>🔊</Text>
        <Text className={styles.toggleText}>语音播报</Text>
      </View>
    </View>
  );
};

export default ElderlyToggle;
