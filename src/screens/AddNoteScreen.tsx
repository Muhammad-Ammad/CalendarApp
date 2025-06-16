import React, { useState, useEffect, useCallback } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { createNote, updateNote } from '../api';  // Make sure to import updateNote
import { AddNoteScreenProps } from '../types';

const AddNoteScreen: React.FC<AddNoteScreenProps> = ({ route, navigation }) => {
  const { selectedDate, noteToEdit } = route.params || {};
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const setScreenTitle = useCallback((isEdit: boolean) => {
    navigation.setOptions({ title: isEdit ? 'Edit Note' : 'Add Note' });
}, [navigation]);

  useEffect(() => {
    if (noteToEdit) {
        setIsEditing(true);
        setTitle(noteToEdit.title);
        setDescription(noteToEdit.description);
        setScreenTitle(true);
    } else {
        setScreenTitle(false);
    }
}, [noteToEdit, setScreenTitle]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    setLoading(true);
    try {
      if (isEditing && noteToEdit) {
        await updateNote(noteToEdit.id, {
          title,
          description,
          date: selectedDate || noteToEdit.date,
        });
      } else {
        await createNote({
          title,
          description,
          date: selectedDate,
        });
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', `Failed to ${isEditing ? 'update' : 'save'} note`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, styles.descriptionInput]}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <Button
        title={loading ? (isEditing ? "Updating..." : "Saving...") : (isEditing ? "Update Note" : "Save Note")}
        onPress={handleSave}
        disabled={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
  },
});

export default AddNoteScreen;