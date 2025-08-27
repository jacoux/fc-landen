import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const publicGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.currentUser()) {
    return true; // User is NOT logged in (can access public pages)
  } else {
    console.log('PublicGuard: User already logged in, redirecting to dashboard.');
    return router.createUrlTree(['/dashboard']); // Redirect to dashboard
  }
};
