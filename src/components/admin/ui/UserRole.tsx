interface UserRoleProp extends React.HTMLAttributes<HTMLSpanElement> {
  role:string
}

const UserRole : React.FC<UserRoleProp> = ({
    role,
    className = "",
  ...props
})=> {
    return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[rgba(59,130,246,0.1)] text-blue-600">{role}</span>
    )
}