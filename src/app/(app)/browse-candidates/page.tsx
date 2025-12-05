
'use client';
import { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CandidateCard } from '@/components/candidate-card';
import { mockCandidates } from '@/lib/mock-data';
import type { Candidate } from '@/lib/types';
import { ListFilter, Search, PoundSterling } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const roles = [...new Set(mockCandidates.map(c => c.role))];
const subjects = ['History', 'Mathematics', 'Science', 'English', 'Chemistry', 'PGCE', 'QTS'];

interface FiltersProps {
    role: string;
    setRole: (role: string) => void;
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
}

function Filters({ role, setRole, subject, setSubject, location, setLocation, rateType, setRateType, minRate, setMinRate, maxRate, setMaxRate }: FiltersProps) {
    return (
        <Accordion type="multiple" defaultValue={['item-1', 'item-2']} className="w-full">
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
                                    {roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
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
        </Accordion>
    )
}

export default function BrowseCandidatesPage() {
    const allCandidates = useMemo(() => mockCandidates, []);
    const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>(allCandidates);
    
    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [subjectFilter, setSubjectFilter] = useState('all');
    const [locationFilter, setLocationFilter] = useState('');
    const [rateTypeFilter, setRateTypeFilter] = useState('all');
    const [minRate, setMinRate] = useState('');
    const [maxRate, setMaxRate] = useState('');

    useEffect(() => {
      try {
        const lowercasedTerm = searchTerm.toLowerCase();
        const minRateNum = minRate ? parseFloat(minRate) : -Infinity;
        const maxRateNum = maxRate ? parseFloat(maxRate) : Infinity;

        const filtered = allCandidates.filter(candidate => {
            if (searchTerm && !(
                candidate.name.toLowerCase().includes(lowercasedTerm) ||
                candidate.role.toLowerCase().includes(lowercasedTerm) ||
                candidate.qualifications.some(q => q.toLowerCase().includes(lowercasedTerm))
            )) {
                return false;
            }

            if (roleFilter !== 'all' && candidate.role !== roleFilter) {
                return false;
            }

            if (subjectFilter !== 'all' && !(
                candidate.qualifications.some(q => q.toLowerCase().includes(subjectFilter)) ||
                candidate.role.toLowerCase().includes(subjectFilter)
            )) {
                return false;
            }

            if (rateTypeFilter !== 'all' && candidate.rateType !== rateTypeFilter) {
                return false;
            }
            
            if (candidate.rate < minRateNum || candidate.rate > maxRateNum) {
                return false;
            }

            if (locationFilter && !candidate.location.toLowerCase().includes(locationFilter.toLowerCase())) {
                return false;
            }

            return true;
        });
        
        setFilteredCandidates(filtered);
      } catch (error) {
        console.error("Error filtering candidates:", error);
        setFilteredCandidates([]);
      }
    }, [searchTerm, roleFilter, subjectFilter, locationFilter, rateTypeFilter, minRate, maxRate, allCandidates]);
    
    const filterProps = {
        role: roleFilter,
        setRole: setRoleFilter,
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
    };

    return (
        <div className="grid md:grid-cols-[280px_1fr] gap-8">
            <aside className="hidden md:block">
                <div className="sticky top-20">
                    <h2 className="text-lg font-semibold mb-4 px-4">Filters</h2>
                    <Filters {...filterProps} />
                </div>
            </aside>
            
            <div className="flex flex-col gap-6">
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

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredCandidates.map(candidate => (
                        <CandidateCard key={candidate.id} candidate={candidate} />
                    ))}
                </div>
                 {filteredCandidates.length === 0 && (
                    <div className="text-center text-muted-foreground col-span-full py-12">
                        <p className="text-lg font-semibold">No candidates found.</p>
                        <p>Try adjusting your search or filters.</p>
                    </div>
                 )}
            </div>
        </div>
    );
}
