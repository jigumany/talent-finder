
'use client';
import { useState, useRef } from "react";
import { useRole } from "@/context/role-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, Handshake, Mail, X } from "lucide-react";
import images from '@/lib/placeholder-images.json';

export default function ProfilePage() {
    const { role } = useRole();
    const isClient = role === 'client';

    const schoolLogo = images['school-logo'];

    const [clientLogo, setClientLogo] = useState<string | null>(schoolLogo.src);
    const clientLogoRef = useRef<HTMLInputElement>(null);
    

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setPreview: (url: string | null) => void) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const clientData = {
        schoolName: 'Oakwood Primary School',
        contactEmail: 'contact@oakwoodprimary.org.uk',
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold font-headline">School Profile</h1>
            
                <>
                    <Card>
                        <CardHeader>
                            <CardTitle>School Information</CardTitle>
                            <CardDescription>Update your school's information.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-6">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage 
                                        src={clientLogo ?? undefined} 
                                        alt={clientData.schoolName}
                                        width={schoolLogo.width}
                                        height={schoolLogo.height}
                                        data-ai-hint={schoolLogo.hint} 
                                    />
                                    <AvatarFallback>{clientData.schoolName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div className="grid gap-2 flex-1">
                                    <Label>School Logo</Label>
                                    <div className="flex gap-2">
                                         <Button variant="outline" onClick={() => clientLogoRef.current?.click()}>
                                            <Upload className="mr-2 h-4 w-4" />
                                            Upload Logo
                                         </Button>
                                         {clientLogo && (
                                            <Button variant="ghost" size="icon" onClick={() => setClientLogo(null)}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                         )}
                                    </div>
                                    <Input
                                        ref={clientLogoRef}
                                        id="school-logo-upload"
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, setClientLogo)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="schoolName">School Name</Label>
                                <Input id="schoolName" defaultValue={clientData.schoolName} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contactEmail">Contact Email</Label>
                                <Input id="contactEmail" type="email" defaultValue={clientData.contactEmail} />
                            </div>
                             <Button>Save Changes</Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Notifications</CardTitle>
                            <CardDescription>Manage your notification preferences.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
                                <div className="flex flex-col space-y-1">
                                    <Label htmlFor="email-notifications">Email Notifications</Label>
                                    <span className="text-sm text-muted-foreground">
                                        Receive emails about new bookings and messages.
                                    </span>
                                </div>
                                <Switch id="email-notifications" defaultChecked />
                              </div>
                               <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
                                <div className="flex flex-col space-y-1">
                                    <Label htmlFor="push-notifications">Push Notifications</Label>
                                    <span className="text-sm text-muted-foreground">
                                        Get push notifications on your mobile device.
                                    </span>
                                </div>
                                <Switch id="push-notifications" />
                              </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Marketing Preferences</CardTitle>
                            <CardDescription>Manage how we communicate with you for marketing purposes.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
                                <div className="flex flex-col space-y-1">
                                    <Label htmlFor="newsletter-notifications" className="flex items-center">
                                      <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                                      GSL Client Marketplace Newsletter
                                    </Label>
                                    <span className="text-sm text-muted-foreground pl-6">
                                        Receive updates about new features, tips, and platform news.
                                    </span>
                                </div>
                                <Switch id="newsletter-notifications" defaultChecked />
                              </div>
                               <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
                                <div className="flex flex-col space-y-1">
                                    <Label htmlFor="partner-notifications" className="flex items-center">
                                      <Handshake className="mr-2 h-4 w-4 text-muted-foreground" />
                                      Partner Promotions
                                    </Label>
                                    <span className="text-sm text-muted-foreground pl-6">
                                       Receive occasional offers and promotions from our trusted partners.
                                    </span>
                                </div>
                                <Switch id="partner-notifications" />
                              </div>
                        </CardContent>
                    </Card>
                </>
            
        </div>
    );
}
