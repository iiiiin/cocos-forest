import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { Challenge } from '../types';
import type { Transaction } from '../../dashboard/types';
import { colors } from '../../../shared/styles/commonStyles';

interface ChallengeSpecialSectionProps {
  challenge: Challenge;
  challengeDetectionResult: {
    transportUsed: boolean;
    cafeUsed: boolean;
    transportTransactions: Transaction[];
    cafeTransactions: Transaction[];
  };
  isAttendanceLoading: boolean;
  tumblerVerificationFailed: boolean;
  onAttendanceCheck: () => void;
  onTumblerVerification: () => void;
}

const ChallengeSpecialSection: React.FC<ChallengeSpecialSectionProps> = ({
  challenge,
  challengeDetectionResult,
  isAttendanceLoading,
  tumblerVerificationFailed,
  onAttendanceCheck,
  onTumblerVerification,
}) => {
  const renderAttendanceSection = () => (
    <View style={styles.specialSection}>
      <TouchableOpacity 
        style={[
          styles.actionButton,
          (challenge.status === 'completed' || isAttendanceLoading) && styles.actionButtonDisabled
        ]}
        onPress={onAttendanceCheck}
        disabled={challenge.status === 'completed' || isAttendanceLoading}
      >
        <Text style={styles.actionButtonText}>
          {challenge.status === 'completed' ? '출석체크 완료' : 
           isAttendanceLoading ? '출석체크 중...' : '출석체크 하기'}
        </Text>
      </TouchableOpacity>
    </View>
  );


  const renderTransportSection = () => (
    <View style={styles.specialSection}>
      <Text style={styles.autoCheckText}>
        {challenge.status === 'completed' 
          ? '대중교통 이용 완료!' 
          : challengeDetectionResult.transportUsed 
            ? '대중교통 이용이 감지되었습니다! 챌린지가 자동으로 완료되었습니다.'
            : '소비내역을 확인하여 자동 판단됩니다'
        }
      </Text>
      {challengeDetectionResult.transportTransactions.length > 0 && (
        <View style={styles.detectedTransactions}>
          <Text style={styles.detectedTransactionsTitle}>감지된 거래:</Text>
          {challengeDetectionResult.transportTransactions.slice(0, 3).map((tx, index) => (
            <Text key={index} style={styles.detectedTransactionItem}>
              • {tx.merchantName} ({tx.amountKrw.toLocaleString()}원)
            </Text>
          ))}
        </View>
      )}
    </View>
  );

  const renderTumblerSection = () => (
    <View style={styles.specialSection}>
      <Text style={styles.autoCheckText}>
        {challenge.status === 'completed' 
          ? '텀블러 인증 완료!' 
          : challengeDetectionResult.cafeUsed 
            ? '카페 이용이 감지되었습니다! 텀블러 인증을 진행하세요.'
            : '카페 이용 후 텀블러 인증이 필요합니다'
        }
      </Text>
      {challengeDetectionResult.cafeTransactions.length > 0 && (
        <View style={styles.detectedTransactions}>
          <Text style={styles.detectedTransactionsTitle}>감지된 카페 거래:</Text>
          {challengeDetectionResult.cafeTransactions.slice(0, 3).map((tx, index) => (
            <Text key={index} style={styles.detectedTransactionItem}>
              • {tx.merchantName} ({tx.amountKrw.toLocaleString()}원)
            </Text>
          ))}
        </View>
      )}
      {challenge.status !== 'completed' && challengeDetectionResult.cafeUsed && !challenge.rewardClaimed && (
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onTumblerVerification}
        >
          <Text style={styles.actionButtonText}>영수증 인증하기</Text>
        </TouchableOpacity>
      )}
      {tumblerVerificationFailed && (
        <View style={styles.failedNotice}>
          <Text style={styles.failedNoticeText}>
            ⚠️ 텀블러 인증에 실패했습니다. 다시 시도해주세요.
          </Text>
        </View>
      )}
    </View>
  );

  switch (challenge.type) {
    case 'attendance':
      return renderAttendanceSection();
    case 'transport':
      return renderTransportSection();
    case 'tumbler':
      return renderTumblerSection();
    default:
      return null;
  }
};

const styles = StyleSheet.create({
  specialSection: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  actionButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  autoCheckText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  detectedTransactions: {
    marginTop: 8,
    padding: 8,
    backgroundColor: colors.greenLight,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  detectedTransactionsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  detectedTransactionItem: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  failedNotice: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#F44336',
  },
  failedNoticeText: {
    fontSize: 12,
    color: '#D32F2F',
    fontWeight: '500',
    lineHeight: 16,
  },
});

export default ChallengeSpecialSection;
