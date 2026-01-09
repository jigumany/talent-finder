'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CandidateCard } from '@/components/candidate-card';
import type { Candidate } from '@/lib/types';
import { ListFilter, Search, PoundSterling, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { fetchCandidatesFilteredPaginated, getFilterMetadata } from '@/lib/data-service';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';

const CANDIDATES_PER_PAGE = 12;
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
    status: string;
    setStatus: (status: string) => void;
    allStatuses: string[];
}

function Filters({ 
    role, setRole, allRoles, 
    subject, setSubject, 
    location, setLocation, 
    rateType, setRateType, 
    minRate, setMinRate, 
    maxRate, setMaxRate, 
    status, setStatus, allStatuses 
}: FiltersProps) {
    return (
        <Accordion type="multiple" defaultValue={['item-1', 'item-2', 'item-3']} className="w-full">
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
                                            className="pl-8"
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
                                            className="pl-8"
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
                                id="location"
                                placeholder="Search location..."
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                        </div>
                    </div>
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
                <AccordionTrigger className="text-base">Status</AccordionTrigger>
                <AccordionContent>
                    <div className="grid gap-2">
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                {allStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}

function PaginationControls({ currentPage, totalPages, onPageChange }: { currentPage: number, totalPages: number, onPageChange: (page: number) => void }) {
    const getPageNumbers = () => {
        const pageNumbers: (number | string)[] = [];
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
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [subjectFilter, setSubjectFilter] = useState('all');
    const [locationFilter, setLocationFilter] = useState('');
    const [rateTypeFilter, setRateTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [minRate, setMinRate] = useState('');
    const [maxRate, setMaxRate] = useState('');

    // Data states
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMetadata, setIsLoadingMetadata] = useState(true);

    // Metadata states
    const [allRoles, setAllRoles] = useState<string[]>([]);
    const [allStatuses, setAllStatuses] = useState<string[]>([]);

    // Debounce filters to avoid too many API calls
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const debouncedLocationFilter = useDebounce(locationFilter, 300);
    const debouncedMinRate = useDebounce(minRate, 500);
    const debouncedMaxRate = useDebounce(maxRate, 500);

    // Load metadata on mount
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

    // Fetch candidates from API and filter client-side
    useEffect(() => {
        async function fetchFilteredCandidates() {
            setIsLoading(true);
            
            try {
                // Fetch a large set of candidates from the API
                const params = {
                    page: 1,
                    perPage: 100, // Fetch 100 at a time
                };

                const result = await fetchCandidatesFilteredPaginated(params);
                let allLoadedCandidates = [...result.data];
                let nextPage = 2;
                
                // Load multiple pages to have enough data to filter
                while (nextPage <= 5 && result.totalPages >= nextPage) {
                    const nextResult = await fetchCandidatesFilteredPaginated({
                        page: nextPage,
                        perPage: 100,
                    });
                    allLoadedCandidates.push(...nextResult.data);
                    nextPage++;
                }

                // Apply client-side filters
                let filtered = [...allLoadedCandidates];

                // Search filter
                if (debouncedSearchTerm) {
                    const term = debouncedSearchTerm.toLowerCase();
                    filtered = filtered.filter(c =>
                        c.name.toLowerCase().includes(term) ||
                        c.qualifications.some(q => q.toLowerCase().includes(term))
                    );
                }

                // Role filter
                if (roleFilter !== 'all') {
                    filtered = filtered.filter(c => c.role === roleFilter);
                }

                // Subject/Qualification filter
                if (subjectFilter !== 'all') {
                    filtered = filtered.filter(c =>
                        c.qualifications.some(q => q.toLowerCase().includes(subjectFilter.toLowerCase()))
                    );
                }

                // Location filter
                if (debouncedLocationFilter) {
                    filtered = filtered.filter(c =>
                        c.location.toLowerCase().includes(debouncedLocationFilter.toLowerCase())
                    );
                }

                // Rate type filter
                if (rateTypeFilter !== 'all') {
                    filtered = filtered.filter(c => c.rateType === rateTypeFilter);
                }

                // Min rate filter
                if (debouncedMinRate) {
                    const minVal = parseFloat(debouncedMinRate);
                    filtered = filtered.filter(c => c.rate >= minVal);
                }

                // Max rate filter
                if (debouncedMaxRate) {
                    const maxVal = parseFloat(debouncedMaxRate);
                    filtered = filtered.filter(c => c.rate <= maxVal);
                }

                // Status filter
                if (statusFilter !== 'all') {
                    filtered = filtered.filter(c => c.status === statusFilter);
                }

                // Calculate pagination based on filtered results
                const totalFiltered = filtered.length;
                const totalPagesCalculated = Math.ceil(totalFiltered / CANDIDATES_PER_PAGE);
                
                // Get the current page of filtered results
                const startIndex = (currentPage - 1) * CANDIDATES_PER_PAGE;
                const endIndex = startIndex + CANDIDATES_PER_PAGE;
                const pageResults = filtered.slice(startIndex, endIndex);

                setCandidates(pageResults);
                setTotalPages(totalPagesCalculated);
                setTotal(totalFiltered);
                
                console.log(`✅ Loaded ${allLoadedCandidates.length} candidates, filtered to ${totalFiltered}, showing ${pageResults.length} on page ${currentPage}`);
            } catch (error) {
                console.error('Error fetching filtered candidates:', error);
                setCandidates([]);
            } finally {
                setIsLoading(false);
            }
        }

        fetchFilteredCandidates();
    }, [currentPage, debouncedSearchTerm, roleFilter, subjectFilter, debouncedLocationFilter, rateTypeFilter, debouncedMinRate, debouncedMaxRate, statusFilter]);

    // Reset to page 1 when filters change (except page number itself)
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm, roleFilter, subjectFilter, debouncedLocationFilter, rateTypeFilter, debouncedMinRate, debouncedMaxRate, statusFilter]);

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

                {isLoadingMetadata || (isLoading && currentPage === 1) ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground text-center">Loading candidates...</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-4 text-xs text-muted-foreground">
                            Total results: {total} | Current Page: {currentPage} of {totalPages}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {candidates.length > 0 ? (
                                candidates.map(candidate => (
                                    <CandidateCard key={candidate.id} candidate={candidate} />
                                ))
                            ) : (
                                <div className="text-center text-muted-foreground col-span-full py-12">
                                    <p className="text-lg font-semibold">No candidates found.</p>
                                    <p>Try adjusting your search or filters.</p>
                                </div>
                            )}
                        </div>
                        
                        {totalPages > 1 && (
                            <div className="mt-8">
                                <div className="flex justify-center items-center mb-4 text-sm text-muted-foreground">
                                    Page {currentPage} of {totalPages} — Showing {candidates.length > 0 ? (currentPage - 1) * CANDIDATES_PER_PAGE + 1 : 0}–{Math.min(currentPage * CANDIDATES_PER_PAGE, total)} of {total} results
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
