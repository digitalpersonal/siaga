
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { ProfessionalDashboard } from './pages/ProfessionalDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AttendantDashboard } from './pages/AttendantDashboard';
import { DriverDashboard } from './pages/DriverDashboard';
import { AuthModal } from './components/AuthModal';
import { ReminderSystem } from './components/ReminderSystem';
import { BiometricUpdateModal } from './components/BiometricUpdateModal';
import { SysAdminAuthModal } from './components/SysAdminAuthModal';
import type { User, ProfessionalUser, AdminUser, AttendantUser, DriverUser } from './types';
import { supabase } from './utils/supabase';
import type { Session } from '@supabase/supabase-js';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<User | ProfessionalUser | AdminUser | AttendantUser | DriverUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSysAdminModalOpen, setIsSysAdminModalOpen] = useState(false);
  const [isBiometricUpdateRequired, setIsBiometricUpdateRequired] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (session: Session | null) => {
    if (session?.user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        setCurrentUser(null);
      } else if (data) {
        // Force admin role for specific email (legacy check, keeping for safety)
        if (session.user.email === 'digitalpersonal@gmail.com') {
          data.role = 'admin';
        }
        
        // Handle User Types
        if (data.role === 'professional') {
          const professionalUser: ProfessionalUser = {
            id: data.id,
            name: data.name || session.user.email?.split('@')[0] || 'Profissional',
            email: session.user.email!,
            imageUrl: data.image_url || `https://i.pravatar.cc/150?u=${session.user.id}`,
            role: 'professional',
            whatsapp: data.whatsapp,
            specialties: data.specialty || [{ name: 'Especialista em Destaque', price: 0 }],
            services: data.services || [],
            settings: data.settings || {
              workHours: { start: '08:00', end: '17:00', lunchStart: '12:00', lunchEnd: '13:00' },
              workDays: [1, 2, 3, 4, 5],
              blockedDays: [],
              blockedTimeSlots: {},
            },
          };
          setCurrentUser(professionalUser);
        } else {
          // Cast for other roles (admin, client, attendant, driver)
          setCurrentUser(data as User);

          // Check for mandatory biometric update for CLIENTS (Patients)
          // Logic: If role is client AND imageUrl is missing OR includes 'pravatar' (default/placeholder)
          if (data.role === 'client') {
             const hasCustomImage = data.image_url && !data.image_url.includes('pravatar.cc');
             if (!hasCustomImage) {
                 setIsBiometricUpdateRequired(true);
             }
          }
        }
      }
    } else {
      setCurrentUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    setLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      fetchProfile(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (_event === 'SIGNED_IN') {
        fetchProfile(session);
      }
      if (_event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setIsBiometricUpdateRequired(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);
  
  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const handleOpenAuthModal = useCallback(() => {
    setIsAuthModalOpen(true);
  }, []);
  
  const handleCloseAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const handleProfileUpdate = useCallback((updatedFields: Partial<User | ProfessionalUser>) => {
    setCurrentUser(prevUser => {
        if (!prevUser) return null;
        const newUser = { ...prevUser, ...updatedFields };
        if (newUser.role === 'professional') {
            return newUser as ProfessionalUser;
        }
        return newUser as User;
    });
  }, []);

  const handleBiometricSuccess = (newImageUrl: string) => {
      if (currentUser) {
          handleProfileUpdate({ imageUrl: newImageUrl });
      }
      setIsBiometricUpdateRequired(false);
  };


  const renderContent = () => {
    if (loading) {
      return <div className="flex-grow flex items-center justify-center"><p>Carregando...</p></div>;
    }

    if (!currentUser) {
      return <LandingPage user={null} onLoginRequired={handleOpenAuthModal} />;
    }
    
    switch (currentUser.role) {
      case 'admin':
        return <AdminDashboard user={currentUser as AdminUser} />;
      case 'professional':
        return <ProfessionalDashboard user={currentUser as ProfessionalUser} onProfileUpdate={handleProfileUpdate} />;
      case 'attendant':
        return <AttendantDashboard user={currentUser as AttendantUser} />;
      case 'driver':
        return <DriverDashboard user={currentUser as DriverUser} />;
      case 'client':
      default:
        return <Dashboard user={currentUser} />;
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-800 flex flex-col">
      <Header 
        user={currentUser} 
        onLoginClick={handleOpenAuthModal}
        onSignUpClick={handleOpenAuthModal}
        onLogout={handleLogout}
      />
      <main className="flex-grow">
        {renderContent()}
      </main>
      <Footer onSysAdminClick={() => setIsSysAdminModalOpen(true)} />
      
      {currentUser && <ReminderSystem user={currentUser} />}
      
      {isAuthModalOpen && (
        <AuthModal 
          onClose={handleCloseAuthModal}
        />
      )}

      {isSysAdminModalOpen && (
        <SysAdminAuthModal 
          onClose={() => setIsSysAdminModalOpen(false)} 
        />
      )}

      {isBiometricUpdateRequired && currentUser && (
          <BiometricUpdateModal 
            user={currentUser} 
            onSuccess={handleBiometricSuccess} 
          />
      )}
    </div>
  );
};

export default App;
