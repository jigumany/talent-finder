
'use client';

import { useTour } from "@/context/tour-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, X } from "lucide-react";

const tourSteps = [
    {
        title: "Welcome to GSL!",
        description: "Let's take a quick tour of your client dashboard to get you started.",
    },
    {
        title: "Dashboard Overview",
        description: "This is your main dashboard. Here you'll find quick links and summaries of your booking activity, helping you stay on top of everything.",
    },
    {
        title: "Post a New Job/Booking",
        description: "Ready to find talent? Click here to post a new job or create a direct booking. You can specify roles, subjects, and all the necessary details.",
    },
    {
        title: "Browse Candidates",
        description: "Explore our marketplace of qualified candidates. You can filter by role, subject, location, and more to find the perfect match.",
    },
    {
        title: "Manage Bookings",
        description: "Use the 'Bookings' and 'Booking Manager' tabs to track your applicants, manage interviews, and see all your confirmed and completed jobs in one place.",
    },
    {
        title: "Ready to Go!",
        description: "That's it! You're all set to start finding and managing top educational talent. If you need help, just ask our AI Assistant.",
    }
]

export function AppTour() {
    const { isTourActive, currentStep, nextStep, prevStep, endTour } = useTour();
    
    if (!isTourActive) {
        return null;
    }
    
    const step = tourSteps[currentStep];
    const isLastStep = currentStep === tourSteps.length - 1;
    const isFirstStep = currentStep === 0;

    return (
        <Dialog open={isTourActive} onOpenChange={endTour}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{step.title}</DialogTitle>
                    <DialogDescription>{step.description}</DialogDescription>
                </DialogHeader>
                <div className="flex items-center justify-center text-sm text-muted-foreground">
                    Step {currentStep + 1} of {tourSteps.length}
                </div>
                <DialogFooter className="flex justify-between w-full">
                    {!isFirstStep ? (
                        <Button variant="outline" onClick={prevStep}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                        </Button>
                    ) : <div></div>}
                    
                    {isLastStep ? (
                        <Button onClick={endTour}>
                            Finish Tour
                        </Button>
                    ) : (
                        <Button onClick={nextStep}>
                            Next <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
