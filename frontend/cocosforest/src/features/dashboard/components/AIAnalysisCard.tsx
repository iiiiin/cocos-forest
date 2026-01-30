import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fetchAIAnalysis } from '../api';
import { useTodayData } from '../hooks/useDashboardQueries';

export const AIAnalysisCard: React.FC = () => {
  const [aiAdvice, setAiAdvice] = useState<string>('AI 분석을 준비 중입니다...');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // React Query로 오늘 데이터 가져오기 (DashboardScreen과 공유)
  const { data: todayData, isLoading: isTodayDataLoading, error: todayDataError } = useTodayData();

  useEffect(() => {
    const loadAIAnalysis = async () => {
      // todayData가 로드될 때까지 대기
      if (isTodayDataLoading || !todayData) {
        return;
      }

      try {
        setIsLoading(true);
        setAnalysisError(null);
        // AI 분석 요청
        const analysisResult = await fetchAIAnalysis(todayData);
        setAiAdvice(analysisResult);

      } catch (error) {
        setAnalysisError('AI 분석을 불러올 수 없습니다. 잠시 후 다시 시도해주세요.');
        setAiAdvice('AI 분석을 불러올 수 없습니다. 잠시 후 다시 시도해주세요.');
      } finally {
        setIsLoading(false);
      }
    };

    loadAIAnalysis();
  }, [todayData, isTodayDataLoading]);

  if (isTodayDataLoading || isLoading) {
    return (
      <View style={styles.speechBubbleContainer}>
        <View style={styles.speechBubbleOuter}>
          <View style={styles.speechBubble}>
            <View style={styles.aiResultContent}>
              <Text style={styles.aiResultText}>AI 분석을 준비 중입니다...</Text>
            </View>
          </View>
        </View>
        <View style={styles.speechTailContainer}>
          <View style={styles.speechTailShadow} />
          <View style={styles.speechTail} />
        </View>
      </View>
    );
  }

  // 데이터 로드 에러 처리
  if (todayDataError) {
    return (
      <View style={styles.speechBubbleContainer}>
        <View style={styles.speechBubbleOuter}>
          <View style={styles.speechBubble}>
            <View style={styles.aiResultContent}>
              <Text style={styles.aiResultText}>
                데이터를 불러올 수 없습니다. 계좌 연결을 확인해주세요.
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.speechTailContainer}>
          <View style={styles.speechTailShadow} />
          <View style={styles.speechTail} />
        </View>
      </View>
    );
  }

  if (analysisError) {
    return (
      <View style={styles.speechBubbleContainer}>
        <View style={styles.speechBubbleOuter}>
          <View style={styles.speechBubble}>
            <View style={styles.aiResultContent}>
              <Text style={styles.aiResultText}>{analysisError}</Text>
            </View>
          </View>
        </View>
        <View style={styles.speechTailContainer}>
          <View style={styles.speechTailShadow} />
          <View style={styles.speechTail} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.speechBubbleContainer}>
      <View style={styles.speechBubbleOuter}>
        <View style={styles.speechBubble}>
          <View style={styles.aiResultContent}>
            <Text style={styles.aiResultText}>
              {aiAdvice}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.speechTailContainer}>
        <View style={styles.speechTailShadow} />
        <View style={styles.speechTail} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  speechBubbleContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  speechBubbleOuter: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    borderRadius: 24,
  },
  speechBubble: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    maxWidth: '92%',
    minWidth: 280,
  },
  speechTailContainer: {
    position: 'relative',
    alignItems: 'center',
    marginTop: -3,
  },
  speechTailShadow: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftWidth: 22,
    borderRightWidth: 22,
    borderTopWidth: 22,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
    top: 1,
  },
  speechTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 20,
    borderRightWidth: 20,
    borderTopWidth: 20,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#ffffff',
  },
  aiResultContent: {
    gap: 12,
  },
  aiResultText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    fontWeight: 'bold',
  },
});
