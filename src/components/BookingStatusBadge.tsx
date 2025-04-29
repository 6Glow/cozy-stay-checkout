
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { PaymentStatus } from '@/types';

interface BookingStatusBadgeProps {
  status: string;
}

const BookingStatusBadge: React.FC<BookingStatusBadgeProps> = ({ status }) => {
  const getStatusConfig = (status: string): { variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"; label: string } => {
    switch (status.toLowerCase()) {
      case 'paid':
        return { variant: "success", label: "Paid" };
      case 'open':
        return { variant: "warning", label: "Awaiting Payment" };
      case 'expired':
        return { variant: "destructive", label: "Expired" };
      case 'canceled':
        return { variant: "destructive", label: "Canceled" };
      case 'failed':
        return { variant: "destructive", label: "Failed" };
      case 'pending':
        return { variant: "warning", label: "Pending" };
      case 'authorized':
        return { variant: "warning", label: "Authorized" };
      case 'refunded':
        return { variant: "secondary", label: "Refunded" };
      case 'charged_back':
        return { variant: "destructive", label: "Disputed" };
      case 'settled':
        return { variant: "success", label: "Settled" };
      case 'partially_refunded':
        return { variant: "secondary", label: "Partially Refunded" };
      case 'refused':
        return { variant: "destructive", label: "Refused" };
      default:
        return { variant: "outline", label: status };
    }
  };

  const { variant, label } = getStatusConfig(status);

  return (
    <Badge variant={variant}>{label}</Badge>
  );
};

export default BookingStatusBadge;
