import React from 'react';
import Link from 'next/link';
import { User } from '@/src/app/types';


interface DataTableProps {
  users: User[];
}

const DataTable: React.FC<DataTableProps> = ({ users }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse min-w-[800px]">
        <thead>
          <tr>
            <th className="p-4 bg-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider text-left">
              <div className="relative inline-block">
                <input
                  type="checkbox"
                  id="select-all"
                  className="opacity-0 absolute"
                />
                <label
                  htmlFor="select-all"
                  className="w-[18px] h-[18px] border border-gray-200 rounded-sm relative cursor-pointer transition-all duration-300 checked:bg-indigo-600 checked:border-indigo-600 checked:after:content-['\f00c'] checked:after:font-[Font_Awesome_6_Free] checked:after:font-bold checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:text-white checked:after:text-[0.625rem]"
                ></label>
              </div>
            </th>
            <th className="p-4 bg-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider text-left">Name</th>
            <th className="p-4 bg-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider text-left">Email</th>
            <th className="p-4 bg-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider text-left">Role</th>
            <th className="p-4 bg-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider text-left">Status</th>
            <th className="p-4 bg-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider text-left">Join Date</th>
            <th className="p-4 bg-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider text-left">Projects</th>
            <th className="p-4 bg-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users?.map((user) => (
            <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-100 transition-all duration-300">
              <td className="p-4 text-sm">
                <div className="relative inline-block">
                  <input
                    type="checkbox"
                    id={`user-${user.id}`}
                    className="opacity-0 absolute"
                  />
                  <label
                    htmlFor={`user-${user.id}`}
                    className="w-[18px] h-[18px] border border-gray-200 rounded-sm relative cursor-pointer transition-all duration-300 checked:bg-indigo-600 checked:border-indigo-600 checked:after:content-['\f00c'] checked:after:font-[Font_Awesome_6_Free] checked:after:font-bold checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:text-white checked:after:text-[0.625rem]"
                  ></label>
                </div>
              </td>
              <td className="p-4 text-sm">
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-medium text-gray-800">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.handle}</div>
                  </div>
                </div>
              </td>
              <td className="p-4 text-sm">{user.email}</td>
              <td className="p-4 text-sm">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user.roleBgColor} ${user.roleColor}`}>
                  {user.role}
                </span>
              </td>
              <td className="p-4 text-sm">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${user.statusBgColor} ${user.statusColor} before:content-[''] before:inline-block before:w-2 before:h-2 before:rounded-full before:bg-${user.statusDotColor}`}>
                  {user.status}
                </span>
              </td>
              <td className="p-4 text-sm">{user.joinDate}</td>
              <td className="p-4 text-sm">{user.projects}</td>
              <td className="p-4 text-sm">
                <div className="flex items-center gap-1 flex-wrap">
                  <button
                    className="w-7 h-7 rounded-md flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-all duration-300"
                    title="Edit User"
                    onClick={() => user.onEdit?.(user.id)}
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    className="w-7 h-7 rounded-md flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-all duration-300"
                    title="View Profile"
                    onClick={() => user.onView?.(user.id)}
                  >
                    <i className="fas fa-eye"></i>
                  </button>
                  <div className="relative">
                    <button className="w-7 h-7 rounded-md flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-all duration-300">
                      <i className="fas fa-ellipsis-v"></i>
                    </button>
                    <div className="absolute top-full right-0 w-[180px] bg-white rounded-md shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] z-10 hidden">
                      <Link
                        href={`/admin/users/reset-password/${user.id}`}
                        className="flex items-center gap-3 p-3 text-sm text-gray-800 hover:bg-gray-100 transition-all duration-300"
                      >
                        <i className="fas fa-key w-4 flex justify-center"></i>
                        Reset Password
                      </Link>
                      <Link
                        href={`/admin/users/reactivate/${user.id}`}
                        className="flex items-center gap-3 p-3 text-sm text-gray-800 hover:bg-gray-100 transition-all duration-300"
                      >
                        <i className="fas fa-redo w-4 flex justify-center"></i>
                        Reactivate Account
                      </Link>
                      <Link
                        href={`/admin/users/delete/${user.id}`}
                        className="flex items-center gap-3 p-3 text-sm text-red-500 hover:bg-gray-100 transition-all duration-300"
                      >
                        <i className="fas fa-trash-alt w-4 flex justify-center"></i>
                        Delete Account
                      </Link>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;