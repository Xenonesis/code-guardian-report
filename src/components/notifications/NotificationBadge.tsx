/**
 * Notification Badge Component
 * Simple badge to show unread notification count
 */

import React, { useState, useEffect } from 'react';
import { NotificationManager } from '@/services/notifications/NotificationManager';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface NotificationBadgeProps {
  className?: string;
  showZero?: boolean;
  maxCount?: number;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  className,
  showZero = false,
  maxCount = 99,
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const unsubscribe = NotificationManager.subscribe((notifications) => {
      const unread = notifications.filter(n => !n.read && !n.dismissed).length;
      setCount(unread);
    });

    return unsubscribe;
  }, []);

  if (count === 0 && !showZero) {
    return null;
  }

  const displayCount = count > maxCount ? `${maxCount}+` : count;

  return (
    <Badge
      variant="destructive"
      className={cn(
        'h-5 min-w-[20px] px-1 flex items-center justify-center text-xs font-semibold',
        className
      )}
    >
      {displayCount}
    </Badge>
  );
};

export default NotificationBadge;
