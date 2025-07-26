interface TableCellProps extends React.HTMLAttributes<HTMLTableCellElement> {
  className?: string;
}

const TableCell: React.FC<TableCellProps> = ({
  children,
  className = "",
  ...props
}) => (
  <td className={`p-4 text-sm ${className}`} {...props}>
    {children}
  </td>
);
