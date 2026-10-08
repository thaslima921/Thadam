import React from 'react';
import { Booking, Destination, Experience } from '../../types/database';
import { DemoControlCenter } from '../../features/demoCenter/DemoControlCenter';
import { AdaptiveRerouteModal } from '../itinerary/AdaptiveRerouteModal';
import { PlaceDetailsModal } from '../itinerary/PlaceDetailsModal';
import { BookingModal } from '../experiences/BookingModal';
import { DigitalTicketModal } from '../experiences/DigitalTicketModal';
import { NotificationCenterModal } from '../../features/notifications/NotificationCenterModal';

interface AppModalsProps {
  showDemoControls: boolean;
  onCloseDemoControls: () => void;
  showNotifications: boolean;
  onCloseNotifications: () => void;
  showAdaptiveModal: boolean;
  onCloseAdaptiveModal: () => void;
  selectedDestination: Destination | null;
  onCloseDestination: () => void;
  onBookExperienceForDest: () => void;
  selectedExperience: Experience | null;
  onCloseExperience: () => void;
  confirmedBooking: Booking | null;
  onCloseTicket: () => void;
  onConfirmBooking: (booking: Booking) => void;
  onSelectDestFromNotification: (destId: string) => void;
}

export const AppModals: React.FC<AppModalsProps> = ({
  showDemoControls,
  onCloseDemoControls,
  showNotifications,
  onCloseNotifications,
  showAdaptiveModal,
  onCloseAdaptiveModal,
  selectedDestination,
  onCloseDestination,
  onBookExperienceForDest,
  selectedExperience,
  onCloseExperience,
  confirmedBooking,
  onCloseTicket,
  onConfirmBooking,
  onSelectDestFromNotification,
}) => {
  return (
    <>
      <NotificationCenterModal
        visible={showNotifications}
        onClose={onCloseNotifications}
        onSelectDestination={onSelectDestFromNotification}
      />
      <DemoControlCenter
        visible={showDemoControls}
        onClose={onCloseDemoControls}
      />
      <AdaptiveRerouteModal
        visible={showAdaptiveModal}
        onClose={onCloseAdaptiveModal}
      />
      <PlaceDetailsModal
        visible={selectedDestination !== null}
        destination={selectedDestination}
        onClose={onCloseDestination}
        onBookExperience={onBookExperienceForDest}
      />
      <BookingModal
        visible={selectedExperience !== null}
        experience={selectedExperience}
        onClose={onCloseExperience}
        onBookingConfirmed={onConfirmBooking}
      />
      <DigitalTicketModal
        visible={confirmedBooking !== null}
        booking={confirmedBooking}
        onClose={onCloseTicket}
      />
    </>
  );
};
