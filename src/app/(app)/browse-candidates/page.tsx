'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CandidateCard } from '@/components/candidate-card';
import type { Candidate } from '@/lib/types';
import { ListFilter, Search, Loader2, ChevronDown, ChevronUp, X } from 'lucide-react';
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

interface FilterState {
    searchTerm: string;
    role: string;
}

interface FiltersProps {
    filters: FilterState;
    setFilters: (filters: FilterState) => void;
    allRoles: string[];
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
    
    const handleRemoveFilter = (key: keyof FilterState, defaultValue: string) => {
        setFilters({ ...filters, [key]: defaultValue });
    };
    
    const handleClearAll = () => {
        setFilters({
            searchTerm: '',
            role: 'all',
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
    allRoles
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
            </div>
        </div>
    );
}

// Desktop Filters Component with controlled accordion
function DesktopFilters({ 
    filters, 
    setFilters, 
    allRoles
}: FiltersProps) {
    const [accordionValue, setAccordionValue] = useState<string[]>(['item-1']);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const updateFilter = useCallback((key: keyof FilterState, value: string) => {
        setFilters({ ...filters, [key]: value });
        
        const accordionItemMap: Record<string, string> = {
            'role': 'item-1',
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
                <AccordionTrigger className="text-sm sm:text-base">Role</AccordionTrigger>
                <AccordionContent>
                    <div className="space-y-4">
                        <div className="space-y-2">
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
    });

    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [totalResults, setTotalResults] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [initialLoad, setInitialLoad] = useState(true);

    const [allRoles, setAllRoles] = useState<string[]>([]);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const debouncedSearchTerm = useDebounce(filters.searchTerm, 300);

    useEffect(() => {
        async function loadMetadata() {
            try {
                const metadata = await getFilterMetadata();
                setAllRoles(metadata.roles);
            } catch (error) {
                console.error("Failed to load filter metadata", error);
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
                    search: debouncedSearchTerm,
                    role: filters.role
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
                setInitialLoad(false);
            }
        }
        loadCandidates();
    }, [
        currentPage,
        debouncedSearchTerm,
        filters.role,
    ]);

    useEffect(() => {
        setCurrentPage(1);
    }, [
        debouncedSearchTerm, 
        filters.role,
    ]);

    const filterProps = {
        filters,
        setFilters,
        allRoles,
    };

    const handleFilterChange = (newFilters: FilterState) => {
        setFilters(newFilters);
        setShowMobileFilters(false);
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
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold">Filters</h2>
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        className="flex items-center gap-2"
                                        onClick={() => setShowMobileFilters(!showMobileFilters)}
                                    >
                                        <ListFilter className="h-4 w-4" />
                                        {showMobileFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    </Button>
                                </div>
                                <SelectedFilters filters={filters} setFilters={setFilters} />
                                {showMobileFilters && (
                                    <div className="mt-4 pt-4 border-t">
                                        <MobileFilters {...updatedFilterProps} />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Desktop Sidebar */}
                    <aside className="hidden lg:block lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            <Card>
                                <CardContent className="p-6">
                                    <h2 className="text-lg font-semibold mb-4">Filters</h2>
                                    <SelectedFilters filters={filters} setFilters={setFilters} />
                                </CardContent>
                            </Card>
                            
                            <Card>
                                <CardContent className="p-6">
                                    <h3 className="text-md font-semibold mb-4">Refine Results</h3>
                                    <DesktopFilters {...updatedFilterProps} />
                                </CardContent>
                            </Card>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="lg:col-span-3">
                        <div className="flex flex-col gap-4 sm:gap-6">
                            {/* Header */}
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                                    <div className="flex-1 min-w-0">
                                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-headline">
                                            Candidate Marketplace
                                        </h1>
                                        <p className="text-sm text-muted-foreground mt-2">
                                            Discover qualified education professionals for your institution
                                        </p>
                                    </div>
                                </div>

                                {/* Search Bar - Improved mobile layout */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                                    <Input 
                                        placeholder="Search by name, subject, or keyword..." 
                                        className="pl-10 pr-4 h-11 sm:h-12 text-sm sm:text-base"
                                        value={filters.searchTerm}
                                        onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">
                                            {totalResults} candidates
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Loading State */}
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center h-64 gap-4">
                                    <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-primary" />
                                    <p className="text-sm sm:text-base text-muted-foreground text-center">
                                        {initialLoad ? 'Loading candidates...' : 'Searching...'}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Results Info */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 bg-muted/50 rounded-lg">
                                        <span className="text-sm font-medium">
                                            Showing <span className="font-bold">{candidates.length}</span> of <span className="font-bold">{totalResults}</span> candidates
                                        </span>
                                        <div className="text-xs text-muted-foreground">
                                            Page {currentPage} of {totalPages}
                                        </div>
                                    </div>

                                    {/* Candidates Grid */}
                                    {candidates.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                                            {candidates.map(candidate => (
                                                <CandidateCard key={candidate.id} candidate={candidate} />
                                            ))}
                                        </div>
                                    ) : (
                                        <Card className="border-dashed">
                                            <CardContent className="py-12 text-center">
                                                <div className="mx-auto max-w-md space-y-4">
                                                    <Search className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                                    <div>
                                                        <h3 className="text-lg font-semibold">No candidates found</h3>
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            Try adjusting your search criteria or filters
                                                        </p>
                                                    </div>
                                                    <Button 
                                                        variant="outline" 
                                                        className="mt-4"
                                                        onClick={() => {
                                                            setFilters({
                                                                searchTerm: '',
                                                                role: 'all',
                                                            });
                                                        }}
                                                    >
                                                        Clear all filters
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                    
                                    {/* Pagination */}
                                    {totalPages > 1 && candidates.length > 0 && (
                                        <div className="mt-6 sm:mt-8">
                                            <PaginationControls 
                                                currentPage={currentPage} 
                                                totalPages={totalPages} 
                                                onPageChange={setCurrentPage} 
                                            />
                                            <div className="text-center text-xs text-muted-foreground mt-3">
                                                {candidates.length} candidates on this page
                                            </div>
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