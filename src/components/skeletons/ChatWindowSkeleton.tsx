import React from "react";

export function ChatWindowSkeleton() {
  return (
    <div className="flex-1 flex flex-col h-full animate-pulse mr-4">
      {/* Messages Skeleton - Matches the WhatsApp bubble style */}
      <div className="flex-1 space-y-6 py-4">
         {/* Incoming message */}
         <div className="flex items-start gap-3 max-w-[80%]">
             <div className="space-y-2 w-full">
                 <div className="bg-white/40 h-16 w-2/3 rounded-2xl rounded-tl-none border border-white/20 shadow-sm" />
             </div>
         </div>

         {/* Outgoing message */}
         <div className="flex items-end justify-end gap-2 ml-auto max-w-[80%]">
             <div className="space-y-2 w-full flex flex-col items-end">
                 <div className="bg-primary/10 h-12 w-1/2 rounded-2xl rounded-tr-none border border-primary/10 shadow-sm" />
             </div>
         </div>

         {/* Incoming long message */}
         <div className="flex items-start gap-3 max-w-[85%]">
             <div className="space-y-2 w-full">
                 <div className="bg-white/40 h-24 w-full rounded-2xl rounded-tl-none border border-white/20 shadow-sm" />
             </div>
         </div>
         
         {/* Outgoing long message */}
         <div className="flex items-end justify-end gap-2 ml-auto max-w-[80%]">
             <div className="space-y-2 w-full flex flex-col items-end">
                 <div className="bg-primary/10 h-20 w-3/4 rounded-2xl rounded-tr-none border border-primary/10 shadow-sm" />
             </div>
         </div>

         {/* Incoming short message */}
         <div className="flex items-start gap-3 max-w-[60%]">
             <div className="space-y-2 w-full">
                 <div className="bg-white/40 h-10 w-full rounded-2xl rounded-tl-none border border-white/20 shadow-sm" />
             </div>
         </div>

         {/* Date separator skeleton */}
         <div className="flex justify-center my-8">
             <div className="w-24 h-6 rounded-full bg-white/20 border border-white/40" />
         </div>

         {/* Outgoing message */}
         <div className="flex items-end justify-end gap-2 ml-auto max-w-[80%]">
             <div className="space-y-2 w-full flex flex-col items-end">
                 <div className="bg-primary/10 h-14 w-2/3 rounded-2xl rounded-tr-none border border-primary/10 shadow-sm" />
             </div>
         </div>
      </div>
    </div>
  );
}
