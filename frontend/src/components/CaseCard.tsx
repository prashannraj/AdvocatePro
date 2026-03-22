import { cn } from '@/lib/utils';
import { Gavel, Calendar, User, MapPin, ChevronRight } from 'lucide-react';
import Badge from './Badge';
import Card from './Card';

interface CaseCardProps {
  case_number: string;
  title: string;
  client_name: string;
  status: string;
  filed_date: string;
  court_name?: string;
  department?: string;
  onClick?: () => void;
}

export default function CaseCard({
  case_number,
  title,
  client_name,
  status,
  filed_date,
  court_name,
  department = 'Litigation',
  onClick
}: CaseCardProps) {
  return (
    <Card onClick={onClick} className="group overflow-hidden">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-2">
          <Badge variant={department.toLowerCase() as any}>{department}</Badge>
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-tighter">
            {case_number}
          </span>
        </div>
        <Badge 
          variant={status === 'Open' ? 'success' : status === 'Pending' ? 'warning' : 'default'}
        >
          {status}
        </Badge>
      </div>

      <h4 className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors leading-tight mb-4">
        {title}
      </h4>

      <div className="grid grid-cols-2 gap-y-3 pt-4 border-t border-slate-50">
        <div className="flex items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
          <User className="h-3 w-3 mr-1.5 text-slate-400" />
          <span className="truncate">{client_name}</span>
        </div>
        <div className="flex items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider justify-end">
          <Calendar className="h-3 w-3 mr-1.5 text-slate-400" />
          <span>{filed_date}</span>
        </div>
        {court_name && (
          <div className="col-span-2 flex items-center text-[10px] text-slate-400 font-medium">
            <MapPin className="h-3 w-3 mr-1.5" />
            <span className="truncate">{court_name}</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-end md:hidden">
        <span className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center">
          View Details <ChevronRight className="h-3 w-3 ml-1" />
        </span>
      </div>
    </Card>
  );
}
