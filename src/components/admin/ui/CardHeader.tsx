import { HTMLAttributes } from "../../types";

type CardHeaderProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
  titleClassName?: string;
  className?: string;
};

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  titleClassName = "",
  className = "",
  children,
  ...props
}: CardHeaderProps) => {
  return (
    <div
      className={`p-4 w-full flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 ${className}`}
      {...props}
    >
      <div>
        <h2 className={`text-lg font-semibold text-gray-800 ${titleClassName}`}>
          {title}
        </h2>
      </div>
      <div className="w-full sm:w-[300px] mt-4 sm:mt-0">{children}</div>
    </div>
  );
};
