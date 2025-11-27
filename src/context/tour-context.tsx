
'use client';

import { createContext, useState, useContext, type ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { CallBackProps, Step } from 'react-joyride';
import { useIsMobile } from '@/hooks/use-mobile';


const TOUR_STEPS: Step[] = [
    {
        target: '#tour-step-0',
        content: "Welcome to GSL! This is your main dashboard. Here you'll find quick links and summaries of your booking activity.",
        disableBeacon: true,
        placement: 'bottom',
    },
    {
        target: '#tour-step-1',
        content: "This is your main dashboard. Here you'll find quick links and summaries of your booking activity, helping you stay on top of everything.",
        disableBeacon: true,
        placement: 'right',
    },
    {
        target: '#tour-step-2',
        content: "Ready to find talent? Use the 'Booking Manager' to post a new job, or use the button on the dashboard to create a direct booking.",
        disableBeacon: true,
        placement: 'right',
    },
    {
        target: '#tour-step-3',
        content: "Explore our marketplace of qualified candidates. You can filter by role, subject, location, and more to find the perfect match.",
        disableBeacon: true,
        placement: 'right',
    },
    {
        target: '#tour-step-4',
        content: "Use the 'Bookings' and 'Booking Manager' tabs to track your applicants, manage interviews, and see all your confirmed and completed jobs in one place.",
        disableBeacon: true,
        placement: 'right',
    },
    {
        target: '#tour-step-5',
        content: "That's it! You're all set to start finding and managing top educational talent. If you need help, just ask our AI Assistant in the bottom right.",
        disableBeacon: true,
        placement: 'center',
    }
];

const tourStepsMobile: Step[] = [
    ...TOUR_STEPS
].map(step => ({...step, placement: 'bottom'}));


interface TourContextType {
  run: boolean;
  stepIndex: number;
  steps: Step[];
  handleJoyrideCallback: (data: CallBackProps) => void;
  startTour: () => void;
  isTourActive: boolean; // Keep this for dialog compatibility if needed elsewhere
}

const TourContext = createContext<TourContextType | null>(null);

export function TourProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const steps = isMobile ? tourStepsMobile : TOUR_STEPS;

  const startTour = useCallback(() => {
    setStepIndex(0);
    setRun(true);
  }, []);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { action, index, status, type } = data;
    const finishedStatuses: string[] = ['finished', 'skipped'];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      setStepIndex(0);
    } else if (type === 'step:after' || type === 'target:not-found') {
        const newIndex = index + (action === 'prev' ? -1 : 1);
        const nextStep = steps[newIndex];
        
        // If the next step has a different route, navigate to it
        if (nextStep && (nextStep.target as string).startsWith('#nav-')) {
            const route = (nextStep.target as string).replace('#nav-', '');
            router.push(`/${route}`);
        }

        setStepIndex(newIndex);
    }
  };

  const value = {
      run,
      stepIndex,
      steps,
      handleJoyrideCallback,
      startTour,
      isTourActive: run, // for compatibility
  };

  return (
    <TourContext.Provider value={value}>
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
}
