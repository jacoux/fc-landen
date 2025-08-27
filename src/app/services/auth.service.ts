import { Injectable, signal, WritableSignal } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Signal to hold the current user state
  readonly currentUser: WritableSignal<User | null> = signal(null);

  constructor(private afAuth: Auth, private router: Router) {
    // Listen to Firebase Auth state changes and update the signal
    this.afAuth.onAuthStateChanged((user) => {
      this.currentUser.set(user); // Update the signal
      console.log('Auth state changed:', user ? user.email : 'No user');
    });
  }

  /**
   * Registers a new user with email and password.
   * @param email User's email
   * @param password User's password
   * @returns Observable of Firebase UserCredential
   */
  register(email: string, password: string): Observable<any> {
    return from(createUserWithEmailAndPassword(this.afAuth, email, password)).pipe(
      map(userCredential => {
        console.log('User registered:', userCredential.user?.email);
        return userCredential;
      }),
      catchError(error => {
        console.error('Registration error:', error);
        throw error;
      })
    );
  }

  /**
   * Logs in a user with email and password.
   * @param email User's email
   * @param password User's password
   * @returns Observable of Firebase UserCredential
   */
  login(email: string, password: string): Observable<any> {
    return from(signInWithEmailAndPassword(this.afAuth, email, password)).pipe(
      map(userCredential => {
        console.log('User logged in:', userCredential.user?.email);
        // User signal is updated by onAuthStateChanged listener
        this.router.navigate(['/dashboard']); // Navigate after successful login
        return userCredential;
      }),
      catchError(error => {
        console.error('Login error:', error);
        throw error;
      })
    );
  }

  /**
   * Logs out the current user.
   * @returns Observable that completes on logout
   */
  logout(): Observable<void> {
    return from(signOut(this.afAuth)).pipe(
      map(() => {
        console.log('User logged out.');
        // User signal is updated by onAuthStateChanged listener
        this.router.navigate(['/login']); // Navigate after logout
      }),
      catchError(error => {
        console.error('Logout error:', error);
        throw error;
      })
    );
  }
}
