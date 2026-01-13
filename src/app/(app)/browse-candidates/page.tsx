'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CandidateCard } from '@/components/candidate-card';
import type { Candidate } from '@/lib/types';
import { ListFilter, Search, PoundSterling, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { fetchCandidatesFilteredPaginated, getFilterMetadata } from '@/lib/data-service';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

const CANDIDATES_PER_PAGE = 12;
const API_PAGE_SIZE = 100;
const INITIAL_PAGES_TO_LOAD = 3;
const MAX_PAGES_TO_LOAD = 100;

const subjects = ['History', 'Mathematics', 'Science', 'English', 'Chemistry', 'PGCE', 'QTS', 'TESOL', 'TEFL'];

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

// Mobile Filter Drawer Component
function MobileFilters({ 
    filters, 
    setFilters, 
    allRoles,
    allStatuses
}: FiltersProps) {
    const updateFilter = useCallback((key: keyof FilterState, value: string) => {
        setFilters({ ...filters, [key]: value });
    }, [filters, setFilters]);

    return (
        <div className="p-4 space-y-4">
            <div className="space-y-4">
                <div>
                    <Label className="text-sm font-medium mb-2 block">Role</Label>
                    <Select value={filters.role} onValueChange={(v) => updateFilter('role', v)}>
                        <SelectTrigger className="w-full text-sm">
                            <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all" className="text-sm">All Roles</SelectItem>
                            {allRoles.map(r => <SelectItem key={r} value={r} className="text-sm">{r}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label className="text-sm font-medium mb-2 block">Subject / Qualification</Label>
                    <Select value={filters.subject} onValueChange={(v) => updateFilter('subject', v)}>
                        <SelectTrigger className="w-full text-sm">
                            <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all" className="text-sm">All Subjects</SelectItem>
                            {subjects.map(s => <SelectItem key={s} value={s.toLowerCase()} className="text-sm">{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label className="text-sm font-medium mb-2 block">Rate Type</Label>
                    <Select value={filters.rateType} onValueChange={(v) => updateFilter('rateType', v)}>
                        <SelectTrigger className="w-full text-sm">
                            <SelectValue placeholder="Select rate type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all" className="text-sm">All Rate Types</SelectItem>
                            <SelectItem value="daily" className="text-sm">Daily</SelectItem>
                            <SelectItem value="hourly" className="text-sm">Hourly</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label className="text-sm font-medium mb-2 block">Rate Range</Label>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                            <PoundSterling className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                            <Input 
                                id="min-rate"
                                type="number"
                                placeholder="Min"
                                className="pl-8 text-sm h-10"
                                value={filters.minRate}
                                onChange={(e) => updateFilter('minRate', e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <PoundSterling className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                            <Input 
                                id="max-rate"
                                type="number"
                                placeholder="Max"
                                className="pl-8 text-sm h-10"
                                value={filters.maxRate}
                                onChange={(e) => updateFilter('maxRate', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <Label className="text-sm font-medium mb-2 block">Location</Label>
                    <Input 
                        id="location"
                        placeholder="Search location..."
                        className="text-sm h-10"
                        value={filters.location}
                        onChange={(e) => updateFilter('location', e.target.value)}
                    />
                </div>

                <div>
                    <Label className="text-sm font-medium mb-2 block">Status</Label>
                    <Select value={filters.status} onValueChange={(v) => updateFilter('status', v)}>
                        <SelectTrigger className="w-full text-sm">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all" className="text-sm">All Statuses</SelectItem>
                            {allStatuses.map(s => <SelectItem key={s} value={s} className="text-sm">{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}

// Desktop Filters Component
function DesktopFilters({ 
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
                <AccordionTrigger className="text-sm sm:text-base">Role & Subject</AccordionTrigger>
                <AccordionContent>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs sm:text-sm">Role</Label>
                            <Select value={filters.role} onValueChange={(v) => updateFilter('role', v)}>
                                <SelectTrigger className="text-xs sm:text-sm">
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all" className="text-xs sm:text-sm">All Roles</SelectItem>
                                    {allRoles.map(r => <SelectItem key={r} value={r} className="text-xs sm:text-sm">{r}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs sm:text-sm">Subject / Qualification</Label>
                            <Select value={filters.subject} onValueChange={(v) => updateFilter('subject', v)}>
                                <SelectTrigger className="text-xs sm:text-sm">
                                    <SelectValue placeholder="Select a subject" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all" className="text-xs sm:text-sm">All Subjects</SelectItem>
                                    {subjects.map(s => <SelectItem key={s} value={s.toLowerCase()} className="text-xs sm:text-sm">{s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
                <AccordionTrigger className="text-sm sm:text-base">Rate & Location</AccordionTrigger>
                <AccordionContent>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs sm:text-sm">Rate Type</Label>
                            <Select value={filters.rateType} onValueChange={(v) => updateFilter('rateType', v)}>
                                <SelectTrigger className="text-xs sm:text-sm">
                                    <SelectValue placeholder="Select rate type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all" className="text-xs sm:text-sm">All Rate Types</SelectItem>
                                    <SelectItem value="daily" className="text-xs sm:text-sm">Daily</SelectItem>
                                    <SelectItem value="hourly" className="text-xs sm:text-sm">Hourly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs sm:text-sm">Rate Range</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="relative">
                                    <PoundSterling className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                                    <Input 
                                        id="min-rate"
                                        type="number"
                                        placeholder="Min"
                                        className="pl-7 text-xs sm:text-sm h-9"
                                        value={filters.minRate}
                                        onChange={(e) => updateFilter('minRate', e.target.value)}
                                    />
                                </div>
                                <div className="relative">
                                    <PoundSterling className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                                    <Input 
                                        id="max-rate"
                                        type="number"
                                        placeholder="Max"
                                        className="pl-7 text-xs sm:text-sm h-9"
                                        value={filters.maxRate}
                                        onChange={(e) => updateFilter('maxRate', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs sm:text-sm">Location</Label>
                            <Input 
                                id="location"
                                placeholder="Search location..."
                                className="text-xs sm:text-sm h-9"
                                value={filters.location}
                                onChange={(e) => updateFilter('location', e.target.value)}
                            />
                        </div>
                    </div>
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
                <AccordionTrigger className="text-sm sm:text-base">Status</AccordionTrigger>
                <AccordionContent>
                    <div className="space-y-2">
                        <Select value={filters.status} onValueChange={(v) => updateFilter('status', v)}>
                            <SelectTrigger className="text-xs sm:text-sm">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all" className="text-xs sm:text-sm">All Statuses</SelectItem>
                                {allStatuses.map(s => <SelectItem key={s} value={s} className="text-xs sm:text-sm">{s}</SelectItem>)}
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
        const maxPagesToShow = window.innerWidth < 640 ? 3 : 5;
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
                        className={cn(currentPage === 1 && "pointer-events-none opacity-50", "text-xs sm:text-sm")}
                        size="sm"
                    />
                </PaginationItem>
                {getPageNumbers().map((page, index) => (
                    <PaginationItem key={index}>
                        {typeof page === 'number' ? (
                            <PaginationLink
                                href="#"
                                isActive={currentPage === page}
                                onClick={(e) => { e.preventDefault(); onPageChange(page); }}
                                className="text-xs sm:text-sm"
                                size="sm"
                            >
                                {page}
                            </PaginationLink>
                        ) : (
                            <PaginationEllipsis className="text-xs sm:text-sm" />
                        )}
                    </PaginationItem>
                ))}
                <PaginationItem>
                    <PaginationNext
                        href="#"
                        onClick={(e) => { e.preventDefault(); onPageChange(Math.min(totalPages, currentPage + 1)); }}
                        className={cn(currentPage === totalPages && "pointer-events-none opacity-50", "text-xs sm:text-sm")}
                        size="sm"
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}

export default function BrowseCandidatesPage() {
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
    const [allRoles, setAllRoles] = useState<string[]>([]);
    const [allStatuses, setAllStatuses] = useState<string[]>([]);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const debouncedSearchTerm = useDebounce(filters.searchTerm, 300);
    const debouncedLocationFilter = useDebounce(filters.location, 300);
    const debouncedMinRate = useDebounce(filters.minRate, 500);
    const debouncedMaxRate = useDebounce(filters.maxRate, 500);

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
            }

            setLoadedPages(endPage);
        } catch (error) {
            console.error('Error loading more pages:', error);
        } finally {
            setIsLoadingMore(false);
        }
    }, [loadedPages, candidateCache.totalPages, isLoadingMore]);

    const filteredCandidates = useMemo(() => {
        let results = [...candidateCache.data];

        if (debouncedSearchTerm) {
            const term = debouncedSearchTerm.toLowerCase();
            results = results.filter(c =>
                c.name.toLowerCase().includes(term) ||
                c.qualifications.some(q => q.toLowerCase().includes(term))
            );
        }

        if (filters.role !== 'all') {
            results = results.filter(c => c.role === filters.role);
        }

        if (filters.subject !== 'all') {
            results = results.filter(c =>
                c.qualifications.some(q => q.toLowerCase().includes(filters.subject.toLowerCase()))
            );
        }

        if (debouncedLocationFilter) {
            results = results.filter(c =>
                c.location.toLowerCase().includes(debouncedLocationFilter.toLowerCase())
            );
        }

        if (filters.rateType !== 'all') {
            results = results.filter(c => c.rateType === filters.rateType);
        }

        if (debouncedMinRate) {
            const minVal = parseFloat(debouncedMinRate);
            results = results.filter(c => c.rate >= minVal);
        }

        if (debouncedMaxRate) {
            const maxVal = parseFloat(debouncedMaxRate);
            results = results.filter(c => c.rate <= maxVal);
        }

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

    const totalPages = Math.ceil(filteredCandidates.length / CANDIDATES_PER_PAGE);
    const paginatedCandidates = useMemo(() => {
        const startIndex = (currentPage - 1) * CANDIDATES_PER_PAGE;
        const endIndex = startIndex + CANDIDATES_PER_PAGE;
        return filteredCandidates.slice(startIndex, endIndex);
    }, [filteredCandidates, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm, filters.role, filters.subject, debouncedLocationFilter, filters.rateType, debouncedMinRate, debouncedMaxRate, filters.status]);

    useEffect(() => {
        const threshold = 50;
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
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
                <div className="grid lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                    {/* Mobile Filter Toggle */}
                    <div className="lg:hidden col-span-full">
                        <Card>
                            <CardContent className="p-3 sm:p-4">
                                <Button 
                                    variant="outline" 
                                    className="w-full justify-between"
                                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                                >
                                    <span className="flex items-center gap-2">
                                        <ListFilter className="h-4 w-4" />
                                        Filters
                                    </span>
                                    {showMobileFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </Button>
                                {showMobileFilters && (
                                    <div className="mt-4">
                                        <MobileFilters {...filterProps} />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Desktop Sidebar */}
                    <aside className="hidden lg:block lg:col-span-1">
                        <div className="sticky top-24">
                            <Card>
                                <CardContent className="p-4 sm:p-6">
                                    <h2 className="text-lg font-semibold mb-4">Filters</h2>
                                    <DesktopFilters {...filterProps} />
                                </CardContent>
                            </Card>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="lg:col-span-3">
                        <div className="flex flex-col gap-4 sm:gap-6">
                            {/* Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold font-headline">
                                    Candidate Marketplace
                                </h1>
                                
                                {/* Mobile Filters Sheet for larger mobile screens */}
                                <div className="block lg:hidden">
                                    <Sheet>
                                        <SheetTrigger asChild>
                                            <Button variant="outline" size="sm" className="sm:flex hidden items-center gap-2">
                                                <ListFilter className="h-4 w-4" />
                                                <span className="text-sm">Advanced Filters</span>
                                            </Button>
                                        </SheetTrigger>
                                        <SheetContent side="left" className="w-[85vw] sm:w-[400px]">
                                            <SheetHeader>
                                                <SheetTitle>Filters</SheetTitle>
                                                <SheetDescription className="text-sm">
                                                    Refine your search for the perfect candidate.
                                                </SheetDescription>
                                            </SheetHeader>
                                            <div className="mt-4">
                                                <MobileFilters {...filterProps} />
                                            </div>
                                        </SheetContent>
                                    </Sheet>
                                </div>
                            </div>

                            {/* Search Bar */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                                <Input 
                                    placeholder="Search by name or keyword..." 
                                    className="pl-10 pr-4 h-11 sm:h-12 text-sm sm:text-base"
                                    value={filters.searchTerm}
                                    onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                                />
                            </div>

                            {/* Loading State */}
                            {isLoadingMetadata || (isLoadingInitial && candidateCache.data.length === 0) ? (
                                <div className="flex flex-col items-center justify-center h-48 sm:h-64 gap-4">
                                    <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-primary" />
                                    <p className="text-sm sm:text-base text-muted-foreground text-center">
                                        Loading candidates...
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Results Info */}
                                    <div className="text-xs sm:text-sm text-muted-foreground flex flex-wrap justify-between items-center gap-2">
                                        <span className="flex-1 min-w-0">
                                            Showing {paginatedCandidates.length > 0 ? (currentPage - 1) * CANDIDATES_PER_PAGE + 1 : 0}–
                                            {Math.min(currentPage * CANDIDATES_PER_PAGE, filteredCandidates.length)} of {filteredCandidates.length} results
                                        </span>
                                        {loadedPages < candidateCache.totalPages && (
                                            <Button 
                                                variant="link" 
                                                size="sm" 
                                                className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm p-0 h-auto"
                                                onClick={() => loadMorePages()}
                                                disabled={isLoadingMore}
                                            >
                                                {isLoadingMore ? 'Loading...' : `Load more (${candidateCache.totalPages - loadedPages} pages)`}
                                            </Button>
                                        )}
                                    </div>

                                    {/* Candidates Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                                        {paginatedCandidates.length > 0 ? (
                                            paginatedCandidates.map(candidate => (
                                                <CandidateCard key={candidate.id} candidate={candidate} />
                                            ))
                                        ) : (
                                            <div className="text-center text-muted-foreground col-span-full py-8 sm:py-12">
                                                <p className="text-base sm:text-lg font-semibold mb-2">No candidates found.</p>
                                                <p className="text-sm sm:text-base">Try adjusting your search or filters.</p>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Loading More Indicator */}
                                    {isLoadingMore && (
                                        <div className="flex justify-center py-4">
                                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                        </div>
                                    )}
                                    
                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="mt-6 sm:mt-8">
                                            <div className="flex justify-center items-center mb-3 sm:mb-4 text-xs sm:text-sm text-muted-foreground">
                                                Page {currentPage} of {totalPages}
                                            </div>
                                            <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}