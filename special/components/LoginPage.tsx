import React, { useState } from 'react';
import { OneSourceLogo } from './Logo';
import { ArrowRight, Lock, Mail, ShieldCheck } from 'lucide-react';
import { AppConfig } from '../types';

interface LoginPageProps {
  onLogin: () => void;
  config: AppConfig;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, config }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSSOLoading, setIsSSOLoading] = useState(false);
  const [email, setEmail] = useState('kelly.seale@onesource.com');

  const handleSSOLogin = () => {
     setIsSSOLoading(true);
     setTimeout(() => {
        onLogin();
     }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API delay for effect
    setTimeout(() => {
      onLogin();
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full flex bg-app-base transition-colors duration-500 font-sans">
      
      {/* LEFT SIDE: Brand Showcase (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900 items-center justify-center p-12">
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
           <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary/20 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '8s' }}></div>
           <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-brand-secondary/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }}></div>
           
           {/* Grid Pattern Overlay */}
           <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center">
           <div className="mb-8 transform hover:scale-105 transition-transform duration-500">
             <OneSourceLogo 
                size={180} 
                showText={false} 
                primaryColor={config.useCustomColors ? config.customColors.primary : undefined}
                secondaryColor={config.useCustomColors ? config.customColors.secondary : undefined}
             />
           </div>
           
           <h1 className="text-5xl font-display font-extrabold text-white mb-4 tracking-tight">
             One<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">Source</span>
           </h1>
           <p className="text-slate-400 text-lg max-w-md font-light leading-relaxed">
             The centralized hub for Solution Engineering, Architecture, and Cost Analysis.
           </p>

           {/* Testimonial / Social Proof Pill */}
           <div className="mt-12 flex items-center gap-3 py-2 px-4 bg-white/5 backdrop-blur-md rounded-full border border-white/10">
              <div className="flex -space-x-2">
                 {[1,2,3].map(i => (
                   <div key={i} className={`w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-[10px] text-white font-bold bg-gradient-to-br ${i===1 ? 'from-blue-500 to-indigo-600' : i===2 ? 'from-emerald-500 to-teal-600' : 'from-orange-500 to-red-600'}`}>
                      {i===1 ? 'KS' : i===2 ? 'GG' : 'WR'}
                   </div>
                 ))}
              </div>
              <span className="text-xs font-medium text-slate-300">Join the Solutions Team</span>
           </div>
        </div>
      </div>

      {/* RIGHT SIDE: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 relative">
         <div className="w-full max-w-md space-y-8 animate-in slide-in-from-bottom-8 fade-in duration-700">
            
            <div className="text-center lg:text-left">
               <div className="lg:hidden flex justify-center mb-6">
                 <OneSourceLogo size={64} showText={false} />
               </div>
               <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Sign in to OneSource</h2>
               <p className="text-slate-500 dark:text-slate-400">Welcome back! Please choose a login method.</p>
            </div>

            {/* PRIMARY: SSO OPTION */}
            <div className="space-y-4">
               <button 
                 onClick={handleSSOLogin}
                 disabled={isSSOLoading}
                 className="w-full h-14 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold rounded-xl shadow-lg shadow-brand-primary/25 hover:shadow-brand-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
               >
                 {isSSOLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                 ) : (
                    <>
                      <div className="p-1 bg-white/20 rounded">
                        <ShieldCheck size={20} className="text-white" />
                      </div>
                      <span className="text-lg">Log in via Siemens SSO</span>
                      <ArrowRight size={20} className="opacity-70 group-hover:translate-x-1 transition-transform" />
                    </>
                 )}
               </button>
            </div>

            {/* DIVIDER */}
            <div className="relative my-6">
               <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-800"></div></div>
               <div className="relative flex justify-center text-xs uppercase"><span className="bg-app-base px-2 text-slate-400 font-bold tracking-wider">Or sign in with email</span></div>
            </div>

            {/* SECONDARY: CREDENTIAL FORM */}
            <form onSubmit={handleSubmit} className="space-y-5">
               
               {/* Email Field */}
               <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Email Address</label>
                  <div className="relative group">
                     <Mail className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-brand-primary transition-colors" size={18} />
                     <input 
                       type="email" 
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                       className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all font-medium text-sm"
                       placeholder="Enter your email"
                     />
                  </div>
               </div>

               {/* Password Field */}
               <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Password</label>
                    <a href="#" className="text-xs font-bold text-brand-primary hover:underline">Forgot?</a>
                  </div>
                  <div className="relative group">
                     <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-brand-primary transition-colors" size={18} />
                     <input 
                       type="password" 
                       defaultValue="password123"
                       className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all font-medium text-sm"
                       placeholder="••••••••"
                     />
                  </div>
               </div>

               {/* Submit Button (Secondary Style) */}
               <button 
                 type="submit" 
                 disabled={isLoading}
                 className="w-full py-3 bg-slate-800 dark:bg-slate-700 text-white font-bold rounded-xl hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
               >
                 {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                 ) : (
                    <span>Sign In</span>
                 )}
               </button>

            </form>
            
            <p className="text-center text-xs text-slate-400 mt-6">
               By signing in, you agree to our <a href="#" className="underline hover:text-brand-primary">Terms of Service</a> and <a href="#" className="underline hover:text-brand-primary">Privacy Policy</a>.
            </p>

         </div>
      </div>
    </div>
  );
};
