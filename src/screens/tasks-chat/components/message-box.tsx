import React, { useState } from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View, Linking, Alert, ToastAndroid, Platform } from 'react-native'
import Clipboard from '@react-native-clipboard/clipboard'
import { ClipboardIcon, SeenIcon } from '../../../assets/icons/tasks-chat'

interface MessageBoxProps {
  id: number;
  title: string;
  imageUri?: string;
  type: 'task' | 'message' | 'image' | 'url';
  urlData?: {
    url: string;
    title?: string;
    description?: string;
    image?: string;
  };
  description: string;
  completed: boolean;
  completedAt?: string;
  timestamp: string;
  handleTaskPress: (id: number) => void;
  handleTaskLongPress: (id: number) => void;
  priority: 'high' | 'medium' | 'low';
  getPriorityColor: (priority: string) => string;
  showCompletedTasks: boolean;
  seen?: boolean;
  starred?: boolean;
  pinned?: boolean;
  isSelected?: boolean;
  isMultiSelectMode?: boolean;
}

const MessageBox: React.FC<MessageBoxProps> = ({id, title,imageUri, type, urlData, description,completed, completedAt, timestamp, handleTaskPress, handleTaskLongPress, priority, getPriorityColor, showCompletedTasks, seen = false, starred = false, pinned = false, isSelected = false, isMultiSelectMode = false }) => {

  const handleCopyToClipboard = () => {
    const textToCopy = `${title}${description ? '\n' + description : ''}`;
    Clipboard.setString(textToCopy);
    
    if (Platform.OS === 'android') {
      ToastAndroid.show('Copied to Clipboard', ToastAndroid.SHORT);
    } else {
      Alert.alert('Success', 'Copied to Clipboard');
    }
  };
  return (
     <View style={[
       styles.messageContainer,
       isMultiSelectMode && styles.messageContainerMultiSelect,
       isSelected && styles.selectedMessageContainer
     ]}>
          
          {/* Checkbox positioned outside and to the left */}
          <TouchableOpacity 
            style={[
              styles.checkbox, 
              completed && styles.checkedBox,
              isMultiSelectMode && styles.checkboxMultiSelect
            ]}
            onPress={() => !isMultiSelectMode ? handleTaskPress(id) : null}>
            {completed && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
          
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => isMultiSelectMode ? handleTaskPress(id) : handleTaskPress(id)}
            onLongPress={() => handleTaskLongPress(id)}
            delayLongPress={500}
            style={[
              styles.messageBubble,
              completed && styles.completedMessageBubble,
            ]}>
            {/* Header with title and status icons */}
            <View style={styles.messageHeader}>
              <View style={styles.titleContainer}>
                  {title ? (
              <Text style={styles.messageDescription}>{title}</Text>
            ) : null}
                <View style={styles.statusIcons}>
                  {pinned && <Text style={styles.statusIcon}>📌</Text>}
                  {starred && <Text style={styles.statusIcon}>⭐</Text>}
                </View>
              </View>
            </View>
    
            {/* Image content */}
            {type === 'image' && imageUri && (
              <Image source={{uri: imageUri}} style={styles.messageImage} />
            )}
    
            {/* URL content */}
            {type === 'url' && urlData && (
              <TouchableOpacity
                style={styles.urlContainer}
                onPress={() => Linking.openURL(urlData!.url)}>
                <Text style={styles.urlTitle}>{urlData.title || 'Link'}</Text>
                <Text style={styles.urlText} numberOfLines={1}>
                  {urlData.url}
                </Text>
              </TouchableOpacity>
            )}
    
            {/* Description */}
          
    
            {/* Footer with priority, clipboard, time, and seen status */}
            <View style={styles.messageFooter}>
           
              
              {/* Clipboard icon */}
              <TouchableOpacity 
                style={styles.iconButton} 
                onPress={handleCopyToClipboard}
                activeOpacity={0.7}>
                <ClipboardIcon 
                  width={14} 
                  height={14} 
                  color={'#6B7280'} 
                />
              </TouchableOpacity>

              <Text style={styles.messageTime}>
                {showCompletedTasks && completedAt
                  ? `${completedAt}`
                  : timestamp}
              </Text>

              {/* Seen icon */}
              <View style={styles.iconButton}>
                <SeenIcon 
                  width={14} 
                  height={14} 
                  color={seen ? '#3B82F6' : '#6B7280'} 
                />
              </View>
            </View>
          </TouchableOpacity>
        </View>
  )
}


const styles = StyleSheet.create({
  
  
  messageContainer: {
    marginBottom: 8,
    alignItems: 'flex-end',
    width: '100%',
    position: 'relative',
    paddingVertical: 3,
    paddingHorizontal:10,
  },
  messageContainerMultiSelect: {
    // No extra padding needed since we removed selection checkboxes
  },
  selectedMessageContainer: {
    backgroundColor: '#60a5fa60',
    borderRadius: 20,
  },
  messageBubble: {
    backgroundColor: '#202023',
    borderRadius: 18,
    padding: 10,
    maxWidth: '90%',
    minWidth: '30%',
  },
  completedMessageBubble: {
    backgroundColor: '#D1FAE5',
  },
  messageHeader: {
    marginBottom: 4,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 12,
    marginLeft: 4,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 8,
    top: 12,
  },
  checkboxMultiSelect: {
    left: 8,
  },
  checkedBox: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  messageTitle: {
    fontSize: 15,
    color: '#fff',
    flexShrink: 1,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.8,
  },
  messageImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 4,
  },
  urlContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 8,
    marginTop: 4,
    marginBottom: 4,
  },
  urlTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1155CC',
    marginBottom: 2,
  },
  urlText: {
    fontSize: 12,
    color: '#6B7280',
  },
  messageDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
      lineHeight: 18,
    flexWrap: 'wrap',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  messageTime: {
    fontSize: 11,
    color: '#6B7280',
    opacity: 0.8,
  },
  iconButton: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginHorizontal: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
});

export default MessageBox