import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { FileText, Link as LinkIcon, Image as ImageIcon, ExternalLink, Download } from 'lucide-react';
import { Message } from '@/src/types/chat.types';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { getSharedMedia } from '@/src/services/api/chat.service';
import { useAuthHeaders } from '@/src/customHooks/useAuthHeaders';
import { Skeleton } from '@/src/components/ui/skeleton';

interface MediaLinksDocsProps {
    conversationId: string;
}

export function MediaLinksDocs({ conversationId }: MediaLinksDocsProps) {
    const authHeaders = useAuthHeaders();

    const { data: media = [], isLoading: mediaLoading } = useQuery({
        queryKey: ['chat-media', conversationId],
        queryFn: () => getSharedMedia(conversationId, 'IMAGE,VIDEO,CHAT_IMAGE,CHAT_VIDEO', authHeaders),
        enabled: !!conversationId && !!authHeaders.Authorization,
    });

    const { data: docs = [], isLoading: docsLoading } = useQuery({
        queryKey: ['chat-docs', conversationId],
        queryFn: () => getSharedMedia(conversationId, 'FILE,AUDIO,CHAT_FILE,CHAT_AUDIO', authHeaders),
        enabled: !!conversationId && !!authHeaders.Authorization,
    });

    const loading = mediaLoading || docsLoading;

    return (
        <div className="flex flex-col h-full bg-background border-t border-border mt-4">
            <h3 className="text-sm font-semibold p-4 text-muted-foreground uppercase tracking-tight">Media, links and docs</h3>
            <Tabs defaultValue="media" className="w-full">
                <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-4">
                    <TabsTrigger value="media" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Media</TabsTrigger>
                    <TabsTrigger value="docs" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Docs</TabsTrigger>
                    <TabsTrigger value="links" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Links</TabsTrigger>
                </TabsList>
                
                <ScrollArea className="h-[300px]">
                    <TabsContent value="media" className="p-4 m-0">
                        {loading ? (
                            <div className="grid grid-cols-3 gap-2">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <Skeleton key={i} className="aspect-square rounded-md" />
                                ))}
                            </div>
                        ) : media.length > 0 ? (
                            <div className="grid grid-cols-3 gap-2">
                                {media.map((item) => (
                                    <div key={item.id} className="aspect-square relative rounded-md overflow-hidden bg-muted group cursor-pointer hover:opacity-90 active:scale-95 transition-all">
                                        <img 
                                            src={item.mediaUrl} 
                                            alt={item.mediaName || 'shared-media'} 
                                            className="w-full h-full object-cover"
                                        />
                                        {item.type.includes('VIDEO') && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                                                    <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[7px] border-l-white border-b-[4px] border-b-transparent ml-0.5" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <NoContent icon={<ImageIcon className="w-8 h-8"/>} text="No media shared yet" />
                        )}
                    </TabsContent>

                    <TabsContent value="docs" className="p-2 m-0">
                        {docs.length > 0 ? (
                            <div className="space-y-1">
                                {docs.map((doc) => (
                                    <div key={doc.id} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg cursor-pointer group transition-colors">
                                        <div className="w-10 h-10 rounded bg-blue-500/10 flex items-center justify-center text-blue-500">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{doc.mediaName || 'File'}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {doc.mediaSize ? `${(doc.mediaSize / 1024).toFixed(1)} KB` : ''} • {format(new Date(doc.createdAt), 'MMM d, yyyy')}
                                            </p>
                                        </div>
                                        <Download className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <NoContent icon={<FileText className="w-8 h-8"/>} text="No documents shared yet" />
                        )}
                    </TabsContent>

                    <TabsContent value="links" className="p-4 m-0">
                        <NoContent icon={<LinkIcon className="w-8 h-8"/>} text="No links shared yet" />
                    </TabsContent>
                </ScrollArea>
            </Tabs>
        </div>
    );
}

function NoContent({ icon, text }: { icon: React.ReactNode, text: string }) {
    return (
        <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground space-y-2 opacity-50">
            {icon}
            <p className="text-sm">{text}</p>
        </div>
    );
}
