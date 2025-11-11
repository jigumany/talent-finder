
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
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import {
    Briefcase,
    Calendar,
    FileText,
    Home,
    LogOut,
    PenSquare,
    Search,
    User,
    Users,
    FilePlus2,
    Activity,
    Info,
    MoreVertical,
    XCircle,
    Pencil as PencilIcon,
    Loader2,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useRole } from '@/context/role-context';
import { cn } from '@/lib/utils';
import { Logo } from './logo';
import images from '@/lib/placeholder-images.json';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState, useEffect } from 'react';


const clientNav = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Browse', href: '/browse-candidates', icon: Users },
    { name: 'Find', href: '/find-me-someone', icon: Search },
    { name: 'Post a Job', href: '/post-a-job', icon: FilePlus2 },
    { name: 'Diary', href: '/diary', icon: Calendar },
    { name: 'Bookings', href: '/bookings', icon: Briefcase },
    { name: 'Reviews', href: '/review-generator', icon: PenSquare },
    { name: 'Profile', href: '/profile', icon: User },
];

const candidateNav = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Timesheets', href: '/timesheets', icon: FileText },
    { name: 'Bookings', href: '/bookings', icon: Briefcase },
    { name: 'Profile', href: '/profile', icon: User },
];

function BottomNavBar({ navItems }: { navItems: typeof clientNav | typeof candidateNav }) {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card md:hidden">
            <div className="flex h-16 items-center justify-around">
                {navItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center justify-center gap-1 text-muted-foreground w-full h-full",
                            (pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))) && "text-primary"
                        )}
                    >
                        <item.icon className="h-6 w-6" />
                        <span className="text-xs font-medium">{item.name}</span>
                    </Link>
                ))}
            </div>
        </nav>
    );
}


export function AppLayout({ children }: { children: React.ReactNode }) {
    const { role, setRole } = useRole();
    const pathname = usePathname();
    const user = role === 'client' ? { name: 'Oakwood Primary', email: 'contact@oakwoodprimary.org.uk', fallback: 'OP' } : { name: 'Amelia Collins', email: 'amelia.c@example.co.uk', fallback: 'AC' };
    const navItems = role === 'client' ? clientNav : candidateNav;
    const avatarImage = images['user-avatar-fallback'];
    const isMobile = useIsMobile();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);


    if (!isClient) {
        return (
             <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (isMobile) {
        return (
            <>
                 <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6 sticky top-0 z-40">
                    <div className="flex-1">
                         <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg text-primary">
                            <Logo className="h-7 w-auto" />
                        </Link>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="icon" className="rounded-full">
                                <Avatar>
                                    <AvatarImage src={avatarImage.src} alt={user.name} data-ai-hint={avatarImage.hint} />
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
                             <DropdownMenuGroup>
                                <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors">
                                    <Label htmlFor="role-switcher" className="flex-1 pr-2">
                                        Client Role
                                    </Label>
                                    <Switch
                                        id="role-switcher"
                                        checked={role === 'client'}
                                        onCheckedChange={(checked) => setRole(checked ? 'client' : 'candidate')}
                                    />
                                </div>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/"><LogOut className="mr-2 h-4 w-4" />Logout</Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </header>
                <main className="p-4 sm:p-6 pb-20">
                    {children}
                </main>
                <BottomNavBar navItems={navItems} />
            </>
        )
    }

    return (
        <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr]">
            <aside className="hidden border-r bg-card md:block">
                <div className="flex h-full max-h-screen flex-col gap-2">
                    <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg text-primary">
                            <Logo className="h-8 w-auto" />
                        </Link>
                    </div>
                    <div className="flex-1">
                        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                            {navItems.map((item) => (
                                 <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                                        (pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard')) && "bg-muted text-primary"
                                    )}>
                                    <item.icon className="h-4 w-4" />
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>
            </aside>
            <div className="flex flex-col">
                <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
                    <div className="w-full flex-1">
                       {/* Desktop search or other header controls can go here */}
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="icon" className="rounded-full">
                                <Avatar>
                                    <AvatarImage src={avatarImage.src} alt={user.name} data-ai-hint={avatarImage.hint} />
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
                             <DropdownMenuGroup>
                                <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors">
                                    <Label htmlFor="role-switcher-desktop" className="flex-1 pr-2">
                                        Client Role
                                    </Label>
                                    <Switch
                                        id="role-switcher-desktop"
                                        checked={role === 'client'}
                                        onCheckedChange={(checked) => setRole(checked ? 'client' : 'candidate')}
                                    />
                                </div>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/"><LogOut className="mr-2 h-4 w-4" />Logout</Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
                    {children}
                </main>
            </div>
        </div>
    );
}
