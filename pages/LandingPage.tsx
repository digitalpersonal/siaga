
import React, { useState, useCallback, useEffect } from 'react';
import { Hero } from '../components/Hero';
import { ServiceCategories } from '../components/ServiceCategories';
import { FeaturedProfessionals } from '../components/FeaturedProfessionals';
import { LandingLoginSection } from '../components/LandingLoginSection';
import { BookingModal } from '../components/BookingModal';
import type { Professional, User, ProfessionalUser } from '../types';
import { supabase } from '../utils/supabase';

interface LandingPageProps {
  user: User | ProfessionalUser | null;
  onLoginRequired: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ user, onLoginRequired }) => {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingContext, setBookingContext] = useState<{ professional?: Professional | null; category?: string | null }>({});
  
  // Check for deep links (e.g., ?ref=professional_id)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const professionalId = params.get('ref');

    if (professionalId) {
        const fetchProfessional = async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, name, specialties:specialty, imageUrl:image_url, services, settings')
                .eq('id', professionalId)
                .single();

            if (data && !error) {
                if (!user) {
                   onLoginRequired();
                } else {
                    setBookingContext({ professional: data as Professional });
                    setIsBookingModalOpen(true);
                }
            }
        };
        fetchProfessional();
    }
  }, [user, onLoginRequired]);

  const handleScheduleFromProfessional = useCallback((professional: Professional) => {
    if (!user) {
      onLoginRequired();
    } else {
      setBookingContext({ professional });
      setIsBookingModalOpen(true);
    }
  }, [user, onLoginRequired]);

  const handleScheduleFromCategory = useCallback((categoryName: string) => {
    if (!user) {
      onLoginRequired();
    } else {
      setBookingContext({ category: categoryName });
      setIsBookingModalOpen(true);
    }
  }, [user, onLoginRequired]);

  const handleCloseModal = useCallback(() => {
    setIsBookingModalOpen(false);
    setBookingContext({});
    window.history.pushState({}, document.title, window.location.pathname);
  }, []);

  return (
    <>
      <Hero />
      <ServiceCategories onCategoryClick={handleScheduleFromCategory} />
      <FeaturedProfessionals onScheduleClick={handleScheduleFromProfessional} />
      
      {/* Área de Login para acesso rápido do cidadão */}
      <LandingLoginSection onRegisterClick={onLoginRequired} />

      {isBookingModalOpen && user && (
        <BookingModal
          professional={bookingContext.professional}
          category={bookingContext.category}
          user={user}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};
