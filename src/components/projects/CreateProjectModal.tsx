"use client";

import React, { useState, useRef } from "react";
import { X, Image, Link as LinkIcon, Tag } from "lucide-react";
import { useCreateProjectMutation } from "./hooks/useCreateProjectMutation";
import useProjectMediaUpload from "./hooks/useProjectMediaUpload";
import toast from "react-hot-toast";

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold">Create New Project</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Project Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter project title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe your project (Markdown supported)"
              required
            />
          </div>

          {/* Repository URLs */}
          <div>
            <label className="block text-sm font-medium mb-2">Repository URLs</label>
            {repositoryUrls.map((url, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => handleRepositoryUrlChange(index, e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://github.com/username/repo"
                />
                {index === repositoryUrls.length - 1 && (
                  <button
                    type="button"
                    onClick={handleAddRepositoryUrl}
                    className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    <LinkIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Demo URL */}
          <div>
            <label className="block text-sm font-medium mb-2">Demo URL</label>
            <input
              type="url"
              value={demoUrl}
              onChange={(e) => setDemoUrl(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://your-demo.com"
            />
          </div>

          {/* Tech Stack */}
          <div>
            <label className="block text-sm font-medium mb-2">Tech Stack</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTech())}
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add technology (e.g., React, Node.js)"
              />
              <button
                type="button"
                onClick={handleAddTech}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {techStack.map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  {tech}
                  <button
                    type="button"
                    onClick={() => handleRemoveTech(tech)}
                    className="hover:text-blue-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add tag"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <Tag className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-gray-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Media Upload */}
          {/* <div>
            <label className="block text-sm font-medium mb-2">Media</label>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (files.length === 0) return;
                
                // Validate file types and sizes
                const validFiles = files.filter((file) => {
                  const isImage = file.type.startsWith("image/");
                  const isVideo = file.type.startsWith("video/");
                  const isValidType = isImage || isVideo;
                  
                  if (!isValidType) {
                    toast.error(`${file.name} is not a valid image or video file`);
                    return false;
                  }
                  
                  // Check file size (5MB for images, 100MB for videos)
                  const maxSize = isImage ? 5 * 1024 * 1024 : 100 * 1024 * 1024;
                  if (file.size > maxSize) {
                    toast.error(`${file.name} is too large (max ${isImage ? "5MB" : "100MB"})`);
                    return false;
                  }
                  
                  return true;
                });

                if (validFiles.length > 0) {
                  startUpload(validFiles);
                }
                
                // Reset input to allow selecting the same file again
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              className="hidden"
              disabled={isUploading}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full px-4 py-2 border border-dashed rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Image className="w-5 h-5 text-gray-500" />
              <span className="text-gray-600">
                {isUploading ? "Uploading..." : "Add Images/Videos"}
              </span>
            </button>
            {attachments.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {attachments.map((attachment, index) => (
                  <div key={index} className="relative w-20 h-20 rounded overflow-hidden group border border-gray-200">
                    {attachment.file.type.startsWith("image") ? (
                      <img
                        src={URL.createObjectURL(attachment.file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-xs text-gray-600">Video</span>
                      </div>
                    )}
                    {attachment.isUploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-1"></div>
                          <span className="text-white text-xs">Uploading...</span>
                        </div>
                      </div>
                    )}
                    {attachment.mediaId && !attachment.isUploading && (
                      <div className="absolute top-1 right-1 bg-green-500 rounded-full p-1">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeAttachment(attachment.file.name)}
                      className="absolute top-1 left-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove media"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Images up to 5MB, Videos up to 100MB. Max 10 files.
            </p>
          </div> */}

          {/* Visibility */}
          <div>
            <label className="block text-sm font-medium mb-2">Visibility</label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as typeof visibility)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="PUBLIC">Public</option>
              <option value="VISIBILITY_CONNECTIONS">Connections Only</option>
              <option value="PRIVATE">Private</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || isUploading}
              className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {createMutation.isPending ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

