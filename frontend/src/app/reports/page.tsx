'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import ResponsiveLayout from '@/components/ResponsiveLayout';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/Card';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Calendar, 
  Download,
  Filter,
  Loader2
} from 'lucide-react';
import Button from '@/components/Button';

export default function ReportsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userStr));
    setLoading(false);
  }, [router]);

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const reportCategories = [
    { title: 'Case Analytics', description: 'Analyze case distribution by type, status, and department.', icon: BarChart3 },
    { title: 'Financial Performance', description: 'Track revenue, outstanding invoices, and payroll expenses.', icon: TrendingUp },
    { title: 'Client Demographics', description: 'Understand your client base and acquisition trends.', icon: PieChart },
    { title: 'Staff Productivity', description: 'Monitor lawyer billable hours and task completion rates.', icon: Calendar },
  ];

  return (
    <ResponsiveLayout user={user} title="Analytics & Reports">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Analytics & Reports</h1>
        <p className="text-slate-500 font-medium text-sm mt-1">Data-driven insights for your legal practice.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {reportCategories.map((category) => (
          <Card key={category.title} className="hover:border-primary/20 transition-all group">
            <CardHeader className="pb-2">
              <div className="h-10 w-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary mb-2 group-hover:scale-110 transition-transform">
                <category.icon size={20} />
              </div>
              <CardTitle className="text-lg">{category.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                {category.description}
              </p>
              <div className="flex space-x-3">
                <Button variant="outline" size="sm" className="flex-1 text-[10px] font-black uppercase tracking-widest">
                  <Filter size={12} className="mr-2" />
                  Filter
                </Button>
                <Button variant="primary" size="sm" className="flex-1 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                  <Download size={12} className="mr-2" />
                  Export PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle icon={BarChart3}>Custom Report Builder</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-slate-50 p-6 rounded-full mb-4">
              <BarChart3 className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="font-black text-slate-900 mb-1">Coming Soon</h3>
            <p className="text-slate-500 text-sm max-w-xs">
              We're building a powerful custom report generator to help you visualize every aspect of your firm.
            </p>
          </div>
        </CardContent>
      </Card>
    </ResponsiveLayout>
  );
}
