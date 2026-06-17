import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import type { ProcessNode } from '@/types/revisit';

interface TimelineProps {
  nodes: ProcessNode[];
}

const Timeline: React.FC<TimelineProps> = ({ nodes }) => {
  return (
    <View className={styles.container}>
      {nodes.map((node, index) => (
        <View key={node.id} className={styles.node}>
          <View className={styles.leftColumn}>
            <View
              className={classnames(
                styles.dot,
                node.status === 'done' && styles.dotDone,
                node.status === 'current' && styles.dotCurrent,
                node.status === 'pending' && styles.dotPending
              )}
            />
            {index < nodes.length - 1 && (
              <View
                className={classnames(
                  styles.line,
                  node.status === 'done' && styles.lineDone
                )}
              />
            )}
          </View>
          <View className={styles.content}>
            <Text
              className={classnames(
                styles.nodeTitle,
                node.status === 'pending' && styles.titlePending,
                'normalText'
              )}
            >
              {node.title}
            </Text>
            <Text className={classnames(styles.nodeDesc, 'smallText')}>
              {node.description}
            </Text>
            {node.time && (
              <Text className={classnames(styles.nodeTime, 'smallText')}>
                {node.time}
              </Text>
            )}
          </View>
        </View>
      ))}
    </View>
  );
};

export default Timeline;
