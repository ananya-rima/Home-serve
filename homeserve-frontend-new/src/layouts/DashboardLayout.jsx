import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import DashboardTopbar from './DashboardTopbar';

const DashboardLayout = ({ navItems, roleLabel }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const activeLabel = navItems.find((item) => location.pathname.startsWith(item.to))?.label || roleLabel;

  return (
    <div className="flex min-h-screen bg-ink-50">
      <DashboardSidebar
        navItems={navItems}
        roleLabel={roleLabel}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex min-h-screen flex-1 flex-col lg:pl-0">
        <DashboardTopbar onMenuClick={() => setSidebarOpen(true)} title={activeLabel} />
        <main className="flex-1 p-4 sm:p-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
