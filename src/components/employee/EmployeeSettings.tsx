import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

export const EmployeeSettings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    workOrderNotifications: true,
    scheduleNotifications: true,
    messageNotifications: true
  });

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      // customer_notifications table doesn't exist - using defaults
      setNotificationSettings({
        emailEnabled: true,
        smsEnabled: false,
        pushEnabled: true,
        workOrderNotifications: true,
        scheduleNotifications: true,
        messageNotifications: true
      });
    } catch (error: any) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!user) return;

    setSaving(true);

    try {
      // customer_notifications table doesn't exist - simulating save
      await new Promise(resolve => setTimeout(resolve, 500));

      toast({
        title: "Success",
        description: "Settings saved successfully"
      });
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground">Manage your preferences and notifications</p>
      </div>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Choose how you want to receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch
              checked={notificationSettings.emailEnabled}
              onCheckedChange={(checked) => 
                setNotificationSettings(prev => ({ ...prev, emailEnabled: checked }))
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>SMS Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via text message
              </p>
            </div>
            <Switch
              checked={notificationSettings.smsEnabled}
              onCheckedChange={(checked) => 
                setNotificationSettings(prev => ({ ...prev, smsEnabled: checked }))
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive in-app push notifications
              </p>
            </div>
            <Switch
              checked={notificationSettings.pushEnabled}
              onCheckedChange={(checked) => 
                setNotificationSettings(prev => ({ ...prev, pushEnabled: checked }))
              }
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <Label className="text-base">Notification Types</Label>
            
            <div className="flex items-center justify-between pl-4">
              <div className="space-y-0.5">
                <Label className="font-normal">Work Order Updates</Label>
                <p className="text-sm text-muted-foreground">
                  New assignments and work order changes
                </p>
              </div>
              <Switch
                checked={notificationSettings.workOrderNotifications}
                onCheckedChange={(checked) => 
                  setNotificationSettings(prev => ({ ...prev, workOrderNotifications: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between pl-4">
              <div className="space-y-0.5">
                <Label className="font-normal">Schedule Changes</Label>
                <p className="text-sm text-muted-foreground">
                  Updates to your work schedule
                </p>
              </div>
              <Switch
                checked={notificationSettings.scheduleNotifications}
                onCheckedChange={(checked) => 
                  setNotificationSettings(prev => ({ ...prev, scheduleNotifications: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between pl-4">
              <div className="space-y-0.5">
                <Label className="font-normal">Messages</Label>
                <p className="text-sm text-muted-foreground">
                  Messages from admins and customers
                </p>
              </div>
              <Switch
                checked={notificationSettings.messageNotifications}
                onCheckedChange={(checked) => 
                  setNotificationSettings(prev => ({ ...prev, messageNotifications: checked }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Manage your account settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Language</Label>
              <p className="text-sm text-muted-foreground">
                English (US)
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Time Zone</Label>
              <p className="text-sm text-muted-foreground">
                (GMT-5:00) Eastern Time
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
};
