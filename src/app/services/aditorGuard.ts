import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

/**
 * EditorAccessGuard:
 * - If '?editor=true' is present in the URL, it requires the user to be logged in.
 * If not logged in, redirects to /login.
 * - If '?editor=true' is NOT present, it allows access (assuming the route is otherwise public).
 */
export const editorAccessGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService); // Inject the AuthService
  const router = inject(Router);           // Inject the Router

  // Get the 'editor' query parameter from the URL
  const editorModeRequested = state.root.queryParams['editor'] === 'true';

  // If editor mode is requested via query parameter
  if (editorModeRequested) {
    // Check if the user is currently logged in using the signal
    if (authService.currentUser()) {
      console.log('EditorAccessGuard: Editor mode requested and user logged in. Access granted.');
      return true; // User is logged in, allow access
    } else {
      // User is NOT logged in, redirect to login
      console.log('EditorAccessGuard: Editor mode requested but user not logged in. Redirecting to login.');
      return router.createUrlTree(['/login']); // Redirect to login page
    }
  } else {
    // If editor mode is NOT requested, allow access without requiring login.
    // This is for routes that are normally public but can have an editor mode.
    console.log('EditorAccessGuard: Editor mode not requested. Access granted (public access).');
    return true;
  }
};
