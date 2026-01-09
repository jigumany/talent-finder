

'use client';
import { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CandidateCard } from '@/components/candidate-card';
import type { Candidate } from '@/lib/types';
import { ListFilter, Search, PoundSterling, Loader2, Calendar as CalendarIcon, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { fetchCandidates, getFilterMetadata, getUniqueCandidateRoles } from '@/lib/data-service';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, isWithinInterval, startOfDay } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination';
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

function PaginationControls({ currentPage, totalPages, onPageChange }: { currentPage: number, totalPages: number, onPageChange: (page: number) => void}) {
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5;
        const halfPagesToShow = Math.floor(maxPagesToShow / 2);

        if (totalPages <= maxPagesToShow + 2) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            pageNumbers.push(1);
            if (currentPage > halfPagesToShow + 2) {
                pageNumbers.push('...');
            }

            let start = Math.max(2, currentPage - halfPagesToShow);
            let end = Math.min(totalPages - 1, currentPage + halfPagesToShow);

            if (currentPage <= halfPagesToShow + 1) {
                end = maxPagesToShow;
            }

            if (currentPage >= totalPages - halfPagesToShow) {
                start = totalPages - maxPagesToShow + 1;
            }

            for (let i = start; i <= end; i++) {
                pageNumbers.push(i);
            }

            if (currentPage < totalPages - halfPagesToShow - 1) {
                pageNumbers.push('...');
            }
            pageNumbers.push(totalPages);
        }
        return pageNumbers;
    };
    
    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        href="#"
                        onClick={(e) => { e.preventDefault(); onPageChange(Math.max(1, currentPage - 1)); }}
                        className={cn(currentPage === 1 && "pointer-events-none opacity-50")}
                    />
                </PaginationItem>
                {getPageNumbers().map((page, index) => (
                    <PaginationItem key={index}>
                        {typeof page === 'number' ? (
                            <PaginationLink
                                href="#"
                                isActive={currentPage === page}
                                onClick={(e) => { e.preventDefault(); onPageChange(page); }}
                            >
                                {page}
                            </PaginationLink>
                        ) : (
                            <PaginationEllipsis />
                        )}
                    </PaginationItem>
                ))}
                <PaginationItem>
                    <PaginationNext
                        href="#"
                        onClick={(e) => { e.preventDefault(); onPageChange(Math.min(totalPages, currentPage + 1)); }}
                         className={cn(currentPage === totalPages && "pointer-events-none opacity-50")}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}

