'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Mail, Phone, Building, Shield, User as UserIcon, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useUser } from '@/context/user-context';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ProfilePage() {
  const { user, isLoading, error } = useUser();
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="text-destructive">
            <p className="font-semibold">Error loading profile</p>
            <p className="text-sm text-muted-foreground">{error || 'Unable to load user profile'}</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const { contact, profile } = user;
  const { company } = profile;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-primary/10">
                <AvatarFallback className="text-lg sm:text-xl">
                  {contact.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold font-headline">{contact.name}</h1>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-sm">
                        {contact.role}
                      </Badge>
                      {contact.permissions && Object.keys(contact.permissions).length > 0 && (
                        <Badge 
                          variant="outline" 
                          className="cursor-pointer hover:bg-muted"
                          onClick={() => setShowPermissionsDialog(true)}
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          Permissions
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">{contact.email}</span>
                  </div>
                  
                  {company?.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span className="text-sm">{company.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserIcon className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Full Name</h4>
                    <p className="text-sm bg-muted/50 p-3 rounded">{contact.name}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Email Address</h4>
                    <p className="text-sm bg-muted/50 p-3 rounded">{contact.email}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">User Role</h4>
                    <p className="text-sm bg-muted/50 p-3 rounded">{contact.role}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Company Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    School Information
                  </CardTitle>
                  <CardDescription>
                    Your organization details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">School Name</h4>
                    <p className="text-sm bg-muted/50 p-3 rounded">{company?.name || 'Not specified'}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">School Email</h4>
                    <p className="text-sm bg-muted/50 p-3 rounded">{company?.email || 'Not specified'}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">School Phone</h4>
                    <p className="text-sm bg-muted/50 p-3 rounded">{company?.phone || 'Not specified'}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Permissions Dialog */}
      {contact.permissions && Object.keys(contact.permissions).length > 0 && (
        <Dialog open={showPermissionsDialog} onOpenChange={setShowPermissionsDialog}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                User Permissions
              </DialogTitle>
              <DialogDescription>
                Permissions granted to your account
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {Object.entries(contact.permissions).map(([key, value]) => (
                <div key={key} className="bg-muted/30 rounded-lg p-4">
                  <h4 className="font-medium mb-2 capitalize">{key.replace(/_/g, ' ')}</h4>
                  <div className="space-y-2">
                    {typeof value === 'boolean' ? (
                      <Badge variant={value ? "default" : "secondary"} className="text-xs">
                        {value ? 'Granted' : 'Not Granted'}
                      </Badge>
                    ) : typeof value === 'object' && value !== null ? (
                      <div className="space-y-1">
                        {Object.entries(value).map(([subKey, subValue]) => (
                          <div key={subKey} className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{subKey.replace(/_/g, ' ')}</span>
                            <Badge variant={subValue ? "default" : "secondary"} className="text-xs">
                              {String(subValue)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        {String(value)}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}