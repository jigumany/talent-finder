
import type { Candidate, Booking, Timesheet } from './types';

export const mockCandidates: Candidate[] = [
  {
    id: '1',
    name: 'Eleanor Vance',
    role: 'History Teacher',
    rate: 50,
    rateType: 'hourly',
    rating: 4.9,
    reviews: 24,
    location: 'London, UK',
    qualifications: ['PhD in History', 'QTS'],
    availability: ['2024-08-19', '2024-08-20', '2024-08-21'],
    imageUrl: 'https://placehold.co/100x100.png',
    cvUrl: '#',
  },
  {
    id: '2',
    name: 'Marcus Thorne',
    role: 'Math Teacher',
    rate: 450,
    rateType: 'daily',
    rating: 4.8,
    reviews: 18,
    location: 'Manchester, UK',
    qualifications: ['M.Sc. in Mathematics', '5+ Years Experience', 'PGCE'],
    availability: ['2024-08-22', '2024-08-23'],
    imageUrl: 'https://placehold.co/100x100.png',
    cvUrl: '#',
  },
  {
    id: '3',
    name: 'Isabella Rossi',
    role: 'Teaching Assistant',
    rate: 25,
    rateType: 'hourly',
    rating: 5.0,
    reviews: 32,
    location: 'Birmingham, UK',
    qualifications: ['Child Development Cert.', 'First Aid'],
    availability: ['2024-08-19', '2024-08-26', '2024-08-27'],
    imageUrl: 'https://placehold.co/100x100.png',
    cvUrl: '#',
  },
    {
    id: '4',
    name: 'James Peterson',
    role: 'Science Teacher',
    rate: 55,
    rateType: 'hourly',
    rating: 4.7,
    reviews: 21,
    location: 'London, UK',
    qualifications: ['M.Ed', 'Chemistry Specialization', 'QTS'],
    availability: ['2024-08-20', '2024-08-21', '2024-08-28'],
    imageUrl: 'https://placehold.co/100x100.png',
    cvUrl: '#',
  },
  {
    id: '5',
    name: 'Priya Sharma',
    role: 'English Teacher',
    rate: 500,
    rateType: 'daily',
    rating: 4.9,
    reviews: 28,
    location: 'Bristol, UK',
    qualifications: ['MA in English Lit', 'TEFL Certified', 'PGCE'],
    availability: ['2024-08-22', '2024-08-23', '2024-08-29', '2024-08-30'],
    imageUrl: 'https://placehold.co/100x100.png',
    cvUrl: '#',
  },
];

export const mockClientBookings: Booking[] = [
  { id: 'b1', candidateName: 'Eleanor Vance', candidateRole: 'History Teacher', date: '2024-07-15', status: 'Completed' },
  { id: 'b2', candidateName: 'Marcus Thorne', candidateRole: 'Math Teacher', date: '2024-07-18', status: 'Completed' },
  { id: 'b3', candidateName: 'Isabella Rossi', candidateRole: 'Teaching Assistant', date: '2024-08-26', status: 'Confirmed' },
  { id: 'b5', candidateName: 'James Peterson', candidateRole: 'Science Teacher', date: '2024-08-28', status: 'Interview' },
];

export const mockCandidateBookings: Booking[] = [
  { id: 'b3', candidateName: 'Isabella Rossi', candidateRole: 'Teaching Assistant', date: '2024-08-26', status: 'Confirmed' },
  { id: 'b4', candidateName: 'Isabella Rossi', candidateRole: 'Teaching Assistant', date: '2024-07-20', status: 'Completed' },
];

export const mockTimesheets: Timesheet[] = [
    {id: 't1', bookingId: 'b4', candidateName: 'Isabella Rossi', date: '2024-07-20', hours: 8, status: 'Approved' },
    {id: 't2', bookingId: 'b-new', candidateName: 'Isabella Rossi', date: '2024-08-19', hours: 6, status: 'Submitted' },
]
