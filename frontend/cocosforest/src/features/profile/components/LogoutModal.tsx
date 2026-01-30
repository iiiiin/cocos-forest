import * as React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, } from 'react-native';

interface LogoutModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({
  visible,
  onCancel,
  onConfirm,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.logoutModalOverlay}>
        <View style={styles.logoutModalContainer}>
          {/* 로그아웃 아이콘 */}
          <View style={styles.logoutIconContainer}>
            <Text style={styles.logoutIcon}>🚪</Text>
          </View>
          
          {/* 제목 */}
          <Text style={styles.logoutTitle}>로그아웃</Text>
          
          {/* 확인 메시지 */}
          <Text style={styles.logoutMessage}>정말로 로그아웃 하시겠습니까?</Text>
          
          {/* 버튼들 */}
          <View style={styles.logoutButtons}>
            <TouchableOpacity style={styles.logoutCancelButton} onPress={onCancel}>
              <Text style={styles.logoutCancelButtonText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutConfirmButton} onPress={onConfirm}>
              <Text style={styles.logoutConfirmButtonText}>로그아웃</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  logoutModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoutModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  logoutIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFE5E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoutIcon: {
    fontSize: 24,
  },
  logoutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  logoutMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  logoutButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  logoutCancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutCancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  logoutConfirmButton: {
    flex: 1,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutConfirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default LogoutModal;

