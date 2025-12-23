import React from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Megaphone,
    Bot,
    BarChart3,
    Briefcase,
    Zap,
    Sparkles,
    Settings,
    Bell,
    LogOut
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

const NavItem = ({ to, label }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            cn(
                "px-2 xl:px-4 py-2 text-xs xl:text-sm font-bold transition-all relative rounded-xl border border-transparent uppercase tracking-wider whitespace-nowrap",
                isActive
                    ? "text-indigo-600 bg-indigo-50 border-indigo-100 shadow-sm shadow-indigo-200/50"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            )
        }
    >
        {label}
    </NavLink>
);

const DashboardLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen w-full bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-xl border-b border-slate-200 overflow-hidden">
                <div className="flex h-20 items-center px-4 lg:px-6 gap-3 lg:gap-4 max-w-[1600px] mx-auto">
                    {/* Logo */}
                    <div className="flex items-center gap-3 flex-shrink-0 group cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-teal-500 flex items-center justify-center shadow-xl shadow-indigo-600/20 group-hover:scale-105 transition-transform">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-black text-lg text-slate-900 tracking-tighter uppercase hidden lg:block">Campaign.AI</span>
                    </div>

                    {/* Main Navigation */}
                    <nav className="hidden md:flex items-center gap-1">
                        <NavItem to="/" label="Dashboard" />
                        <NavItem to="/campaigns" label="Campaigns" />
                        <NavItem to="/ai-assistant" label="AI Assistant" />
                        <NavItem to="/ai-marketing" label="AI Marketing" />
                        <NavItem to="/analytics" label="Analytics" />
                        <NavItem to="/workfront" label="Adobe WorkFront" />
                    </nav>

                    <div className="ml-auto flex items-center gap-2 xl:gap-6">
                        <div className="flex items-center gap-2">
                            <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all border border-transparent hover:border-slate-200">
                                <Bell className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleLogout}
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100 group"
                                title="Logout"
                            >
                                <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </button>
                        </div>

                        <div className="flex items-center gap-3 pl-3 xl:pl-4 border-l border-slate-200">
                            <div className="text-right hidden 2xl:block">
                                <p className="text-sm font-black text-slate-900 leading-none">{user?.name || 'Commander'}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Authorized Node</p>
                            </div>
                            <div className="w-9 h-9 xl:w-10 xl:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-teal-500 border-2 border-white cursor-pointer shadow-lg hover:scale-105 transition-transform active:scale-95 flex items-center justify-center text-white font-black text-sm">
                                {user?.name?.charAt(0).toUpperCase() || 'C'}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="w-full relative min-h-[calc(100vh-80px)]">
                {/* Visual Atmosphere */}
                <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute top-[5%] left-[10%] w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[5%] right-[10%] w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-[120px]" />
                </div>

                <div className="p-6 md:p-8 max-w-[1600px] mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
