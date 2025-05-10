import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/hooks/use-toast';

export default function Settings() {
  const [saving, setSaving] = useState(false);
  
  // Fetch user data
  const { data: user } = useQuery({
    queryKey: ['/api/me'],
  });
  
  // Example settings state
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      browser: true,
      mobile: false,
      newTranscript: true,
      newSummary: true,
      actionItemReminders: true,
      meetingReminders: true
    },
    privacy: {
      shareRecordings: 'team',
      shareTranscripts: 'team',
      retentionPeriod: 90,
      autoDelete: false
    },
    transcription: {
      language: 'en-US',
      speakerIdentification: true,
      highlightActionItems: true,
      accuracy: 85
    },
    integrations: {
      zoom: true,
      teams: false,
      googleMeet: true,
      slack: false,
      outlook: true,
      googleCalendar: false
    }
  });
  
  const handleSave = () => {
    setSaving(true);
    
    // Simulate saving
    setTimeout(() => {
      setSaving(false);
      toast({
        title: "Settings saved",
        description: "Your settings have been successfully updated."
      });
    }, 800);
  };
  
  return (
    <main className="flex-1 relative overflow-y-auto focus:outline-none">
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-dark">Settings</h1>
          <Button 
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i> Saving...
              </>
            ) : (
              <>
                <i className="fas fa-save mr-2"></i> Save Changes
              </>
            )}
          </Button>
        </div>
        
        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full md:w-auto">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="transcription">Transcription</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>
          
          {/* Account Settings */}
          <TabsContent value="account">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your account details and personal information.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-4">
                    {user?.avatarUrl && (
                      <div className="h-16 w-16 rounded-full overflow-hidden">
                        <img 
                          src={user.avatarUrl} 
                          alt={user.fullName}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <Button variant="outline" size="sm">
                        <i className="fas fa-upload mr-2"></i> Change Avatar
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input 
                        id="fullName" 
                        defaultValue={user?.fullName || ''}
                        placeholder="Your full name" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        defaultValue={user?.email || ''}
                        placeholder="your.email@example.com" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input 
                        id="username" 
                        defaultValue={user?.username || ''}
                        placeholder="username" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
                      <Input 
                        id="phoneNumber" 
                        placeholder="+1 (555) 123-4567" 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>
                    Manage your password and security settings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input 
                      id="current-password" 
                      type="password" 
                      placeholder="Enter your current password" 
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input 
                        id="new-password" 
                        type="password" 
                        placeholder="Enter new password" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input 
                        id="confirm-password" 
                        type="password" 
                        placeholder="Confirm new password" 
                      />
                    </div>
                  </div>
                  <div className="pt-2">
                    <Button variant="outline">
                      Change Password
                    </Button>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">Two-Factor Authentication</h4>
                        <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                      </div>
                      <Switch />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">Sessions</h4>
                        <p className="text-sm text-gray-500">Manage your active sessions</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose how and when you want to be notified.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Notification Channels</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-notifications">Email Notifications</Label>
                        <p className="text-sm text-gray-500">Receive notifications via email</p>
                      </div>
                      <Switch 
                        id="email-notifications" 
                        checked={settings.notifications.email}
                        onCheckedChange={(checked) => 
                          setSettings({
                            ...settings,
                            notifications: {...settings.notifications, email: checked}
                          })
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="browser-notifications">Browser Notifications</Label>
                        <p className="text-sm text-gray-500">Show browser push notifications</p>
                      </div>
                      <Switch 
                        id="browser-notifications" 
                        checked={settings.notifications.browser}
                        onCheckedChange={(checked) => 
                          setSettings({
                            ...settings,
                            notifications: {...settings.notifications, browser: checked}
                          })
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="mobile-notifications">Mobile Notifications</Label>
                        <p className="text-sm text-gray-500">Push notifications to mobile app</p>
                      </div>
                      <Switch 
                        id="mobile-notifications" 
                        checked={settings.notifications.mobile}
                        onCheckedChange={(checked) => 
                          setSettings({
                            ...settings,
                            notifications: {...settings.notifications, mobile: checked}
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Notification Types</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="new-transcript">New Transcript Available</Label>
                      <Switch 
                        id="new-transcript" 
                        checked={settings.notifications.newTranscript}
                        onCheckedChange={(checked) => 
                          setSettings({
                            ...settings,
                            notifications: {...settings.notifications, newTranscript: checked}
                          })
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="new-summary">New Summary Available</Label>
                      <Switch 
                        id="new-summary" 
                        checked={settings.notifications.newSummary}
                        onCheckedChange={(checked) => 
                          setSettings({
                            ...settings,
                            notifications: {...settings.notifications, newSummary: checked}
                          })
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="action-reminders">Action Item Reminders</Label>
                      <Switch 
                        id="action-reminders" 
                        checked={settings.notifications.actionItemReminders}
                        onCheckedChange={(checked) => 
                          setSettings({
                            ...settings,
                            notifications: {...settings.notifications, actionItemReminders: checked}
                          })
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="meeting-reminders">Meeting Reminders</Label>
                      <Switch 
                        id="meeting-reminders" 
                        checked={settings.notifications.meetingReminders}
                        onCheckedChange={(checked) => 
                          setSettings({
                            ...settings,
                            notifications: {...settings.notifications, meetingReminders: checked}
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Quiet Hours</h3>
                  <p className="text-sm text-gray-500">Set times when you don't want to receive notifications</p>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-32">
                      <Label htmlFor="start-time">Start Time</Label>
                      <Select defaultValue="20:00">
                        <SelectTrigger id="start-time">
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }).map((_, i) => {
                            const hour = i.toString().padStart(2, '0');
                            return (
                              <SelectItem key={hour} value={`${hour}:00`}>
                                {`${hour}:00`}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="w-32">
                      <Label htmlFor="end-time">End Time</Label>
                      <Select defaultValue="07:00">
                        <SelectTrigger id="end-time">
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }).map((_, i) => {
                            const hour = i.toString().padStart(2, '0');
                            return (
                              <SelectItem key={hour} value={`${hour}:00`}>
                                {`${hour}:00`}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Button variant="outline" size="sm" className="mt-6">
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Transcription Settings */}
          <TabsContent value="transcription">
            <Card>
              <CardHeader>
                <CardTitle>Transcription Settings</CardTitle>
                <CardDescription>
                  Customize how your meetings are transcribed and processed.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Default Language</Label>
                    <Select 
                      value={settings.transcription.language}
                      onValueChange={(value) => 
                        setSettings({
                          ...settings,
                          transcription: {...settings.transcription, language: value}
                        })
                      }
                    >
                      <SelectTrigger id="language">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="en-GB">English (UK)</SelectItem>
                        <SelectItem value="es-ES">Spanish</SelectItem>
                        <SelectItem value="fr-FR">French</SelectItem>
                        <SelectItem value="de-DE">German</SelectItem>
                        <SelectItem value="ja-JP">Japanese</SelectItem>
                        <SelectItem value="zh-CN">Chinese (Simplified)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="speaker-identification">Speaker Identification</Label>
                      <p className="text-sm text-gray-500">Automatically detect different speakers</p>
                    </div>
                    <Switch 
                      id="speaker-identification" 
                      checked={settings.transcription.speakerIdentification}
                      onCheckedChange={(checked) => 
                        setSettings({
                          ...settings,
                          transcription: {...settings.transcription, speakerIdentification: checked}
                        })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="highlight-action-items">Highlight Action Items</Label>
                      <p className="text-sm text-gray-500">Detect and highlight action items in transcript</p>
                    </div>
                    <Switch 
                      id="highlight-action-items" 
                      checked={settings.transcription.highlightActionItems}
                      onCheckedChange={(checked) => 
                        setSettings({
                          ...settings,
                          transcription: {...settings.transcription, highlightActionItems: checked}
                        })
                      }
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="accuracy-slider">Transcription Accuracy vs. Speed</Label>
                      <span className="text-sm text-gray-500">{settings.transcription.accuracy}%</span>
                    </div>
                    <Slider 
                      id="accuracy-slider"
                      min={60}
                      max={100}
                      step={5}
                      value={[settings.transcription.accuracy]}
                      onValueChange={(value) => 
                        setSettings({
                          ...settings,
                          transcription: {...settings.transcription, accuracy: value[0]}
                        })
                      }
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Faster</span>
                      <span>More Accurate</span>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Privacy & Retention</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="share-recordings">Share Recordings With</Label>
                    <Select 
                      value={settings.privacy.shareRecordings}
                      onValueChange={(value) => 
                        setSettings({
                          ...settings,
                          privacy: {...settings.privacy, shareRecordings: value}
                        })
                      }
                    >
                      <SelectTrigger id="share-recordings">
                        <SelectValue placeholder="Select sharing level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No one (private)</SelectItem>
                        <SelectItem value="participants">Meeting participants only</SelectItem>
                        <SelectItem value="team">My team</SelectItem>
                        <SelectItem value="organization">My organization</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="share-transcripts">Share Transcripts With</Label>
                    <Select 
                      value={settings.privacy.shareTranscripts}
                      onValueChange={(value) => 
                        setSettings({
                          ...settings,
                          privacy: {...settings.privacy, shareTranscripts: value}
                        })
                      }
                    >
                      <SelectTrigger id="share-transcripts">
                        <SelectValue placeholder="Select sharing level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No one (private)</SelectItem>
                        <SelectItem value="participants">Meeting participants only</SelectItem>
                        <SelectItem value="team">My team</SelectItem>
                        <SelectItem value="organization">My organization</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="retention-slider">Retention Period (days)</Label>
                      <span className="text-sm text-gray-500">{settings.privacy.retentionPeriod} days</span>
                    </div>
                    <Slider 
                      id="retention-slider"
                      min={30}
                      max={365}
                      step={30}
                      value={[settings.privacy.retentionPeriod]}
                      onValueChange={(value) => 
                        setSettings({
                          ...settings,
                          privacy: {...settings.privacy, retentionPeriod: value[0]}
                        })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-delete">Auto-delete After Retention Period</Label>
                      <p className="text-sm text-gray-500">Automatically delete transcripts and recordings</p>
                    </div>
                    <Switch 
                      id="auto-delete" 
                      checked={settings.privacy.autoDelete}
                      onCheckedChange={(checked) => 
                        setSettings({
                          ...settings,
                          privacy: {...settings.privacy, autoDelete: checked}
                        })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Integrations Settings */}
          <TabsContent value="integrations">
            <Card>
              <CardHeader>
                <CardTitle>Integrations</CardTitle>
                <CardDescription>
                  Connect with your favorite meeting and productivity tools.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Meeting Platforms</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <i className="fab fa-zoom text-blue-400 text-2xl mr-3"></i>
                        <div>
                          <h4 className="text-sm font-medium">Zoom</h4>
                          <p className="text-xs text-gray-500">Record and transcribe Zoom meetings</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {settings.integrations.zoom ? (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => 
                              setSettings({
                                ...settings,
                                integrations: {...settings.integrations, zoom: false}
                              })
                            }
                          >
                            Disconnect
                          </Button>
                        ) : (
                          <Button 
                            size="sm"
                            onClick={() => 
                              setSettings({
                                ...settings,
                                integrations: {...settings.integrations, zoom: true}
                              })
                            }
                          >
                            Connect
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <i className="fab fa-microsoft text-blue-500 text-2xl mr-3"></i>
                        <div>
                          <h4 className="text-sm font-medium">Microsoft Teams</h4>
                          <p className="text-xs text-gray-500">Record and transcribe Teams meetings</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {settings.integrations.teams ? (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => 
                              setSettings({
                                ...settings,
                                integrations: {...settings.integrations, teams: false}
                              })
                            }
                          >
                            Disconnect
                          </Button>
                        ) : (
                          <Button 
                            size="sm"
                            onClick={() => 
                              setSettings({
                                ...settings,
                                integrations: {...settings.integrations, teams: true}
                              })
                            }
                          >
                            Connect
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <i className="fab fa-google text-red-500 text-2xl mr-3"></i>
                        <div>
                          <h4 className="text-sm font-medium">Google Meet</h4>
                          <p className="text-xs text-gray-500">Record and transcribe Google Meet calls</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {settings.integrations.googleMeet ? (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => 
                              setSettings({
                                ...settings,
                                integrations: {...settings.integrations, googleMeet: false}
                              })
                            }
                          >
                            Disconnect
                          </Button>
                        ) : (
                          <Button 
                            size="sm"
                            onClick={() => 
                              setSettings({
                                ...settings,
                                integrations: {...settings.integrations, googleMeet: true}
                              })
                            }
                          >
                            Connect
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Productivity Tools</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <i className="fab fa-slack text-purple-500 text-2xl mr-3"></i>
                        <div>
                          <h4 className="text-sm font-medium">Slack</h4>
                          <p className="text-xs text-gray-500">Share meeting summaries in Slack</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {settings.integrations.slack ? (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => 
                              setSettings({
                                ...settings,
                                integrations: {...settings.integrations, slack: false}
                              })
                            }
                          >
                            Disconnect
                          </Button>
                        ) : (
                          <Button 
                            size="sm"
                            onClick={() => 
                              setSettings({
                                ...settings,
                                integrations: {...settings.integrations, slack: true}
                              })
                            }
                          >
                            Connect
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <i className="fab fa-microsoft text-blue-500 text-2xl mr-3"></i>
                        <div>
                          <h4 className="text-sm font-medium">Outlook Calendar</h4>
                          <p className="text-xs text-gray-500">Sync with your Outlook calendar</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {settings.integrations.outlook ? (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => 
                              setSettings({
                                ...settings,
                                integrations: {...settings.integrations, outlook: false}
                              })
                            }
                          >
                            Disconnect
                          </Button>
                        ) : (
                          <Button 
                            size="sm"
                            onClick={() => 
                              setSettings({
                                ...settings,
                                integrations: {...settings.integrations, outlook: true}
                              })
                            }
                          >
                            Connect
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <i className="fab fa-google text-green-500 text-2xl mr-3"></i>
                        <div>
                          <h4 className="text-sm font-medium">Google Calendar</h4>
                          <p className="text-xs text-gray-500">Sync with your Google calendar</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {settings.integrations.googleCalendar ? (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => 
                              setSettings({
                                ...settings,
                                integrations: {...settings.integrations, googleCalendar: false}
                              })
                            }
                          >
                            Disconnect
                          </Button>
                        ) : (
                          <Button 
                            size="sm"
                            onClick={() => 
                              setSettings({
                                ...settings,
                                integrations: {...settings.integrations, googleCalendar: true}
                              })
                            }
                          >
                            Connect
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Add New Integration</h3>
                  <p className="text-sm text-gray-500">Browse the integration marketplace to add more tools.</p>
                  
                  <Button>
                    <i className="fas fa-puzzle-piece mr-2"></i> Browse Integrations
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
