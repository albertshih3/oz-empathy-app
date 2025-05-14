import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { Dialog, View, Text, Button, Card, Icon, Colors } from 'react-native-ui-lib';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';

interface LifespanDialogProps {
  isVisible: boolean;
  onClose: () => void;
  lifespan: string;
  lifespanCap: string;
  animalName: string;
}

const LifespanDialog: React.FC<LifespanDialogProps> = ({ isVisible, onClose, lifespan, lifespanCap, animalName }) => {
  const isLonger = (lifespanCap && lifespan) ? parseFloat(lifespanCap) > parseFloat(lifespan) : false;
  const screenWidth = Dimensions.get('window').width;

  return (
    <Dialog
      visible={isVisible}
      onDismiss={onClose}
      bottom
      useSafeArea
      containerStyle={styles.dialogContainer}
      ignoreBackgroundPress={false}
    >
      <Animated.View entering={SlideInUp.duration(400)}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="timer-outline" size={26} color={Colors.blue30} />
          <ThemedText type="title" style={styles.title}>{animalName}'s Lifespan</ThemedText>
          <Button 
            iconSource={() => <MaterialCommunityIcons name="close" size={24} color={Colors.dark60} />}
            style={styles.closeButton} 
            backgroundColor="transparent"
            onPress={onClose} 
          />
        </View>

        <View style={styles.content}>
          <Animated.View entering={FadeIn.delay(200).duration(400)}>
            <Card style={styles.infoCard}>
              <Card.Section
                content={[
                  { 
                    text: 'In the Wild',
                    text60BO: true,
                    $textDefault: true 
                  },
                  { 
                    text: lifespan, 
                    text20: true,
                    $textDefault: true,
                    style: { color: Colors.blue30, marginVertical: 8 }
                  },
                  { 
                    text: 'Animals in their natural habitat face predators, disease, competition for resources, and environmental challenges.',
                    text80: true,
                    $textDefaultLight: true
                  }
                ]}
                style={styles.cardSection}
              />
            </Card>
          </Animated.View>

          <Animated.View entering={FadeIn.delay(300).duration(400)}>
            <Card style={styles.infoCard}>
              <Card.Section
                content={[
                  { 
                    text: 'In Captivity',
                    text60BO: true,
                    $textDefault: true 
                  },
                  { 
                    text: lifespanCap, 
                    text20: true,
                    $textDefault: true,
                    style: { color: isLonger ? Colors.green30 : Colors.blue30, marginVertical: 8 }
                  },
                  { 
                    text: 'In zoos and sanctuaries, animals often live longer due to veterinary care, regular meals, and protection from predators and environmental threats.',
                    text80: true,
                    $textDefaultLight: true
                  }
                ]}
                style={styles.cardSection}
              />
            </Card>
          </Animated.View>

          {isLonger && (
            <Animated.View entering={FadeIn.delay(400).duration(400)}>
              <Card style={[styles.infoCard, styles.noteCard]}>
                <MaterialCommunityIcons name="information-outline" size={20} color={Colors.blue30} style={styles.noteIcon} />
                <ThemedText style={styles.noteText}>
                  Animals in human care typically live longer than their wild counterparts due to consistent nutrition, veterinary care, and lack of predators.
                </ThemedText>
              </Card>
            </Animated.View>
          )}
        </View>

        <Button 
          label="Close" 
          onPress={onClose} 
          style={styles.button}
          backgroundColor={Colors.blue30}
        />
      </Animated.View>
    </Dialog>
  );
};

const styles = StyleSheet.create({
  dialogContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark70,
  },
  content: {
    padding: 20,
  },
  title: {
    marginLeft: 10,
    flex: 1,
    fontSize: 22,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardSection: {
    padding: 16,
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: Colors.blue70,
  },
  noteIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 10,
    height: 50,
  },
});

export default LifespanDialog;