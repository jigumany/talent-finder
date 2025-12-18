
import type { Candidate, Booking, Timesheet, Job, Application, ClientReview, AuditLog, TeamMember } from './types';
import images from './placeholder-images.json';

// Note: Most mock data is being replaced by live API calls.
// Some mock data might remain for features not yet connected to the backend.

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
    details: { 'Qualifications': ['PhD in History', 'QTS'] },
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
    details: { 'Qualifications': ['M.Sc. in Mathematics', '5+ Years Experience', 'PGCE'] },
    availability: ['2024-08-22', '2024-08-23'],
    imageUrl: images['candidate-2'].src,
    cvUrl: '#',
    bio: 'An experienced math educator who excels at breaking down complex concepts into understandable lessons.',
    reviewsData: [
      { reviewerName: 'Oakfield High', rating: 5, comment: 'Marcus has a fantastic ability to connect with students and make math accessible. Highly recommended.', date: '2024-07-01' },
    ]
  },
    // Other mock candidates can remain for reference or for features not yet connected.
];

export const mockClientBookings: Booking[] = [];
export const mockCandidateBookings: Booking[] = [];


export const mockTimesheets: Timesheet[] = [
    {id: 't1', bookingId: 'b4', candidateName: 'Isabella Rossi', date: '2024-07-20', hours: 8, status: 'Approved' },
    {id: 't2', bookingId: 'b-new', candidateName: 'Isabella Rossi', date: '2024-08-19', hours: 6, status: 'Submitted' },
];

export const mockJobs: Job[] = [
    {
        id: 'job-1',
        title: 'Senior History Teacher',
        description: 'Seeking an experienced history teacher for A-Level students. Must have a passion for modern history.',
        datePosted: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Active',
        location: 'London, UK',
        startDate: '2024-09-01T00:00:00Z',
        subject: 'History',
    },
    {
        id: 'job-2',
        title: 'Primary School Teaching Assistant',
        description: 'A supportive and nurturing teaching assistant for our Year 3 class. Experience with special needs is a plus.',
        datePosted: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Active',
        location: 'Manchester, UK',
    },
];

export const mockApplications: Application[] = [
    // Job 1: Senior History Teacher
    { id: 'app-1', jobId: 'job-1', candidateId: '1', status: 'Interview', dateApplied: '2024-08-16T10:00:00Z' },
    { id: 'app-2', jobId: 'job-1', candidateId: '5', status: 'Applied', dateApplied: '2024-08-17T11:00:00Z' },
];

export const mockClientReviews: ClientReview[] = [
    {
        id: 'cr1',
        bookingId: 'b1',
        candidateName: 'Eleanor Vance',
        date: '2024-07-18T10:00:00Z',
        rating: 5,
        reviewText: "Eleanor was an outstanding history teacher. Her lessons were engaging, well-prepared, and she had a fantastic rapport with the students. She brought a level of enthusiasm that was truly infectious. We received excellent feedback from both students and parents. Highly recommended."
    },
    {
        id: 'cr2',
        bookingId: 'b2',
        candidateName: 'Marcus Thorne',
        date: '2024-07-20T14:30:00Z',
        rating: 4,
        reviewText: "Marcus provided solid cover for our Year 10 Maths class. He has a strong command of the subject matter and managed the classroom effectively. While his approach is more traditional, he ensured the curriculum was covered thoroughly. A reliable and knowledgeable teacher."
    },
];

const now = new Date();
const today = now.toISOString();
const yesterday = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString();
const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();

export const mockAuditLogs: AuditLog[] = [
    { id: 'log-1', jobId: 'job-1', date: twoDaysAgo, action: 'Job Created', user: 'Jane Doe (Admin)', details: 'Initial posting for Senior History Teacher.' },
    { id: 'log-2', jobId: 'job-1', date: yesterday, action: 'Job Edited', user: 'Jane Doe (Admin)', details: 'Updated job description to include A-Level requirement.' },
];

export const mockTeamMembers: TeamMember[] = [
  { id: 'tm-1', name: 'Sarah Wilson', email: 'sarah.wilson@oakwoodprimary.org.uk', role: 'Admin', avatarUrl: 'https://picsum.photos/seed/201/100/100' },
  { id: 'tm-2', name: 'David Lee', email: 'david.lee@oakwoodprimary.org.uk', role: 'Member', avatarUrl: 'https://picsum.photos/seed/202/100/100' },
  { id: 'tm-3', name: 'Laura Brown', email: 'laura.brown@oakwoodprimary.org.uk', role: 'Member', avatarUrl: 'https://picsum.photos/seed/203/100/100' },
];
