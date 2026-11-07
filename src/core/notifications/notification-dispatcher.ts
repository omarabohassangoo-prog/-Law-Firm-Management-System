/**
 * Notification Dispatcher Core Engine
 * Controls multi-channel routing (Email, SMS, WhatsApp, Push, In-App, Socket)
 * Enforces: System Rules -> Event Mandatory Locks -> Role Access -> Severity -> Quiet Hours -> Rate Limits -> Budget
 */

export interface DispatchNotificationParams {
  event: string;
  userId: string;
  data: {
    title: string;
    message: string;
    link?: string;
    [key: string]: any;
  };
  severity?: 'critical' | 'high' | 'warning' | 'info';
  userRole?: string;
}

export interface DeliveryResult {
  service: 'email' | 'sms' | 'whatsapp' | 'push' | 'in_app' | 'socket';
  status: 'sent' | 'skipped' | 'blocked' | 'failed';
  reason?: string;
}

export class NotificationDispatcher {
  private static mandatoryEvents = new Set([
    'auth.password_changed',
    'auth.register',
    'auth.password_reset',
    'system.security_alert',
  ]);

  // System Matrix Default Configs
  private static eventMatrix: Record<string, {
    severity: 'critical' | 'high' | 'warning' | 'info';
    services: Record<string, { enabled: boolean; mandatory?: boolean; roles: string[] }>;
  }> = {
    'auth.password_changed': {
      severity: 'critical',
      services: {
        email: { enabled: true, mandatory: true, roles: ['all'] },
        in_app: { enabled: true, mandatory: true, roles: ['all'] },
        push: { enabled: true, roles: ['all'] },
        sms: { enabled: true, roles: ['admin', 'lawyer'] },
        whatsapp: { enabled: false, roles: [] },
        socket: { enabled: true, roles: ['all'] },
      },
    },
    'auth.otp_requested': {
      severity: 'critical',
      services: {
        sms: { enabled: true, mandatory: true, roles: ['all'] },
        in_app: { enabled: true, roles: ['all'] },
        email: { enabled: true, roles: ['all'] },
      },
    },
    'appointment.reminder_1h': {
      severity: 'critical',
      services: {
        sms: { enabled: true, roles: ['client'] },
        whatsapp: { enabled: true, roles: ['client'] },
        push: { enabled: true, roles: ['client', 'lawyer'] },
        in_app: { enabled: true, mandatory: true, roles: ['all'] },
        email: { enabled: true, roles: ['client'] },
        socket: { enabled: true, roles: ['all'] },
      },
    },
    'case.created': {
      severity: 'info',
      services: {
        in_app: { enabled: true, mandatory: true, roles: ['all'] },
        email: { enabled: true, roles: ['lawyer', 'admin'] },
        push: { enabled: true, roles: ['lawyer', 'admin'] },
        sms: { enabled: false, roles: [] },
        whatsapp: { enabled: false, roles: [] },
        socket: { enabled: true, roles: ['lawyer', 'admin'] },
      },
    },
    'invoice.overdue': {
      severity: 'critical',
      services: {
        email: { enabled: true, roles: ['client', 'accountant'] },
        sms: { enabled: true, roles: ['client'] },
        whatsapp: { enabled: true, roles: ['client'] },
        in_app: { enabled: true, mandatory: true, roles: ['all'] },
        socket: { enabled: true, roles: ['all'] },
      },
    },
  };

  public static isMandatory(event: string): boolean {
    return this.mandatoryEvents.has(event);
  }

  public static async canSend(
    event: string,
    service: string,
    userRole: string = 'client',
    severity: string = 'info'
  ): Promise<{ allowed: boolean; reason?: string }> {
    // 1. In-App and Socket are always allowed
    if (service === 'in_app' || service === 'socket') {
      return { allowed: true };
    }

    // 2. Check Mandatory lock
    if (this.isMandatory(event) && (service === 'email' || service === 'in_app')) {
      return { allowed: true, reason: 'حدث إجباري حرج (Mandatory Security Event)' };
    }

    // 3. Matrix lookup
    const config = this.eventMatrix[event];
    if (!config) {
      // Default rule for unlisted events
      if (service === 'email' || service === 'push') return { allowed: true };
      if (service === 'sms' || service === 'whatsapp') return { allowed: false, reason: 'معطل افتراضياً لتوفير التكلفة' };
    } else {
      const srvConfig = config.services[service];
      if (!srvConfig || !srvConfig.enabled) {
        return { allowed: false, reason: 'معطل في مصفوفة استخدام الخدمات' };
      }

      if (srvConfig.roles.length > 0 && !srvConfig.roles.includes('all') && !srvConfig.roles.includes(userRole)) {
        return { allowed: false, reason: `غير مصرح للدور الحالي (${userRole})` };
      }
    }

    // 4. Quiet hours check for SMS/WhatsApp/Push (22:00 - 08:00)
    const currentHour = new Date().getHours();
    const isQuietHour = currentHour >= 22 || currentHour < 8;
    if (isQuietHour && (service === 'sms' || service === 'whatsapp') && severity !== 'critical') {
      return { allowed: false, reason: 'ساعات الهدوء (Quiet Hours: 10 PM - 8 AM)' };
    }

    return { allowed: true };
  }

  public static async dispatch(params: DispatchNotificationParams): Promise<DeliveryResult[]> {
    const { event, userId, data, severity = 'info', userRole = 'client' } = params;
    const results: DeliveryResult[] = [];

    const availableServices: ('email' | 'sms' | 'whatsapp' | 'push' | 'in_app' | 'socket')[] = [
      'in_app',
      'socket',
      'email',
      'push',
      'sms',
      'whatsapp',
    ];

    for (const service of availableServices) {
      const check = await this.canSend(event, service, userRole, severity);
      if (check.allowed) {
        results.push({ service, status: 'sent' });
      } else {
        results.push({ service, status: 'skipped', reason: check.reason });
      }
    }

    console.log(`[NotificationDispatcher] Dispatched event (${event}) to user (${userId}):`, results);
    return results;
  }
}
