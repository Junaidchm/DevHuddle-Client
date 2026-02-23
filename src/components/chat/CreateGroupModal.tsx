"use client";

import React, { useState, useRef } from "react";
import { X, Search, Loader2, Camera, UserPlus } from "lucide-react";
import { useChatSuggestions } from "@/src/hooks/chat/useChatSuggestions";
import { PROFILE_DEFAULT_URL } from "@/src/constants";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/src/components/ui/avatar";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import { useCreateGroup } from "@/src/hooks/chat/useGroupMutations";
import { Label } from "@/src/components/ui/label";
import { useMediaUpload } from "@/src/hooks/chat/useMediaUpload";
import toast from "react-hot-toast";

interface User {
  id: string;
  username: string;
  fullName: string;
  profilePhoto?: string;
  bio?: string;
}

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated: (group: any) => void;
}

export function CreateGroupModal({ isOpen, onClose, onGroupCreated }: CreateGroupModalProps) {
  const [step, setStep] = useState<1 | 2>(1); // 1: Select Participants, 2: Group Info
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [groupName, setGroupName] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [topicInput, setTopicInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadMediaAsync } = useMediaUpload();

  // Fetch suggestions
  const { data: rawSuggestions = [], isLoading: isSuggestionsLoading } = useChatSuggestions();
  
  const suggestedUsers: User[] = React.useMemo(() => {
    return rawSuggestions.map((item: any) => ({
      id: item.id,
      username: item.username,
      fullName: item.fullName || item.name || item.username,
      profilePhoto: item.profilePhoto,
      bio: item.bio || item.headline || item.jobTitle, 
    }));
  }, [rawSuggestions]);

  const filteredUsers = React.useMemo(() => {
    if (!searchQuery.trim()) return suggestedUsers;
    const query = searchQuery.toLowerCase();
    return suggestedUsers.filter(
      (user) =>
        user.fullName.toLowerCase().includes(query) ||
        user.username.toLowerCase().includes(query)
    );
  }, [suggestedUsers, searchQuery]);

  const createGroupMutation = useCreateGroup((group) => {
      onGroupCreated(group);
      setIsLoading(false);
      handleClose();
      toast.success("Group created successfully");
  });

  const handleUserToggle = (user: User) => {
    if (selectedUsers.some(u => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setSearchQuery("");
      setSelectedUsers([]);
      setGroupName("");
      setTopics([]);
      setTopicInput("");
      setIconFile(null);
      setIconPreview(null);
      setIsLoading(false);
    }, 300);
  };

  const handleAddTopic = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
          e.preventDefault();
          if (topicInput.trim() && !topics.includes(topicInput.trim()) && topics.length < 5) {
              setTopics([...topics, topicInput.trim()]);
              setTopicInput("");
          }
      }
  };

  const removeTopic = (topic: string) => {
      setTopics(topics.filter(t => t !== topic));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
          toast.error("Please select an image file");
          return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
          toast.error("Image must be smaller than 5MB");
          return;
      }

      setIconFile(file);
      const url = URL.createObjectURL(file);
      setIconPreview(url);
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) return;
    
    setIsLoading(true);

    try {
        let iconUrl = undefined;

        if (iconFile) {
            const result = await uploadMediaAsync({
                file: iconFile,
                mediaType: "CHAT_IMAGE"
            });
            iconUrl = result.mediaUrl;
        }

        createGroupMutation.mutate({
            name: groupName,
            participantIds: selectedUsers.map(u => u.id),
            topics: topics,
            icon: iconUrl
        });
    } catch (error) {
        setIsLoading(false);
        toast.error("Failed to create group. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden flex flex-col max-h-[85vh]">
        <DialogHeader className="px-6 py-4 border-b border-border">
          <DialogTitle className="text-xl font-semibold">
            {step === 1 ? "Add Participants" : "New Group"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {step === 1 ? `${selectedUsers.length} selected` : "Provide a subject and optional group icon"}
          </p>
        </DialogHeader>

        {step === 1 ? (
            <>
                {/* Search */}
                <div className="px-6 py-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-muted/40 border-none focus-visible:ring-0"
                            autoFocus
                        />
                    </div>
                </div>

                {/* Selected pills */}
                {selectedUsers.length > 0 && (
                    <div className="px-6 pb-2 flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                        {selectedUsers.map(user => (
                            <div key={user.id} className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                                <Avatar className="w-4 h-4">
                                    <AvatarImage src={user.profilePhoto || PROFILE_DEFAULT_URL} />
                                    <AvatarFallback className="text-[8px]">{user.fullName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span>{user.fullName.split(' ')[0]}</span>
                                <button onClick={() => handleUserToggle(user)} className="hover:text-destructive">
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* User List */}
                <div className="flex-1 overflow-y-auto px-2 py-2 min-h-[300px]">
                    {isSuggestionsLoading ? (
                        <div className="flex justify-center py-8"><Loader2 className="animate-spin text-muted-foreground" /></div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No users found</div>
                    ) : (
                        <div className="space-y-1">
                            {filteredUsers.map(user => {
                                const isSelected = selectedUsers.some(u => u.id === user.id);
                                return (
                                    <button
                                        key={user.id}
                                        onClick={() => handleUserToggle(user)}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left",
                                            isSelected ? "bg-muted/80" : "hover:bg-muted/50"
                                        )}
                                    >
                                        <div className="relative">
                                            <Avatar className="w-10 h-10 border border-border">
                                                <AvatarImage src={user.profilePhoto || PROFILE_DEFAULT_URL} alt={user.fullName} />
                                                <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            {isSelected && (
                                                <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-0.5 border-2 border-background">
                                                    <div className="w-3 h-3 bg-primary rounded-full" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-foreground truncate">{user.fullName}</p>
                                            <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <DialogFooter className="px-6 py-4 border-t border-border">
                    <Button variant="ghost" onClick={handleClose}>Cancel</Button>
                    <Button 
                        disabled={selectedUsers.length === 0} 
                        onClick={() => setStep(2)}
                    >
                        Next
                    </Button>
                </DialogFooter>
            </>
        ) : (
            <>
                <div className="p-6 flex flex-col gap-6">
                    {/* Group Icon Upload */}
                    <div className="flex justify-center">
                        <div 
                            className="w-20 h-20 rounded-full bg-muted flex items-center justify-center cursor-pointer hover:bg-muted/80 relative group overflow-hidden border-2 border-dashed border-muted-foreground/50 hover:border-primary/50 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {iconPreview ? (
                                <img src={iconPreview} alt="Group Icon" className="w-full h-full object-cover" />
                            ) : (
                                <Camera className="w-8 h-8 text-muted-foreground" />
                            )}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white text-xs font-medium">
                                    {iconPreview ? "Change" : "Add Icon"}
                                </span>
                            </div>
                        </div>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </div>

                    <div className="space-y-2">
                         <Label>Group Subject</Label>
                         <Input 
                            placeholder="Type group subject here..." 
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            maxLength={25}
                         />
                         <p className="text-xs text-muted-foreground text-right">{groupName.length}/25</p>
                    </div>

                    <div className="space-y-2">
                        <Label>Topics (Optional)</Label>
                        <Input
                            placeholder="Add topics (e.g. React, Design)... Press Enter"
                            value={topicInput}
                            onChange={(e) => setTopicInput(e.target.value)}
                            onKeyDown={handleAddTopic}
                            maxLength={15}
                            disabled={topics.length >= 5}
                        />
                        <div className="flex flex-wrap gap-2 mt-2">
                            {topics.map(topic => (
                                <Badge key={topic} variant="secondary" className="px-2 py-1 gap-1">
                                    {topic}
                                    <button onClick={() => removeTopic(topic)} className="hover:text-destructive">
                                        <X className="w-3 h-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground">{topics.length}/5 topics added</p>
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 border-t border-border">
                    <Button variant="ghost" onClick={() => setStep(1)} disabled={isLoading}>Back</Button>
                    <Button 
                        disabled={!groupName.trim() || isLoading} 
                        onClick={handleCreateGroup}
                    >
                        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {isLoading ? "Creating..." : "Create Group"}
                    </Button>
                </DialogFooter>
            </>
        )}
      </DialogContent>
    </Dialog>
  );
}
