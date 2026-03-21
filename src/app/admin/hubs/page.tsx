"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @next/next/no-img-element */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getHubs, getReportedHubs, suspendHub, deleteHubAdmin } from "@/src/services/api/admin-panel.service";
import { MODERATION_REASONS } from "@/src/constants/moderation.constants";
import { useApiClient } from "@/src/lib/api-client";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Link from "next/link";
import { Card } from "@/src/components/admin/ui/Card";
import { CardHeader } from "@/src/components/admin/ui/CardHeader";
import { SearchInput } from "@/src/components/admin/ui/SearchInput";
import { FilterBar } from "@/src/components/admin/ui/FilterBar";
import { FilterSelect } from "@/src/components/admin/ui/FilterSelect";
import StatusBadge from "@/src/components/admin/ui/StatusBadge";
import ConfirmModal from "@/src/components/admin/ui/ConfirmModal";
import ContentIdentityCell from "@/src/components/admin/ui/ContentIdentityCell";
import useDebounce from "@/src/customHooks/useDebounce";

export default function HubsPage() {
  const { data: session, status } = useSession();
  const apiClient = useApiClient({ requireAuth: true });
  
  const userId = session?.user?.id;
  const userRole = session?.user?.role;
  
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
  });
  const [showReportedOnly, setShowReportedOnly] = useState(false);

  const debouncedSearch = useDebounce(filters.search, 500);

  // Modal states
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; hubId: string | null }>({
    isOpen: false,
    hubId: null,
  });
  const [suspendModal, setSuspendModal] = useState<{ isOpen: boolean; hubId: string | null }>({
    isOpen: false,
    hubId: null,
  });

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-hubs", page, limit, filters.status, debouncedSearch, showReportedOnly, userId, userRole],
    queryFn: () =>
      showReportedOnly
        ? getReportedHubs({ page, limit, search: debouncedSearch }, apiClient.getHeaders() as any)
        : getHubs({ page, limit, ...filters, search: debouncedSearch }, apiClient.getHeaders() as any),
    enabled: status !== "loading" && !!userId && userRole === "superAdmin" && apiClient.isReady,
  });

  const suspendMutation = useMutation({
    mutationFn: ({ hubId, suspended, reason }: { hubId: string; suspended: boolean; reason?: string }) =>
      suspendHub(hubId, { suspended, reason }, apiClient.getHeaders() as any),
    onSuccess: () => {
      toast.success("Hub status updated successfully");
      setSuspendModal({ isOpen: false, hubId: null });
      queryClient.invalidateQueries({ queryKey: ["admin-hubs"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update hub status");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (hubId: string) => deleteHubAdmin(hubId, apiClient.getHeaders() as any),
    onSuccess: () => {
      toast.success("Hub deleted successfully");
      setDeleteModal({ isOpen: false, hubId: null });
      queryClient.invalidateQueries({ queryKey: ["admin-hubs"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete hub");
    },
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading hubs. Please try again.</p>
        </div>
      </div>
    );
  }

  const hubs = data?.data?.hubs || [];
  const total = data?.data?.total || 0;
  const totalPages = data?.data?.totalPages || 1;

  const handleClearFilter = () => {
    setPage(1);
    setFilters({
      status: "all",
      search: "",
    });
    setShowReportedOnly(false);
  };

  return (
    <div className="p-6 w-full h-full">
      <Card>
        <CardHeader title="Hubs Management">
          <SearchInput
            placeholder="Search hubs..."
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            value={filters.search}
          />
        </CardHeader>

        <div className="overflow-x-auto">
          <FilterBar onClearFilters={handleClearFilter}>
            <FilterSelect
              label="Status"
              id="status-filter"
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              value={filters.status}
              options={[
                { label: "All Status", value: "all" },
                { label: "Active", value: "active" },
                { label: "Suspended", value: "suspended" },
                { label: "Reported", value: "reported" },
              ]}
            />
            <div className="flex flex-col gap-1 max-[768px]:w-full">
              <label className="text-xs text-gray-500 font-medium">Extra</label>
              <label className="flex items-center gap-2 h-[38px] px-2 border border-gray-200 rounded-lg bg-white cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={showReportedOnly}
                  onChange={(e) => setShowReportedOnly(e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">Reported Only</span>
              </label>
            </div>
          </FilterBar>

          <table className="w-full border-collapse min-w-[1000px]">
            <thead>
              <tr>
                <th className="p-4 bg-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider text-left">
                  <div className="relative inline-block">
                    <input type="checkbox" id="select-all" className="peer sr-only" />
                    <label htmlFor="select-all" className="w-[18px] h-[18px] border border-gray-300 rounded-sm flex items-center justify-center cursor-pointer transition-all duration-300 peer-checked:bg-indigo-600 peer-checked:border-indigo-600">
                      <i className="fas fa-check text-white text-[0.625rem] hidden peer-checked:inline-block"></i>
                    </label>
                  </div>
                </th>
                <th className="p-4 bg-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider text-left">Hub Info</th>
                <th className="p-4 bg-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider text-left">Creator</th>
                <th className="p-4 bg-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider text-left">Members</th>
                <th className="p-4 bg-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider text-left">Reports</th>
                <th className="p-4 bg-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider text-left">Status</th>
                <th className="p-4 bg-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider text-left">Created</th>
                <th className="p-4 bg-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-3">
                      <i className="fas fa-circle-notch fa-spin text-2xl text-indigo-600"></i>
                      <span className="font-medium">Fetching hubs...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 inline-block max-w-md">
                      <i className="fas fa-exclamation-circle text-red-500 text-2xl mb-2"></i>
                      <p className="text-red-800 font-bold">Error loading hubs</p>
                      <p className="text-red-600 text-sm mt-1">{(error as any)?.response?.data?.message || "Please refresh the page"}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                hubs.map((hub: any) => (
                  <tr key={hub.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="relative inline-block">
                        <input type="checkbox" id={`hub-${hub.id}`} className="peer sr-only" />
                        <label htmlFor={`hub-${hub.id}`} className="w-[18px] h-[18px] border border-gray-300 rounded-sm flex items-center justify-center cursor-pointer transition-all duration-300 peer-checked:bg-indigo-600 peer-checked:border-indigo-600">
                          <i className="fas fa-check text-white text-[0.625rem] hidden peer-checked:inline-block"></i>
                        </label>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={hub.icon || `https://ui-avatars.com/api/?name=${encodeURIComponent(hub.name)}&background=4f46e5&color=fff`}
                          alt={hub.name}
                          className="h-10 w-10 rounded-lg object-cover bg-gray-100"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium text-gray-900 truncate">{hub.name}</span>
                          <span className="text-[10px] text-gray-500">ID: {hub.id.substring(0, 8)}...</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <ContentIdentityCell
                        name={hub.owner?.name || "Hub Owner"}
                        username={hub.owner?.username || (hub.ownerId ? hub.ownerId.substring(0, 8) : "owner")}
                        avatar={hub.owner?.profilePicture || null}
                        avatarSize="sm"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600 font-medium">
                        <i className="fas fa-users text-gray-400"></i>
                        {hub.memberCount || 0}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-sm font-semibold ${hub.reportsCount > 0 ? "text-orange-600" : "text-gray-600"}`}>
                        {hub.reportsCount || 0}
                      </span>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={hub.isSuspended ? "suspended" : hub.reportsCount > 0 ? "reported" : "active"} />
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(hub.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/hubs/${hub.id}`}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                          title="View Details"
                        >
                          <i className="fas fa-eye"></i>
                        </Link>
                        {hub.isSuspended ? (
                          <button
                            onClick={() => suspendMutation.mutate({ hubId: hub.id, suspended: false })}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-green-500 hover:bg-green-50 transition-colors"
                            title="Unsuspend Hub"
                            disabled={suspendMutation.isPending}
                          >
                            <i className={`fas ${suspendMutation.isPending ? "fa-spinner fa-spin" : "fa-unlock"}`}></i>
                          </button>
                        ) : (
                          <button
                            onClick={() => setSuspendModal({ isOpen: true, hubId: hub.id })}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-yellow-500 hover:bg-yellow-50 transition-colors"
                            title="Suspend Hub"
                            disabled={suspendMutation.isPending}
                          >
                            <i className="fas fa-lock"></i>
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, hubId: hub.id })}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                          title="Delete Hub"
                          disabled={deleteMutation.isPending}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {hubs.length === 0 && !isLoading && !error && (
            <div className="p-12 text-center text-gray-500">
              No hubs found matching the criteria.
            </div>
          )}
        </div>

        {/* Footer with Pagination */}
        <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center border-t border-gray-200 gap-4">
          <div className="flex gap-1">
            <button
              className="w-8 h-8 rounded-md flex items-center justify-center text-gray-800 hover:bg-gray-100 transition-all duration-300 disabled:text-gray-400 disabled:cursor-not-allowed"
              disabled={page === 1}
              onClick={() => setPage((pre) => Math.max(pre - 1, 1))}
            >
              <i className="fas fa-chevron-left"></i>
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-8 h-8 rounded-md flex items-center justify-center font-medium ${
                  page === i + 1
                    ? "text-white bg-indigo-600"
                    : "text-gray-800 hover:bg-gray-100"
                } transition-all duration-300`}
              >
                {i + 1}
              </button>
            ))}

            <button
              className="w-8 h-8 rounded-md flex items-center justify-center text-gray-800 disabled:text-gray-400 hover:bg-gray-100 transition-all duration-300"
              disabled={page === totalPages}
              onClick={() => setPage((pre) => Math.min(pre + 1, totalPages))}
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500 w-full sm:w-auto justify-between sm:justify-start">
            <label htmlFor="page-size">Show</label>
            <select
              id="page-size"
              onChange={(e) => setLimit(Number(e.target.value))}
              value={limit}
              className="p-1 border border-gray-200 rounded-md text-sm text-gray-800 bg-white min-w-[70px] outline-none focus:border-indigo-600"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
            <span>entries</span>
          </div>
        </div>
      </Card>

      {/* Modals */}
      <ConfirmModal
        isOpen={suspendModal.isOpen}
        onClose={() => setSuspendModal({ isOpen: false, hubId: null })}
        onConfirm={(reason) => {
          if (suspendModal.hubId) {
            suspendMutation.mutate({ hubId: suspendModal.hubId, suspended: true, reason });
          }
        }}
        title="Suspend Hub"
        message="Are you sure you want to suspend this hub? Suspended hubs are hidden from search and members cannot post until unsuspended."
        confirmLabel="Suspend Hub"
        confirmVariant="warning"
        reasonRequired={true}
        reasonOptions={MODERATION_REASONS}
        isLoading={suspendMutation.isPending}
      />

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, hubId: null })}
        onConfirm={() => {
          if (deleteModal.hubId) {
            deleteMutation.mutate(deleteModal.hubId);
          }
        }}
        title="Delete Hub"
        message="This action is irreversible. All hub content, members, and settings will be permanently removed."
        confirmLabel="Delete Permanently"
        confirmVariant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
