/**
 * Hub System Type Definitions
 */

export interface HubChannel {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface DomainHub {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    ownerId: string;
    topics: string[];
    channels?: HubChannel[];
    memberCount?: number;
    isPublic?: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface HubMember {
    id: string;
    hubId: string;
    userId: string;
    role: 'ADMIN' | 'MEMBER';
    joinedAt: string;
}

export interface CreateHubData {
    name: string;
    description?: string;
    icon?: string;
    topics?: string[];
    isPublic?: boolean;
}
