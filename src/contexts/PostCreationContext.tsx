"use client";

import React, { createContext, useContext, ReactNode, useState, useCallback } from "react";
import { useMediaUpload } from "@/src/hooks/useMediaUpload";

export type AudienceType = "PUBLIC" | "CONNECTIONS";
export type CommentControl = "ANYONE" | "CONNECTIONS" | "NOBODY";

export type PostCreationStatus =
    | "IDLE"
    | "UPLOADING"
    | "SUBMITTING"
    | "SUCCESS"
    | "ERROR";

export type UploadStatus =
    | "PENDING"
    | "UPLOADING"
    | "COMPLETED"
    | "ERROR";

import { ImageTransform, User } from "@/src/app/types/feed";

export interface PostMediaItem {
    id: string;             // Local unique ID for UI
    file?: File;
    url: string;            // Preview URL or R2 URL
    type: "IMAGE" | "VIDEO";
    uploadStatus: UploadStatus;
    remoteId?: string;      // R2 mediaId
    error?: string;
    name?: string;
    transform?: ImageTransform;
    taggedUsers?: User[];
}

export interface PostSettings {
    visibility: AudienceType;
    commentControl: CommentControl;
}

interface PostCreationState {
    content: string;
    media: PostMediaItem[];
    settings: PostSettings;
    status: PostCreationStatus;
    error: string | null;
    uploadProgress: number; // Global progress from useMediaUpload
}

interface PostCreationContextType extends PostCreationState {
    setContent: (content: string) => void;
    addMedia: (files: File[]) => Promise<void>;
    removeMedia: (id: string) => void;
    updateMediaItem: (id: string, updates: Partial<PostMediaItem>) => void;
    updateSettings: (settings: Partial<PostSettings>) => void;
    reset: () => void;
    setEditingPost: (post: any) => void; // For edit mode initialization
}

const PostCreationContext = createContext<PostCreationContextType | undefined>(undefined);

export function PostCreationProvider({ children }: { children: ReactNode }) {
    const [content, setContent] = useState("");
    const [media, setMedia] = useState<PostMediaItem[]>([]);
    const [settings, setSettings] = useState<PostSettings>({
        visibility: "PUBLIC",
        commentControl: "ANYONE"
    });
    const [status, setStatus] = useState<PostCreationStatus>("IDLE");
    const [error, setError] = useState<string | null>(null);

    // Unified Upload Manager
    const { uploadFiles, progress: uploadProgress, isUploading } = useMediaUpload();

    const addMedia = useCallback(async (files: File[]) => {
        if (!files.length) return;

        // 1. Create Optimistic Items
        const newItems: PostMediaItem[] = files.map(file => ({
            id: crypto.randomUUID(),
            file,
            url: URL.createObjectURL(file), // Immediate preview
            type: file.type.startsWith("video") ? "VIDEO" : "IMAGE",
            uploadStatus: "PENDING",
            name: file.name
        }));

        setMedia(prev => [...prev, ...newItems]);
        setStatus("UPLOADING");

        try {
            // 2. Perform Upload
            const uploadedResults = await uploadFiles(files);

            // 3. Update Items with Remote Data
            setMedia(prev => {
                return prev.map(item => {
                    const match = uploadedResults.find(r => r.name === item.name); // Using name matching for now
                    
                    if (match) {
                        return {
                            ...item,
                            uploadStatus: "COMPLETED",
                            remoteId: match.mediaId ?? undefined,
                            url: match.url || item.url // Use R2 URL
                        };
                    }
                    // Handle items that weren't in this batch (old items) or failed
                    // If it was in this batch but not in results, it failed
                    const isNewItem = newItems.find(n => n.id === item.id);
                    if (isNewItem && !match) {
                         return { ...item, uploadStatus: "ERROR", error: "Upload failed" };
                    }
                    return item;
                });
            });
            
            setStatus("IDLE");
        } catch (err: any) {
            console.error("Upload error", err);
            setError("Failed to upload media");
            setStatus("ERROR");
            
            // Mark batch as error
            setMedia(prev => prev.map(item => 
                newItems.find(n => n.id === item.id) 
                    ? { ...item, uploadStatus: "ERROR", error: "Batch upload failed" }
                    : item
            ));
        }
    }, [uploadFiles]);

    const removeMedia = useCallback((id: string) => {
        setMedia(prev => prev.filter(item => item.id !== id));
    }, []);

    const updateMediaItem = useCallback((id: string, updates: Partial<PostMediaItem>) => {
        setMedia(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    }, []);

    const updateSettings = useCallback((newSettings: Partial<PostSettings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    }, []);

    const reset = useCallback(() => {
        setContent("");
        setMedia([]);
        setSettings({ visibility: "PUBLIC", commentControl: "ANYONE" });
        setStatus("IDLE");
        setError(null);
    }, []);

    const setEditingPost = useCallback((post: any) => {
        // Hydrate state from existing post
        setContent(post.content || "");
        setSettings({
            visibility: post.visibility || "PUBLIC",
            commentControl: post.commentControl || "ANYONE"
        });
        
        if (post.attachments?.length) {
            setMedia(post.attachments.map((att: any) => ({
                id: att.id,
                url: att.url,
                type: att.type,
                uploadStatus: "COMPLETED",
                remoteId: att.id, // Existing media has remoteId
                name: att.name,
                // Hydrate transform/tags if available in future
            })));
        }
    }, []);

    return (
        <PostCreationContext.Provider value={{
            content,
            setContent,
            media,
            addMedia,
            removeMedia,
            updateMediaItem,
            settings,
            updateSettings,
            status: isUploading ? "UPLOADING" : status, // Derive uploading status
            error,
            uploadProgress,
            reset,
            setEditingPost
        }}>
            {children}
        </PostCreationContext.Provider>
    );
}

export function usePostCreation() {
    const context = useContext(PostCreationContext);
    if (!context) {
        throw new Error("usePostCreation must be used within a PostCreationProvider");
    }
    return context;
}
