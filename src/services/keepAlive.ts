import { getSupabase } from './supabase';

/**
 * Keep-Alive Service to prevent Supabase from going dormant
 * 
 * This service pings the database periodically to maintain an active connection
 * and prevent the Supabase project from pausing due to inactivity.
 */
class KeepAliveService {
  private interval: NodeJS.Timeout | null = null;
  private isRunning = false;
  private pingCount = 0;
  private lastPingTime: Date | null = null;
  private failureCount = 0;
  
  // Configuration
  private readonly PING_INTERVAL = 10 * 60 * 1000; // 10 minutes
  private readonly MAX_FAILURES = 3;
  private readonly ACTIVE_HOURS = {
    start: 6, // 6 AM
    end: 23   // 11 PM
  };

  /**
   * Start the keep-alive service
   */
  start(): void {
    if (this.isRunning) {
      console.log('Keep-alive service is already running');
      return;
    }

    console.log('🔄 Starting Supabase keep-alive service...');
    this.isRunning = true;
    this.scheduleNextPing();
  }

  /**
   * Stop the keep-alive service
   */
  stop(): void {
    if (this.interval) {
      clearTimeout(this.interval);
      this.interval = null;
    }
    this.isRunning = false;
    console.log('⏹️ Supabase keep-alive service stopped');
  }

  /**
   * Get service status and statistics
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      pingCount: this.pingCount,
      lastPingTime: this.lastPingTime,
      failureCount: this.failureCount,
      nextPingIn: this.interval ? this.PING_INTERVAL : null
    };
  }

  /**
   * Schedule the next ping based on current time and active hours
   */
  private scheduleNextPing(): void {
    if (!this.isRunning) return;

    const now = new Date();
    const currentHour = now.getHours();
    
    // Check if we're in active hours
    const isActiveHours = currentHour >= this.ACTIVE_HOURS.start && currentHour < this.ACTIVE_HOURS.end;
    
    let delay: number;
    
    if (isActiveHours) {
      // During active hours, ping every 10 minutes
      delay = this.PING_INTERVAL;
    } else {
      // During inactive hours, ping once per hour
      delay = 60 * 60 * 1000; // 1 hour
    }

    this.interval = setTimeout(() => {
      this.performPing();
    }, delay);
  }

  /**
   * Perform a database ping
   */
  private async performPing(): Promise<void> {
    try {
      const supabase = getSupabase();
      
      // Simple query to keep connection alive
      const { error } = await supabase
        .from('user_preferences')
        .select('count')
        .limit(1);

      if (error) {
        throw error;
      }

      // Ping successful
      this.pingCount++;
      this.lastPingTime = new Date();
      this.failureCount = 0;
      
      console.log(`✅ Keep-alive ping #${this.pingCount} successful at ${this.lastPingTime.toLocaleTimeString()}`);
      
    } catch (error) {
      this.failureCount++;
      console.warn(`⚠️ Keep-alive ping failed (${this.failureCount}/${this.MAX_FAILURES}):`, error);
      
      // If we've exceeded max failures, stop the service
      if (this.failureCount >= this.MAX_FAILURES) {
        console.error('❌ Keep-alive service stopped due to repeated failures');
        this.stop();
        return;
      }
    }

    // Schedule next ping
    this.scheduleNextPing();
  }

  /**
   * Perform an immediate ping (for testing)
   */
  async pingNow(): Promise<boolean> {
    try {
      await this.performPing();
      return true;
    } catch (error) {
      console.error('Manual ping failed:', error);
      return false;
    }
  }

  /**
   * Reset failure count (useful after fixing connection issues)
   */
  resetFailures(): void {
    this.failureCount = 0;
    console.log('🔄 Keep-alive failure count reset');
  }
}

// Export singleton instance
export const keepAliveService = new KeepAliveService();

// Auto-start the service when the module is imported
// Only start if we're in a browser environment and Supabase is configured
if (typeof window !== 'undefined') {
  try {
    // Check if Supabase is configured
    getSupabase();
    
    // Start the service after a short delay to allow app initialization
    setTimeout(() => {
      keepAliveService.start();
    }, 5000); // 5 second delay
    
  } catch (error) {
    console.log('Supabase not configured, keep-alive service not started');
  }
}

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    keepAliveService.stop();
  });
}
