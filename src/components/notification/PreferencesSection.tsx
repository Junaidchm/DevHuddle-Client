'use client';

import { useState } from 'react';

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
    alert('Notification preferences saved successfully!');
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
      alert('Preferences have been reset to default.');
    }
  };

  return (
    <div className="max-w-[900px] mx-auto my-0 px-[1.5rem]">
      <div className="bg-white rounded-[0.75rem] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] p-[2rem] mt-[3rem]">
        <h2 className="text-[1.5rem] font-[600] text-[#1f2937] mb-[0.75rem] flex items-center gap-[0.5rem]">
          <i className="fas fa-sliders-h text-[#4f46e5]"></i> Notification Preferences
        </h2>
        <p className="text-[#6b7280] mb-[2rem] text-[0.95rem]">
          Customize how you receive notifications and what type of activities you want to be notified about.
        </p>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-[1.5rem] mb-[2rem]">
          {/* Web Notifications Card */}
          <div className="bg-[#f3f4f6] rounded-[0.5rem] overflow-hidden transition-transform duration-[0.2s] hover:-translate-y-[3px]">
            <div className="p-[1.25rem] flex items-center gap-[1rem] bg-white border-b border-[#e5e7eb]">
              <div className="w-[2.5rem] h-[2.5rem] rounded-[50%] bg-[#4f46e5] flex items-center justify-center text-white">
                <i className="fas fa-desktop"></i>
              </div>
              <h3 className="text-[1.1rem] font-[600] text-[#1f2937]">Web Notifications</h3>
            </div>
            <div className="p-[1.25rem]">
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
                isLast
              />
            </div>
          </div>

          {/* Email Notifications Card */}
          <div className="bg-[#f3f4f6] rounded-[0.5rem] overflow-hidden transition-transform duration-[0.2s] hover:-translate-y-[3px]">
            <div className="p-[1.25rem] flex items-center gap-[1rem] bg-white border-b border-[#e5e7eb]">
              <div className="w-[2.5rem] h-[2.5rem] rounded-[50%] bg-[#4f46e5] flex items-center justify-center text-white">
                <i className="fas fa-envelope"></i>
              </div>
              <h3 className="text-[1.1rem] font-[600] text-[#1f2937]">Email Notifications</h3>
            </div>
            <div className="p-[1.25rem]">
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
                isLast
              />
            </div>
          </div>

          {/* Mobile Push Notifications Card */}
          <div className="bg-[#f3f4f6] rounded-[0.5rem] overflow-hidden transition-transform duration-[0.2s] hover:-translate-y-[3px]">
            <div className="p-[1.25rem] flex items-center gap-[1rem] bg-white border-b border-[#e5e7eb]">
              <div className="w-[2.5rem] h-[2.5rem] rounded-[50%] bg-[#4f46e5] flex items-center justify-center text-white">
                <i className="fas fa-mobile-alt"></i>
              </div>
              <h3 className="text-[1.1rem] font-[600] text-[#1f2937]">Mobile Push Notifications</h3>
            </div>
            <div className="p-[1.25rem]">
              <ToggleOption 
                label="Enable push notifications" 
                checked={preferences.pushNotifications}
                onChange={() => handleToggle('pushNotifications')}
              />
              <div className="flex justify-between items-center py-[0.75rem]">
                <span className="text-[#1f2937] text-[0.9rem]">Notification priority</span>
                <select 
                  value={preferences.notificationPriority}
                  onChange={(e) => setPreferences(prev => ({ ...prev, notificationPriority: e.target.value }))}
                  className="w-full px-[0.5rem] py-[0.5rem] rounded-[0.25rem] border border-[#e5e7eb] text-[#1f2937] bg-white mt-[0.5rem]"
                >
                  <option>High - All notifications</option>
                  <option>Medium - Important only</option>
                  <option>Low - Mentions only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Activity Types Card */}
          <div className="bg-[#f3f4f6] rounded-[0.5rem] overflow-hidden transition-transform duration-[0.2s] hover:-translate-y-[3px]">
            <div className="p-[1.25rem] flex items-center gap-[1rem] bg-white border-b border-[#e5e7eb]">
              <div className="w-[2.5rem] h-[2.5rem] rounded-[50%] bg-[#4f46e5] flex items-center justify-center text-white">
                <i className="fas fa-bell"></i>
              </div>
              <h3 className="text-[1.1rem] font-[600] text-[#1f2937]">Activity Types</h3>
            </div>
            <div className="p-[1.25rem]">
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
                isLast
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-[1rem] mt-[1rem]">
          <button 
            onClick={handleReset}
            className="inline-flex items-center gap-[0.5rem] px-[1.25rem] py-[0.6rem] border-none rounded-[0.5rem] font-[500] cursor-pointer transition-all duration-[0.2s] text-[0.9rem] bg-transparent text-[#1f2937] border border-[#e5e7eb] hover:bg-[#f3f4f6]"
          >
            Reset to Default
          </button>
          <button 
            onClick={handleSave}
            className="inline-flex items-center gap-[0.5rem] px-[1.25rem] py-[0.6rem] border-none rounded-[0.5rem] font-[500] cursor-pointer transition-all duration-[0.2s] text-[0.9rem] bg-[#4f46e5] text-white hover:bg-[#4338ca]"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}

function ToggleOption({ label, checked, onChange, isLast = false }: { 
  label: string; 
  checked: boolean; 
  onChange: () => void;
  isLast?: boolean;
}) {
  return (
    <div className={`flex justify-between items-center py-[0.75rem] ${!isLast ? 'border-b border-[#e5e7eb]' : ''}`}>
      <span className="text-[#1f2937] text-[0.9rem]">{label}</span>
      <label className="relative inline-block w-[3rem] h-[1.5rem]">
        <input 
          type="checkbox" 
          checked={checked}
          onChange={onChange}
          className="opacity-0 w-0 h-0 peer" 
        />
        <span className="absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-[#ccc] rounded-[1.5rem] transition-[0.4s] before:absolute before:content-[''] before:h-[1.1rem] before:w-[1.1rem] before:left-[0.2rem] before:bottom-[0.2rem] before:bg-white before:rounded-[50%] before:transition-[0.4s] peer-checked:bg-[#4f46e5] peer-checked:before:translate-x-[1.5rem]"></span>
      </label>
    </div>
  );
}
