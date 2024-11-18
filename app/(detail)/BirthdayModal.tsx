import React from 'react';
import { StyleSheet } from 'react-native';
import { Dialog, View, Text, Button } from 'react-native-ui-lib';

interface BirthdayDialogProps {
  isVisible: boolean;
  onClose: () => void;
  birthday: { seconds: number; nanoseconds: number };
  animalName: string;
}

const BirthdayDialog: React.FC<BirthdayDialogProps> = ({ isVisible, onClose, birthday, animalName }) => {
  const formatDate = (timestamp: { seconds: number; nanoseconds: number }) => {
    const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <Dialog
      visible={isVisible}
      onDismiss={onClose}
      bottom
      useSafeArea
      containerStyle={styles.dialogContainer}
    >
      <View style={styles.content}>
        <Text style={styles.title}>{animalName}'s Birthday</Text>
        <Text style={styles.birthday}>{formatDate(birthday)}</Text>
        <Text style={{textAlign: 'center'}}>{`Why are there a lot of January 1st birthdays? For some animals, we may not know their exact birth day, but we know their birth year. In these cases, ACCR uses Jan. 1st as a placeholder.`}</Text>
        <Button label="Close" onPress={onClose} style={styles.button} />
      </View>
    </Dialog>
  );
};

const styles = StyleSheet.create({
  dialogContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  birthday: {
    fontSize: 18,
    marginBottom: 20,
  },
  button: {
    marginTop: 10,
  },
});

export default BirthdayDialog;