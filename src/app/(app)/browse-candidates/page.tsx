'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
const API_PAGE_SIZE = 100; // Fetch from API in batches of 100
const INITIAL_PAGES_TO_LOAD = 3; // Start with 3 pages (300 candidates)
const MAX_PAGES_TO_LOAD = 100; // Maximum pages to cache (10,000 candidates)

const subjects = ['History', 'Mathematics', 'Science', 'English', 'Chemistry', 'PGCE', 'QTS', 'TESOL', 'TEFL'];

// Filter state interface for better type safety
interface FilterState {
    searchTerm: string;
    role: string;
    subject: string;
    location: string;
    rateType: string;
    minRate: string;
    maxRate: string;
    status: string;
}

// Cache management for loaded pages
interface CandidateCache {
    data: Candidate[];
    totalPages: number;
    total: number;
    lastFetched: number;
}

interface FiltersProps {
    filters: FilterState;
    setFilters: (filters: FilterState) => void;
    allRoles: string[];
    allStatuses: string[];
}

function Filters({ 
    filters, 
    setFilters, 
    allRoles,
    allStatuses
}: FiltersProps) {
    const updateFilter = useCallback((key: keyof FilterState, value: string) => {
        setFilters({ ...filters, [key]: value });
    }, [filters, setFilters]);

    return (
        <Accordion type="multiple" defaultValue={['item-1', 'item-2', 'item-3']} className="w-full">
            <AccordionItem value="item-1">
                <AccordionTrigger className="text-base">Role & Subject</AccordionTrigger>
                <AccordionContent>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label>Role</Label>
                            <Select value={filters.role} onValueChange={(v) => updateFilter('role', v)}>
                                <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    {allRoles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Subject / Qualification</Label>
                            <Select value={filters.subject} onValueChange={(v) => updateFilter('subject', v)}>
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
                            <Select value={filters.rateType} onValueChange={(v) => updateFilter('rateType', v)}>
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
                                            value={filters.minRate}
                                            onChange={(e) => updateFilter('minRate', e.target.value)}
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
                                            value={filters.maxRate}
                                            onChange={(e) => updateFilter('maxRate', e.target.value)}
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
                                value={filters.location}
                                onChange={(e) => updateFilter('location', e.target.value)}
                            />
                        </div>
                    </div>
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
                <AccordionTrigger className="text-base">Status</AccordionTrigger>
                <AccordionContent>
                    <div className="grid gap-2">
                        <Select value={filters.status} onValueChange={(v) => updateFilter('status', v)}>
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
    // State management
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState<FilterState>({
        searchTerm: '',
        role: 'all',
        subject: 'all',
        location: '',
        rateType: 'all',
        minRate: '',
        maxRate: '',
        status: 'all',
    });

    // Data states
    const [candidateCache, setCandidateCache] = useState<CandidateCache>({
        data: [],
        totalPages: 0,
        total: 0,
        lastFetched: 0,
    });
    const [loadedPages, setLoadedPages] = useState(0);
    const [isLoadingInitial, setIsLoadingInitial] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isLoadingMetadata, setIsLoadingMetadata] = useState(true);

    // Metadata states
    const [allRoles, setAllRoles] = useState<string[]>([]);
    const [allStatuses, setAllStatuses] = useState<string[]>([]);

    // Debounce filters
    const debouncedSearchTerm = useDebounce(filters.searchTerm, 300);
    const debouncedLocationFilter = useDebounce(filters.location, 300);
    const debouncedMinRate = useDebounce(filters.minRate, 500);
    const debouncedMaxRate = useDebounce(filters.maxRate, 500);

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

    // Load initial pages
    useEffect(() => {
        async function loadInitialPages() {
            setIsLoadingInitial(true);
            const allCandidates: Candidate[] = [];
            let totalPages = 0;
            let total = 0;

            try {
                for (let page = 1; page <= INITIAL_PAGES_TO_LOAD; page++) {
                    const result = await fetchCandidatesFilteredPaginated({
                        page,
                        perPage: API_PAGE_SIZE,
                    });
                    
                    allCandidates.push(...result.data);
                    totalPages = result.totalPages;
                    total = result.total;

                    console.log(`✅ Loaded page ${page}/${INITIAL_PAGES_TO_LOAD}. Total: ${allCandidates.length} candidates`);
                }

                setCandidateCache({
                    data: allCandidates,
                    totalPages,
                    total,
                    lastFetched: Date.now(),
                });
                setLoadedPages(INITIAL_PAGES_TO_LOAD);
            } catch (error) {
                console.error('Error loading initial pages:', error);
            } finally {
                setIsLoadingInitial(false);
            }
        }

        loadInitialPages();
    }, []);

    // Load more pages on demand
    const loadMorePages = useCallback(async (additionalPages: number = 3) => {
        if (loadedPages >= candidateCache.totalPages || isLoadingMore) return;

        setIsLoadingMore(true);
        try {
            const startPage = loadedPages + 1;
            const endPage = Math.min(loadedPages + additionalPages, candidateCache.totalPages);

            for (let page = startPage; page <= endPage; page++) {
                const result = await fetchCandidatesFilteredPaginated({
                    page,
                    perPage: API_PAGE_SIZE,
                });
                
                setCandidateCache(prev => ({
                    ...prev,
                    data: [...prev.data, ...result.data],
                }));

                console.log(`✅ Loaded page ${page}. Total candidates: ${candidateCache.data.length + result.data.length}`);
            }

            setLoadedPages(endPage);
        } catch (error) {
            console.error('Error loading more pages:', error);
        } finally {
            setIsLoadingMore(false);
        }
    }, [loadedPages, candidateCache.totalPages, isLoadingMore]);

    // Apply filters to cached candidates (memoized for performance)
    const filteredCandidates = useMemo(() => {
        let results = [...candidateCache.data];

        // Search filter
        if (debouncedSearchTerm) {
            const term = debouncedSearchTerm.toLowerCase();
            results = results.filter(c =>
                c.name.toLowerCase().includes(term) ||
                c.qualifications.some(q => q.toLowerCase().includes(term))
            );
        }

        // Role filter
        if (filters.role !== 'all') {
            results = results.filter(c => c.role === filters.role);
        }

        // Subject filter
        if (filters.subject !== 'all') {
            results = results.filter(c =>
                c.qualifications.some(q => q.toLowerCase().includes(filters.subject.toLowerCase()))
            );
        }

        // Location filter
        if (debouncedLocationFilter) {
            results = results.filter(c =>
                c.location.toLowerCase().includes(debouncedLocationFilter.toLowerCase())
            );
        }

        // Rate type filter
        if (filters.rateType !== 'all') {
            results = results.filter(c => c.rateType === filters.rateType);
        }

        // Min rate filter
        if (debouncedMinRate) {
            const minVal = parseFloat(debouncedMinRate);
            results = results.filter(c => c.rate >= minVal);
        }

        // Max rate filter
        if (debouncedMaxRate) {
            const maxVal = parseFloat(debouncedMaxRate);
            results = results.filter(c => c.rate <= maxVal);
        }

        // Status filter
        if (filters.status !== 'all') {
            results = results.filter(c => c.status === filters.status);
        }

        return results;
    }, [
        candidateCache.data,
        debouncedSearchTerm,
        filters.role,
        filters.subject,
        debouncedLocationFilter,
        filters.rateType,
        debouncedMinRate,
        debouncedMaxRate,
        filters.status,
    ]);

    // Paginate filtered results
    const totalPages = Math.ceil(filteredCandidates.length / CANDIDATES_PER_PAGE);
    const paginatedCandidates = useMemo(() => {
        const startIndex = (currentPage - 1) * CANDIDATES_PER_PAGE;
        const endIndex = startIndex + CANDIDATES_PER_PAGE;
        return filteredCandidates.slice(startIndex, endIndex);
    }, [filteredCandidates, currentPage]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm, filters.role, filters.subject, debouncedLocationFilter, filters.rateType, debouncedMinRate, debouncedMaxRate, filters.status]);

    // Auto-load more pages when approaching the end of loaded data
    useEffect(() => {
        const threshold = 50; // Load more when within 50 candidates of the end
        if (filteredCandidates.length > 0 && 
            filteredCandidates.length - (currentPage * CANDIDATES_PER_PAGE) < threshold &&
            loadedPages < candidateCache.totalPages) {
            loadMorePages();
        }
    }, [currentPage, filteredCandidates.length, loadedPages, candidateCache.totalPages, loadMorePages]);

    const filterProps = {
        filters,
        setFilters,
        allRoles,
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
                        value={filters.searchTerm}
                        onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                    />
                </div>

                {isLoadingMetadata || (isLoadingInitial && candidateCache.data.length === 0) ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground text-center">Loading candidates...</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-4 text-xs text-muted-foreground flex justify-between">
                            <span>Loaded: {candidateCache.data.length} | Filtered: {filteredCandidates.length} | Page: {currentPage}/{totalPages}</span>
                            {loadedPages < candidateCache.totalPages && (
                                <span className="text-blue-600 cursor-pointer hover:underline" onClick={() => loadMorePages()}>
                                    Load more ({candidateCache.totalPages - loadedPages} pages remaining)
                                </span>
                            )}
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
                                </div>
                            )}
                        </div>
                        
                        {isLoadingMore && (
                            <div className="flex justify-center py-4">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                        )}
                        
                        {totalPages > 1 && (
                            <div className="mt-8">
                                <div className="flex justify-center items-center mb-4 text-sm text-muted-foreground">
                                    Page {currentPage} of {totalPages} — Showing {paginatedCandidates.length > 0 ? (currentPage - 1) * CANDIDATES_PER_PAGE + 1 : 0}–{Math.min(currentPage * CANDIDATES_PER_PAGE, filteredCandidates.length)} of {filteredCandidates.length} results
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
