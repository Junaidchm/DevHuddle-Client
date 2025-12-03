// app/components/FollowerList.tsx
'use client';
import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import FollowerItem from './FollowerItem';
import { useAuthHeaders } from '@/src/customHooks/useAuthHeaders';
import { PROFILE_DEFAULT_URL } from '@/src/constents';
import { queryKeys } from '@/src/lib/queryKeys';
import { fetchFollowers, fetchFollowing } from '@/src/services/api/follow.service';
import Pagination from './Pagination';
import useDebounce from '@/src/customHooks/useDebounce';

interface FollowerListProps {
  username: string;
  currentUserId?: string;
  view: 'followers' | 'following';
  searchQuery?: string;
}

const ITEMS_PER_PAGE = 10;

const FollowerList = ({ username, currentUserId, view, searchQuery = '' }: FollowerListProps) => {
  const authHeaders = useAuthHeaders();
  const [currentPage, setCurrentPage] = useState(1);
  
  const { data: network = [], isLoading, error } = useQuery({
    queryKey: queryKeys.network.list(username, view),
    queryFn: () => {
      if (view === 'followers') {
        return fetchFollowers(username, authHeaders);
      }
      return fetchFollowing(username, authHeaders);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!authHeaders.Authorization,
  });

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Filter network based on search query
  const filteredNetwork = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return network;
    }

    const query = debouncedSearchQuery.toLowerCase().trim();
    return network.filter((user: any) => {
      const nameMatch = user.name?.toLowerCase().includes(query);
      const usernameMatch = user.username?.toLowerCase().includes(query);
      const jobTitleMatch = user.jobTitle?.toLowerCase().includes(query);
      return nameMatch || usernameMatch || jobTitleMatch;
    });
  }, [network, debouncedSearchQuery]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredNetwork.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedNetwork = filteredNetwork.slice(startIndex, endIndex);

  // Reset to page 1 when search query or view changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, view]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl overflow-hidden shadow-sm mb-8">
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-slate-500">Loading {view}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl overflow-hidden shadow-sm mb-8">
        <div className="p-5 text-center text-red-500">Error loading network</div>
      </div>
    );
  }

  if (filteredNetwork.length === 0) {
    return (
      <div className="bg-white rounded-xl overflow-hidden shadow-sm mb-8">
        <div className="p-8 text-center">
          {searchQuery.trim() ? (
            <>
              <p className="text-slate-600 mb-2">No users found matching your search.</p>
              <p className="text-sm text-slate-500">Try a different search term.</p>
            </>
          ) : (
            <>
              <p className="text-slate-600 mb-2">
                {view === 'followers' 
                  ? 'This user doesn\'t have any followers yet.' 
                  : 'This user isn\'t following anyone yet.'}
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Results count indicator */}
      {debouncedSearchQuery.trim() && (
        <div className="mb-4 text-sm text-slate-600">
          Found {filteredNetwork.length} {filteredNetwork.length === 1 ? 'result' : 'results'} 
          {filteredNetwork.length !== network.length && ` of ${network.length} ${view}`}
        </div>
      )}
      
      <div className="bg-white rounded-xl overflow-hidden shadow-sm mb-8">
        {paginatedNetwork.map((follower: any) => (
          <FollowerItem
            key={follower.id}
            id={follower.id}
            imgSrc={follower.profilePicture || PROFILE_DEFAULT_URL}
            name={follower.name}
            username={follower.username}
            role={follower.jobTitle || 'Developer'}
            alt={follower.name}
            isFollowing={follower.isFollowing || false}
            currentUserId={currentUserId}
          />
        ))}
      </div>
      
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        isLoading={isLoading}
      />
    </>
  );
};

export default FollowerList;
