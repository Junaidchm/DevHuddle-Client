// type TableProps = React.TableHTMLAttributes<HTMLTableElement> & {
//   className?: string;
//   headers: string[];
// };

// export const Table: React.FC<TableProps> = ({
//   className = "",
//   headers = [],
//   children,
//   ...props
// }) => {
//   return (
//     <div className="overflow-x-auto">
//       <div className="flex items-center gap-4 p-4 px-6 border-b border-gray-200 bg-gray-100 flex-wrap max-[768px]:flex-col max-[768px]:items-start">
//         <div className="flex flex-col gap-1 max-[768px]:w-full">
//           <label
//             htmlFor="status-filter"
//             className="text-xs text-gray-500 font-medium"
//           >
//             Status
//           </label>
//           <select
//             //onChange={(e) => setStatus(e.target.value)}
//             id="status-filter"
//             className="p-1 px-2 border border-gray-200 rounded-lg font-['Inter'] text-sm text-gray-800 bg-white min-w-[140px] max-[768px]:w-full focus:outline-none focus:border-indigo-600 focus:shadow-[0_0_0_3px_rgba(79,70,229,0.2)]"
//           >
//             <option value="all">All Status</option>
//             <option value="active">Active</option>
//             <option value="inactive">Inactive</option>
//             <option value="suspended">Suspended</option>
//           </select>
//         </div>

//         <div className="flex flex-col gap-1 max-[768px]:w-full">
//           <label
//             htmlFor="date-filter"
//             className="text-xs text-gray-500 font-medium"
//           >
//             Join Date
//           </label>
//           <select
//             id="date-filter"
//             onChange={(e) => setDate(e.target.value)}
//             className="p-1 px-2 border border-gray-200 rounded-lg font-['Inter'] text-sm text-gray-800 bg-white min-w-[140px] max-[768px]:w-full focus:outline-none focus:border-indigo-600 focus:shadow-[0_0_0_3px_rgba(79,70,229,0.2)]"
//           >
//             <option value="all">All Time</option>
//             <option value="today">Today</option>
//             <option value="last-week">Last 7 Days</option>
//             <option value="last-month">Last 30 Days</option>
//             <option value="last-quarter">Last 90 Days</option>
//           </select>
//         </div>

//         <button
//           onClick={handleClearFilter}
//           className="px-4 py-2 mt-3.5 rounded-lg font-medium text-sm text-gray-800 bg-transparent flex items-center justify-center gap-2 transition-all duration-300 hover:bg-gray-100"
//         >
//           <i className="fas fa-times"></i>
//           Clear Filters
//         </button>
//       </div>
//       <table className="w-full border-collapse min-w-[800px]">
//         <thead>
//           <tr>
//             <th className="p-4 bg-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider text-left">
//               <div className="relative inline-block">
//                 <input
//                   type="checkbox"
//                   id="select-all"
//                   className="peer sr-only"
//                 />
//                 <label
//                   htmlFor="select-all"
//                   className="w-[18px] h-[18px] border border-gray-300 rounded-sm flex items-center justify-center cursor-pointer transition-all duration-300 peer-checked:bg-indigo-600 peer-checked:border-indigo-600"
//                 >
//                   <i className="fas fa-check text-white text-[0.625rem] hidden peer-checked:inline-block"></i>
//                 </label>
//               </div>
//             </th>
//             <th className="p-4 bg-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider text-left">
//               Name
//             </th>
//             <th className="p-4 bg-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider text-left">
//               Email
//             </th>
//             <th className="p-4 bg-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider text-left">
//               Role
//             </th>
//             <th className="p-4 bg-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider text-left">
//               Status
//             </th>
//             <th className="p-4 bg-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider text-left">
//               Join Date
//             </th>
//             <th className="p-4 bg-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider text-left">
//               Projects
//             </th>
//             <th className="p-4 bg-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider text-left">
//               Actions
//             </th>
//           </tr>
//         </thead>
//         <tbody>
//           {data?.data?.users.map((user: User, index: number) => (
//             <tr
//               key={user.id}
//               className="border-b border-gray-200 hover:bg-gray-100 transition-all duration-300"
//             >
//               <td className="p-4 text-sm">
//                 <div className="relative inline-block">
//                   <input
//                     type="checkbox"
//                     id={`user-${user.id}`}
//                     className="peer sr-only"
//                   />
//                   <label
//                     htmlFor={`user-${user.id}`}
//                     className="w-[18px] h-[18px] border border-gray-300 rounded-sm flex items-center justify-center cursor-pointer transition-all duration-300 peer-checked:bg-indigo-600 peer-checked:border-indigo-600"
//                   >
//                     <i className="fas fa-check text-white text-[0.625rem] hidden peer-checked:inline-block"></i>
//                   </label>
//                 </div>
//               </td>

//               <td className="p-4 text-sm">
//                 <div className="flex items-center gap-3">
//                   <img
//                     src="https://ui-avatars.com/api/?name=David+Miller&background=10b981&color=fff"
//                     alt="David Miller"
//                     className="w-8 h-8 rounded-full object-cover"
//                   />
//                   <div>
//                     <div className="font-medium text-gray-800">{user.name}</div>
//                     <div className="text-xs text-gray-500">{user.username}</div>
//                   </div>
//                 </div>
//               </td>
//               <td className="p-4 text-sm">{user.email}</td>
//               <td className="p-4 text-sm">
//                 <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[rgba(59,130,246,0.1)] text-blue-600">
//                   {user.role}
//                 </span>
//               </td>
//               <td className="p-4 text-sm">
//                 <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-[rgba(239,68,68,0.1)] text-red-500 before:content-[''] before:inline-block before:w-2 before:h-2 before:rounded-full before:bg-red-500">
//                   {!user.isBlocked ? "Active" : "Bloked"}
//                 </span>
//               </td>
//               <td className="p-4 text-sm">Apr 8, 2023</td>
//               <td className="p-4 text-sm">21</td>
//               <td className="p-4 text-sm">
//                 <div className="flex items-center gap-1 flex-wrap">
//                   {/* <button
//                             className="w-7 h-7 rounded-md flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-all duration-300"
//                             title="Edit User"
//                           >
//                             <i className="fas fa-edit"></i>
//                           </button> */}
//                   <button
//                     onClick={() => setSelectedUser(user.id)}
//                     className="w-7 h-7 rounded-md flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-all duration-300"
//                     title="View Profile"
//                   >
//                     <i className="fas fa-eye"></i>
//                   </button>
//                   <div className="relative">
//                     <button
//                       onClick={() => handleBlockToogle(index)}
//                       className="w-7 h-7 rounded-md flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-all duration-300"
//                     >
//                       <i className="fas fa-ellipsis-v"></i>
//                     </button>
//                     {blockUnblock === index && (
//                       <div className="absolute top-full right-0 w-44 bg-white rounded-md shadow-lg z-10">
//                         <button
//                           onClick={() => handleBlockMutation(user.id)}
//                           disabled={blockUnblockMutation.isPending}
//                           className={`flex w-full items-center gap-2 px-4 py-2 text-sm ${
//                             user.isBlocked ? "text-gray-800" : "text-red-500"
//                           } hover:bg-gray-100 transition-all duration-300`}
//                         >
//                           <i className="fas fa-user-slash text-sm w-5 h-5 flex items-center justify-center"></i>
//                           {user.isBlocked ? "UnBlock" : "Block"}
//                         </button>
//                         {/* <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 transition-all duration-300">
//                                   <i className="fas fa-unlock text-sm w-5 h-5 flex items-center justify-center"></i>
//                                   UnBlock
//                                 </button> */}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };
