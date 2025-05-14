import React from 'react';
import { StyleSheet } from 'react-native';
import { Dialog, View, Text, Button } from 'react-native-ui-lib';

interface BirthdayDialogProps {
  isVisible: boolean;
  onClose: () => void;
  birthday: string | { seconds: number; nanoseconds: number } | undefined;
  animalName: string;
}

const BirthdayDialog: React.FC<BirthdayDialogProps> = ({ isVisible, onClose, birthday, animalName }) => {
  const calculateAge = (birthdayTimestamp: { seconds: number; nanoseconds: number }) => {
    try {
      const birthDate = new Date(birthdayTimestamp.seconds * 1000);
      const today = new Date();
      
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    } catch (err) {
      console.error("Error calculating age:", err);
      return null;
    }
  };

  const formatDate = (birthday: string | { seconds: number; nanoseconds: number } | undefined) => {
    console.log("Formatting birthday:", birthday);
    
    if (!birthday) return "Unknown";
    
    // Handle Firestore timestamp format
    if (typeof birthday === 'object' && birthday.seconds !== undefined) {
      try {
        const date = new Date(birthday.seconds * 1000 + (birthday.nanoseconds || 0) / 1000000);
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      } catch (err) {
        console.error("Error formatting timestamp:", err);
        return "Invalid date";
      }
    }
    
    // Handle string format (YYYY-MM-DD)
    if (typeof birthday === 'string') {
      const [year, month, day] = birthday.split('-');
      if (year && month && day) {
        try {
          const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          });
        } catch (err) {
          console.error("Error formatting string date:", err);
          return birthday; // Return as is if there's an error
        }
      }
      return birthday; // Return as is if not in expected format
    }
    
    // If birthday is an object but doesn't have seconds property
    if (typeof birthday === 'object') {
      console.log("Unknown object format for birthday:", birthday);
      return "Invalid date format";
    }
    
    return "Unknown";
  };

  // Calculate age if birthday is in timestamp format
  const age = typeof birthday === 'object' && birthday?.seconds ? calculateAge(birthday) : null;

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
        
        {age !== null && (
          <View style={styles.ageContainer}>
            <Text style={styles.ageLabel}>Age</Text>
            <Text style={styles.age}>{age} years old</Text>
          </View>
        )}
        
        <Text style={{textAlign: 'center', marginTop: 14, fontSize: 16, lineHeight: 22}}>{`Why are there a lot of January 1st birthdays? For some animals, we may not know their exact birth day, but we know their birth year. In these cases, ACCR uses Jan. 1st as a placeholder.`}</Text>
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  birthday: {
    fontSize: 20,
    marginBottom: 18,
  },
  button: {
    marginTop: 10,
  },
  ageContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    marginBottom: 15,
    width: '80%',
  },
  ageLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 6,
  },
  age: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default BirthdayDialog;