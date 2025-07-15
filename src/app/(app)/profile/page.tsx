
'use client';
import { useRole } from "@/context/role-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

export default function ProfilePage() {
    const { role } = useRole();
    const isClient = role === 'client';
    const title = isClient ? "School Profile" : "My Candidate Profile";
    const description = isClient ? "Update your school's information." : "Keep your professional profile up to date.";

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold font-headline">{title}</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {isClient ? (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="schoolName">School Name</Label>
                                <Input id="schoolName" defaultValue="Hill Valley School" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contactEmail">Contact Email</Label>
                                <Input id="contactEmail" type="email" defaultValue="contact@hillvalley.edu" />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Full Name</Label>
                                    <Input id="fullName" defaultValue="Jane Doe" />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="contactEmail">Email</Label>
                                    <Input id="contactEmail" type="email" defaultValue="jane.doe@example.com" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="roles">My Roles</Label>
                                <Input id="roles" defaultValue="Teaching Assistant, Substitute Teacher" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="bio">Short Bio</Label>
                                <Textarea id="bio" placeholder="Tell us about your experience..." defaultValue="Enthusiastic and certified Teaching Assistant with 3+ years of experience supporting lead teachers and students in a dynamic classroom environment." rows={4} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="cv">Upload CV</Label>
                                <Input id="cv" type="file" />
                                <p className="text-sm text-muted-foreground">Current file: my_cv_2024.pdf</p>
                            </div>
                        </>
                    )}
                     <Button>Save Changes</Button>
                </CardContent>
            </Card>

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
