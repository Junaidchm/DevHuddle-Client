"use client";

import React, { useState, useRef } from "react";
import { X, Image as ImageIcon, Link as LinkIcon, Tag, UploadCloud, Loader2 } from "lucide-react";
import { useCreateProjectMutation } from "./hooks/useCreateProjectMutation";
import useProjectMediaUpload from "./hooks/useProjectMediaUpload";
import toast from "react-hot-toast";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Badge } from "@/src/components/ui/badge";
import { Label } from "@/src/components/ui/label";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateProjectModal({
  isOpen,
  onClose,
}: CreateProjectModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [repositoryUrls, setRepositoryUrls] = useState<string[]>([""]);
  const [demoUrl, setDemoUrl] = useState("");
  const [techStack, setTechStack] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [techInput, setTechInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE" | "VISIBILITY_CONNECTIONS">("PUBLIC");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    startUpload,
    attachments,
    isUploading,
    removeAttachment,
    reset: resetMediaUploads,
    getMediaIds,
  } = useProjectMediaUpload();

  const createMutation = useCreateProjectMutation();

  const handleAddRepositoryUrl = () => {
    setRepositoryUrls([...repositoryUrls, ""]);
  };

  const handleRepositoryUrlChange = (index: number, value: string) => {
    const newUrls = [...repositoryUrls];
    newUrls[index] = value;
    setRepositoryUrls(newUrls.filter((url) => url.trim() !== ""));
  };

  const handleAddTech = () => {
    if (techInput.trim() && !techStack.includes(techInput.trim())) {
      setTechStack([...techStack, techInput.trim()]);
      setTechInput("");
    }
  };

  const handleRemoveTech = (tech: string) => {
    setTechStack(techStack.filter((t) => t !== tech));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleClose = () => {
    resetMediaUploads();
    setTitle("");
    setDescription("");
    setRepositoryUrls([""]);
    setDemoUrl("");
    setTechStack([]);
    setTags([]);
    setTechInput("");
    setTagInput("");
    setVisibility("PUBLIC");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a project title");
      return;
    }

    if (!description.trim()) {
      toast.error("Please enter a project description");
      return;
    }

    // Check if any media is still uploading
    const uploadingMedia = attachments.filter((a) => a.isUploading);
    if (uploadingMedia.length > 0) {
      toast.error("Please wait for media to finish uploading before creating the project.");
      return;
    }

    const filteredRepoUrls = repositoryUrls.filter((url) => url.trim() !== "");
    const mediaIds = getMediaIds();

    createMutation.mutate({
      title: title.trim(),
      description: description.trim(),
      repositoryUrls: filteredRepoUrls,
      demoUrl: demoUrl.trim() || undefined,
      techStack,
      tags,
      visibility,
      mediaIds,
    }, {
      onSuccess: () => {
        handleClose();
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 shadow-xl border-border/40">
        <DialogHeader className="p-6 pb-4 border-b border-border/10">
          <DialogTitle className="text-xl font-bold tracking-tight">Showcase Project</DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs font-medium">
            Share your technical masterpieces with the community.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          {/* Core Information Section */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs font-semibold text-foreground/80">Project Title <span className="text-primary">*</span></Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Distributed Mesh Network"
                  required
                  className="h-10 border-border/60 bg-muted/5 focus:bg-background transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-xs font-semibold text-foreground/80">Description <span className="text-primary">*</span></Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="What is this project about? (Markdown supported)"
                  required
                  className="resize-none min-h-[120px] border-border/60 bg-muted/5 focus:bg-background transition-all text-sm leading-relaxed"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Links & Visibility Section */}
            <div className="space-y-4">
                <div className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold text-foreground/80">Repository URLs</Label>
                            <Button type="button" variant="ghost" size="sm" onClick={handleAddRepositoryUrl} className="h-6 text-[10px] font-bold text-primary px-1 hover:bg-transparent">
                                + Add
                            </Button>
                        </div>
                        <div className="space-y-1.5">
                            {repositoryUrls.map((url, index) => (
                            <div key={index} className="flex gap-2">
                                <Input
                                type="url"
                                value={url}
                                onChange={(e) => handleRepositoryUrlChange(index, e.target.value)}
                                placeholder="GitHub URL"
                                className="font-mono text-[11px] h-9 bg-muted/5"
                                />
                                {repositoryUrls.length > 1 && (
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => setRepositoryUrls(repositoryUrls.filter((_, i) => i !== index))}
                                    className="h-9 w-9 text-muted-foreground hover:text-destructive"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </Button>
                                )}
                            </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="demoUrl" className="text-xs font-semibold text-foreground/80">Demo URL</Label>
                        <Input
                            id="demoUrl"
                            type="url"
                            value={demoUrl}
                            onChange={(e) => setDemoUrl(e.target.value)}
                            placeholder="Live preview URL"
                            className="h-9 bg-muted/5"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="visibility" className="text-xs font-semibold text-foreground/80">Visibility</Label>
                        <select
                            id="visibility"
                            value={visibility}
                            onChange={(e) => setVisibility(e.target.value as typeof visibility)}
                            className="w-full h-9 px-3 text-xs border border-border rounded-md bg-muted/5 focus:bg-background transition-all appearance-none cursor-pointer"
                        >
                            <option value="PUBLIC">🌎 Public</option>
                            <option value="VISIBILITY_CONNECTIONS">👥 Network</option>
                            <option value="PRIVATE">🔒 Private</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Technical Stack & Tags */}
            <div className="space-y-4 pt-2">
                <div className="space-y-3">
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-foreground/80">Tech Stack</Label>
                        <div className="flex gap-2">
                            <Input
                                value={techInput}
                                onChange={(e) => setTechInput(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTech())}
                                placeholder="React, Rust..."
                                className="h-9 bg-muted/5"
                            />
                            <Button type="button" onClick={handleAddTech} variant="secondary" className="h-9 px-3 text-xs">
                                Add
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-1 min-h-[24px]">
                            {techStack.map((tech) => (
                                <Badge key={tech} variant="secondary" className="px-1.5 py-0.5 text-[10px] bg-muted/50 border-none font-medium">
                                {tech}
                                <button type="button" onClick={() => handleRemoveTech(tech)} className="ml-1 text-muted-foreground hover:text-foreground">
                                    <X className="w-2.5 h-2.5" />
                                </button>
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1.5 pt-1">
                        <Label className="text-xs font-semibold text-foreground/80">Tags</Label>
                        <div className="flex gap-2">
                            <Input
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                                placeholder="web3, ai..."
                                className="h-9 bg-muted/5"
                            />
                            <Button type="button" onClick={handleAddTag} variant="secondary" className="h-9 px-3 text-xs">
                                Tag
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 min-h-[12px]">
                            {tags.map((tag) => (
                                <span key={tag} className="text-[11px] font-medium text-primary/80">#{tag}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
          </div>

          {/* Media Assets Section */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-semibold text-foreground/80">Visual Assets</h3>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {attachments.map((attachment, index) => {
                  const previewUrl = URL.createObjectURL(attachment.file);
                  return (
                    <div key={attachment.file.name + attachment.file.lastModified} className="relative group aspect-square rounded-lg overflow-hidden border border-border/60 bg-muted/20">
                      {attachment.file.type.startsWith('image/') ? (
                        <img 
                          src={previewUrl} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                          onLoad={() => URL.revokeObjectURL(previewUrl)}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-secondary/30">
                          <UploadCloud className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}

                      {index === 0 && (
                          <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-brand-blue text-[8px] text-white font-bold rounded-sm shadow-sm flex items-center gap-1 z-10">
                              COVER
                          </div>
                      )}
                      
                      {attachment.isUploading && (
                        <div className="absolute inset-0 bg-background/60 flex items-center justify-center backdrop-blur-sm">
                          <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <button 
                            type="button" 
                            onClick={() => removeAttachment(attachment.file.name)}
                            className="p-1.5 bg-white/20 hover:bg-white/40 text-white rounded-md transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                      </div>
                    </div>
                  );
                })}

                {attachments.length < 10 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="aspect-square rounded-lg border-2 border-dashed border-border/60 hover:border-primary/40 hover:bg-muted/30 flex flex-col items-center justify-center gap-1 transition-all group"
                  >
                    <UploadCloud className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-[9px] font-bold text-muted-foreground uppercase group-hover:text-primary">Add</span>
                  </button>
                )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files && startUpload(Array.from(e.target.files))}
              className="hidden"
              multiple
              accept="image/*,video/*"
            />
          </div>
        </form>

        <DialogFooter className="p-4 border-t border-border/10 bg-muted/5 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={createMutation.isPending || isUploading}
              className="px-4 text-xs font-medium text-muted-foreground hover:bg-transparent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={createMutation.isPending || isUploading}
              className="h-9 px-6 text-xs font-bold"
            >
              {createMutation.isPending ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                    Publishing...
                  </>
              ) : "Publish Project"}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

