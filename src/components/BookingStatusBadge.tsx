
import React from 'react';
import { Badge } from "@/components/ui/badge";

type PaymentStatus = 
  | 'paid'
  | 'open'
  | 'expired'
  | 'canceled'
  | 'failed'
  | 'pending'
  | 'authorized'
  | 'refused'
  | 'charged_back'
  | 'refunded'
  | 'settled'
  | 'partially_refunded'
  | 'refund_requested';

interface BookingStatusBadgeProps {
  status: string;
}

const BookingStatusBadge: React.FC<BookingStatusBadgeProps> = ({ status }) => {
  const getStatusConfig = (status: string): { variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"; label: string } => {
    switch (status.toLowerCase()) {
      case 'paid':
        return { variant: "success", label: "Оплачен" };
      case 'open':
        return { variant: "warning", label: "Ожидает оплаты" };
      case 'expired':
        return { variant: "destructive", label: "Просрочен" };
      case 'canceled':
        return { variant: "destructive", label: "Отменен" };
      case 'failed':
        return { variant: "destructive", label: "Не удался" };
      case 'pending':
        return { variant: "warning", label: "В ожидании" };
      case 'authorized':
        return { variant: "warning", label: "Авторизован" };
      case 'refunded':
        return { variant: "secondary", label: "Возвращен" };
      case 'charged_back':
        return { variant: "destructive", label: "Оспорен" };
      case 'settled':
        return { variant: "success", label: "Переведен" };
      case 'partially_refunded':
        return { variant: "secondary", label: "Частично возвращен" };
      default:
        return { variant: "outline", label: status };
    }
  };

  const { variant, label } = getStatusConfig(status);

  return (
    <Badge variant={variant as any} className={variant === 'success' ? 'bg-green-500' : variant === 'warning' ? 'bg-yellow-500' : ''}>
      {label}
    </Badge>
  );
};

export default BookingStatusBadge;