export default function BrowseCandidatesPage() {
    const [allCandidates, setAllCandidates] = useState<Candidate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMetadata, setIsLoadingMetadata] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState('Loading candidates...');
    
    const [currentPage, setCurrentPage] = useState(1);
    const CANDIDATES_PER_PAGE = 12;
    
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
    const [allStatuses, setAllStatuses] = useState<string[]>([]);
    
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const debouncedLocationFilter = useDebounce(locationFilter, 300);
    const debouncedMinRate = useDebounce(minRate, 500);
    const debouncedMaxRate = useDebounce(maxRate, 500);

    // Load all candidates on mount
    useEffect(() => {
        async function loadAllData() {
            setIsLoading(true);
            const allCandidatesData: Candidate[] = [];
            let nextPageUrl: string | null = 'https://gslstaging.mytalentcrm.com/api/v2/open/candidates?with_key_stages=1&per_page=100';
            let pageCount = 0;
            const MAX_PAGES = 600; // Safety limit to prevent infinite loops

            const fetchPageWithTimeout = async (url: string, timeoutMs: number = 15000): Promise<Response | null> => {
                try {
                    const controller = new AbortController();
                    const timeout = setTimeout(() => controller.abort(), timeoutMs);
                    
                    const response = await fetch(url, {
                        cache: 'no-store',
                        signal: controller.signal,
                        headers: {
                            'Cache-Control': 'no-cache, no-store, must-revalidate',
                            'Pragma': 'no-cache',
                            'Expires': '0'
                        }
                    });
                    
                    clearTimeout(timeout);
                    return response;
                } catch (error) {
                    console.error(`Timeout or error fetching page:`, error);
                    return null;
                }
            };

            while (nextPageUrl && pageCount < MAX_PAGES) {
                try {
                    setLoadingProgress(`Loading page ${pageCount + 1}...`);
                    const response = await fetchPageWithTimeout(nextPageUrl, 15000);

                    if (!response) {
                        console.warn(`⚠️ Timeout on page ${pageCount + 1}. Saving progress with ${allCandidatesData.length} candidates`);
                        setLoadingProgress(`Timeout on page ${pageCount + 1}. Loaded ${allCandidatesData.length} candidates so far.`);
                        break;
                    }

                    if (!response.ok) {
                        console.error(`Failed to fetch from ${nextPageUrl}: ${response.statusText}`);
                        break;
                    }

                    const jsonResponse = await response.json();
                    const candidatesOnPage = jsonResponse.data.map((apiCandidate: any): Candidate => {
                        const detailTypeMap: Record<string, string> = {
                            'KS1': 'Key Stage 1',
                            'KS2': 'Key Stage 2',
                            'KS3': 'Key Stage 3',
                            'KS4': 'Key Stage 4',
                            'KS5': 'Key Stage 5',
                            'SEND': 'SEND',
                            'Add': 'Additional Criteria',
                            'Langs': 'Languages',
                            'Quals': 'Qualifications',
                        };

                        const details: Record<string, string[]> = {};
                        const qualifications: string[] = [];

                        const allDetails = [...(apiCandidate.details || []), ...(apiCandidate.key_stages || [])];

                        if (allDetails) {
                            for (const detail of allDetails) {
                                const value = detail.name || detail.detail_type_value;
                                if (!value) continue;

                                const rawType = detail.key_stage_type || detail.detail_type;
                                const mappedType = detailTypeMap[rawType] || rawType || 'General';
                                
                                if (!details[mappedType]) {
                                    details[mappedType] = [];
                                }
                                details[mappedType].push(value);
                                qualifications.push(value);
                            }
                        }

                        const role = apiCandidate.candidate_type?.name || apiCandidate.job_title?.name || 'Educator';
                        const location = apiCandidate.location?.address_line_1 || apiCandidate.location?.city || 'Location not specified';

                        let rateType: 'hourly' | 'daily' = 'daily';
                        if (apiCandidate.pay_type?.toLowerCase() === 'hourly' || apiCandidate.pay_type?.toLowerCase() === 'daily') {
                            rateType = apiCandidate.pay_type.toLowerCase();
                        } else if (apiCandidate.rate_type?.toLowerCase() === 'hourly' || apiCandidate.rate_type?.toLowerCase() === 'daily') {
                            rateType = apiCandidate.rate_type.toLowerCase();
                        }

                        const status: string = apiCandidate.status?.name || 'Inactive';
                        
                        return {
                            id: apiCandidate.id.toString(),
                            name: `${apiCandidate.first_name} ${apiCandidate.last_name || ''}`.trim(),
                            role: role,
                            rate: apiCandidate.pay_rate || 0,
                            rateType: rateType,
                            rating: Math.round((Math.random() * (5 - 4) + 4) * 10) / 10,
                            reviews: Math.floor(Math.random() * 30),
                            location: location,
                            qualifications: qualifications,
                            details: details,
                            availability: apiCandidate.dates?.next_available_date ? [apiCandidate.dates.next_available_date] : [],
                            imageUrl: `https://picsum.photos/seed/${apiCandidate.id}/100/100`,
                            cvUrl: '#',
                            bio: `An experienced ${role} based in ${location}.`,
                            status: status,
                        };
                    });

                    allCandidatesData.push(...candidatesOnPage);
                    nextPageUrl = jsonResponse.links.next;
                    pageCount++;

                    console.log(`✅ Loaded page ${pageCount}. Total candidates: ${allCandidatesData.length}`);
                    
                    // Small delay to avoid overwhelming the API
                    await new Promise(resolve => setTimeout(resolve, 100));
                } catch (pageError) {
                    console.error(`Error loading page ${pageCount}:`, pageError);
                    break;
                }
            }

            setAllCandidates(allCandidatesData);
            console.log(`✅ Finished loading. Total candidates: ${allCandidatesData.length}`);
            console.log(`First candidate:`, allCandidatesData[0]);
            console.log(`Last candidate:`, allCandidatesData[allCandidatesData.length - 1]);
            setLoadingProgress(`Loaded ${allCandidatesData.length} candidates`);
            setIsLoading(false);
        }

        loadAllData();
    }, []);

    // Load filter metadata on mount
    useEffect(() => {
        async function loadMetadata() {
            setIsLoadingMetadata(true);
            const metadata = await getFilterMetadata();
            setAllRoles(metadata.roles);
            setAllStatuses(metadata.statuses);
            setIsLoadingMetadata(false);
        }
        loadMetadata();
    }, []);

    // Apply filters to all candidates
    const filteredCandidates = useMemo(() => {
        console.log(`🔍 Filtering starting with ${allCandidates.length} total candidates`);
        let candidates = allCandidates;

        // Search filter
        if (debouncedSearchTerm) {
            const lowercasedTerm = debouncedSearchTerm.toLowerCase();
            candidates = candidates.filter(c =>
                c.name.toLowerCase().includes(lowercasedTerm) ||
                c.qualifications.some(q => q.toLowerCase().includes(lowercasedTerm))
            );
            console.log(`  After search filter: ${candidates.length} candidates`);
        }

        // Role filter
        if (roleFilter !== 'all') {
            candidates = candidates.filter(c => c.role === roleFilter);
            console.log(`  After role filter (${roleFilter}): ${candidates.length} candidates`);
        }

        // Subject filter
        if (subjectFilter !== 'all') {
            candidates = candidates.filter(c => c.qualifications.some(q => q.toLowerCase().includes(subjectFilter.toLowerCase())));
            console.log(`  After subject filter (${subjectFilter}): ${candidates.length} candidates`);
        }

        // Location filter
        if (debouncedLocationFilter) {
            candidates = candidates.filter(c => c.location.toLowerCase().includes(debouncedLocationFilter.toLowerCase()));
            console.log(`  After location filter (${debouncedLocationFilter}): ${candidates.length} candidates`);
        }

        // Rate type filter
        if (rateTypeFilter !== 'all') {
            candidates = candidates.filter(c => c.rateType === rateTypeFilter);
            console.log(`  After rate type filter (${rateTypeFilter}): ${candidates.length} candidates`);
        }

        // Min rate filter
        if (debouncedMinRate) {
            candidates = candidates.filter(c => c.rate >= parseFloat(debouncedMinRate));
            console.log(`  After min rate filter (${debouncedMinRate}): ${candidates.length} candidates`);
        }

        // Max rate filter
        if (debouncedMaxRate) {
            candidates = candidates.filter(c => c.rate <= parseFloat(debouncedMaxRate));
            console.log(`  After max rate filter (${debouncedMaxRate}): ${candidates.length} candidates`);
        }

        // Status filter
        if (statusFilter !== 'all') {
            candidates = candidates.filter(c => c.status === statusFilter);
            console.log(`  After status filter (${statusFilter}): ${candidates.length} candidates`);
        }

        // Date range filter
        if (dateRange?.from) {
            candidates = candidates.filter(c => {
                if (c.availability.length === 0) return false;
                const to = dateRange.to || dateRange.from;
                const interval = { start: startOfDay(dateRange.from!), end: startOfDay(to) };
                return c.availability.some(availDateStr => isWithinInterval(new Date(availDateStr), interval));
            });
            console.log(`  After date range filter: ${candidates.length} candidates`);
        }

        console.log(`✅ Filter complete: ${candidates.length} candidates`);
        return candidates;
    }, [allCandidates, debouncedSearchTerm, roleFilter, subjectFilter, debouncedLocationFilter, rateTypeFilter, debouncedMinRate, debouncedMaxRate, statusFilter, dateRange]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm, roleFilter, subjectFilter, debouncedLocationFilter, rateTypeFilter, debouncedMinRate, debouncedMaxRate, statusFilter, dateRange]);

    // Paginate the filtered results
    const paginatedCandidates = useMemo(() => {
        const startIndex = (currentPage - 1) * CANDIDATES_PER_PAGE;
        return filteredCandidates.slice(startIndex, startIndex + CANDIDATES_PER_PAGE);
    }, [filteredCandidates, currentPage]);

    const totalPages = Math.ceil(filteredCandidates.length / CANDIDATES_PER_PAGE);


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
                </div>

                {isLoadingMetadata || isLoading ? (
                     <div className="flex flex-col items-center justify-center h-64 gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground text-center">{loadingProgress}</p>
                        <p className="text-xs text-muted-foreground">Loaded candidates in state: {allCandidates.length}</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-4 text-xs text-muted-foreground">
                            Total loaded: {allCandidates.length} | Filtered: {filteredCandidates.length}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {paginatedCandidates.length > 0 ? (
                                paginatedCandidates.map(candidate => (
                                    <CandidateCard key={candidate.id} candidate={candidate} />
                                ))
                            ) : (
                                <div className="text-center text-muted-foreground col-span-full py-12">
                                    <p className="text-lg font-semibold">No candidates found.</p>
                                    <p>Try adjusting your search or filters.</p>
                                    {allCandidates.length === 0 && <p className="text-xs mt-2">⚠️ No candidates loaded yet</p>}
                                </div>
                            )}
                        </div>
                        
                        {totalPages > 1 && (
                            <div className="mt-8">
                                <div className="flex justify-center items-center mb-4 text-sm text-muted-foreground">
                                    Showing {paginatedCandidates.length > 0 ? (currentPage - 1) * CANDIDATES_PER_PAGE + 1 : 0} - {Math.min(currentPage * CANDIDATES_PER_PAGE, filteredCandidates.length)} of {filteredCandidates.length} candidates
                                </div>
                                <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
