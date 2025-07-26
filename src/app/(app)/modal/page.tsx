"use client";

import React, { useState, useRef, useEffect } from 'react';
import { X, Image, Edit3, User, Type, Trash2, Copy, Plus, RotateCcw, RotateCw, FlipHorizontal, Crop, Sliders, Palette } from 'lucide-react';
import { Globe, Users, ChevronDown, Video, Calendar, MoreHorizontal, Smile, Camera, FileText, Briefcase, Award, Plus as PlusIcon } from 'lucide-react';

// Define interface for image transform properties
interface ImageTransform {
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  zoom: number;
  straighten: number;
  aspectRatio: string;
  filter: string;
  brightness: number;
  contrast: number;
  saturation: number;
  temperature: number;
  highlights: number;
  shadows: number;
  altText: string;
}

// Define interface for image object
interface ImageData {
  id: number;
  file: File;
  preview: string;
  name: string;
}

// Define interface for user object
interface User {
  id: number;
  name: string;
  title: string;
  avatar: string;
}

const Page: React.FC = () => {
  const [isNormalPostModalOpen, setIsNormalPostModalOpen] = useState<boolean>(false);
  const [isPollModalOpen, setIsPollModalOpen] = useState<boolean>(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState<boolean>(false);
  const [selectedImages, setSelectedImages] = useState<ImageData[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [rightPanelView, setRightPanelView] = useState<'default' | 'edit' | 'mention'>('default');
  const [editTab, setEditTab] = useState<'crop' | 'filter' | 'adjust'>('crop');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [altText, setAltText] = useState<string>('');
  const [showAltTextModal, setShowAltTextModal] = useState<boolean>(false);
  const [taggedUsers, setTaggedUsers] = useState<User[]>([]);
  const [isOpen, setIsOpen] = useState(false); // Moved from renderNormalPostModal
  const [showPostSettings, setShowPostSettings] = useState(false); // Moved from renderNormalPostModal
  const [showCommentControl, setShowCommentControl] = useState(false); // Moved from renderNormalPostModal
  const [audienceType, setAudienceType] = useState('anyone'); // Moved from renderNormalPostModal
  const [commentControl, setCommentControl] = useState('anyone'); // Moved from renderNormalPostModal
  const [brandPartnership, setBrandPartnership] = useState(false); // Moved from renderNormalPostModal
  const [showSuccess, setShowSuccess] = useState(false); // Moved to parent component
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Image editing states
  const [imageTransforms, setImageTransforms] = useState<Record<number, ImageTransform>>({});
  const [aspectRatio, setAspectRatio] = useState<string>('original');
  const [zoom, setZoom] = useState<number>(50);
  const [straighten, setStraighten] = useState<number>(50);
  const [selectedFilter, setSelectedFilter] = useState<string>('none');
  
  // Adjustment states
  const [brightness, setBrightness] = useState<number>(50);
  const [contrast, setContrast] = useState<number>(50);
  const [saturation, setSaturation] = useState<number>(50);
  const [temperature, setTemperature] = useState<number>(50);
  const [highlights, setHighlights] = useState<number>(50);
  const [shadows, setShadows] = useState<number>(50);

  // Poll states
  const [pollQuestion, setPollQuestion] = useState<string>('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [pollDuration, setPollDuration] = useState<string>('24h');

  // Mock data for mentions
  const mockUsers: User[] = [
    {
      id: 1,
      name: 'Junaid Chm',
      title: 'You • Full Stack Developer | React Js | Next Js | Javascript | Typescript | Express Js | Node Js | Mongodb | PSQL | HTML5 | CSS | Bootstrap | MVC | Tailwind |',
      avatar: 'https://i.pravatar.cc/150?img=1'
    },
    {
      id: 2,
      name: 'Anugrah James',
      title: '1st • Founder & Software Developer @College Concierge | Open Source Developer | Bridging Ideas & Implementation | Computer Science Undergraduate building solutions that matter through code and creativity',
      avatar: 'https://i.pravatar.cc/150?img=2'
    },
    {
      id: 3,
      name: 'Akshara Raveendran',
      title: '1st • Self-Learning Enthusiast | Lifelong Learner | Tech Explorer',
      avatar: 'https://i.pravatar.cc/150?img=4'
    },
    {
      id: 4,
      name: 'AKHIL MK',
      title: '1st • Self Taught Developer (MERN) | Bootstrap| Tailwind CSS | JavaScript | Node.js| React.js | Next.js | Express.js | MongoDB | Git | C | Java | MySQL | GraphQL',
      avatar: 'https://i.pravatar.cc/150?img=5'
    }
  ];

  const filters = [
    { name: 'None', value: 'none', filter: 'none' },
    { name: 'Vintage', value: 'vintage', filter: 'sepia(0.5) contrast(1.2) brightness(1.1)' },
    { name: 'B&W', value: 'bw', filter: 'grayscale(1) contrast(1.1)' },
    { name: 'Warm', value: 'warm', filter: 'hue-rotate(15deg) saturate(1.2) brightness(1.1)' },
    { name: 'Cool', value: 'cool', filter: 'hue-rotate(-15deg) saturate(1.1) brightness(0.9)' },
    { name: 'Dramatic', value: 'dramatic', filter: 'contrast(1.5) saturate(1.3) brightness(0.9)' },
    { name: 'Soft', value: 'soft', filter: 'blur(0.5px) brightness(1.1) saturate(0.8)' },
    { name: 'Vibrant', value: 'vibrant', filter: 'saturate(1.5) contrast(1.2) brightness(1.1)' }
  ];

  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Initialize transform for new images
  useEffect(() => {
    const newTransforms = { ...imageTransforms };
    let hasChanges = false;

    selectedImages.forEach(image => {
      if (!newTransforms[image.id]) {
        newTransforms[image.id] = {
          rotation: 0,
          flipH: false,
          flipV: false,
          zoom: 50,
          straighten: 50,
          aspectRatio: 'original',
          filter: 'none',
          brightness: 50,
          contrast: 50,
          saturation: 50,
          temperature: 50,
          highlights: 50,
          shadows: 50,
          altText: ''
        };
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setImageTransforms(newTransforms);
    }
  }, [selectedImages]);

  // Sync slider states with current image transforms
  useEffect(() => {
    const currentImage = selectedImages[currentImageIndex];
    if (currentImage && imageTransforms[currentImage.id]) {
      const transform = imageTransforms[currentImage.id];
      setZoom(transform.zoom);
      setStraighten(transform.straighten);
      setAspectRatio(transform.aspectRatio);
      setSelectedFilter(transform.filter);
      setBrightness(transform.brightness);
      setContrast(transform.contrast);
      setSaturation(transform.saturation);
      setTemperature(transform.temperature);
      setHighlights(transform.highlights);
      setShadows(transform.shadows);
    }
  }, [currentImageIndex, selectedImages, imageTransforms]);

  const getCurrentImageTransform = (): ImageTransform => {
    const currentImage = selectedImages[currentImageIndex];
    return currentImage && imageTransforms[currentImage.id]
      ? imageTransforms[currentImage.id]
      : {
          rotation: 0,
          flipH: false,
          flipV: false,
          zoom: 50,
          straighten: 50,
          aspectRatio: 'original',
          filter: 'none',
          brightness: 50,
          contrast: 50,
          saturation: 50,
          temperature: 50,
          highlights: 50,
          shadows: 50,
          altText: ''
        };
  };

  const updateImageTransform = (updates: Partial<ImageTransform>): void => {
    const currentImage = selectedImages[currentImageIndex];
    if (currentImage) {
      setImageTransforms(prev => ({
        ...prev,
        [currentImage.id]: {
          ...prev[currentImage.id],
          ...updates
        }
      }));
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/gif'].includes(file.type);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      if (!isValidType) console.warn(`File ${file.name} is not a supported image type.`);
      if (!isValidSize) console.warn(`File ${file.name} exceeds 10MB size limit.`);
      return isValidType && isValidSize;
    });

    const newImages = validFiles.map((file, index) =>
      new Promise<ImageData>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          if (e.target?.result) {
            resolve({
              id: Date.now() + index,
              file,
              preview: e.target.result as string,
              name: file.name
            });
          } else {
            reject(new Error(`Failed to read file: ${file.name}`));
          }
        };
        reader.onerror = () => reject(new Error(`Error reading file: ${file.name}`));
        reader.readAsDataURL(file);
      })
    );

    try {
      const images = await Promise.all(newImages);
      setSelectedImages(prev => [...prev, ...images]);
      if (selectedImages.length === 0 && images.length > 0) {
        setCurrentImageIndex(0);
      }
    } catch (error) {
      console.error('Error processing images:', error);
      // Optionally, notify the user of the error
    }
  };

  const openNormalPostModal = (): void => {
    setIsNormalPostModalOpen(true);
    setIsOpen(true); // Sync with moved state
  };

  const openPollModal = (): void => {
    setIsPollModalOpen(true);
  };

  const openPhotoModal = (): void => {
    setIsPhotoModalOpen(true);
    setRightPanelView('default');
  };

  const closeNormalPostModal = (): void => {
    setIsNormalPostModalOpen(false);
    setIsOpen(false); // Sync with moved state
    setShowPostSettings(false);
    setShowCommentControl(false);
  };

  const closePollModal = (): void => {
    setIsPollModalOpen(false);
    setPollQuestion('');
    setPollOptions(['', '']);
    setPollDuration('24h');
  };

  const closePhotoModal = (): void => {
    setIsPhotoModalOpen(false);
    setSelectedImages([]);
    setCurrentImageIndex(0);
    setRightPanelView('default');
    setSearchQuery('');
    setImageTransforms({});
    setTaggedUsers([]);
  };

  const triggerFileInput = (): void => {
    fileInputRef.current?.click();
  };

  const removeImage = (imageId: number): void => {
    const newImages = selectedImages.filter(img => img.id !== imageId);
    setSelectedImages(newImages);
    
    // Remove from transforms
    setImageTransforms(prev => {
      const newTransforms = { ...prev };
      delete newTransforms[imageId];
      return newTransforms;
    });

    if (currentImageIndex >= newImages.length && newImages.length > 0) {
      setCurrentImageIndex(newImages.length - 1);
    } else if (newImages.length === 0) {
      setCurrentImageIndex(0);
    }
  };

  const duplicateImage = (): void => {
    const currentImage = selectedImages[currentImageIndex];
    if (currentImage) {
      const duplicatedImage = {
        ...currentImage,
        id: Date.now(),
        name: `Copy of ${currentImage.name}`
      };
      
      const newImages = [...selectedImages];
      newImages.splice(currentImageIndex + 1, 0, duplicatedImage);
      setSelectedImages(newImages);
      
      // Copy transforms
      setImageTransforms(prev => ({
        ...prev,
        [duplicatedImage.id]: { ...prev[currentImage.id] }
      }));
      
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const moveImage = (fromIndex: number, toIndex: number): void => {
    const newImages = [...selectedImages];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    setSelectedImages(newImages);
    setCurrentImageIndex(toIndex);
  };

  const selectImage = (index: number): void => {
    setCurrentImageIndex(index);
    setRightPanelView('default');
  };

  const applyTransforms = (): void => {
    // In a real app, this would apply the transforms to the actual image
    setRightPanelView('default');
  };

  const resetAllAdjustments = (): void => {
    updateImageTransform({
      brightness: 50,
      contrast: 50,
      saturation: 50,
      temperature: 50,
      highlights: 50,
      shadows: 50
    });
    setBrightness(50);
    setContrast(50);
    setSaturation(50);
    setTemperature(50);
    setHighlights(50);
    setShadows(50);
  };

  const addUserTag = (user: User): void => {
    if (!taggedUsers.find(u => u.id === user.id)) {
      setTaggedUsers(prev => [...prev, user]);
    }
  };

  const removeUserTag = (userId: number): void => {
    setTaggedUsers(prev => prev.filter(u => u.id !== userId));
  };

  const getImageStyle = (): React.CSSProperties => {
    const transform = getCurrentImageTransform();
    const rotation = transform.rotation || 0;
    const flipH = transform.flipH ? -1 : 1;
    const flipV = transform.flipV ? -1 : 1;
    const zoomLevel = (transform.zoom / 50) * 0.5 + 0.75; // 0.75 to 1.25
    const straightenAngle = ((transform.straighten - 50) / 50) * 15; // -15 to +15 degrees
    
    let filterValue = '';
    
    if (transform.filter !== 'none') {
      const filter = filters.find(f => f.value === transform.filter);
      filterValue = filter ? filter.filter : '';
    }
    
    // Add adjustment filters
    const brightnessVal = (transform.brightness / 50) * 0.5 + 0.75; // 0.75 to 1.25
    const contrastVal = (transform.contrast / 50) * 0.5 + 0.75;
    const saturateVal = (transform.saturation / 50) * 0.5 + 0.75;
    const hueRotateVal = ((transform.temperature - 50) / 50) * 30; // -30 to +30 degrees
    
    const adjustmentFilters = `brightness(${brightnessVal}) contrast(${contrastVal}) saturate(${saturateVal}) hue-rotate(${hueRotateVal}deg)`;
    
    return {
      transform: `rotate(${rotation + straightenAngle}deg) scale(${flipH}, ${flipV}) scale(${zoomLevel})`,
      filter: filterValue ? `${filterValue} ${adjustmentFilters}` : adjustmentFilters,
      transition: 'all 0.3s ease'
    };
  };

  const renderDefaultRightPanel = () => (
    <div className="w-32">
      <div className="text-center mb-4">
        <span className="text-sm text-slate-600 font-medium">
          {selectedImages.length > 0 ? `${currentImageIndex + 1} of ${selectedImages.length}` : '0 of 0'}
        </span>
      </div>
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
        {selectedImages.map((image, index) => (
          <div key={image.id} className="relative group">
            <img
              src={image.preview}
              alt="Thumbnail"
              className={`w-24 h-24 object-cover rounded-lg cursor-pointer border-2 transition-all duration-200 ${
                index === currentImageIndex ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => selectImage(index)}
            />
            <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
              {String(index + 1).padStart(2, '0')}
            </div>
            <button
              onClick={() => removeImage(image.id)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            >
              ×
            </button>
            <div className="absolute left-1 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => index > 0 && moveImage(index, index - 1)}
                className="bg-white shadow-md rounded p-1 mb-1 text-xs hover:bg-gray-50"
                disabled={index === 0}
              >
                ↑
              </button>
              <button
                onClick={() => index < selectedImages.length - 1 && moveImage(index, index + 1)}
                className="bg-white shadow-md rounded p-1 text-xs hover:bg-gray-50"
                disabled={index === selectedImages.length - 1}
              >
                ↓
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {taggedUsers.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-200">
          <h4 className="text-sm font-medium text-slate-700 mb-3">Tagged</h4>
          <div className="space-y-2">
            {taggedUsers.map(user => (
              <div key={user.id} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full" />
                <span className="text-xs text-slate-700 flex-1 truncate">{user.name}</span>
                <button
                  onClick={() => removeUserTag(user.id)}
                  className="text-red-500 hover:text-red-700 text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderCropTab = () => (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button 
          onClick={() => updateImageTransform({ rotation: (getCurrentImageTransform().rotation || 0) - 90 })}
          className="p-3 hover:bg-gray-100 rounded-lg border border-slate-200 transition-colors"
          title="Rotate Left"
        >
          <RotateCcw size={20} className="text-slate-600" />
        </button>
        <button 
          onClick={() => updateImageTransform({ rotation: (getCurrentImageTransform().rotation || 0) + 90 })}
          className="p-3 hover:bg-gray-100 rounded-lg border border-slate-200 transition-colors"
          title="Rotate Right"
        >
          <RotateCw size={20} className="text-slate-600" />
        </button>
        <button 
          onClick={() => updateImageTransform({ flipH: !getCurrentImageTransform().flipH })}
          className="p-3 hover:bg-gray-100 rounded-lg border border-slate-200 transition-colors"
          title="Flip Horizontal"
        >
          <FlipHorizontal size={20} className="text-slate-600" />
        </button>
        <button 
          onClick={() => updateImageTransform({ flipV: !getCurrentImageTransform().flipV })}
          className="p-3 hover:bg-gray-100 rounded-lg border border-slate-200 transition-colors"
          title="Flip Vertical"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-600">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <polyline points="8,12 12,8 16,12"/>
          </svg>
        </button>
      </div>

      <div>
        <h4 className="text-sm font-medium text-slate-700 mb-3">Aspect Ratio</h4>
        <div className="flex flex-wrap gap-2">
          {['Original', 'Square', '4:3', '3:4', '16:9', '9:16'].map((ratio) => (
            <button
              key={ratio}
              onClick={() => {
                setAspectRatio(ratio.toLowerCase());
                updateImageTransform({ aspectRatio: ratio.toLowerCase() });
              }}
              className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                aspectRatio === ratio.toLowerCase()
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-slate-700 hover:bg-gray-200'
              }`}
            >
              {ratio}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-slate-700 mb-3">Zoom ({Math.round((zoom / 50) * 50 + 75)}%)</h4>
        <div className="relative">
          <input
            type="range"
            min="0"
            max="100"
            value={zoom}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const value = Number(e.target.value);
              setZoom(value);
              updateImageTransform({ zoom: value });
            }}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-slate-700 mb-3">Straighten ({Math.round(((straighten - 50) / 50) * 15)}°)</h4>
        <div className="relative">
          <input
            type="range"
            min="0"
            max="100"
            value={straighten}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const value = Number(e.target.value);
              setStraighten(value);
              updateImageTransform({ straighten: value });
            }}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>
      </div>
    </div>
  );

  const renderFilterTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => {
              setSelectedFilter(filter.value);
              updateImageTransform({ filter: filter.value });
            }}
            className={`relative p-3 rounded-lg border-2 text-center transition-all ${
              selectedFilter === filter.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-sm font-medium text-slate-700">{filter.name}</div>
            <div 
              className="w-full h-12 bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400 rounded mt-2"
              style={{ filter: filter.filter }}
            />
          </button>
        ))}
      </div>
    </div>
  );

  const renderAdjustTab = () => (
    <div className="space-y-5">
      <div>
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium text-slate-700">Brightness</h4>
          <span className="text-xs text-slate-500">{Math.round((brightness / 50) * 50 + 75)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={brightness}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const value = Number(e.target.value);
            setBrightness(value);
            updateImageTransform({ brightness: value });
          }}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium text-slate-700">Contrast</h4>
          <span className="text-xs text-slate-500">{Math.round((contrast / 50) * 50 + 75)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={contrast}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const value = Number(e.target.value);
            setContrast(value);
            updateImageTransform({ contrast: value });
          }}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium text-slate-700">Saturation</h4>
          <span className="text-xs text-slate-500">{Math.round((saturation / 50) * 50 + 75)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={saturation}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const value = Number(e.target.value);
            setSaturation(value);
            updateImageTransform({ saturation: value });
          }}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium text-slate-700">Temperature</h4>
          <span className="text-xs text-slate-500">{Math.round(((temperature - 50) / 50) * 30)}°</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={temperature}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const value = Number(e.target.value);
            setTemperature(value);
            updateImageTransform({ temperature: value });
          }}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium text-slate-700">Highlights</h4>
          <span className="text-xs text-slate-500">{Math.round((highlights / 50) * 50 + 75)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={highlights}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const value = Number(e.target.value);
            setHighlights(value);
            updateImageTransform({ highlights: value });
          }}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium text-slate-700">Shadows</h4>
          <span className="text-xs text-slate-500">{Math.round((shadows / 50) * 50 + 75)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={shadows}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const value = Number(e.target.value);
            setShadows(value);
            updateImageTransform({ shadows: value });
          }}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
      </div>

      <button
        onClick={resetAllAdjustments}
        className="w-full py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-gray-50 rounded-lg transition-colors"
      >
        Reset All
      </button>
    </div>
  );

  const renderEditPanel = () => (
    <div className="w-96 border-l border-slate-200 pl-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setRightPanelView('default')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X size={20} className="text-slate-600" />
        </button>
        <h3 className="text-lg font-semibold text-slate-800">Edit</h3>
      </div>

      <div className="flex border-b border-slate-200 mb-6">
        <button 
          onClick={() => setEditTab('crop')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            editTab === 'crop'
              ? 'text-slate-800 border-blue-500'
              : 'text-slate-500 border-transparent hover:text-slate-700'
          }`}
        >
          <Crop size={16} className="inline mr-2" />
          Crop
        </button>
        <button 
          onClick={() => setEditTab('filter')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            editTab === 'filter'
              ? 'text-slate-800 border-blue-500'
              : 'text-slate-500 border-transparent hover:text-slate-700'
          }`}
        >
          <Palette size={16} className="inline mr-2" />
          Filter
        </button>
        <button 
          onClick={() => setEditTab('adjust')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            editTab === 'adjust'
              ? 'text-slate-800 border-blue-500'
              : 'text-slate-500 border-transparent hover:text-slate-700'
          }`}
        >
          <Sliders size={16} className="inline mr-2" />
          Adjust
        </button>
      </div>

      <div className="max-h-[400px] overflow-y-auto pr-2">
        {editTab === 'crop' && renderCropTab()}
        {editTab === 'filter' && renderFilterTab()}
        {editTab === 'adjust' && renderAdjustTab()}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-200">
        <button 
          onClick={applyTransforms}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Apply Changes
        </button>
      </div>
    </div>
  );

  const renderMentionPanel = () => (
    <div className="w-96 border-l border-slate-200 pl-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setRightPanelView('default')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X size={20} className="text-slate-600" />
        </button>
        <h3 className="text-lg font-semibold text-slate-800">Add a tag</h3>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Type a name or names"
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
        {filteredUsers.map((user) => (
          <div 
            key={user.id} 
            onClick={() => addUserTag(user)}
            className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
          >
            <img
              src={user.avatar}
              alt={user.name}
              className="w-12 h-12 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-slate-800 text-sm">{user.name}</h4>
              <p className="text-xs text-slate-600 line-clamp-3 mt-1">{user.title}</p>
            </div>
            {taggedUsers.find(u => u.id === user.id) && (
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderAltTextModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Alt Text</h3>
          <button
            onClick={() => setShowAltTextModal(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={18} className="text-slate-600" />
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-slate-600 mb-3">
            Help make your content accessible to everyone. Alt text describes your photos for people with visual impairments.
          </p>
          <textarea
            value={altText}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAltText(e.target.value)}
            placeholder="Write alt text..."
            className="w-full h-24 px-3 py-2 border border-slate-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={125}
          />
          <div className="text-right text-xs text-slate-500 mt-1">
            {altText.length}/125
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowAltTextModal(false)}
            className="flex-1 px-4 py-2 text-slate-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              updateImageTransform({ altText });
              setShowAltTextModal(false);
              setAltText('');
            }}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );

  const CommentControlModal = () => (
    <div className="absolute top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
      <div className="p-4">
        <h4 className="font-medium text-slate-800 mb-3">Who can comment?</h4>
        <div className="space-y-2">
          {[
            { id: 'anyone', title: 'Anyone', subtitle: 'Anyone can comment on your post' },
            { id: 'connections', title: 'Connections only', subtitle: 'Only your connections can comment' },
            { id: 'nobody', title: 'No one', subtitle: 'Turn off commenting' }
          ].map((option) => (
            <div
              key={option.id}
              onClick={() => {
                setCommentControl(option.id);
                setShowCommentControl(false);
              }}
              className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
            >
              <div>
                <div className="font-medium text-sm">{option.title}</div>
                <div className="text-xs text-gray-600">{option.subtitle}</div>
              </div>
              <div className={`w-4 h-4 rounded-full border-2 ${
                commentControl === option.id 
                  ? 'bg-blue-600 border-blue-600' 
                  : 'border-gray-300'
              }`}>
                {commentControl === option.id && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const PostSettingsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[500px] p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-800">Post settings</h2>
          <button
            onClick={() => setShowPostSettings(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        {/* Audience Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-slate-800 mb-4">Who can see your post?</h3>
          <div className="space-y-3">
            {[
              {
                id: 'anyone',
                icon: <Globe size={20} />,
                title: 'Anyone',
                subtitle: 'Anyone on or off LinkedIn',
                selected: audienceType === 'anyone'
              },
              {
                id: 'connections',
                icon: <Users size={20} />,
                title: 'Connections only',
                subtitle: 'Connections on LinkedIn',
                selected: audienceType === 'connections'
              }
            ].map((option) => (
              <div
                key={option.id}
                onClick={() => setAudienceType(option.id)}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-gray-600">{option.icon}</div>
                  <div>
                    <div className="font-medium text-slate-800">{option.title}</div>
                    <div className="text-sm text-gray-600">{option.subtitle}</div>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 ${
                  option.selected 
                    ? 'bg-blue-600 border-blue-600' 
                    : 'border-gray-300'
                }`}>
                  {option.selected && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comment Control */}
        <div className="mb-6 relative">
          <div 
            onClick={() => setShowCommentControl(!showCommentControl)}
            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
          >
            <div>
              <div className="font-medium text-slate-800">Comment control</div>
              <div className="text-sm text-gray-600 capitalize">{commentControl === 'nobody' ? 'No one' : commentControl}</div>
            </div>
            <ChevronDown size={20} className="text-gray-600" />
          </div>
          {showCommentControl && <CommentControlModal />}
        </div>

        {/* Brand Partnership */}
        <div className="mb-8">
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-slate-800">Brand partnership</span>
              <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">?</span>
              </div>
            </div>
            <button
              onClick={() => setBrandPartnership(!brandPartnership)}
              className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                brandPartnership ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                brandPartnership ? 'translate-x-6' : 'translate-x-0.5'
              }`}></div>
            </button>
          </div>
          <div className="px-3">
            <div className="text-sm text-gray-600">{brandPartnership ? 'On' : 'Off'}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowPostSettings(false)}
            className="px-6 py-2 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors duration-200"
          >
            Back
          </button>
          <button
            onClick={() => setShowPostSettings(false)}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );

  const MediaPreview = () => (
    <div className="mt-4 space-y-2">
      {selectedImages.map((media) => (
        <div key={media.id} className="relative bg-gray-50 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src={media.preview} alt={media.name} className="w-12 h-12 object-cover rounded" />
            <div>
              <div className="font-medium text-sm">{media.name}</div>
              <div className="text-xs text-gray-600">image</div>
            </div>
          </div>
          <button
            onClick={() => removeImage(media.id)}
            className="p-1 hover:bg-gray-200 rounded-full"
          >
            <X size={16} className="text-gray-600" />
          </button>
        </div>
      ))}
    </div>
  );

  const SuccessNotification = () => (
    <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-70 flex items-center space-x-2">
      <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
        <span className="text-green-500 text-sm">✓</span>
      </div>
      <span>Post shared successfully!</span>
    </div>
  );

  const MainPostModal = () => {
    const userProfile = {
      name: "Junaid Chm",
      title: "Full Stack Developer | React Js | Next Js | Javascript | Typescript",
      location: "Kozhikode, Kerala",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    };
    const [postContent, setPostContent] = useState('');
    const [selectedMedia, setSelectedMedia] = useState([]);
    const [isPosting, setIsPosting] = useState(false);
    const [posts, setPosts] = useState([]);

    const fileInputRef = useRef(null);
    const videoInputRef = useRef(null);

    const closeModal = () => {
      closeNormalPostModal();
      setPostContent('');
      setSelectedMedia([]);
    };

    const handleFileUpload = (event, type) => {
      const files = Array.from(event.target.files);
      const newMedia = files.map(file => ({
        id: Date.now() + Math.random(),
        file,
        type,
        url: URL.createObjectURL(file),
        name: file.name
      }));
      setSelectedMedia(prev => [...prev, ...newMedia]);
    };

    const removeMedia = (id) => {
      setSelectedMedia(prev => prev.filter(media => media.id !== id));
    };

    const handlePost = async () => {
      if (!postContent.trim() && selectedMedia.length === 0) return;
      
      setIsPosting(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newPost = {
        id: Date.now(),
        content: postContent,
        media: selectedMedia,
        audience: audienceType,
        commentControl,
        brandPartnership,
        timestamp: new Date(),
        author: userProfile,
        likes: 0,
        comments: 0
      };
      
      setPosts(prev => [newPost, ...prev]);
      setIsPosting(false);
      setShowSuccess(true); // Update parent state
      
      setTimeout(() => {
        setShowSuccess(false);
        closeModal();
      }, 2000);
    };

    const rewriteWithAI = () => {
      const aiSuggestions = [
        "🚀 Excited to share my latest project! Building scalable web applications with React and Next.js has been an incredible journey. Always learning, always growing! #WebDev #React #NextJS",
        "💡 Just discovered an amazing new approach to state management in React. The developer community never fails to inspire me with innovative solutions! #ReactJS #StateManagement #Innovation",
        "🎯 Another day, another challenge conquered! Love how every coding problem teaches us something new. What's the most interesting bug you've solved recently? #CodingLife #ProblemSolving"
      ];
      
      const randomSuggestion = aiSuggestions[Math.floor(Math.random() * aiSuggestions.length)];
      setPostContent(randomSuggestion);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[600px] max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <img
                src={userProfile.avatar}
                alt={userProfile.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold text-slate-800">{userProfile.name}</h3>
                <button
                  onClick={() => setShowPostSettings(true)}
                  className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <span>Post to {audienceType === 'anyone' ? 'Anyone' : 'Connections only'}</span>
                  <ChevronDown size={14} />
                </button>
              </div>
            </div>
            <button
              onClick={closeModal}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <X size={20} className="text-slate-600" />
            </button>
          </div>

          {/* Content Area */}
          <div className="p-6">
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="What do you want to talk about?"
              className="w-full h-48 text-lg placeholder-gray-400 border-none outline-none resize-none font-light"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
            />
            
            {selectedMedia.length > 0 && <MediaPreview />}
          </div>

          {/* Media Options */}
          <div className="px-6 pb-4">
            <div className="flex items-center space-x-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileUpload(e, 'image')}
                className="hidden"
              />
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={(e) => handleFileUpload(e, 'video')}
                className="hidden"
              />
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Add photos"
              >
                <Image size={20} className="text-gray-600" />
              </button>
              <button 
                onClick={() => videoInputRef.current?.click()}
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Add videos"
              >
                <Video size={20} className="text-gray-600" />
              </button>
              <button className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Create an event">
                <Calendar size={20} className="text-gray-600" />
              </button>
              <button className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Add emoji">
                <Smile size={20} className="text-gray-600" />
              </button>
              <button className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors" title="More options">
                <MoreHorizontal size={20} className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* Rewrite with AI Button */}
          <div className="px-6 pb-4">
            <button 
              onClick={rewriteWithAI}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
            >
              <span className="text-orange-500 font-bold">✨</span>
              <span className="text-gray-700 font-medium">Rewrite with AI</span>
            </button>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">⏰</span>
            </div>
            <button
              onClick={handlePost}
              disabled={(!postContent.trim() && selectedMedia.length === 0) || isPosting}
              className={`px-6 py-2 font-semibold rounded-full transition-all duration-200 ${
                (postContent.trim() || selectedMedia.length > 0) && !isPosting
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isPosting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderPollModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[600px] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-800">Create Poll</h2>
          <button
            onClick={closePollModal}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Enter your poll question"
            value={pollQuestion}
            onChange={(e) => setPollQuestion(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {pollOptions.map((option, index) => (
            <input
              key={index}
              type="text"
              placeholder={`Option ${index + 1}`}
              value={option}
              onChange={(e) => {
                const newOptions = [...pollOptions];
                newOptions[index] = e.target.value;
                setPollOptions(newOptions);
              }}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ))}
          <button
            onClick={() => setPollOptions([...pollOptions, ''])}
            className="w-full py-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            Add Option
          </button>
          <select
            value={pollDuration}
            onChange={(e) => setPollDuration(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="1h">1 hour</option>
            <option value="24h">24 hours</option>
            <option value="7d">7 days</option>
          </select>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={closePollModal}
            className="bg-gradient-to-br from-violet-500 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
          >
            Create Poll
          </button>
        </div>
      </div>
    </div>
  );

  const renderPhotoModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[900px] max-h-[85vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800">Photo Editor</h2>
          <button
            onClick={closePhotoModal}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        <div className="p-6 flex gap-6 h-[calc(85vh-120px)]">
          <div className="flex-1 flex flex-col">
            {selectedImages.length > 0 ? (
              <div className="relative flex-1 bg-gray-100 rounded-lg overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <img
                    src={selectedImages[currentImageIndex]?.preview}
                    alt={imageTransforms[selectedImages[currentImageIndex]?.id]?.altText || 'Selected'}
                    className="max-w-full max-h-full object-contain rounded-lg"
                    style={getImageStyle()}
                  />
                </div>
                <div className="absolute top-4 left-4 bg-yellow-400 text-black px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                  33
                </div>
                {taggedUsers.length > 0 && (
                  <div className="absolute bottom-4 left-4 flex gap-2">
                    {taggedUsers.map(user => (
                      <div key={user.id} className="bg-white bg-opacity-90 px-2 py-1 rounded-full text-xs font-medium text-slate-800 shadow-lg">
                        @{user.name.split(' ')[0]}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div 
                onClick={triggerFileInput}
                className="flex-1 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-violet-400 hover:bg-violet-50 transition-all duration-200"
              >
                <div className="text-center">
                  <Image size={64} className="text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 font-medium text-lg">Click to upload images</p>
                  <p className="text-slate-400 text-sm mt-2">JPG, PNG, GIF up to 10MB each</p>
                  <p className="text-slate-400 text-xs mt-1">Drag and drop multiple files</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
              <div className="flex gap-3">
                <button 
                  onClick={() => setRightPanelView('edit')}
                  className={`p-3 rounded-full transition-colors duration-200 ${
                    rightPanelView === 'edit' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'hover:bg-gray-100 text-slate-600'
                  }`}
                  title="Edit image"
                >
                  <Edit3 size={20} />
                </button>
                <button 
                  onClick={() => setRightPanelView('mention')}
                  className={`p-3 rounded-full transition-colors duration-200 ${
                    rightPanelView === 'mention' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'hover:bg-gray-100 text-slate-600'
                  }`}
                  title="Tag people"
                >
                  <User size={20} />
                </button>
                <button 
                  onClick={() => {
                    const currentImage = selectedImages[currentImageIndex];
                    if (currentImage) {
                      const transform = getCurrentImageTransform();
                      setAltText(transform.altText || '');
                      setShowAltTextModal(true);
                    }
                  }}
                  className="p-3 hover:bg-gray-100 rounded-full transition-colors duration-200" 
                  title="Add alt text"
                  disabled={selectedImages.length === 0}
                >
                  <Type size={20} className="text-slate-600" />
                </button>
                <button 
                  onClick={duplicateImage}
                  className="p-3 hover:bg-gray-100 rounded-full transition-colors duration-200" 
                  title="Duplicate image"
                  disabled={selectedImages.length === 0}
                >
                  <Copy size={20} className="text-slate-600" />
                </button>
                <button 
                  onClick={() => selectedImages.length > 0 && removeImage(selectedImages[currentImageIndex].id)}
                  className="p-3 hover:bg-red-100 rounded-full transition-colors duration-200" 
                  title="Delete image"
                  disabled={selectedImages.length === 0}
                >
                  <Trash2 size={20} className="text-red-500" />
                </button>
                <button 
                  onClick={triggerFileInput}
                  className="p-3 hover:bg-gray-100 rounded-full transition-colors duration-200" 
                  title="Add more images"
                >
                  <Plus size={20} className="text-slate-600" />
                </button>
              </div>

              <button 
                onClick={closePhotoModal}
                className="bg-gradient-to-br from-violet-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
                disabled={selectedImages.length === 0}
              >
                Done ({selectedImages.length})
              </button>
            </div>

            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700">
                <span className="font-medium">Pro tips:</span> Use the edit panel to enhance your photos, add alt text for accessibility, and tag people to increase engagement. You can reorder images by using the up/down arrows on thumbnails.
              </p>
            </div>
          </div>

          {rightPanelView === 'default' && renderDefaultRightPanel()}
          {rightPanelView === 'edit' && renderEditPanel()}
          {rightPanelView === 'mention' && renderMentionPanel()}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-xl p-4 mb-6 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <img
            src="https://i.pravatar.cc/150?img=3"
            alt="Your Profile"
            className="w-12 h-12 rounded-full object-cover"
          />
          <button 
            onClick={openNormalPostModal}
            className="flex-1 text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-full border border-slate-200 text-slate-500 transition-colors duration-200 ease-in-out cursor-pointer"
          >
            Start a post...
          </button>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex gap-1 sm:gap-4 flex-wrap">
            <button 
              onClick={openPhotoModal}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-gray-50 rounded-lg transition-colors duration-200 ease-in-out cursor-pointer"
            >
              <Image size={20} className="text-violet-500 flex-shrink-0" />
              <span className="hidden sm:inline">Photo</span>
            </button>

            <button className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-gray-50 rounded-lg transition-colors duration-200 ease-in-out cursor-pointer">
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="#10b981"
                className="flex-shrink-0"
              >
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
              </svg>
              <span className="hidden sm:inline">Article</span>
            </button>

            <button 
              onClick={openPollModal}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-gray-50 rounded-lg transition-colors duration-200 ease-in-out cursor-pointer"
            >
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="#f59e0b"
                className="flex-shrink-0"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              <span className="hidden sm:inline">Poll</span>
            </button>

            <button className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-gray-50 rounded-lg transition-colors duration-200 ease-in-out cursor-pointer">
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="#ef4444"
                className="flex-shrink-0"
              >
                <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4zM14 13h-3v3H9v-3H6v-2h3V8h2v3h3v2z" />
              </svg>
              <span className="hidden sm:inline">Event</span>
            </button>
          </div>

          <button className="bg-gradient-to-br from-violet-500 to-purple-600 text-white border-none px-4 py-2 rounded-lg font-semibold text-sm cursor-pointer transition-all duration-200 ease-in-out shadow-sm hover:-translate-y-0.5 hover:shadow-lg ml-2">
            Post
          </button>
        </div>
      </div>

      {isNormalPostModalOpen && <MainPostModal />}
      {isPollModalOpen && renderPollModal()}
      {isPhotoModalOpen && renderPhotoModal()}
      {showAltTextModal && renderAltTextModal()}
      {showPostSettings && <PostSettingsModal />}
      {showSuccess && <SuccessNotification />}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .slider::-moz-range-thumb {
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .slider::-webkit-slider-track {
          background: #e2e8f0;
          height: 4px;
          border-radius: 2px;
        }
        .slider::-moz-range-track {
          background: #e2e8f0;
          height: 4px;
          border-radius: 2px;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default Page;