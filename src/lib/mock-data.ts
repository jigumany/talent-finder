

import type { Candidate, Booking, Timesheet, Job, Application } from './types';
import images from './placeholder-images.json';

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
    availability: ['2024-08-19', '2024-08-20', '2024-08-21', '2025-01-20', '2025-01-21'],
    imageUrl: images['candidate-1'].src,
    cvUrl: '#',
    bio: 'Passionate historian with a knack for making the past come alive for students of all ages.',
    reviewsData: [
      { reviewerName: 'Greenwood Academy', rating: 5, comment: 'Eleanor is an exceptional educator. Her passion for history is infectious, and our students were thoroughly engaged.', date: '2024-06-10' },
      { reviewerName: 'Northwood School', rating: 4, comment: 'A very knowledgeable and professional teacher. We would happily have her back.', date: '2024-05-22' },
    ]
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
    imageUrl: images['candidate-2'].src,
    cvUrl: '#',
    bio: 'An experienced math educator who excels at breaking down complex concepts into understandable lessons.',
    reviewsData: [
      { reviewerName: 'Oakfield High', rating: 5, comment: 'Marcus has a fantastic ability to connect with students and make math accessible. Highly recommended.', date: '2024-07-01' },
    ]
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
    imageUrl: images['candidate-3'].src,
    cvUrl: '#',
    bio: 'A nurturing and patient teaching assistant dedicated to creating a supportive and positive learning environment.',
     reviewsData: [
      { reviewerName: 'St. Jude Primary', rating: 5, comment: 'Isabella was an absolute star. The children adored her, and she was incredibly supportive to our staff.', date: '2024-06-15' },
      { reviewerName: 'Bright Futures Nursery', rating: 5, comment: 'Her calm and patient demeanor was perfect for our early years students.', date: '2024-05-30' },
    ]
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
    imageUrl: images['candidate-4'].src,
    cvUrl: '#',
    bio: 'Engaging science teacher who loves sparking curiosity through hands-on experiments and real-world examples.',
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
    imageUrl: images['candidate-5'].src,
    cvUrl: '#',
    bio: 'A literature enthusiast committed to developing strong reading and writing skills in her students.',
  },
];

export const mockClientBookings: Booking[] = [
  { id: 'b1', candidateName: 'Eleanor Vance', candidateRole: 'History Teacher', date: '2024-07-15', status: 'Completed' },
  { id: 'b2', candidateName: 'Marcus Thorne', candidateRole: 'Math Teacher', date: '2024-07-18', status: 'Completed' },
  { id: 'b3', candidateName: 'Isabella Rossi', candidateRole: 'Teaching Assistant', date: '2024-08-26', status: 'Confirmed' },
  { id: 'b5', candidateName: 'James Peterson', candidateRole: 'Science Teacher', date: '2024-08-28', status: 'Interview' },
  { id: 'b6', candidateName: 'Priya Sharma', candidateRole: 'English Teacher', date: '2024-07-22', status: 'Completed' },
  { id: 'b7', candidateName: 'Eleanor Vance', candidateRole: 'History Teacher', date: '2024-08-12', status: 'Confirmed' },
  { id: 'b8', candidateName: 'Marcus Thorne', candidateRole: 'Math Teacher', date: '2024-08-15', status: 'Confirmed' },
  { id: 'b9', candidateName: 'Priya Sharma', candidateRole: 'English Teacher', date: '2024-08-21', status: 'Interview' },
  { id: 'b10', candidateName: 'Isabella Rossi', candidateRole: 'Teaching Assistant', date: '2024-08-05', status: 'Completed' },
  { id: 'b11', candidateName: 'James Peterson', candidateRole: 'Science Teacher', date: '2024-08-01', status: 'Completed' },
  { id: 'b12', candidateName: 'Eleanor Vance', candidateRole: 'History Teacher', date: '2024-09-02', status: 'Confirmed' },
  { id: 'b13', candidateName: 'Priya Sharma', candidateRole: 'English Teacher', date: '2024-09-05', status: 'Interview' },
  { id: 'b14', candidateName: 'Marcus Thorne', candidateRole: 'Math Teacher', date: '2024-09-09', status: 'Confirmed' },
  { id: 'b15', candidateName: 'Isabella Rossi', candidateRole: 'Teaching Assistant', date: '2024-07-29', status: 'Completed' },
  // 2025 Data
  { id: 'b16', candidateName: 'Eleanor Vance', candidateRole: 'History Teacher', date: '2025-01-20', status: 'Confirmed' },
  { id: 'b17', candidateName: 'James Peterson', candidateRole: 'Science Teacher', date: '2025-01-22', status: 'Interview' },
  { id: 'b18', candidateName: 'Marcus Thorne', candidateRole: 'Math Teacher', date: '2025-02-10', status: 'Confirmed' },
  { id: 'b19', candidateName: 'Priya Sharma', candidateRole: 'English Teacher', date: '2025-02-14', status: 'Completed' },
  { id: 'b20', candidateName: 'Isabella Rossi', candidateRole: 'Teaching Assistant', date: '2025-11-03', status: 'Completed' },
  { id: 'b21', candidateName: 'Eleanor Vance', candidateRole: 'History Teacher', date: '2025-11-10', status: 'Confirmed' },
  { id: 'b22', candidateName: 'Marcus Thorne', candidateRole: 'Math Teacher', date: '2025-11-17', status: 'Interview' },
];

