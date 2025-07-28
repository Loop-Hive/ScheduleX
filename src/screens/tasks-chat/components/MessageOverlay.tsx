import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  TextInput,
  BackHandler,
  Clipboard,
  ToastAndroid,
  Platform,
} from 'react-native';

interface MessageOverlayProps {
  visible: boolean;
  onClose: () => void;
  onReply: (text: string) => void;
  onStar: () => void;
  onDelete: () => void;
  onForward: () => void;
  onCopy: () => void;
  onEdit: (text: string) => void;
  onPin: () => void;
  onMarkCompleted: () => void;
  isStarred: boolean;
  isPinned: boolean;
  isCompleted: boolean;
  taskLists: Array<{ id: number; name: string; color: string }>;
  currentListId: number;
  onForwardToList?: (listId: number) => void;
  selectedCount?: number;
}

const MessageOverlay: React.FC<MessageOverlayProps> = ({
  visible,
  onClose,
  onReply,
  onStar,
  onDelete,
  onForward,
  onCopy,
  onEdit,
  onPin,
  onMarkCompleted,
  isStarred,
  isPinned,
  isCompleted,
  taskLists,
  currentListId,
  onForwardToList,
  selectedCount = 1,
}) => {
  const [showMenuPopover, setShowMenuPopover] = useState(false);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [editText, setEditText] = useState('');

  // Handle Android back button
  useEffect(() => {
    if (visible) {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        onClose();
        return true;
      });

      return () => backHandler.remove();
    }
  }, [visible, onClose]);

  const handleReply = () => {
    setShowReplyModal(true);
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleForward = () => {
    setShowForwardModal(true);
  };

  const handleMenuPress = () => {
    setShowMenuPopover(!showMenuPopover);
  };

  const confirmReply = () => {
    if (replyText.trim()) {
      onReply(replyText);
      setReplyText('');
      setShowReplyModal(false);
      onClose();
    }
  };

  const confirmEdit = () => {
    if (editText.trim()) {
      onEdit(editText);
      setEditText('');
      setShowEditModal(false);
      onClose();
    }
  };

  const handleForwardToList = (listId: number) => {
    if (onForwardToList) {
      onForwardToList(listId);
    } else {
      onForward();
    }
    setShowForwardModal(false);
    onClose();
  };

  const handleMenuAction = (action: () => void) => {
    setShowMenuPopover(false);
    action();
    onClose();
  };

  if (!visible) return null;

  return (
    <>
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.container}>
          {/* Close button */}
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          
          <View style={styles.headerOverlay}>
            <TouchableOpacity style={styles.actionButton} onPress={handleReply}>
              <Text style={styles.actionIcon}>↩️</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={onStar}>
              <Text style={styles.actionIcon}>⭐</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
              <Text style={styles.actionIcon}>🗑️</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleForward}>
              <Text style={styles.actionIcon}>➡️</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleMenuPress}>
              <Text style={styles.actionIcon}>⋮</Text>
            </TouchableOpacity>

            {/* Close button */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          {showMenuPopover && (
            <View style={styles.menuPopover}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleMenuAction(onCopy)}>
                <Text style={styles.menuText}>Copy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleMenuAction(handleEdit)}>
                <Text style={styles.menuText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleMenuAction(onPin)}>
                <Text style={styles.menuText}>{isPinned ? 'Unpin' : 'Pin'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleMenuAction(onMarkCompleted)}>
                <Text style={styles.menuText}>
                  {isCompleted ? 'Mark Incomplete' : 'Mark Completed'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>

      <Modal visible={showReplyModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedCount > 1 ? `Reply to ${selectedCount} Messages` : 'Reply to Message'}
            </Text>
            <TextInput
              style={styles.modalInput}
              value={replyText}
              onChangeText={setReplyText}
              placeholder="Type your reply..."
              placeholderTextColor="#9CA3AF"
              multiline
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowReplyModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmReply}>
                <Text style={styles.confirmButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showEditModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedCount > 1 ? 'Edit not available for multiple messages' : 'Edit Message'}
            </Text>
            {selectedCount === 1 ? (
              <>
                <TextInput
                  style={styles.modalInput}
                  value={editText}
                  onChangeText={setEditText}
                  placeholder="Edit your message..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  autoFocus
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setShowEditModal(false)}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={confirmEdit}>
                    <Text style={styles.confirmButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowEditModal(false)}>
                <Text style={styles.cancelButtonText}>OK</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={showForwardModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedCount > 1 ? `Forward ${selectedCount} Messages to List` : 'Forward to List'}
            </Text>
            <View style={styles.listContainer}>
              {taskLists
                .filter(list => list.id !== currentListId)
                .map(list => (
                  <TouchableOpacity
                    key={list.id}
                    style={[styles.listItem, { backgroundColor: list.color }]}
                    onPress={() => handleForwardToList(list.id)}>
                    <Text style={styles.listItemText}>{list.name}</Text>
                  </TouchableOpacity>
                ))}
            </View>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowForwardModal(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  backgroundOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    flex: 1,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#18181B',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
    zIndex: 1000,
  },
  actionButton: {
    alignItems: 'center',
    padding: 8,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 4,
    color: '#F3F4F6',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: '#374151',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  closeIcon: {
    fontSize: 20,
    color: '#F3F4F6',
    fontWeight: 'bold',
  },
  menuPopover: {
    position: 'absolute',
    top: 140,
    right: 20,
    backgroundColor: '#18181B',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
    minWidth: 160,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1001,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuText: {
    fontSize: 16,
    color: '#F3F4F6',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#18181B',
    borderRadius: 20,
    padding: 24,
    margin: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#F3F4F6',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#F3F4F6',
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#374151',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#374151',
  },
  confirmButton: {
    backgroundColor: '#6366F1',
  },
  cancelButtonText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  listContainer: {
    marginBottom: 20,
  },
  listItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
  },
  listItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    textAlign: 'center',
  },
  closeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default MessageOverlay;