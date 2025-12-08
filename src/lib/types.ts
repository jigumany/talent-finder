
export type Review = {
  reviewerName: string;
  rating: number;
  comment: string;
  date: string; // ISO date string
};

export type Candidate = {
  id: string;
  name: string;
  role: string;
  rate: number;
  rateType: 'hourly' | 'daily';
  rating: number;
  reviews: number;
  reviewsData?: Review[];
  location: string;
  qualifications: string[];
  availability: string[]; // as ISO date strings
  imageUrl: string;
  cvUrl: string;
  bio: string;
};

export type Booking = {
  id: string;
  candidateName: string;
  candidateRole: string;
  date: string; // as ISO date string
  status: 'Confirmed' | 'Completed' | 'Pending' | 'Interview' | 'Hired' | 'Rejected';
};

export type Timesheet = {
  id: string;
  bookingId: string;
  candidateName: string;
  date: string;
  hours: number;
  status: 'Submitted' | 'Approved' | 'Rejected';
};

export type Job = {
  id: string;
  title: string;
  description: string;
  datePosted: string; // ISO date string
  status: 'Active' | 'Closed' | 'Draft' | 'Paused';
  applicants?: number;
  shortlisted?: number;
  location?: string;
  startDate?: string;
  endDate?: string;
  subject?: string;
  notes?: string;
};

export type ApplicationStatus = 'Applied' | 'Shortlisted' | 'Interview' | 'Offer' | 'Hired' | 'Rejected';

export type Application = {
    id: string;
    jobId: string;
    candidateId: string;
    status: ApplicationStatus;
    dateApplied: string; // ISO date string
};

export type ClientReview = {
    id: string;
    bookingId: string;
    candidateName: string;
    date: string; // ISO date string
    rating: number;
    reviewText: string;
};

export type AuditLog = {
    id: string;
    jobId: string;
    date: string; // ISO date string
    action: string;
    user: string;
    details?: string;
};

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Member';
  avatarUrl: string;
};
    
