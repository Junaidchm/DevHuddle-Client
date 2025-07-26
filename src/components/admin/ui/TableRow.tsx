interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  className?: string;
}

const TableRow: React.FC<TableRowProps> = ({
  children,
  className = "",
  ...props
}) => (
  <tr
    className={`border-b border-gray-200 hover:bg-gray-100 transition-all duration-300 ${className}`}
    {...props}
  >
    {children}
  </tr>
);
