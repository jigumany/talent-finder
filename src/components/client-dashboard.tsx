'use client';
import Link from 'next/link';
import { useMemo, useEffect, useState } from 'react';
import { fetchBookingsPaginated } from '@/lib/data-service';
import type { Booking } from '@/lib/types';
import { CalendarCheck2, Calendar, Briefcase, FilePlus2, Users, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { format, parseISO, subMonths } from 'date-fns';
import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from './ui/chart';

// Number of months to show in the chart
const CHART_MONTHS_TO_SHOW = 6;

export default function ClientDashboard() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasMore, setHasMore] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalBookings, setTotalBookings] = useState(0);

    useEffect(() => {
        async function loadRecentBookings() {
            setIsLoading(true);
            try {
                // Load multiple pages to get enough data for charts
                let allBookings: Booking[] = [];
                let page = 1;
                let hasMoreData = true;
                const maxPagesToLoad = 3; // Load up to 150 bookings (3 pages of 50)
                
                while (hasMoreData && page <= maxPagesToLoad) {
                    const result = await fetchBookingsPaginated(page, 50);
                    allBookings = [...allBookings, ...result.data];
                    hasMoreData = result.currentPage < result.totalPages;
                    page++;
                    
                    // If we have enough bookings for the charts, stop loading
                    if (allBookings.length >= 100) {
                        break;
                    }
                }
                
                setBookings(allBookings);
                setTotalBookings(allBookings.length);
                setHasMore(hasMoreData);
            } catch (error) {
                console.error('Error loading bookings:', error);
            } finally {
                setIsLoading(false);
            }
        }
        loadRecentBookings();
    }, []);
    
    const confirmedBooking = useMemo(() => bookings.find(b => b.status === 'Confirmed'), [bookings]);

    const monthlyBookingsChartData = useMemo(() => {
        const sixMonthsAgo = subMonths(new Date(), CHART_MONTHS_TO_SHOW - 1);
        
        const counts: {[key: string]: number} = {};
        bookings.forEach(booking => {
            try {
                const date = parseISO(booking.date);
                // Only include bookings from the last 6 months
                if (date >= sixMonthsAgo) {
                    const month = format(date, 'MMM');
                    counts[month] = (counts[month] || 0) + 1;
                }
            } catch (error) {
                console.error('Error parsing booking date:', booking.date);
            }
        });

        const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
        // Get last 6 months including current
        const currentMonthIndex = new Date().getMonth();
        const lastSixMonths = [];
        for (let i = CHART_MONTHS_TO_SHOW - 1; i >= 0; i--) {
            const monthIndex = (currentMonthIndex - i + 12) % 12;
            lastSixMonths.push(monthOrder[monthIndex]);
        }
        
        return lastSixMonths.map(month => ({
            month,
            bookings: counts[month] || 0,
        }));
    }, [bookings]);

    const monthlyChartConfig = {
        bookings: {
            label: "Bookings",
            color: "hsl(var(--primary))",
        },
    } satisfies ChartConfig;

     const statusDistributionChartData = useMemo(() => {
        const counts: Record<string, number> = {
            Completed: 0,
            Confirmed: 0,
            Interview: 0,
            Pencilled: 0,
            Cancelled: 0,
        };

        bookings.forEach(booking => {
            if (counts.hasOwnProperty(booking.status)) {
                counts[booking.status]++;
            } else {
                // For any other status, count as "Other"
                counts[booking.status] = (counts[booking.status] || 0) + 1;
            }
        });

        // Filter out zero values and transform
        return Object.entries(counts)
            .filter(([_, value]) => value > 0)
            .map(([status, value], index) => ({
                name: status,
                value: value,
                fill: `hsl(var(--chart-${(index % 5) + 1}))`,
            }));
    }, [bookings]);

    const statusChartConfig = {
        value: {
            label: "Bookings",
        },
    } satisfies ChartConfig;

    const loadMoreBookings = async () => {
        if (!hasMore) return;
        
        setIsLoading(true);
        try {
            const nextPage = currentPage + 1;
            const result = await fetchBookingsPaginated(nextPage, 50);
            setBookings(prev => [...prev, ...result.data]);
            setCurrentPage(nextPage);
            setHasMore(result.currentPage < result.totalPages);
        } catch (error) {
            console.error('Error loading more bookings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && bookings.length === 0) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    return (
      <div className="flex flex-col gap-8">
         <div className="flex justify-between items-start">
            <h1 id="tour-step-0" className="text-2xl font-bold font-headline">Client Dashboard</h1>
            <div className="flex gap-2">
                 <Button asChild size="sm">
                    <Link href="/browse-candidates">
                        <Users className="md:mr-2 h-4 w-4"/>
                        <span className="hidden md:inline">Go to Marketplace</span>
                    </Link>
                </Button>
                <Button asChild size="sm" id="tour-step-2-action">
                    <Link href="/post-a-job">
                        <FilePlus2 className="md:mr-2 h-4 w-4"/>
                        <span className="hidden md:inline">Post a Job</span>
                    </Link>
                </Button>
            </div>
         </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Upcoming Booking</CardTitle>
                    <CalendarCheck2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {confirmedBooking ? (
                        <>
                            <div className="text-2xl font-bold truncate">{confirmedBooking.candidateName}</div>
                            <p className="text-xs text-muted-foreground">
                                For {format(parseISO(confirmedBooking.date), "dd/MM/yyyy")}
                            </p>
                        </>
                    ) : (
                         <div className="text-lg font-semibold text-muted-foreground">None</div>
                    )}
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Manage Diary</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                   <p className="text-xs text-muted-foreground mb-2">View and manage your booking schedule.</p>
                   <Button size="sm" asChild>
                     <Link href="/diary">Open Diary</Link>
                   </Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Booking History</CardTitle>
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                 <CardContent>
                    <p className="text-xs text-muted-foreground mb-2">
                        Showing {bookings.length} of {totalBookings} total bookings
                    </p>
                     <Button size="sm" asChild>
                        <Link href="/bookings">View Bookings</Link>
                    </Button>
                    {hasMore && bookings.length > 0 && (
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2 w-full"
                            onClick={loadMoreBookings}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="h-3 w-3 animate-spin mr-2" />
                            ) : null}
                            Load More Bookings
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Bookings per Month</CardTitle>
                    <CardDescription>
                        Last {CHART_MONTHS_TO_SHOW} months of booking activity
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={monthlyChartConfig} className="min-h-[200px] w-full">
                        <BarChart accessibilityLayer data={monthlyBookingsChartData}>
                           <CartesianGrid vertical={false} />
                           <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                            />
                           <Bar dataKey="bookings" fill="var(--color-bookings)" radius={8} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Booking Status Distribution</CardTitle>
                    <CardDescription>
                        {bookings.length} bookings analyzed
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-0">
                    <ChartContainer config={statusChartConfig} className="mx-auto aspect-square max-h-[250px]">
                        <PieChart>
                            <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                            <Pie 
                                data={statusDistributionChartData} 
                                dataKey="value" 
                                nameKey="name" 
                                innerRadius={60} 
                                strokeWidth={5} 
                            />
                            <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                        </PieChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
      </div>
    );
}