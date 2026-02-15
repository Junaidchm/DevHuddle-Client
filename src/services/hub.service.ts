
import { axiosInstance } from '../axios/axios';
import { DomainHub, HubMember, CreateHubData, HubChannel } from '../types/hub.types';
import { API_ROUTES } from '../constants/api.routes';

export const hubService = {
    async createHub(data: CreateHubData, headers: Record<string, string>): Promise<DomainHub> {
        const response = await axiosInstance.post(API_ROUTES.HUBS.CREATE, data, { headers });
        return response.data;
    },

    async getUserHubs(headers: Record<string, string>): Promise<DomainHub[]> {
        const response = await axiosInstance.get(API_ROUTES.HUBS.MY_HUBS, { headers });
        return response.data;
    },

    async getHubDetails(hubId: string, headers: Record<string, string>): Promise<DomainHub> {
        const response = await axiosInstance.get(API_ROUTES.HUBS.DETAILS(hubId), { headers });
        return response.data;
    },

    async joinHub(hubId: string, headers: Record<string, string>): Promise<HubMember> {
        const response = await axiosInstance.post(API_ROUTES.HUBS.JOIN(hubId), {}, { headers });
        return response.data;
    },

    async searchHubs(query: string | undefined, headers: Record<string, string>): Promise<DomainHub[]> {
        const response = await axiosInstance.get(API_ROUTES.HUBS.SEARCH, { 
            params: { query },
            headers
        });
        return response.data;
    },

    async createChannel(hubId: string, data: { name: string; description?: string }, headers: Record<string, string>): Promise<HubChannel> {
        const response = await axiosInstance.post(API_ROUTES.HUBS.CREATE_CHANNEL(hubId), data, { headers });
        return response.data;
    }
};
