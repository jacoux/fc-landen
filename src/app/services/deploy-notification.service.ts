import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class DeployNotificationService {
  private readonly platformId = inject(PLATFORM_ID);
  private showToast = signal(false);
  private countdown = signal(60);
  private countdownInterval: any = null;
  private storageKey = 'fc-landen-deploy-notification';

  readonly isVisible = this.showToast.asReadonly();
  readonly timeRemaining = this.countdown.asReadonly();

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.restoreState();

      window.addEventListener('beforeunload', () => {
        this.saveState();
      });
    }
  }

  startDeployCountdown() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }

    this.showToast.set(true);
    this.countdown.set(60);

    if (isPlatformBrowser(this.platformId)) {
      this.saveState();

      this.countdownInterval = setInterval(() => {
        const current = this.countdown();
        if (current <= 1) {
          clearInterval(this.countdownInterval);
          this.countdownInterval = null;
          this.showToast.set(false);
          this.clearState();
        } else {
          this.countdown.set(current - 1);
          this.saveState();
        }
      }, 1000);
    }
  }

  hideToast() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
    this.showToast.set(false);
    if (isPlatformBrowser(this.platformId)) {
      this.clearState();
    }
  }

  private saveState() {
    if (!isPlatformBrowser(this.platformId)) return;

    const state = {
      isVisible: this.showToast(),
      timeRemaining: this.countdown(),
      timestamp: Date.now()
    };
    localStorage.setItem(this.storageKey, JSON.stringify(state));
  }

  private restoreState() {
    if (!isPlatformBrowser(this.platformId)) return;

    const saved = localStorage.getItem(this.storageKey);
    if (!saved) return;

    try {
      const state = JSON.parse(saved);
      const now = Date.now();
      const elapsed = Math.floor((now - state.timestamp) / 1000);
      const remaining = state.timeRemaining - elapsed;

      if (state.isVisible && remaining > 0) {
        this.showToast.set(true);
        this.countdown.set(remaining);

        // Continue countdown
        this.countdownInterval = setInterval(() => {
          const current = this.countdown();
          if (current <= 1) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
            this.showToast.set(false);
            this.clearState();
          } else {
            this.countdown.set(current - 1);
            this.saveState();
          }
        }, 1000);
      } else {
        this.clearState();
      }
    } catch (error) {
      console.error('Failed to restore deploy notification state:', error);
      this.clearState();
    }
  }

  private clearState() {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.removeItem(this.storageKey);
  }
}
