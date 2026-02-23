'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { SlidersHorizontal, Monitor, Mail, Smartphone, Bell } from "lucide-react";
import { cn } from "@/src/lib/utils";
import toast from 'react-hot-toast';

export default function PreferencesSection() {
  const [preferences, setPreferences] = useState({
    browserNotifications: true,
    showBadge: true,
    soundAlerts: false,
    emailMentions: true,
    emailCollab: true,
    emailDigest: true,
    pushNotifications: true,
    notificationPriority: 'Medium - Important only',
    likesNotif: false,
    commentsNotif: true,
    followersNotif: false,
    eventsNotif: true
  });

  const handleToggle = (key: keyof typeof preferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = () => {
    // In a real app, this would make an API call
    toast.success('Notification preferences saved successfully!');
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all notification preferences to default?')) {
      setPreferences({
        browserNotifications: true,
        showBadge: true,
        soundAlerts: false,
        emailMentions: true,
        emailCollab: true,
        emailDigest: true,
        pushNotifications: true,
        notificationPriority: 'Medium - Important only',
        likesNotif: false,
        commentsNotif: true,
        followersNotif: false,
        eventsNotif: true
      });
      toast.success('Preferences have been reset to default.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
          <SlidersHorizontal className="w-6 h-6 text-primary" />
          Notification Preferences
        </h2>
        <p className="text-muted-foreground">
          Customize how you receive notifications and what type of activities you want to be notified about.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Web Notifications Card */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4 border-b border-border">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              <Monitor className="w-5 h-5" />
            </div>
            <CardTitle className="text-lg">Web Notifications</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <ToggleOption 
              label="Enable browser notifications" 
              checked={preferences.browserNotifications}
              onChange={() => handleToggle('browserNotifications')}
            />
            <ToggleOption 
              label="Show notifications badge" 
              checked={preferences.showBadge}
              onChange={() => handleToggle('showBadge')}
            />
            <ToggleOption 
              label="Sound alerts" 
              checked={preferences.soundAlerts}
              onChange={() => handleToggle('soundAlerts')}
            />
          </CardContent>
        </Card>

        {/* Email Notifications Card */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4 border-b border-border">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              <Mail className="w-5 h-5" />
            </div>
            <CardTitle className="text-lg">Email Notifications</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <ToggleOption 
              label="Send email for new mentions" 
              checked={preferences.emailMentions}
              onChange={() => handleToggle('emailMentions')}
            />
            <ToggleOption 
              label="Send email for collaboration requests" 
              checked={preferences.emailCollab}
              onChange={() => handleToggle('emailCollab')}
            />
            <ToggleOption 
              label="Send weekly activity digest" 
              checked={preferences.emailDigest}
              onChange={() => handleToggle('emailDigest')}
            />
          </CardContent>
        </Card>

        {/* Mobile Push Notifications Card */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4 border-b border-border">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              <Smartphone className="w-5 h-5" />
            </div>
            <CardTitle className="text-lg">Mobile Push Notifications</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <ToggleOption 
              label="Enable push notifications" 
              checked={preferences.pushNotifications}
              onChange={() => handleToggle('pushNotifications')}
            />
            <div className="flex flex-col gap-2 pt-2">
              <span className="text-sm font-medium">Notification priority</span>
              <select 
                value={preferences.notificationPriority}
                onChange={(e) => setPreferences(prev => ({ ...prev, notificationPriority: e.target.value }))}
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option>High - All notifications</option>
                <option>Medium - Important only</option>
                <option>Low - Mentions only</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Activity Types Card */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4 border-b border-border">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              <Bell className="w-5 h-5" />
            </div>
            <CardTitle className="text-lg">Activity Types</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <ToggleOption 
              label="Likes on your content" 
              checked={preferences.likesNotif}
              onChange={() => handleToggle('likesNotif')}
            />
            <ToggleOption 
              label="Comments on your content" 
              checked={preferences.commentsNotif}
              onChange={() => handleToggle('commentsNotif')}
            />
            <ToggleOption 
              label="New followers" 
              checked={preferences.followersNotif}
              onChange={() => handleToggle('followersNotif')}
            />
            <ToggleOption 
              label="Event reminders" 
              checked={preferences.eventsNotif}
              onChange={() => handleToggle('eventsNotif')}
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={handleReset}>
          Reset to Default
        </Button>
        <Button onClick={handleSave}>
          Save Preferences
        </Button>
      </div>
    </div>
  );
}

function ToggleOption({ label, checked, onChange }: { 
  label: string; 
  checked: boolean; 
  onChange: () => void;
}) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input 
          type="checkbox" 
          checked={checked}
          onChange={onChange}
          className="sr-only peer" 
        />
        <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
      </label>
    </div>
  );
}
