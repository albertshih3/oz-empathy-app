// This is a helper function to safely get animal data for detail page
import { getAnimal } from './animalCache';
import firestore from '@react-native-firebase/firestore';

export const getAnimalDetail = async (animalId: string, personalId: string) => {
  try {
    // First try to get the animal from cache or Firestore
    const animalData = await getAnimal(animalId);
    
    if (!animalData) {
      return { error: 'Could not find animal information' };
    }
    
    // Find the personal data for this specific individual
    const personalData = animalData.personal?.find((p: any) => p.docid === personalId);
    
    if (!personalData || Object.keys(personalData).length === 0) {
      console.log("Could not find personal data for animal:", animalData);
      return { error: 'Could not find individual animal information', animal: animalData };
    }
    
    console.log("Found personal data:", personalData);
    // Return both animal data and personal data at the top level to make access easier
    return { 
      ...animalData, 
      personalData 
    };
  } catch (err) {
    console.error("Error fetching animal detail:", err);
    return { error: 'Failed to load animal information' };
  }
};
