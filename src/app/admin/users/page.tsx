"use client";

import StatCard from "@/src/components/admin/user-management/StatCard";
import { useAdminRedirectIfNotAuthenticated } from "@/src/customHooks/useAdminAuthenticated";
import { getAllUsers, toogleUserBlock } from "@/src/services/api/admin.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { User } from "../../types";
import Link from "next/link";
import toast from "react-hot-toast";
import { useState } from "react";
import dynamic from "next/dynamic";
import { Card } from "@/src/components/admin/ui/Card";
import { CardHeader } from "@/src/components/admin/ui/CardHeader";
import { SearchInput } from "@/src/components/admin/ui/SearchInput";
import usePresignedProfileImage from "@/src/customHooks/usePresignedProfileImage";
import useDebounce from "@/src/customHooks/useDebounce";
import { FilterSelect } from "@/src/components/admin/ui/FilterSelect";
import { config } from "./static_config";
import { FilterBar } from "@/src/components/admin/ui/FilterBar";

const UserDetailsModal = dynamic(
  () => import("@/src/components/admin/user-management/userDetailsModal")
);

export default function UserList() {
  // useAdminRedirectIfNotAuthenticated("/admin/signIn");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("all");

  const [blockUnblock, setBlockUnblock] = useState<number>(-1);
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 2000);

  const { data, error, isLoading } = useQuery({
    queryKey: ["users", page, limit, status, debouncedSearch, date],
    queryFn: () => {
      return getAllUsers({
        page,
        limit,
        search: debouncedSearch,
        status,
        date,
      });
    },
    staleTime: 30000,
    refetchOnWindowFocus: true,
  });

  const handleClearFilter = () => {
    setPage(1);
    setLimit(5);
    setStatus("all");
    setSearch("");
    setDate("all");
  };

  const totalUsers = data?.data?.total || 0;
  const totalPages = data?.data?.totalPages;
  const startIndex = (page - 1) * limit + 1;
  const endIndex = Math.min(startIndex + limit - 1, totalUsers);

  const blockUnblockMutation = useMutation({
    mutationFn: toogleUserBlock,
    onSuccess: () => {
      toast.success("User status updated");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const handleBlockMutation = (userId: string) => {
    blockUnblockMutation.mutate(userId);
  };

  const handleBlockToogle = (index: number) => {
    setBlockUnblock((pre) => (pre === index ? -1 : index));
  };

  return (
    <>
      <div className="p-6 w-full h-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon="fa-users"
            iconColor="text-indigo-600"
            iconBgColor="bg-[rgba(79,70,229,0.1)]"
            title="Total Users"
            value={"1234"}
            trendColor="text-green-600"
            trend="12% from last month"
            trendIcon="fa-arrow-up"
          />
          <StatCard
            icon="fa-user-plus"
            iconColor="text-cyan-500"
            iconBgColor="bg-[rgba(6,182,212,0.1)]"
            title="New Users"
            value={"487"}
            trendColor="text-green-600"
            trend="8% from last month"
            trendIcon="fa-arrow-up"
          />
          <StatCard
            icon="fa-user-check"
            iconColor="text-green-500"
            iconBgColor="bg-[rgba(16,185,129,0.1)]"
            title="Active Users"
            value={"9,342"}
            trendColor="text-green-600"
            trend="5% from last month"
            trendIcon="fa-arrow-up"
          />
          <StatCard
            icon="fa-user-slash"
            iconColor="text-red-500"
            iconBgColor="bg-[rgba(239,68,68,0.1)]"
            title="Inactive Users"
            value={"214"}
            trendColor="text-red-500"
            trend="3% from last month"
            trendIcon="fa-arrow-down"
          />
        </div>

        <Card>
          <CardHeader title="Users List">
            <SearchInput
              onChange={(e) => setSearch(e.target.value)}
              value={search}
            />
          </CardHeader>

          <div className="overflow-x-auto">
            <FilterBar  onClearFilters={handleClearFilter}>
              <FilterSelect
                label="Status"
                id="status-filter"
                onChange={(e) => setStatus(e.target.value)}
                value={status}
                options={config.statusOptions}     
              />
              
              <FilterSelect
                label="Join Date"
                id="date-filter"
                onChange={(e) => setDate(e.target.value)}
                value={date}
                options={config.dateOptions}     
              />
            </FilterBar>
            
            <table className="w-full border-collapse min-w-[800px]">
              <thead>
                <tr>
                  <th className="p-4 bg-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider text-left">
                    <div className="relative inline-block">
                      <input
                        type="checkbox"
                        id="select-all"
                        className="peer sr-only"
                      />
                      <label
                        htmlFor="select-all"
                        className="w-[18px] h-[18px] border border-gray-300 rounded-sm flex items-center justify-center cursor-pointer transition-all duration-300 peer-checked:bg-indigo-600 peer-checked:border-indigo-600"
                      >
                        <i className="fas fa-check text-white text-[0.625rem] hidden peer-checked:inline-block"></i>
                      </label>
                    </div>
                  </th>
                  <th className="p-4 bg-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider text-left">
                    Name
                  </th>
                  <th className="p-4 bg-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider text-left">
                    Email
                  </th>
                  <th className="p-4 bg-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider text-left">
                    Role
                  </th>
                  <th className="p-4 bg-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider text-left">
                    Status
                  </th>
                  <th className="p-4 bg-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider text-left">
                    Join Date
                  </th>
                  <th className="p-4 bg-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider text-left">
                    Projects
                  </th>
                  <th className="p-4 bg-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider text-left">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {data?.data?.users?.length > 0 ? (
                  data?.data?.users.map((user: User, index: number) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-200 hover:bg-gray-100 transition-all duration-300"
                    >
                      <td className="p-4 text-sm">
                        <div className="relative inline-block">
                          <input
                            type="checkbox"
                            id={`user-${user.id}`}
                            className="peer sr-only"
                          />
                          <label
                            htmlFor={`user-${user.id}`}
                            className="w-[18px] h-[18px] border border-gray-300 rounded-sm flex items-center justify-center cursor-pointer transition-all duration-300 peer-checked:bg-indigo-600 peer-checked:border-indigo-600"
                          >
                            <i className="fas fa-check text-white text-[0.625rem] hidden peer-checked:inline-block"></i>
                          </label>
                        </div>
                      </td>

                      <td className="p-4 text-sm">
                        <div className="flex items-center gap-3">
                          <img
                            src="https://ui-avatars.com/api/?name=David+Miller&background=10b981&color=fff"
                            alt={user.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <div className="font-medium text-gray-800">
                              {user.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {user.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm">{user.email}</td>
                      <td className="p-4 text-sm">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[rgba(59,130,246,0.1)] text-blue-600">
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4 text-sm">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                        ${
                          user.isBlocked
                            ? "bg-[rgba(239,68,68,0.1)] text-red-500 before:bg-red-500"
                            : "bg-[rgba(34,197,94,0.1)] text-green-500 before:bg-green-500"
                        }
                        before:content-[''] before:inline-block before:w-2 before:h-2 before:rounded-full`}
                        >
                          {user.isBlocked ? "Blocked" : "Active"}
                        </span>
                      </td>

                      <td className="p-4 text-sm">
                        {user.createdAt &&
                          new Date(user.createdAt).toISOString().split("T")[0]}
                      </td>
                      <td className="p-4 text-sm">21</td>
                      <td className="p-4 text-sm">
                        <div className="flex items-center gap-1 flex-wrap">
                          {/* <button
                        className="w-7 h-7 rounded-md flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-all duration-300"
                        title="Edit User"
                      >
                        <i className="fas fa-edit"></i>
                      </button> */}
                          <button
                            onClick={() => setSelectedUser(user.id)}
                            className="w-7 h-7 rounded-md flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-all duration-300"
                            title="View Profile"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <div className="relative">
                            <button
                              onClick={() => handleBlockToogle(index)}
                              className="w-7 h-7 rounded-md flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-all duration-300"
                            >
                              <i className="fas fa-ellipsis-v"></i>
                            </button>
                            {blockUnblock === index && (
                              <div className="absolute top-full right-0 w-44 bg-white rounded-md shadow-lg z-10">
                                <button
                                  onClick={() => handleBlockMutation(user.id)}
                                  disabled={blockUnblockMutation.isPending}
                                  className={`flex w-full items-center gap-2 px-4 py-2 text-sm ${
                                    user.isBlocked
                                      ? "text-gray-800"
                                      : "text-red-500"
                                  } hover:bg-gray-100 transition-all duration-300`}
                                >
                                  <i className="fas fa-user-slash text-sm w-5 h-5 flex items-center justify-center"></i>
                                  {user.isBlocked ? "UnBlock" : "Block"}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-b border-gray-200">
                    <td
                      colSpan={8}
                      className="p-4 text-sm text-gray-500 text-center"
                    >
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center border-t border-gray-200 gap-4">
            {/* <div className="text-sm text-gray-500">
              {"  "} <span className="font-semibold text-gray-800"></span>{"  "}
              {"  "}
              <span className="font-semibold text-gray-800">{"  "}</span> {"  "}
            </div> */}
            {/* Page numbers */}
            <div className="flex gap-1">
              <button
                className="w-8 h-8 rounded-md flex items-center justify-center text-gray-800 hover:bg-gray-100 transition-all duration-300 disabled:text-gray-400 disabled:cursor-not-allowed"
                disabled={page === 1}
                onClick={() => setPage((pre) => Math.max(pre - 1, 1))}
              >
                <i className="fas fa-chevron-left"></i>
              </button>

              {[...Array(totalPages).keys()].slice(0, 5).map((i) => (
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
                className="p-1 border border-gray-200 rounded-md text-sm text-gray-800 bg-white min-w-[70px] outline-none focus:border-indigo-600 focus:shadow-[0_0_0_3px_rgba(79,70,229,0.2)]"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              <span>entries</span>
            </div>
          </div>
        </Card>
      </div>

      {selectedUser && (
        <UserDetailsModal userId={selectedUser} onClose={setSelectedUser} />
      )}
    </>
  );
}