export const mockCandidateBookings: Booking[] = [
  { id: 'b3', candidateName: 'Isabella Rossi', candidateRole: 'Teaching Assistant', date: '2024-08-26', status: 'Confirmed' },
  { id: 'b4', candidateName: 'Isabella Rossi', candidateRole: 'Teaching Assistant', date: '2024-07-20', status: 'Completed' },
];

export const mockTimesheets: Timesheet[] = [
    {id: 't1', bookingId: 'b4', candidateName: 'Isabella Rossi', date: '2024-07-20', hours: 8, status: 'Approved' },
    {id: 't2', bookingId: 'b-new', candidateName: 'Isabella Rossi', date: '2024-08-19', hours: 6, status: 'Submitted' },
];

export const mockJobs: Job[] = [
    {
        id: 'job-1',
        title: 'Senior History Teacher',
        description: 'Seeking an experienced history teacher for A-Level students. Must have a passion for modern history.',
        datePosted: '2024-08-15T10:00:00Z',
        status: 'Active',
        applicants: 12,
        shortlisted: 3,
    },
    {
        id: 'job-2',
        title: 'Primary School Teaching Assistant',
        description: 'A supportive and nurturing teaching assistant for our Year 3 class. Experience with special needs is a plus.',
        datePosted: '2024-08-10T14:30:00Z',
        status: 'Active',
        applicants: 25,
        shortlisted: 5,
    },
    {
        id: 'job-3',
        title: 'Urgent: Substitute Maths Teacher',
        description: 'Required for immediate start for a two-week cover. Must be qualified to teach GCSE level.',
        datePosted: '2024-08-01T09:00:00Z',
        status: 'Closed',
        applicants: 8,
        shortlisted: 1,
    }
];

export const mockApplications: Application[] = [
    // Job 1: Senior History Teacher
    { id: 'app-1', jobId: 'job-1', candidateId: '1', status: 'Interview', dateApplied: '2024-08-16T10:00:00Z' },
    { id: 'app-2', jobId: 'job-1', candidateId: '5', status: 'Applied', dateApplied: '2024-08-17T11:00:00Z' },
    { id: 'app-3', jobId: 'job-1', candidateId: '4', status: 'Shortlisted', dateApplied: '2024-08-16T14:00:00Z' },
    { id: 'app-7', jobId: 'job-1', candidateId: '2', status: 'Applied', dateApplied: '2024-08-18T09:00:00Z' },


    // Job 2: Primary School Teaching Assistant
    { id: 'app-4', jobId: 'job-2', candidateId: '3', status: 'Offer', dateApplied: '2024-08-11T09:00:00Z' },
    { id: 'app-5', jobId: 'job-2', candidateId: '2', status: 'Applied', dateApplied: '2024-08-12T15:00:00Z' },
    { id: 'app-8', jobId: 'job-2', candidateId: '1', status: 'Applied', dateApplied: '2024-08-13T16:00:00Z' },
    { id: 'app-9', jobId: 'job-2', candidateId: '5', status: 'Shortlisted', dateApplied: '2024-08-12T18:00:00Z' },
    { id: 'app-10', jobId: 'job-2', candidateId: '4', status: 'Interview', dateApplied: '2024-08-14T11:00:00Z' },


    // Job 3: Substitute Maths Teacher
    { id: 'app-6', jobId: 'job-3', candidateId: '2', status: 'Hired', dateApplied: '2024-08-02T09:30:00Z' },
];
