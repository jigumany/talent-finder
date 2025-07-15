
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

export default function ProfilePage() {
    const { role } = useRole();
    const isClient = role === 'client';

    // Placeholder data for the candidate view
    const candidateData = {
        fullName: 'Jane Doe',
        email: 'jane.doe@example.com',
        phoneNumber: '123-456-7890',
        profilePhotoUrl: 'https://placehold.co/100x100.png',
        cvUrl: 'my_cv_2024.pdf',
        roleType: 'Teaching Assistant',
        subjects: 'General Curriculum, Reading Support',
        qualifications: 'Child Development Cert., First Aid',
        experienceYears: 3,
        bio: 'Enthusiastic and certified Teaching Assistant with 3+ years of experience supporting lead teachers and students in a dynamic classroom environment.',
        baseLocation: 'Chicago, IL',
        canTravel: true,
        preferredRadiusKm: 20,
        hourlyRate: 25,
        dailyRate: 180,
    };

    const clientData = {
        schoolName: 'Hill Valley School',
        contactEmail: 'contact@hillvalley.edu',
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
                                    <AvatarImage src={candidateData.profilePhotoUrl} alt={candidateData.fullName} />
                                    <AvatarFallback>{candidateData.fullName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div className="grid gap-2 flex-1">
                                    <Label htmlFor="profile-photo">Profile Photo</Label>
                                    <Input id="profile-photo" type="file" />
                                    <p className="text-sm text-muted-foreground">Upload a new photo.</p>
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
                                <Label htmlFor="cv">Upload CV</Label>
                                <Input id="cv" type="file" />
                                <p className="text-sm text-muted-foreground">Current file: {candidateData.cvUrl}</p>
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
                            <div className="flex items-center justify-between space-x-4">
                                <Label htmlFor="canTravel" className="flex flex-col space-y-1">
                                  <span>Willing to Travel</span>
                                  <span className="font-normal leading-snug text-muted-foreground">
                                    Are you open to roles outside your base location?
                                  </span>
                                </Label>
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
                <CardContent className="space-y-6">
                     <div className="flex items-center justify-between space-x-4">
                        <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
                          <span>Email Notifications</span>
                          <span className="font-normal leading-snug text-muted-foreground">
                            Receive emails about new bookings and messages.
                          </span>
                        </Label>
                        <Switch id="email-notifications" defaultChecked />
                      </div>
                      <Separator />
                       <div className="flex items-center justify-between space-x-4">
                        <Label htmlFor="push-notifications" className="flex flex-col space-y-1">
                          <span>Push Notifications</span>
                           <span className="font-normal leading-snug text-muted-foreground">
                            Get push notifications on your mobile device.
                          </span>
                        </Label>
                        <Switch id="push-notifications" />
                      </div>
                </CardContent>
            </Card>
        </div>
    );
}
