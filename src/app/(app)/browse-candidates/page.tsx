

'use client';
import { useState, useEffect, useMemo, useTransition, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CandidateCard } from '@/components/candidate-card';
import type { Candidate } from '@/lib/types';
import { ListFilter, Search, PoundSterling, Loader2, Calendar as CalendarIcon, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { fetchCandidates, getUniqueCandidateRoles } from '@/lib/data-service';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useDebounce } from '@/hooks/use-debounce';

const CANDIDATES_PER_PAGE = 9;
const subjects = ['History', 'Mathematics', 'Science', 'English', 'Chemistry', 'PGCE', 'QTS', 'TESOL', 'TEFL'];

interface FiltersProps {
    role: string;
    setRole: (role: string) => void;
    allRoles: string[];
    subject: string;
    setSubject: (subject: string) => void;
    location: string;
    setLocation: (location: string) => void;
    rateType: string;
    setRateType: (rateType: string) => void;
    minRate: string;
    setMinRate: (rate: string) => void;
    maxRate: string;
    setMaxRate: (rate: string) => void;
    dateRange: DateRange | undefined;
    setDateRange: (range: DateRange | undefined) => void;
    status: string;
    setStatus: (status: string) => void;
    allStatuses: string[];
}

function Filters({ role, setRole, allRoles, subject, setSubject, location, setLocation, rateType, setRateType, minRate, setMinRate, maxRate, setMaxRate, dateRange, setDateRange, status, setStatus, allStatuses }: FiltersProps) {
    return (
        <Accordion type="multiple" defaultValue={['item-1', 'item-2', 'item-3', 'item-4']} className="w-full">
            <AccordionItem value="item-1">
                <AccordionTrigger className="text-base">Role & Subject</AccordionTrigger>
                <AccordionContent>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label>Role</Label>
                            <Select value={role} onValueChange={setRole}>
                                <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    {allRoles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Subject / Qualification</Label>
                             <Select value={subject} onValueChange={setSubject}>
                                <SelectTrigger><SelectValue placeholder="Select a subject" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Subjects</SelectItem>
                                     {subjects.map(s => <SelectItem key={s} value={s.toLowerCase()}>{s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger className="text-base">Rate & Location</AccordionTrigger>
                <AccordionContent>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label>Rate Type</Label>
                            <Select value={rateType} onValueChange={setRateType}>
                                <SelectTrigger><SelectValue placeholder="Select rate type" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Rate Types</SelectItem>
                                    <SelectItem value="daily">Daily</SelectItem>
                                    <SelectItem value="hourly">Hourly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="grid gap-2">
                            <Label>Rate Range</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="grid gap-1.5">
                                    <div className="relative">
                                         <PoundSterling className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                         <Input 
                                            id="min-rate"
                                            type="number"
                                            placeholder="Min" 
                                            className="pl-7"
                                            value={minRate}
                                            onChange={(e) => setMinRate(e.target.value)}
                                        />
                                    </div>
                                </div>
                                 <div className="grid gap-1.5">
                                     <div className="relative">
                                        <PoundSterling className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input 
                                            id="max-rate"
                                            type="number"
                                            placeholder="Max" 
                                            className="pl-7"
                                            value={maxRate}
                                            onChange={(e) => setMaxRate(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>Location</Label>
                            <Input 
                                placeholder="e.g. London, UK" 
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                        </div>
                    </div>
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-3">
                <AccordionTrigger className="text-base">Availability</AccordionTrigger>
                <AccordionContent>
                    <div className="grid gap-2">
                        <Label>Date Range</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="date"
                                    variant={"outline"}
                                    className={cn(
                                        "w-[240px] justify-start text-left font-normal",
                                        !dateRange && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange?.from ? (
                                        dateRange.to ? (
                                            <>
                                                {format(dateRange.from, "LLL dd, y")} -{" "}
                                                {format(dateRange.to, "LLL dd, y")}
                                            </>
                                        ) : (
                                            format(dateRange.from, "LLL dd, y")
                                        )
                                    ) : (
                                        <span>Pick a date range</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={dateRange?.from}
                                    selected={dateRange}
                                    onSelect={setDateRange}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
                <AccordionTrigger className="text-base">Status</AccordionTrigger>
                <AccordionContent>
                    <div className="grid gap-2">
                        <Label>Candidate Status</Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger><SelectValue placeholder="Select a status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                {allStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}

export default function BrowseCandidatesPage() {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFiltering, startFiltering] = useTransition();

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    
    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [subjectFilter, setSubjectFilter] = useState('all');
    const [locationFilter, setLocationFilter] = useState('');
    const [rateTypeFilter, setRateTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [minRate, setMinRate] = useState('');
    const [maxRate, setMaxRate] = useState('');
    const [dateRange, setDateRange] = useState<DateRange | undefined>();

    const [allRoles, setAllRoles] = useState<string[]>([]);
    const allStatuses = ['Active', 'Available', 'Pre-screen', 'Archived', 'Stop', 'Pending Compliance'];
    
    // This is just a placeholder and won't be used for filtering with server-side pagination.
    // The server API would need to be updated to handle these filters.
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const loadCandidates = useCallback(async (page: number) => {
        setIsLoading(true);
        const { candidates: fetchedCandidates, totalPages: fetchedTotalPages } = await fetchCandidates({ page, perPage: CANDIDATES_PER_PAGE });
        setCandidates(fetchedCandidates);
        setTotalPages(fetchedTotalPages);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        loadCandidates(currentPage);
    }, [currentPage, loadCandidates]);
    
    useEffect(() => {
        // In a real app with a more advanced API, you would pass the filters to `loadCandidates`
        // and the API would return filtered results. We reset to page 1 on filter changes.
        setCurrentPage(1);
    }, [debouncedSearchTerm, roleFilter, subjectFilter, locationFilter, rateTypeFilter, statusFilter, minRate, maxRate, dateRange]);
    
    useEffect(() => {
        async function loadRoles() {
            setAllRoles(await getUniqueCandidateRoles());
        }
        loadRoles();
    }, []);


    // Note: Client-side filtering is removed as we are now paginating from the server.
    // A production app would pass these filters to the `fetchCandidates` call.
    const paginatedCandidates = candidates;

    const filterProps = {
        role: roleFilter,
        setRole: setRoleFilter,
        allRoles,
        subject: subjectFilter,
        setSubject: setSubjectFilter,
        location: locationFilter,
        setLocation: setLocationFilter,
        rateType: rateTypeFilter,
        setRateType: setRateTypeFilter,
        minRate,
        setMinRate,
        maxRate,
        setMaxRate,
        dateRange,
        setDateRange,
        status: statusFilter,
        setStatus: setStatusFilter,
        allStatuses,
    };

    return (
        <div className="grid md:grid-cols-[280px_1fr] gap-8">
            <aside className="hidden md:block">
                <div className="sticky top-20">
                    <h2 className="text-lg font-semibold mb-4">Filters</h2>
                    <Filters {...filterProps} />
                </div>
            </aside>
            
            <main className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold font-headline">Candidate Marketplace</h1>
                    <div className="md:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <ListFilter className="h-4 w-4" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent className="w-[300px] sm:w-[400px]">
                                <SheetHeader>
                                    <SheetTitle>Filters</SheetTitle>
                                    <SheetDescription>
                                        Refine your search for the perfect candidate.
                                    </SheetDescription>
                                </SheetHeader>
                                <div className="mt-4">
                                     <Filters {...filterProps} />
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        placeholder="Search by name or keyword..." 
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                     <p className="text-xs text-muted-foreground mt-1">Note: Server-side search/filter not implemented in this demo.</p>
                </div>

                {isLoading ? (
                     <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {paginatedCandidates.length > 0 ? (
                                paginatedCandidates.map(candidate => (
                                    <CandidateCard key={candidate.id} candidate={candidate} />
                                ))
                            ) : (
                                <div className="text-center text-muted-foreground col-span-full py-12">
                                    <p className="text-lg font-semibold">No candidates found.</p>
                                    <p>Try adjusting your search or filters.</p>
                                </div>
                            )}
                        </div>
                        
                        <div className="mt-8">
                            {totalPages > 1 && (
                                <>
                                    <div className="flex justify-center items-center mb-4 text-sm text-muted-foreground">
                                        Page {currentPage} of {totalPages}
                                    </div>
                                    <Pagination>
                                        <PaginationContent>
                                            <PaginationItem>
                                                <PaginationPrevious 
                                                    href="#"
                                                    onClick={(e) => { e.preventDefault(); setCurrentPage(prev => Math.max(prev - 1, 1)); }}
                                                    className={cn(
                                                        "cursor-pointer",
                                                        currentPage === 1 ? "pointer-events-none opacity-50" : undefined
                                                    )}
                                                />
                                            </PaginationItem>
                                            
                                            {/* Simplified pagination links for brevity */}
                                            <PaginationItem>
                                                <PaginationLink href="#" isActive>{currentPage}</PaginationLink>
                                            </PaginationItem>
                                            
                                            <PaginationItem>
                                                <PaginationNext 
                                                    href="#"
                                                    onClick={(e) => { e.preventDefault(); setCurrentPage(prev => Math.min(prev + 1, totalPages)); }}
                                                    className={cn(
                                                        "cursor-pointer",
                                                        currentPage === totalPages ? "pointer-events-none opacity-50" : undefined
                                                    )}
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                </>
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

