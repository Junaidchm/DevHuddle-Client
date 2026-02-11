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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-6">
        <DialogHeader className="px-1">
          <DialogTitle className="text-2xl font-bold">Create New Project</DialogTitle>
          <DialogDescription>
            Share your latest work with the community.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-2 space-y-6 mt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Project Title <span className="text-destructive">*</span></Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. AI-Powered Task Manager"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="Describe your project (Markdown supported)"
              required
              className="resize-y min-h-[120px]"
            />
          </div>

          {/* Repository URLs */}
          <div className="space-y-3">
             <div className="flex items-center justify-between">
                <Label>Repository URLs</Label>
                <Button type="button" variant="ghost" size="sm" onClick={handleAddRepositoryUrl} className="h-8 text-xs">
                    <LinkIcon className="w-3.5 h-3.5 mr-1.5" />
                    Add Another URL
                </Button>
             </div>
            {repositoryUrls.map((url, index) => (
              <Input
                key={index}
                type="url"
                value={url}
                onChange={(e) => handleRepositoryUrlChange(index, e.target.value)}
                placeholder="https://github.com/username/repo"
                className="font-mono text-sm"
              />
            ))}
          </div>

          {/* Demo URL */}
          <div className="space-y-2">
            <Label htmlFor="demoUrl">Demo URL</Label>
            <Input
              id="demoUrl"
              type="url"
              value={demoUrl}
              onChange={(e) => setDemoUrl(e.target.value)}
              placeholder="https://your-demo.com"
            />
          </div>

          {/* Tech Stack */}
          <div className="space-y-3">
            <Label>Tech Stack</Label>
            <div className="flex gap-2">
              <Input
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTech())}
                placeholder="Add technology (e.g., React, Node.js)"
                className="flex-1"
              />
              <Button type="button" onClick={handleAddTech} variant="secondary">
                Add
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2 min-h-[32px] p-2 border border-dashed rounded-md bg-muted/30">
                {techStack.length === 0 && <span className="text-xs text-muted-foreground self-center">No technologies added</span>}
                {techStack.map((tech) => (
                    <Badge key={tech} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100">
                    {tech}
                    <button
                        type="button"
                        onClick={() => handleRemoveTech(tech)}
                        className="p-0.5 hover:bg-blue-200 rounded-full transition-colors ml-1"
                    >
                        <X className="w-3 h-3" />
                    </button>
                    </Badge>
                ))}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                placeholder="Add tag (e.g., open-source, web3)"
                className="flex-1"
              />
               <Button type="button" onClick={handleAddTag} variant="outline" size="icon">
                  <Tag className="w-4 h-4" />
               </Button>
            </div>
            
            <div className="flex flex-wrap gap-2 min-h-[32px] p-2 border border-dashed rounded-md bg-muted/30">
                {tags.length === 0 && <span className="text-xs text-muted-foreground self-center">No tags added</span>}
                {tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="pl-2 pr-1 py-1 flex items-center gap-1">
                    #{tag}
                    <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="p-0.5 hover:bg-muted-foreground/20 rounded-full transition-colors ml-1"
                    >
                        <X className="w-3 h-3" />
                    </button>
                    </Badge>
                ))}
            </div>
          </div>

          {/* Visibility */}
          <div className="space-y-2">
            <Label htmlFor="visibility">Visibility</Label>
            <select
              id="visibility"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as typeof visibility)}
              className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background hover:bg-accent hover:text-accent-foreground focus:ring-2 focus:ring-ring focus:outline-none transition-colors"
            >
              <option value="PUBLIC">Public</option>
              <option value="VISIBILITY_CONNECTIONS">Connections Only</option>
              <option value="PRIVATE">Private</option>
            </select>
          </div>

        </form>

        <DialogFooter className="pt-4 border-t border-border mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createMutation.isPending || isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={createMutation.isPending || isUploading}
              className="min-w-[140px]"
            >
              {createMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
              ) : "Create Project"}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

