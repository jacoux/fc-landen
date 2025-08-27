// src/app/guards/auth.guard.ts
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check the signal directly. Angular will re-evaluate if the signal changes.
  if (authService.currentUser()) {
    return true; // User is logged in
  } else {
    console.log('AuthGuard: User not logged in, redirecting to login.');
    return router.createUrlTree(['/login']); // Redirect to login page
  }
};
