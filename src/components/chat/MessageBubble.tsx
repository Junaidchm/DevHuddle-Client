import React, { useState } from "react";
import { Check, CheckCheck, FileText, Download, Play, Pause } from "lucide-react";
import { Message } from "@/src/types/chat.types";
import Image from "next/image";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  senderName?: string;
  senderAvatar?: string;
}

export function MessageBubble({ message, isOwn, showAvatar, senderName, senderAvatar }: MessageBubbleProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);

  // Format time to HH:MM (WhatsApp style)
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  // Render delivery status (WhatsApp-style checkmarks)
  const renderStatus = () => {
    if (!isOwn) return null;
    
    if (message.status === "read" || message.status === "READ") {
      return <CheckCheck className="w-4 h-4 text-blue-400" />; // Blue checkmarks for read
    } else if (message.status === "delivered" || message.status === "DELIVERED") {
      return <CheckCheck className="w-4 h-4 text-gray-400" />; // Gray double checkmark
    } else if (message.status === "sent" || message.status === "SENT") {
      return <Check className="w-4 h-4 text-gray-400" />; // Gray single checkmark
    }
    return <Check className="w-4 h-4 text-gray-300" />; // Sending
  };

  // Render content based on message type
  const renderContent = () => {
    switch (message.type) {
      case 'IMAGE':
      case 'CHAT_IMAGE': // Handle new enum value
        return (
          <div className="mb-1">
            <div 
              onClick={() => setShowLightbox(true)}
              className="relative w-full max-w-[300px] sm:max-w-[400px] rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-95 transition-opacity"
            >
              {/* Using standard img tag for dynamic aspect ratios without known dimensions */}
              <img 
                src={message.mediaUrl || ''} 
                alt="Image" 
                className="w-full h-auto object-contain max-h-[400px]"
                loading="lazy"
              />
            </div>
            {message.content && <p className="mt-1 text-sm">{message.content}</p>}
            
            {/* Lightbox Modal */}
            {showLightbox && (
              <div 
                className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-default"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLightbox(false);
                }}
              >
                <div className="relative max-w-4xl max-h-screen w-full flex flex-col items-center">
                   <img 
                    src={message.mediaUrl || ''} 
                    alt="Full View" 
                    className="max-w-full max-h-[85vh] object-contain rounded-sm"
                  />
                  <div className="mt-4 flex gap-4">
                     <a 
                       href={message.mediaUrl} 
                       download 
                       target="_blank"
                       rel="noopener noreferrer"
                       className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
                       onClick={(e) => e.stopPropagation()}
                     >
                       <Download className="w-4 h-4" />
                       <span className="text-sm">Download</span>
                     </a>
                     <button 
                       onClick={() => setShowLightbox(false)}
                       className="px-4 py-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors text-sm"
                     >
                       Close
                     </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'VIDEO':
      case 'CHAT_VIDEO': // Handle new enum value
        return (
          <div className="mb-1">
            <div className="relative w-full max-w-[300px] aspect-video rounded-lg overflow-hidden bg-black">
              <video 
                src={message.mediaUrl} 
                controls 
                className="w-full h-full object-contain"
              />
            </div>
            {message.content && <p className="mt-1 text-sm">{message.content}</p>}
          </div>
        );
        
      case 'AUDIO':
      case 'CHAT_AUDIO':
        return (
          <div className={`flex items-center gap-3 p-3 rounded-lg min-w-[200px] ${isOwn ? 'bg-[#005c4b]/10' : 'bg-gray-100'}`}>
             <div className="flex-shrink-0">
                <button 
                  onClick={() => {
                    const audio = document.getElementById(`audio-${message.id}`) as HTMLAudioElement;
                    if (audio) {
                      if (isPlaying) audio.pause();
                      else audio.play();
                      setIsPlaying(!isPlaying);
                    }
                  }}
                  className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${isOwn ? 'bg-[#0A66C2] text-white hover:bg-[#004182]' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                </button>
             </div>
             <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                <audio 
                  id={`audio-${message.id}`}
                  src={message.mediaUrl}
                  onEnded={() => setIsPlaying(false)}
                  onPause={() => setIsPlaying(false)}
                  onPlay={() => setIsPlaying(true)}
                  className="hidden"
                />
                <div className="h-1 bg-gray-300 rounded-full overflow-hidden w-full">
                   {/* Simplified progress bar - for full feature use a proper progress state */}
                   <div className={`h-full ${isOwn ? 'bg-[#0A66C2]/40' : 'bg-gray-400'} w-0`} style={{ width: '0%', transition: 'width 0.1s linear' }} id={`progress-${message.id}`} />
                </div>
                <div className="flex justify-between text-[10px] text-gray-500 font-medium">
                  <span id={`time-${message.id}`}>0:00</span>
                  <span>{message.mediaDuration ? new Date(message.mediaDuration * 1000).toISOString().substr(14, 5) : "--:--"}</span>
                </div>
             </div>
             
             {/* Script to update progress - lightweight approach without extra state rerenders */}
             <script dangerouslySetInnerHTML={{__html: `
                (function() {
                  const audio = document.getElementById('audio-${message.id}');
                  const progress = document.getElementById('progress-${message.id}');
                  const time = document.getElementById('time-${message.id}');
                  
                  if (audio && progress && time) {
                    audio.ontimeupdate = () => {
                      const pct = (audio.currentTime / audio.duration) * 100;
                      progress.style.width = pct + '%';
                      
                      const mins = Math.floor(audio.currentTime / 60);
                      const secs = Math.floor(audio.currentTime % 60);
                      time.textContent = mins + ':' + (secs < 10 ? '0' : '') + secs;
                    };
                  }
                })();
             `}} />
          </div>
        );

      case 'FILE':
      case 'CHAT_FILE':
        return (
          <div className="mb-1">
            <div className={`flex items-center gap-3 p-3 rounded-lg ${isOwn ? 'bg-[#005c4b]/10' : 'bg-gray-100'}`}>
              <div className="p-2 bg-red-100 rounded-lg text-red-500">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{message.mediaName || "File"}</p>
                <p className="text-xs opacity-70">{(message.mediaSize ? (Number(message.mediaSize) / 1024).toFixed(1) : 0)} KB • {message.mediaMimeType?.split('/')[1]?.toUpperCase()}</p>
              </div>
              <a href={message.mediaUrl} download target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors">
                <Download className="w-4 h-4 text-gray-600" />
              </a>
            </div>
            {message.content && <p className="mt-1 text-sm">{message.content}</p>}
          </div>
        );

      default:
        // Text message
        return <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words flex-1">{message.content}</p>;
    }
  };

  return (
    <div className={`flex items-end gap-2 mb-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar for received messages */}
      {!isOwn && showAvatar && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#0A66C2] to-[#004182] flex items-center justify-center text-white text-xs font-semibold shadow-sm overflow-hidden">
           {senderAvatar ? (
               <Image src={senderAvatar} alt={senderName || 'U'} width={32} height={32} className="object-cover w-full h-full" />
           ) : (
               <span>{senderName?.charAt(0)?.toUpperCase() || 'U'}</span>
           )}
        </div>
      )}
      {!isOwn && !showAvatar && <div className="w-8" />}

      {/* Message Bubble Container */}
      <div className={`relative max-w-[65%] group ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Bubble with WhatsApp-style design */}
        <div
          className={`
            px-3 py-2 shadow-sm
            ${isOwn 
              ? 'bg-[#0A66C2] text-white rounded-lg rounded-br-sm' 
              : 'bg-white text-gray-800 border border-gray-200 rounded-lg rounded-bl-sm'
            }
          `}
        >
          {/* Sender name for group chats (received messages only) */}
          {!isOwn && senderName && (
            <p className="text-xs font-semibold text-[#0A66C2] mb-1">{senderName}</p>
          )}
          
          {/* Message content with timestamp inline */}
          <div className="flex flex-col">
            {renderContent()}
            
            {/* Timestamp + Status (WhatsApp style - bottom right inside bubble) */}
            <div className={`
              flex items-center gap-1 justify-end mt-1
              ${isOwn ? 'text-blue-100' : 'text-gray-500'}
            `}>
              <span className="text-[11px] leading-none">{formatTime(message.createdAt)}</span>
              {renderStatus()}
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for sent messages */}
      {isOwn && <div className="w-8" />}
    </div>
  );
}
