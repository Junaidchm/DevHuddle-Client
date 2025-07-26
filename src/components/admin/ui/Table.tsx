interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  headers: string[];
  className?: string;
}

const Table: React.FC<TableProps> = ({
  headers,
  children,
  className = "",
  ...props
}) => (
  <div className="overflow-x-auto">
    <table
      className={`w-full border-collapse min-w-[800px] ${className}`}
      {...props}
    >
      <thead>
        <tr>
          {headers.map((header, index) => (
            <th
              key={index}
              className="p-4 bg-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider text-left"
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  </div>
);
