import React from 'react';
import { OtpVerificationModal } from './OtpVerificationModal';

interface AIAuthBotModalProps {
  sessionId: string;
  email: string;
  phone: string;
  whatsappUrl?: string;
  demoOtp?: string;
  purpose: 'login' | 'register';
  onSuccess: () => void;
  onCancel: () => void;
}

export const AIAuthBotModal: React.FC<AIAuthBotModalProps> = ({
  sessionId,
  email,
  phone,
  purpose,
  onSuccess,
  onCancel
}) => {
  return (
    <OtpVerificationModal
      sessionId={sessionId}
      email={email}
      phone={phone}
      purpose={purpose}
      onSuccess={onSuccess}
      onCancel={onCancel}
    />
  );
};
