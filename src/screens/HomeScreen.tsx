import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Text, FlatList, ActivityIndicator, TouchableOpacity, ListRenderItem } from 'react-native';
import { Calendar } from 'react-native-calendars';
import {
    deleteNote,
    getNotesByDate
} from '../api';
import { HomeScreenProps } from '../types';
import { useFocusEffect } from '@react-navigation/native';

interface Note {
    id: string;
    title: string;
    description: string;
    created_at: string;
    date: string;
}

const getCurrentDate = () => {
    const now = new Date();
    // Adjust for timezone offset to get local date
    const offset = now.getTimezoneOffset() * 60000;
    const localDate = new Date(now.getTime() - offset);
    return localDate.toISOString().split('T')[0];
};

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
    const [selectedDate, setSelectedDate] = useState(getCurrentDate());
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchNotes = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getNotesByDate(selectedDate);
            setNotes(data);
        } catch (err) {
            setError('Failed to load notes');
        } finally {
            setLoading(false);
        }
    }, [selectedDate]);

    useFocusEffect(
        useCallback(() => {
            fetchNotes();
        }, [fetchNotes])
    );

    const handleEdit = (note: Note) => {
    navigation.navigate('AddNote', { 
        selectedDate: note.date,
        noteToEdit: note
    });
};

    const handleDelete = async (noteId: string) => {
        try {
            await deleteNote(noteId);
            fetchNotes();
        } catch (err) {
            setError('Failed to delete note');
        }
    };

    const renderNoteItem: ListRenderItem<Note> = ({ item }) => (
        <View style={styles.noteContainer}>
            <View style={styles.noteItem}>
                <Text style={styles.noteTitle}>{item.title}</Text>
                <Text>{item.description}</Text>
                <Text style={styles.noteDate}>
                    {new Date(item.created_at).toLocaleString()}
                </Text>
            </View>
            <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleEdit(item)}
            >
                <Text style={styles.deleteButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(item.id)}
            >
                <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
        </View>
    );

    const handleLogout = () => {
        navigation.replace('Login');
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Notes</Text>
                <TouchableOpacity onPress={handleLogout}>
                    <Text style={styles.logoutButton}>Logout</Text>
                </TouchableOpacity>
            </View>

            <Calendar
                current={selectedDate}
                onDayPress={(day) => setSelectedDate(day.dateString)}
                markedDates={{
                    [selectedDate]: { selected: true, selectedColor: 'blue' }
                }}
            />

            {loading ? (
                <ActivityIndicator size="large" style={styles.loader} />
            ) : error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : (
                <FlatList
                    data={notes}
                    renderItem={renderNoteItem}
                    keyExtractor={(item) => item.id}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No notes for this date</Text>
                    }
                />
            )}

            <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('AddNote', { selectedDate })}
            >
                <Text style={styles.addButtonText}>+ Add Note</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    logoutButton: {
        color: 'red',
        fontWeight: 'bold',
        padding: 8,
    },
    noteContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5,
    },
    noteItem: {
        backgroundColor: '#f9f9f9',
        padding: 15,
        borderRadius: 5,
        flex: 1,
    },
    noteTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 5,
        textTransform: 'capitalize',
    },
    noteDate: {
        color: 'gray',
        fontSize: 12,
        marginTop: 5,
    },
    deleteButton: {
        backgroundColor: 'red',
        padding: 10,
        borderRadius: 5,
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editButton: {
        backgroundColor: 'green',
        padding: 10,
        borderRadius: 5,
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    addButton: {
        backgroundColor: 'blue',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        margin: 10,
    },
    addButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    loader: {
        marginTop: 20,
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginTop: 20,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: 'gray',
    },
});

export default HomeScreen;