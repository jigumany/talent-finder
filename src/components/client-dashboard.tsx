
'use client';
import Link from 'next/link';
import { useMemo } from 'react';
import { mockClientBookings } from '@/lib/mock-data';
import { CalendarCheck2, Calendar, Briefcase, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { format, getMonth, getYear, parseISO } from 'date-fns';
import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from './ui/chart';

export default function ClientDashboard() {
    
    const confirmedBooking = mockClientBookings.find(b => b.status === 'Confirmed');

    const monthlyBookingsChartData = useMemo(() => {
        const counts: {[key: string]: number} = {};
        mockClientBookings.forEach(booking => {
            const date = parseISO(booking.date);
            const month = format(date, 'MMM');
            counts[month] = (counts[month] || 0) + 1;
        });

        const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
        return monthOrder.map(month => ({
            month,
            bookings: counts[month] || 0,
        })).filter(d => d.bookings > 0);
    }, []);

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
        };

        mockClientBookings.forEach(booking => {
            if (counts.hasOwnProperty(booking.status)) {
                counts[booking.status]++;
            }
        });

        return Object.keys(counts).map((status, index) => ({
            name: status,
            value: counts[status],
            fill: `hsl(var(--chart-${index + 1}))`,
        }));
    }, []);

    const statusChartConfig = {
        value: {
            label: "Bookings",
        },
        Completed: {
            label: "Completed",
            color: "hsl(var(--chart-1))",
        },
        Confirmed: {
            label: "Confirmed",
            color: "hsl(var(--chart-2))",
        },
        Interview: {
            label: "Interview",
            color: "hsl(var(--chart-3))",
        },
    } satisfies ChartConfig;


    return (
      <div className="flex flex-col gap-8">
         <div className="flex justify-between items-start">
            <h1 className="text-2xl font-bold font-headline">Client Dashboard</h1>
             <Button asChild>
                <Link href="/find-me-someone">
                    <Search className="mr-2 h-4 w-4"/> Find Me Someone
                </Link>
            </Button>
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
                            <div className="text-2xl font-bold">{confirmedBooking.candidateName}</div>
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
                   <Button variant="outline" size="sm" asChild>
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
                    <p className="text-xs text-muted-foreground mb-2">Review all past and upcoming bookings.</p>
                     <Button variant="outline" size="sm" asChild>
                        <Link href="/bookings">View Bookings</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Bookings per Month</CardTitle>
                    <CardDescription>A summary of your booking activity over the recent months.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={monthlyChartConfig} className="min-h-[200px] w-full">
                        <BarChart accessibilityLayer data={monthlyBookingsChartData}>
                           <CartesianGrid vertical={false} />
                           <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                            <Tooltip
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
                    <CardDescription>A breakdown of your bookings by their current status.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-0">
                    <ChartContainer config={statusChartConfig} className="mx-auto aspect-square max-h-[250px]">
                        <PieChart>
                            <Tooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                            <Pie data={statusDistributionChartData} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={5} />
                             <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                        </PieChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Browse Candidates</CardTitle>
                <CardDescription>
                    Explore our pool of qualified candidates to find the perfect fit for your school.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground mb-4">
                    Our marketplace allows you to filter by role, subject, location, and rate to quickly find available staff.
                </p>
                <Button asChild>
                    <Link href="/browse-candidates">
                        <Search className="mr-2 h-4 w-4"/> Go to Marketplace
                    </Link>
                </Button>
            </CardContent>
        </Card>

      </div>
    );
}
