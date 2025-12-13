
'use server';

import { initializeFirebase } from '@/firebase';
import {
  collection,
  writeBatch,
  getDocs,
  QuerySnapshot,
  DocumentData,
  doc,
} from 'firebase/firestore';

// Data to preload
const collegesToPreload = [
  {
    id: 'cbit',
    name: 'Chaitanya Bharathi Institute of Technology (CBIT)',
    collegeType: 'Engineering',
    city: 'Hyderabad',
    state: 'Telangana',
    approvalStatus: true,
    subscriptionId: 'sub_standard_2024',
  },
  {
    id: 'osmania',
    name: 'Osmania University',
    collegeType: 'Degree',
    city: 'Hyderabad',
    state: 'Telangana',
    approvalStatus: true,
    subscriptionId: 'sub_standard_2024',
  },
  {
    id: 'nizam',
    name: 'Nizam College',
    collegeType: 'Degree',
    city: 'Hyderabad',
    state: 'Telangana',
    approvalStatus: true,
    subscriptionId: 'sub_standard_2024',
  },
  {
    id: 'st-francis',
    name: 'St. Francis College for Women',
    collegeType: 'Women’s',
    city: 'Hyderabad',
    state: 'Telangana',
    approvalStatus: true,
    subscriptionId: 'sub_standard_2024',
  },
  {
    id: 'loyola',
    name: 'Loyola Academy',
    collegeType: 'Degree',
    city: 'Hyderabad',
    state: 'Telangana',
    approvalStatus: true,
    subscriptionId: 'sub_standard_2024',
  },
  {
    id: 'aurora',
    name: 'Aurora’s Degree & PG College',
    collegeType: 'Degree',
    city: 'Hyderabad',
    state: 'Telangana',
    approvalStatus: true,
    subscriptionId: 'sub_basic_2024',
  },
  {
    id: 'mjcet',
    name: 'Muffakham Jah College of Engineering and Technology',
    collegeType: 'Engineering',
    city: 'Hyderabad',
    state: 'Telangana',
    approvalStatus: true,
    subscriptionId: 'sub_premium_2024',
  },
  {
    id: 'stanley',
    name: 'Stanley College of Engineering and Technology for Women',
    collegeType: 'Women’s',
    city: 'Hyderabad',
    state: 'Telangana',
    approvalStatus: false, // Example of a non-approved college
    subscriptionId: 'sub_none_2024',
  },
  {
    id: 'vasavi',
    name: 'Vasavi College of Engineering',
    collegeType: 'Engineering',
    city: 'Hyderabad',
    state: 'Telangana',
    approvalStatus: true,
    subscriptionId: 'sub_premium_2024',
  },
  {
    id: 'av-college',
    name: 'AV College of Arts, Science and Commerce',
    collegeType: 'Degree',
    city: 'Hyderabad',
    state: 'Telangana',
    approvalStatus: true,
    subscriptionId: 'sub_basic_2024',
  },
];

const subscriptionsToPreload = [
    {
        id: "sub_basic_2024",
        planName: "Basic",
        price: 5000,
        duration: 365,
        startDate: "2024-01-01T00:00:00Z",
        endDate: "2024-12-31T23:59:59Z",
    },
    {
        id: "sub_standard_2024",
        planName: "Standard",
        price: 10000,
        duration: 365,
        startDate: "2024-01-01T00:00:00Z",
        endDate: "2024-12-31T23:59:59Z",
    },
    {
        id: "sub_premium_2024",
        planName: "Premium",
        price: 20000,
        duration: 365,
        startDate: "2024-01-01T00:00:00Z",
        endDate: "2024-12-31T23:59:59Z",
    },
    {
        id: "sub_none_2024",
        planName: "None",
        price: 0,
        duration: 0,
        startDate: "2024-01-01T00:00:00Z",
        endDate: "2024-01-01T00:00:00Z",
    }
];

export async function preloadColleges() {
  try {
    console.log('Preloading colleges and subscriptions into Firestore...');
    const { firestore } = initializeFirebase();
    const collegesCollection = collection(firestore, 'colleges');
    const subscriptionsCollection = collection(firestore, 'subscriptions');

    // Check if the collections are empty
    const collegesSnapshot = await getDocs(collegesCollection);
    const subscriptionsSnapshot = await getDocs(subscriptionsCollection);
    
    if (!collegesSnapshot.empty && !subscriptionsSnapshot.empty) {
      console.log('Collections are not empty. Skipping preload.');
      return {
        success: true,
        message: 'Colleges and subscriptions collections already contain data.',
      };
    }

    const batch = writeBatch(firestore);

    collegesToPreload.forEach(college => {
      const docRef = doc(firestore, 'colleges', college.id);
      batch.set(docRef, college);
    });

    subscriptionsToPreload.forEach(sub => {
      const docRef = doc(firestore, 'subscriptions', sub.id);
      const subWithDates = {
        ...sub,
        startDate: new Date(sub.startDate),
        endDate: new Date(sub.endDate)
      }
      batch.set(docRef, subWithDates);
    });

    await batch.commit();
    console.log('Successfully preloaded colleges and subscriptions data.');
    return { success: true, message: 'Successfully preloaded colleges and subscriptions data.' };
  } catch (error) {
    console.error('Error preloading data:', error);
    return {
      success: false,
      message: 'Failed to preload data.',
      error,
    };
  }
}
