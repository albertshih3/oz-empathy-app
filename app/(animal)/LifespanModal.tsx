import React from 'react';
import { StyleSheet } from 'react-native';
import { Dialog, View, Text, Button } from 'react-native-ui-lib';

interface LifespanDialogProps {
  isVisible: boolean;
  onClose: () => void;
  lifespan: string;
  lifespanCap: string;
  animalName: string;
}

const LifespanDialog: React.FC<LifespanDialogProps> = ({ isVisible, onClose, lifespan, lifespanCap, animalName }) => {
  return (
    <Dialog
      visible={isVisible}
      onDismiss={onClose}
      bottom
      useSafeArea
      containerStyle={styles.dialogContainer}
    >
      <View style={styles.content}>
        <Text style={styles.title}>{animalName}'s Lifespan</Text>
        <Text style={styles.lifespanText}>Lifespan in the wild: {lifespan}</Text>
        <Text style={styles.lifespanText}>Lifespan in captivity: {lifespanCap}</Text>
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
  lifespanText: {
    fontSize: 18,
    marginBottom: 10,
  },
  button: {
    marginTop: 20,
  },
});

export default LifespanDialog;