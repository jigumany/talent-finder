
'use client';
import { useRole } from "@/context/role-context";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lock } from "lucide-react";


export default function TimesheetsPage() {
    const { role } = useRole();

    return (
        <div className="flex items-center justify-center h-full">
            <Alert className="max-w-md">
                <Lock className="h-4 w-4" />
                <AlertTitle>Feature Not Available</AlertTitle>
                <AlertDescription>
                    This page is intended for candidates and is currently not accessible.
                </AlertDescription>
            </Alert>
        </div>
    )
}
