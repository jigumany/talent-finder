
import { notFound } from 'next/navigation';
import { mockCandidates } from '@/lib/mock-data';
import { CandidatePublicProfile } from '@/components/candidate-public-profile';

export default function CandidatePublicProfilePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const candidate = mockCandidates.find((c) => c.id === id);

  if (!candidate) {
    notFound();
  }

  return <CandidatePublicProfile candidate={candidate} />;
}
