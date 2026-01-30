import * as React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, } from 'react-native';

interface WithdrawModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  withdrawInput: string;
  onInputChange: (text: string) => void;
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({
  visible,
  onCancel,
  onConfirm,
  withdrawInput,
  onInputChange,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.withdrawModalOverlay}>
        <View style={styles.withdrawModalContainer}>
          {/* 회원탈퇴 아이콘 */}
          <View style={styles.withdrawIconContainer}>
            <Text style={styles.withdrawIcon}>🗑️</Text>
          </View>
          
          {/* 제목 */}
          <Text style={styles.withdrawTitle}>정말 탈퇴하시겠어요?</Text>
          
          {/* 경고 메시지 */}
          <Text style={styles.withdrawWarningMessage}>
            탈퇴하시면 지금까지의 모든 활동 기록이 삭제되고 복구할 수 없습니다.
          </Text>
          
          {/* 입력 확인 섹션 */}
          <View style={styles.withdrawInputSection}>
            <Text style={styles.withdrawInputInstruction}>
              정말 탈퇴하시려면 아래에 '회원탈퇴'를 입력해주세요.
            </Text>
            <TextInput
              style={styles.withdrawTextInput}
              value={withdrawInput}
              onChangeText={onInputChange}
              placeholder="회원탈퇴"
              placeholderTextColor="#999"
            />
          </View>
          
          {/* 버튼들 */}
          <View style={styles.withdrawButtons}>
            <TouchableOpacity style={styles.withdrawCancelButton} onPress={onCancel}>
              <Text style={styles.withdrawCancelButtonText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.withdrawConfirmButton} onPress={onConfirm}>
              <Text style={styles.withdrawConfirmButtonText}>탈퇴하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  withdrawModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  withdrawModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  withdrawIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFE5E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  withdrawIcon: {
    fontSize: 24,
  },
  withdrawTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
  },
  withdrawWarningMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  withdrawInputSection: {
    backgroundColor: '#FFE5E5',
    borderRadius: 8,
    padding: 16,
    width: '100%',
    marginBottom: 24,
  },
  withdrawInputInstruction: {
    fontSize: 14,
    color: '#FF3B30',
    marginBottom: 12,
    textAlign: 'center',
  },
  withdrawTextInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    textAlign: 'center',
  },
  withdrawButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  withdrawCancelButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  withdrawCancelButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '500',
  },
  withdrawConfirmButton: {
    flex: 1,
    backgroundColor: '#8B4513',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  withdrawConfirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default WithdrawModal;

