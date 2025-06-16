import axios from 'axios';

const API_BASE_URL = 'http://192.168.0.103:5000';

export const getNotesByDate = async (date: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/notes?date=${date}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching notes:', error);
    throw error;
  }
};

export const createNote = async (note: { title: string; description: string; date: string }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/notes`, note);
    return response.data;
  } catch (error) {
    console.error('Error creating note:', error);
    throw error;
  }
};

export const updateNote = async (noteId: string, updates: { 
  title?: string; 
  description?: string; 
  date?: string 
}) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/notes/${noteId}`, updates);
    return response.data;
  } catch (error) {
    console.error('Error updating note:', error);
    throw error;
  }
};

export const deleteNote = async (noteId: string) => {
  try {
    await axios.delete(`${API_BASE_URL}/notes/${noteId}`);
  } catch (error) {
    console.error('Error deleting note:', error);
    throw error;
  }
};