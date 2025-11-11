

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
