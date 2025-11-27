
'use client';

import { useTour } from "@/context/tour-context";
import Joyride, { type CallBackProps, type Step } from 'react-joyride';
import { useTheme } from 'next-themes';

export function AppTour() {
    const { isTourActive, run, stepIndex, handleJoyrideCallback, steps } = useTour();
    const { theme } = useTheme();

    if (typeof window === 'undefined') {
        return null;
    }

    return (
        <Joyride
            callback={handleJoyrideCallback}
            continuous
            run={run}
            stepIndex={stepIndex}
            steps={steps}
            showProgress
            showSkipButton
            styles={{
                options: {
                    zIndex: 10000,
                    primaryColor: '#3F51B5', // Primary theme color
                    textColor: theme === 'dark' ? '#FFFFFF' : '#333333',
                    arrowColor: theme === 'dark' ? '#333333' : '#FFFFFF',
                    backgroundColor: theme === 'dark' ? '#333333' : '#FFFFFF',
                },
                spotlight: {
                    borderRadius: '8px',
                },
                tooltip: {
                    borderRadius: '8px',
                },
                buttonNext: {
                    borderRadius: '6px',
                },
                buttonBack: {
                     borderRadius: '6px',
                },
            }}
        />
    );
}
