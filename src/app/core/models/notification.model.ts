// core/models/notification.model.ts
export interface Notification {
  id: number;
  message: string;
  type: NotificationType;
  userId: number;
  read: boolean;
  createdAt: Date;
}

export enum NotificationType {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR'
}
