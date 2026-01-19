
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
  DropdownMenuTrigger,
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
    Ban,
    Menu,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useRole } from '@/context/role-context';
import { cn } from '@/lib/utils';
import { Logo } from './logo';
import images from '@/lib/placeholder-images.json';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUser, useUserContact } from '@/context/user-context';
import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { logout } from '@/app/auth/actions';


const clientNav = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, id: 'tour-step-1' },
    { name: 'Browse', href: '/browse-candidates', icon: Users, id: 'tour-step-3' },
    { name: 'Find', href: '/find-me-someone', icon: Search },
    { name: 'Booking Manager', href: '/post-a-job', icon: FilePlus2, id: 'tour-step-2' },
    { name: 'Diary', href: '/diary', icon: Calendar },
    { name: 'Bookings', href: '/bookings', icon: Briefcase, id: 'tour-step-4' },
    { name: 'Reviews', href: '/review-generator', icon: PenSquare },
    { name: 'Blacklist', href: '/blacklist', icon: Ban },
    { name: 'Profile', href: '/profile', icon: User },
];


export function AppLayout({ children }: { children: React.ReactNode }) {
    const { role, setRole } = useRole();
    const pathname = usePathname();
    const { user } = useUser();
    const contact = useUserContact();
    const avatarImage = images['user-avatar-fallback'];
    const isMobile = useIsMobile();
    const [isClient, setIsClient] = useState(false);
    const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const displayUser = {
        name: user?.profile?.company?.name || 'Company',
        email: contact?.email || 'No email'
    };

    const avatarData = {
        src: '', // You might want to add avatar URL to your UserProfile type
        hint: user?.profile?.company?.name || 'User avatar',
        fallback: user?.profile?.company?.name?.charAt(0)?.toUpperCase() || 'U'
    };

    const navItems = clientNav;

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
                    <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="md:hidden">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle navigation menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0">
                            <SheetHeader className="border-b p-4">
                                <SheetTitle asChild>
                                    <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg text-primary" onClick={() => setIsMobileSheetOpen(false)}>
                                        <Logo className="h-8 w-auto" />
                                    </Link>
                                </SheetTitle>
                                <SheetDescription className="sr-only">
                                    Main navigation menu.
                                </SheetDescription>
                            </SheetHeader>
                            <nav className="flex flex-col h-full">
                                <div className="flex-1 overflow-y-auto">
                                    <div className="grid items-start p-2 text-sm font-medium lg:px-4">
                                        {navItems.map((item) => (
                                            <SheetClose asChild key={item.name}>
                                                <Link
                                                    id={item.id}
                                                    href={item.href}
                                                    className={cn(
                                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                                                        (pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard')) && "bg-muted text-primary"
                                                    )}>
                                                    <item.icon className="h-4 w-4" />
                                                    {item.name}
                                                </Link>
                                            </SheetClose>
                                        ))}
                                    </div>
                                </div>
                            </nav>
                        </SheetContent>
                    </Sheet>
                    
                    <div className="flex-1">
                         <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg text-primary">
                            <Logo className="h-7 w-auto" />
                        </Link>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="icon" className="rounded-full">
                                <Avatar>
                                    <AvatarImage src={avatarData.src} alt={displayUser.name} data-ai-hint={avatarData.hint} />
                                    <AvatarFallback>{avatarData.fallback}</AvatarFallback>
                                </Avatar>
                                <span className="sr-only">Toggle user menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>
                                <div className="font-medium">{displayUser.name}</div>
                                <div className="text-xs text-muted-foreground">{displayUser.email}</div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                             <DropdownMenuItem asChild>
                                <form action={logout} className="w-full">
                                  <button type="submit" className="flex items-center w-full cursor-default select-none rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Logout</span>
                                  </button>
                                </form>
                              </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </header>
                <main className="p-4 sm:p-6 pb-20">
                    {children}
                </main>
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
                                    id={item.id}
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
                                    <AvatarImage src={avatarData.src} alt={displayUser.name} data-ai-hint={avatarData.hint} />
                                    <AvatarFallback>{avatarData.fallback}</AvatarFallback>
                                </Avatar>
                                <span className="sr-only">Toggle user menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>
                                <div className="font-medium">{displayUser.name}</div>
                                <div className="text-xs text-muted-foreground">{displayUser.email}</div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                             <DropdownMenuItem asChild>
                                <form action={logout} className="w-full">
                                   <button type="submit" className="flex items-center w-full cursor-default select-none rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Logout</span>
                                  </button>
                                </form>
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
