// Define a User type for better type safety
export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

// Test credentials from environment variables
const TEST_EMAIL = import.meta.env.VITE_TEST_EMAIL;
const TEST_PASSWORD = import.meta.env.VITE_TEST_PASSWORD;

// Local storage key for user session
const USER_SESSION_KEY = 'user_session';

/**
 * Get the current user session from localStorage
 * @returns User object or null if not logged in
 */
export function getUserSession(): User | null {
  const userJson = localStorage.getItem(USER_SESSION_KEY);
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson) as User;
  } catch (error) {
    console.error('Error parsing user session:', error);
    return null;
  }
}

/**
 * Save user session to localStorage
 * @param user User object to save
 */
export function setUserSession(user: User): void {
  localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
}

/**
 * Clear user session from localStorage (logout)
 */
export function clearUserSession(): void {
  localStorage.removeItem(USER_SESSION_KEY);
}

/**
 * Check if user is logged in
 * @returns boolean indicating if user is logged in
 */
export function isLoggedIn(): boolean {
  return getUserSession() !== null;
}

/**
 * Login user with email and password
 * @param email User email
 * @param password User password
 * @returns Promise resolving to User object
 */
export async function loginUser(email: string, password: string): Promise<User> {
  // This is a mock implementation
  // In a real app, you would make an API call to your backend
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Validate inputs
  if (!email || !password) {
    throw new Error('Email y contraseña son requeridos');
  }
  
  // Check against environment variables
  if (email !== TEST_EMAIL || password !== TEST_PASSWORD) {
    throw new Error('Credenciales inválidas');
  }
  
  // Create a user object for the authenticated user
  const user: User = {
    id: '1',
    email,
    name: 'Usuario de Prueba',
    role: 'admin'
  };
  
  // Save to localStorage
  setUserSession(user);
  
  return user;
}
