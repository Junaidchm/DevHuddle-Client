

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DomainHub, HubMember, HubChannel } from '../types/hub.types';
import { hubService } from '../services/hub.service';
import { useSession } from "next-auth/react"; // Use next-auth
import { useWebSocket } from './WebSocketContext';
import { useAuthHeaders } from '../customHooks/useAuthHeaders';

interface HubContextType {
    hubs: DomainHub[];
    activeHub: DomainHub | null;
    activeChannel: HubChannel | null;
    isLoading: boolean;
    error: string | null;
    
    // Actions
    fetchUserHubs: () => Promise<void>;
    selectHub: (hubId: string) => void;
    selectChannel: (channelId: string) => void;
    createHub: (data: any) => Promise<DomainHub>;
    joinHub: (hubId: string) => Promise<void>;
    createChannel: (hubId: string, data: any) => Promise<HubChannel>;
}

const HubContext = createContext<HubContextType | undefined>(undefined);

export const HubProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [hubs, setHubs] = useState<DomainHub[]>([]);
    const [activeHub, setActiveHub] = useState<DomainHub | null>(null);
    const [activeChannel, setActiveChannel] = useState<HubChannel | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { data: session } = useSession();
    const user = session?.user;
    const authHeaders = useAuthHeaders();
    // const { socket } = useWebSocket(); // Socket is not exposed directly

    const fetchUserHubs = useCallback(async () => {
        if (!user || !authHeaders.Authorization) return;
        setIsLoading(true);
        try {
            const userHubs = await hubService.getUserHubs(authHeaders);
            setHubs(userHubs);
        } catch (err) {
            console.error("Failed to fetch hubs", err);
            setError("Failed to load hubs");
        } finally {
            setIsLoading(false);
        }
    }, [user, authHeaders]);

    // Initial load
    useEffect(() => {
        if (user && authHeaders.Authorization) {
            fetchUserHubs();
        }
    }, [user, authHeaders.Authorization, fetchUserHubs]);

    const selectHub = useCallback(async (hubId: string) => {
        // Find in local state first
        const hub = hubs.find(h => h.id === hubId);
        if (hub) {
            setActiveHub(hub);
            // Default to 'general' channel or first available
            if (hub.channels && hub.channels.length > 0) {
                 // Try to find a 'general' channel
                 const general = hub.channels.find(c => c.name.toLowerCase() === 'general');
                 setActiveChannel(general || hub.channels[0]);
            }
        } else {
             // Fetch details if not fully loaded (e.g. from search result)
             if (!authHeaders.Authorization) return;
             try {
                 const details = await hubService.getHubDetails(hubId, authHeaders);
                 setActiveHub(details);
                  if (details.channels && details.channels.length > 0) {
                     const general = details.channels.find(c => c.name.toLowerCase() === 'general');
                     setActiveChannel(general || details.channels[0]);
                }
             } catch (err) {
                 console.error("Failed to fetch hub details", err);
             }
        }
    }, [hubs, authHeaders]);

    const selectChannel = useCallback((channelId: string) => {
        if (!activeHub || !activeHub.channels) return;
        const channel = activeHub.channels.find(c => c.id === channelId);
        if (channel) {
            setActiveChannel(channel);
        }
    }, [activeHub]);

    const createHub = async (data: any) => {
        if (!authHeaders.Authorization) throw new Error("Not authenticated");
        setIsLoading(true);
        try {
            const newHub = await hubService.createHub(data, authHeaders);
            setHubs(prev => [...prev, newHub]);
            selectHub(newHub.id);
            return newHub;
        } catch (err) {
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const joinHub = async (hubId: string) => {
        if (!authHeaders.Authorization) throw new Error("Not authenticated");
        try {
             await hubService.joinHub(hubId, authHeaders);
             await fetchUserHubs(); // Refresh list
             selectHub(hubId);
        } catch (err) {
            throw err;
        }
    };
    
    const createChannel = async (hubId: string, data: any) => {
        if (!authHeaders.Authorization) throw new Error("Not authenticated");
         try {
            const channel = await hubService.createChannel(hubId, data, authHeaders);
            // Update local state
            setHubs(prev => prev.map(h => {
                if (h.id === hubId) {
                    return {
                        ...h,
                        channels: [...(h.channels || []), channel]
                    };
                }
                return h;
            }));
            
            // Also update active hub if it matches
            if (activeHub && activeHub.id === hubId) {
                setActiveHub(prev => {
                     if (!prev) return null;
                     return {
                         ...prev,
                         channels: [...(prev.channels || []), channel]
                     };
                });
            }
            return channel;
        } catch (err) {
            throw err;
        }
    };

    return (
        <HubContext.Provider value={{
            hubs,
            activeHub,
            activeChannel,
            isLoading,
            error,
            fetchUserHubs,
            selectHub,
            selectChannel,
            createHub,
            joinHub,
            createChannel
        }}>
            {children}
        </HubContext.Provider>
    );
};

export const useHub = () => {
    const context = useContext(HubContext);
    if (context === undefined) {
        throw new Error('useHub must be used within a HubProvider');
    }
    return context;
};
