export const config = {
  title: "Users List",
  searchPlaceholder: "Search users...",
  totalPages: 5,
  totalItems: 1024,
  itemsText: "users",
  headers: [
    "",
    "Name",
    "Email",
    "Role",
    "Status",
    "Join Date",
    "Projects",
    "Actions",
  ],
  statusOptions: [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ],
  dateOptions: [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "last-week", label: "Last 7 Days" },
    { value: "last-month", label: "Last 30 Days" },
    { value: "last-quarter", label: "Last 90 Days" },
  ],
};

interface Option {
  value: string;
  label: string;
}

interface Filter {
  label: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Option[];
}
