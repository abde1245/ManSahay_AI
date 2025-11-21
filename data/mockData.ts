
import { Doctor } from '../types';

export const MOCK_DOCTORS: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Sarah Jenkins',
    specialty: 'Psychiatrist',
    rating: 4.9,
    location: 'Manhattan, NY (Video Available)',
    imageUrl: 'https://picsum.photos/id/64/200',
    price: '$150/session',
    slots: ['Today 4:00 PM', 'Tomorrow 10:00 AM', 'Fri 2:00 PM'],
    available: 'Today, 4:00 PM'
  },
  {
    id: '2',
    name: 'Dr. Aris Thorne',
    specialty: 'Trauma Specialist',
    rating: 4.8,
    location: 'Brooklyn, NY',
    imageUrl: 'https://picsum.photos/id/91/200',
    price: '$130/session',
    slots: ['Tomorrow 11:00 AM', 'Tomorrow 3:00 PM', 'Fri 9:00 AM'],
    available: 'Tomorrow, 11:00 AM'
  },
  {
    id: '3',
    name: 'Dr. Emily Chen',
    specialty: 'Child Therapist',
    rating: 5.0,
    location: 'Queens, NY (In-person)',
    imageUrl: 'https://picsum.photos/id/65/200',
    price: '$120/session',
    slots: ['Wed 4:00 PM', 'Thu 10:00 AM'],
    available: 'Wed, 4:00 PM'
  },
  {
    id: '4',
    name: 'Dr. Michael Ross',
    specialty: 'Psychiatrist',
    rating: 4.7,
    location: 'Video Call Only',
    imageUrl: 'https://picsum.photos/id/1005/200',
    price: '$160/session',
    slots: ['Today 5:30 PM', 'Mon 9:00 AM'],
    available: 'Today, 5:30 PM'
  }
];
