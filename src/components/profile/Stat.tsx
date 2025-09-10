// app/components/Stat.tsx
interface StatProps {
  value: string;
  label: string;
}

const Stat = ({ value, label }: StatProps) => {
  return (
    <div className="text-center">
      <div className="text-xl font-bold text-slate-800">{value}</div>
      <div className="text-sm text-slate-500">{label}</div>
    </div>
  );
};

export default Stat;