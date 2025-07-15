
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import {
    Briefcase,
    CalendarDays,
    FileText,
    Home,
    LogOut,
    PenSquare,
    School,
    Settings,
    User,
    Users,
    Calendar,
    Search,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useRole } from '@/context/role-context';


const clientNav = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Browse Candidates', href: '/#marketplace', icon: Users },
    { name: 'Find Me Someone', href: '/find-me-someone', icon: Search },
    { name: 'Diary', href: '/diary', icon: Calendar },
    { name: 'Bookings', href: '/bookings', icon: Briefcase },
    { name: 'Review Generator', href: '/review-generator', icon: PenSquare },
    { name: 'Profile', href: '/profile', icon: User },
];

const candidateNav = [
    { name: 'Dashboard', href: '/dashboard', icon: CalendarDays },
    { name: 'Timesheets', href: '/timesheets', icon: FileText },
    { name: 'Bookings', href: '/bookings', icon: Briefcase },
    { name: 'Profile', href: '/profile', icon: User },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
    const { role, setRole } = useRole();
    const pathname = usePathname();
    const navItems = role === 'client' ? clientNav : candidateNav;
    const user = role === 'client' ? { name: 'Hill Valley School', email: 'contact@hillvalley.edu', fallback: 'HV' } : { name: 'Jane Doe', email: 'jane.doe@example.com', fallback: 'JD' };

    return (
        <SidebarProvider>
            <Sidebar>
                <SidebarHeader>
                    <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg text-primary">
                        <School className="h-6 w-6" />
                        <span>Staffable</span>
                    </Link>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarMenu>
                        {navItems.map((item) => (
                            <SidebarMenuItem key={item.name}>
                                <Link href={item.href} passHref legacyBehavior>
                                    <SidebarMenuButton
                                        isActive={pathname === item.href || pathname.startsWith(item.href + '/')}
                                        tooltip={item.name}
                                    >
                                        <item.icon />
                                        <span>{item.name}</span>
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarContent>
                <SidebarFooter>
                    <div className="flex items-center gap-2 p-2">
                        <Label htmlFor="role-switcher" className="text-sm font-medium text-muted-foreground">
                            Candidate
                        </Label>
                        <Switch
                            id="role-switcher"
                            checked={role === 'client'}
                            onCheckedChange={(checked) => setRole(checked ? 'client' : 'candidate')}
                        />
                         <Label htmlFor="role-switcher" className="text-sm font-medium">
                            Client
                        </Label>
                    </div>
                </SidebarFooter>
            </Sidebar>
            <SidebarInset>
                <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
                    <SidebarTrigger className="md:hidden" />
                    <div className="w-full flex-1">
                        {/* Can add a search bar here later */}
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="icon" className="rounded-full">
                                <Avatar>
                                    <AvatarImage src={`https://placehold.co/32x32.png?text=${user.fallback}`} alt={user.name} />
                                    <AvatarFallback>{user.fallback}</AvatarFallback>
                                </Avatar>
                                <span className="sr-only">Toggle user menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-xs text-muted-foreground">{user.email}</div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem><Settings className="mr-2 h-4 w-4" />Settings</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <Link href="/" passHref legacyBehavior>
                                <DropdownMenuItem><LogOut className="mr-2 h-4 w-4" />Logout</DropdownMenuItem>
                            </Link>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </header>
                <main className="flex-1 p-4 sm:p-6 bg-background">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
