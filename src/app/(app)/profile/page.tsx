
'use client';
import { useRole } from "@/context/role-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload } from "lucide-react";
import images from '@/lib/placeholder-images.json';

export default function ProfilePage() {
    const { role } = useRole();
    const isClient = role === 'client';

    const womanPortrait = images['woman-portrait'];
    const schoolLogo = images['school-logo'];

    // Placeholder data for the candidate view
    const candidateData = {
        fullName: 'Amelia Collins',
        email: 'amelia.collins@example.co.uk',
        phoneNumber: '07700 900123',
        profilePhotoUrl: womanPortrait.src,
        cvUrl: 'my_cv_2024.pdf',
        roleType: 'Teaching Assistant',
        subjects: 'General Curriculum, Reading Support',
        qualifications: 'Child Development Cert., First Aid',
        experienceYears: 3,
        bio: 'Enthusiastic and certified Teaching Assistant with 3+ years of experience supporting lead teachers and students in a dynamic classroom environment.',
        baseLocation: 'Manchester, UK',
        canTravel: true,
        preferredRadiusKm: 30,
        hourlyRate: 25,
        dailyRate: 180,
    };

    const clientData = {
        schoolName: 'Oakwood Primary School',
        contactEmail: 'contact@oakwoodprimary.org.uk',
        profilePhotoUrl: schoolLogo.src,
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold font-headline">{isClient ? "School Profile" : "My Candidate Profile"}</h1>
            
            {isClient ? (
                // CLIENT VIEW
                <Card>
                    <CardHeader>
                        <CardTitle>School Information</CardTitle>
                        <CardDescription>Update your school's information.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-6">
                            <Avatar className="h-20 w-20">
                                <AvatarImage 
                                    src={clientData.profilePhotoUrl} 
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
                                     <Button variant="outline">
                                        <Upload className="mr-2 h-4 w-4" />
                                        Upload Logo
                                     </Button>
                                </div>
                                {/* <Input id="profile-photo" type="file" className="hidden" /> */}
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
            ) : (
                // CANDIDATE VIEW
                <>
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Keep your personal details up to date.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <div className="flex items-center gap-6">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage 
                                        src={candidateData.profilePhotoUrl} 
                                        alt={candidateData.fullName} 
                                        width={womanPortrait.width}
                                        height={womanPortrait.height}
                                        data-ai-hint={womanPortrait.hint}
                                    />
                                    <AvatarFallback>{candidateData.fullName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div className="grid gap-2 flex-1">
                                    <Label>Profile Photo</Label>
                                     <div className="flex gap-2">
                                         <Button variant="outline">
                                            <Upload className="mr-2 h-4 w-4" />
                                            Upload Photo
                                         </Button>
                                    </div>
                                    {/* <Input id="profile-photo" type="file" className="hidden" /> */}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Full Name</Label>
                                    <Input id="fullName" defaultValue={candidateData.fullName} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" defaultValue={candidateData.email} readOnly />
                                </div>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="phoneNumber">Phone Number</Label>
                                <Input id="phoneNumber" type="tel" defaultValue={candidateData.phoneNumber} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                         <CardHeader>
                            <CardTitle>Professional Details</CardTitle>
                            <CardDescription>Showcase your experience and skills.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="roleType">Primary Role</Label>
                                    <Input id="roleType" defaultValue={candidateData.roleType} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="experienceYears">Years of Experience</Label>
                                    <Input id="experienceYears" type="number" defaultValue={candidateData.experienceYears} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="subjects">Subjects/Specialties</Label>
                                <Input id="subjects" defaultValue={candidateData.subjects} placeholder="e.g. Maths, Science, Early Years" />
                                <p className="text-sm text-muted-foreground">Enter a comma-separated list.</p>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="qualifications">Qualifications & Certifications</Label>
                                <Input id="qualifications" defaultValue={candidateData.qualifications} placeholder="e.g. PGCE, QTS, First Aid Certified" />
                                <p className="text-sm text-muted-foreground">Enter a comma-separated list.</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea id="bio" placeholder="Tell us about your experience..." defaultValue={candidateData.bio} rows={5} />
                            </div>
                            <div className="space-y-2">
                                <Label>Upload CV</Label>
                                <div className="flex items-center gap-2">
                                     <Button variant="outline">
                                        <Upload className="mr-2 h-4 w-4" />
                                        Upload CV
                                     </Button>
                                     {candidateData.cvUrl && <p className="text-sm text-muted-foreground">Current file: {candidateData.cvUrl}</p>}
                                </div>
                                {/* <Input id="cv" type="file" className="hidden"/> */}
                            </div>
                        </CardContent>
                    </Card>
                    
                     <Card>
                         <CardHeader>
                            <CardTitle>Location & Rate</CardTitle>
                            <CardDescription>Set your work preferences and rates.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="baseLocation">Base Location</Label>
                                <Input id="baseLocation" defaultValue={candidateData.baseLocation} placeholder="e.g. London, UK" />
                            </div>
                            <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
                                <div className="flex flex-col space-y-1">
                                    <Label htmlFor="canTravel">Willing to Travel</Label>
                                    <span className="text-sm text-muted-foreground">
                                        Are you open to roles outside your base location?
                                    </span>
                                </div>
                                <Switch id="canTravel" defaultChecked={candidateData.canTravel} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="preferredRadiusKm">Preferred Travel Radius (km)</Label>
                                <Input id="preferredRadiusKm" type="number" defaultValue={candidateData.preferredRadiusKm} />
                            </div>
                            <Separator />
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="hourlyRate">Hourly Rate (£)</Label>
                                    <Input id="hourlyRate" type="number" defaultValue={candidateData.hourlyRate} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dailyRate">Daily Rate (£)</Label>
                                    <Input id="dailyRate" type="number" defaultValue={candidateData.dailyRate} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                     <div className="flex justify-end">
                        <Button size="lg">Save All Changes</Button>
                    </div>
                </>
            )}

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
        </div>
    );
}
