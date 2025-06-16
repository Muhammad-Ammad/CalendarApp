import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export interface Note {
  id: string;
  title: string;
  description: string;
  created_at: string;
  date: string;
}

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  AddNote: {
    selectedDate: string;
    noteToEdit?: Note;
  };
};

// Navigation props
export type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;
export type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;
export type AddNoteScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddNote'>;

// Route props
export type AddNoteScreenRouteProp = RouteProp<RootStackParamList, 'AddNote'>;

// Screen props interfaces
export interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

export type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export interface AddNoteScreenProps {
  navigation: AddNoteScreenNavigationProp;
  route: AddNoteScreenRouteProp;
}
