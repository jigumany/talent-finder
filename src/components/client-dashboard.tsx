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
                const result = await fetchBookingsPaginated(1, 50);
                setBookings(result.data);
                setTotalBookings(result.total);
                setHasMore(result.currentPage < result.totalPages);
                setCurrentPage(result.currentPage);
            } catch (error) {
                console.error('Error loading bookings:', error);
            } finally {
                setIsLoading(false);
            }
        }
        loadRecentBookings();
    }, []);
    
    // Find upcoming booking (status 'Confirmed' or 'Pencilled')
    const upcomingBooking = useMemo(() => {
        const today = new Date();
        // Sort by start_date and find the first upcoming booking
        const upcoming = bookings
            .filter(b => {
                try {
                    const startDate = parseISO(b.startDate);
                    return startDate >= today && 
                           (b.status === 'Confirmed' || b.status === 'Pencilled' || b.status === 'Pending');
                } catch (error) {
                    return false;
                }
            })
            .sort((a, b) => {
                try {
                    return parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime();
                } catch (error) {
                    return 0;
                }
            });
        
        return upcoming[0] || null;
    }, [bookings]);

    const monthlyBookingsChartData = useMemo(() => {
        const sixMonthsAgo = subMonths(new Date(), CHART_MONTHS_TO_SHOW - 1);
        
        const counts: {[key: string]: number} = {};
        bookings.forEach(booking => {
            try {
                const date = parseISO(booking.startDate);
                // Only include bookings from the last 6 months
                if (date >= sixMonthsAgo) {
                    const month = format(date, 'MMM');
                    counts[month] = (counts[month] || 0) + 1;
                }
            } catch (error) {
                console.error('Error parsing booking date:', booking.startDate);
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
        const counts: Record<string, number> = {};
        
        // Initialize with common statuses
        const commonStatuses = ['Confirmed', 'Pencilled', 'Pending', 'Cancelled', 'Completed'];
        commonStatuses.forEach(status => counts[status] = 0);
        
        // Count actual statuses from bookings
        bookings.forEach(booking => {
            const status = booking.status || 'Unknown';
            counts[status] = (counts[status] || 0) + 1;
        });

        // Filter out zero values and transform for chart
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
            setTotalBookings(result.total);
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
                    {upcomingBooking ? (
                        <>
                            <div className="text-2xl font-bold truncate">{upcomingBooking.candidateName}</div>
                            <p className="text-xs text-muted-foreground">
                                {upcomingBooking.startDate === upcomingBooking.endDate 
                                    ? `On ${format(parseISO(upcomingBooking.startDate), "dd/MM/yyyy")}`
                                    : `${format(parseISO(upcomingBooking.startDate), "dd/MM")} - ${format(parseISO(upcomingBooking.endDate), "dd/MM/yyyy")}`
                                }
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Status: <span className="font-medium">{upcomingBooking.status}</span>
                            </p>
                        </>
                    ) : (
                         <div className="text-lg font-semibold text-muted-foreground">No upcoming bookings</div>
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