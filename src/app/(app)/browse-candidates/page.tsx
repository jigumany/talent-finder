'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CandidateCard } from '@/components/candidate-card';
import type { Candidate } from '@/lib/types';
import { ListFilter, Search, PoundSterling, Loader2, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { fetchCandidatesFilteredPaginated, getFilterMetadata } from '@/lib/data-service';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const CANDIDATES_PER_PAGE = 12;

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

interface FiltersProps {
    filters: FilterState;
    setFilters: (filters: FilterState) => void;
    allRoles: string[];
    allStatuses: string[];
}

// Helper function to capitalize first letter
const capitalize = (str: string) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};

// Component to display selected filter chips
function SelectedFilters({ filters, setFilters }: { filters: FilterState; setFilters: (filters: FilterState) => void }) {
    const activeFilters = [];
    
    // Search filter
    if (filters.searchTerm) {
        activeFilters.push({
            label: `Search: ${filters.searchTerm}`,
            key: 'searchTerm',
            value: '',
        });
    }
    
    // Role filter
    if (filters.role !== 'all') {
        activeFilters.push({
            label: `Role: ${capitalize(filters.role)}`,
            key: 'role',
            value: 'all',
        });
    }
    
    // Subject filter
    if (filters.subject !== 'all') {
        const subjectLabel = subjects.find(s => s.toLowerCase() === filters.subject) || capitalize(filters.subject);
        activeFilters.push({
            label: `Subject: ${subjectLabel}`,
            key: 'subject',
            value: 'all',
        });
    }
    
    // Location filter
    if (filters.location) {
        activeFilters.push({
            label: `Location: ${filters.location}`,
            key: 'location',
            value: '',
        });
    }
    
    // Rate type filter
    if (filters.rateType !== 'all') {
        activeFilters.push({
            label: `Rate Type: ${capitalize(filters.rateType)}`,
            key: 'rateType',
            value: 'all',
        });
    }
    
    // Min rate filter
    if (filters.minRate) {
        activeFilters.push({
            label: `Min Rate: £${filters.minRate}`,
            key: 'minRate',
            value: '',
        });
    }
    
    // Max rate filter
    if (filters.maxRate) {
        activeFilters.push({
            label: `Max Rate: £${filters.maxRate}`,
            key: 'maxRate',
            value: '',
        });
    }
    
    // Status filter
    if (filters.status !== 'all') {
        activeFilters.push({
            label: `Status: ${capitalize(filters.status)}`,
            key: 'status',
            value: 'all',
        });
    }
    
    const handleRemoveFilter = (key: keyof FilterState, defaultValue: string) => {
        setFilters({ ...filters, [key]: defaultValue });
    };
    
    const handleClearAll = () => {
        setFilters({
            searchTerm: '',
            role: 'all',
            subject: 'all',
            location: '',
            rateType: 'all',
            minRate: '',
            maxRate: '',
            status: 'all',
        });
    };
    
    if (activeFilters.length === 0) {
        return null;
    }
    
    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                    Active Filters ({activeFilters.length})
                </span>
                {activeFilters.length > 0 && (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleClearAll}
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                    >
                        Clear all
                    </Button>
                )}
            </div>
            <div className="flex flex-wrap gap-2">
                {activeFilters.map((filter, index) => (
                    <Badge 
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 text-xs font-normal"
                    >
                        <span className="truncate max-w-[180px] sm:max-w-[200px]">{filter.label}</span>
                        <button
                            onClick={() => handleRemoveFilter(filter.key as keyof FilterState, filter.value)}
                            className="ml-0.5 rounded-full hover:bg-muted p-0.5"
                            aria-label={`Remove ${filter.label} filter`}
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                ))}
            </div>
        </div>
    );
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
                            {allRoles.map(r => <SelectItem key={r} value={r} className="text-sm">{capitalize(r)}</SelectItem>)}
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
                    <Label className="text-sm font-medium mb-2 block">Availability Status</Label>
                    <Select value={filters.status} onValueChange={(v) => updateFilter('status', v)}>
                        <SelectTrigger className="w-full text-sm">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all" className="text-sm">All Statuses</SelectItem>
                            {allStatuses.map(s => <SelectItem key={s} value={s} className="text-sm">{capitalize(s)}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}

// Desktop Filters Component with controlled accordion
function DesktopFilters({ 
    filters, 
    setFilters, 
    allRoles,
    allStatuses
}: FiltersProps) {
    const [accordionValue, setAccordionValue] = useState<string[]>(['item-1', 'item-2', 'item-3']);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const updateFilter = useCallback((key: keyof FilterState, value: string) => {
        setFilters({ ...filters, [key]: value });
        
        const accordionItemMap: Record<string, string> = {
            'role': 'item-1',
            'subject': 'item-1',
            'rateType': 'item-2',
            'minRate': 'item-2',
            'maxRate': 'item-2',
            'location': 'item-2',
            'status': 'item-3'
        };
        
        const accordionItem = accordionItemMap[key];
        if (accordionItem) {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            
            timeoutRef.current = setTimeout(() => {
                setAccordionValue(prev => prev.filter(item => item !== accordionItem));
            }, 300);
        }
    }, [filters, setFilters]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return (
        <Accordion 
            type="multiple" 
            value={accordionValue}
            onValueChange={setAccordionValue}
            className="w-full"
        >
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
                                    {allRoles.map(r => <SelectItem key={r} value={r} className="text-xs sm:text-sm">{capitalize(r)}</SelectItem>)}
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
                <AccordionTrigger className="text-sm sm:text-base">Availability Status</AccordionTrigger>
                <AccordionContent>
                    <div className="space-y-2">
                        <Select value={filters.status} onValueChange={(v) => updateFilter('status', v)}>
                            <SelectTrigger className="text-xs sm:text-sm">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all" className="text-xs sm:text-sm">All Statuses</SelectItem>
                                {allStatuses.map(s => <SelectItem key={s} value={s} className="text-xs sm:text-sm">{capitalize(s)}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}

// Improved responsive pagination controls
function PaginationControls({ currentPage, totalPages, onPageChange }: { currentPage: number, totalPages: number, onPageChange: (page: number) => void }) {
    const getPageNumbers = () => {
        // Dynamically determine max pages to show based on screen width
        const maxPagesToShow = window.innerWidth < 640 ? 3 : 
                              window.innerWidth < 768 ? 4 : 
                              window.innerWidth < 1024 ? 5 : 7;
        
        const halfPagesToShow = Math.floor(maxPagesToShow / 2);
        const pageNumbers: (number | string)[] = [];

        if (totalPages <= maxPagesToShow + 2) {
            // Show all pages if total is small
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            // Always show first page
            pageNumbers.push(1);
            
            // Determine if we need ellipsis after first page
            if (currentPage > halfPagesToShow + 2) {
                pageNumbers.push('...');
            }

            // Calculate start and end of middle section
            let start = Math.max(2, currentPage - halfPagesToShow);
            let end = Math.min(totalPages - 1, currentPage + halfPagesToShow);

            // Adjust if near start
            if (currentPage <= halfPagesToShow + 1) {
                end = maxPagesToShow;
            }

            // Adjust if near end
            if (currentPage >= totalPages - halfPagesToShow) {
                start = totalPages - maxPagesToShow + 1;
            }

            // Add middle pages
            for (let i = start; i <= end; i++) {
                pageNumbers.push(i);
            }

            // Determine if we need ellipsis before last page
            if (currentPage < totalPages - halfPagesToShow - 1) {
                pageNumbers.push('...');
            }
            
            // Always show last page
            if (totalPages > 1) {
                pageNumbers.push(totalPages);
            }
        }
        return pageNumbers;
    };
    
    return (
        <Pagination>
            <PaginationContent className="flex flex-wrap justify-center gap-1 sm:gap-2">
                <PaginationItem>
                    <PaginationPrevious
                        href="#"
                        onClick={(e) => { e.preventDefault(); onPageChange(Math.max(1, currentPage - 1)); }}
                        className={cn(
                            currentPage === 1 && "pointer-events-none opacity-50",
                            "text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-9"
                        )}
                    />
                </PaginationItem>
                {getPageNumbers().map((page, index) => (
                    <PaginationItem key={index}>
                        {typeof page === 'number' ? (
                            <PaginationLink
                                href="#"
                                isActive={currentPage === page}
                                onClick={(e) => { e.preventDefault(); onPageChange(page); }}
                                className="text-xs sm:text-sm min-w-[32px] sm:min-w-[36px] h-8 sm:h-9"
                            >
                                {page}
                            </PaginationLink>
                        ) : (
                            <span className="flex items-center justify-center min-w-[24px] sm:min-w-[28px] h-8 sm:h-9 text-xs sm:text-sm text-muted-foreground">
                                ...
                            </span>
                        )}
                    </PaginationItem>
                ))}
                <PaginationItem>
                    <PaginationNext
                        href="#"
                        onClick={(e) => { e.preventDefault(); onPageChange(Math.min(totalPages, currentPage + 1)); }}
                        className={cn(
                            currentPage === totalPages && "pointer-events-none opacity-50",
                            "text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-9"
                        )}
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

    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [totalResults, setTotalResults] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const [allRoles, setAllRoles] = useState<string[]>([]);
    const [allStatuses, setAllStatuses] = useState<string[]>([]);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

    const debouncedSearchTerm = useDebounce(filters.searchTerm, 300);
    const debouncedLocationFilter = useDebounce(filters.location, 300);
    const debouncedMinRate = useDebounce(filters.minRate, 500);
    const debouncedMaxRate = useDebounce(filters.maxRate, 500);

    useEffect(() => {
        async function loadMetadata() {
            setIsLoading(true);
            try {
                const metadata = await getFilterMetadata();
                setAllRoles(metadata.roles);
                setAllStatuses(metadata.statuses);
            } catch (error) {
                console.error("Failed to load filter metadata", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadMetadata();
    }, []);

    useEffect(() => {
        async function loadCandidates() {
            setIsLoading(true);
            try {
                const result = await fetchCandidatesFilteredPaginated({
                    page: currentPage,
                    perPage: CANDIDATES_PER_PAGE,
                    searchTerm: debouncedSearchTerm,
                    role: filters.role,
                    subject: filters.subject,
                    location: debouncedLocationFilter,
                    rateType: filters.rateType,
                    minRate: debouncedMinRate,
                    maxRate: debouncedMaxRate,
                    status: filters.status,
                });
                setCandidates(result.data);
                setTotalPages(result.totalPages);
                setTotalResults(result.total);
            } catch (error) {
                console.error("Failed to fetch candidates", error);
                setCandidates([]);
                setTotalPages(0);
                setTotalResults(0);
            } finally {
                setIsLoading(false);
            }
        }
        loadCandidates();
    }, [
        currentPage,
        debouncedSearchTerm,
        debouncedLocationFilter,
        debouncedMinRate,
        debouncedMaxRate,
        filters.role,
        filters.subject,
        filters.rateType,
        filters.status,
    ]);


    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm, filters.role, filters.subject, debouncedLocationFilter, filters.rateType, debouncedMinRate, debouncedMaxRate, filters.status]);


    const filterProps = {
        filters,
        setFilters,
        allRoles,
        allStatuses,
    };

    const handleFilterChange = (newFilters: FilterState) => {
        setFilters(newFilters);
        // Close mobile filters after selection
        setShowMobileFilters(false);
        // Close mobile sheet after selection
        setIsMobileSheetOpen(false);
    };

    const updatedFilterProps = {
        ...filterProps,
        setFilters: handleFilterChange,
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
                                        <MobileFilters {...updatedFilterProps} />
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
                                    <DesktopFilters {...updatedFilterProps} />
                                </CardContent>
                            </Card>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="lg:col-span-3">
                        <div className="flex flex-col gap-4 sm:gap-6">
                            {/* Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold font-headline">
                                        Candidate Marketplace
                                    </h1>
                                    {/* Selected Filters Section */}
                                    <SelectedFilters filters={filters} setFilters={setFilters} />
                                </div>
                                
                                {/* Mobile Filters Sheet for larger mobile screens */}
                                <div className="block lg:hidden">
                                    <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
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
                                                <MobileFilters {...updatedFilterProps} />
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
                            {isLoading ? (
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
                                            Showing {candidates.length > 0 ? (currentPage - 1) * CANDIDATES_PER_PAGE + 1 : 0}–
                                            {(currentPage - 1) * CANDIDATES_PER_PAGE + candidates.length} of {totalResults} results
                                        </span>
                                    </div>

                                    {/* Candidates Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                                        {candidates.length > 0 ? (
                                            candidates.map(candidate => (
                                                <CandidateCard key={candidate.id} candidate={candidate} />
                                            ))
                                        ) : (
                                            <div className="text-center text-muted-foreground col-span-full py-8 sm:py-12">
                                                <p className="text-base sm:text-lg font-semibold mb-2">No candidates found.</p>
                                                <p className="text-sm sm:text-base">Try adjusting your search or filters.</p>
                                            </div>
                                        )}
                                    </div>
                                    
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
