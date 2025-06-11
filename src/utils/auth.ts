import { supabase, UserWithRole } from './supabase';

// Define a User type for better type safety
export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  username?: string;
}

// Local storage key for user session (for backward compatibility)
const USER_SESSION_KEY = 'user_session';

/**
 * Get the current user session from Supabase auth
 * @returns User object or null if not logged in
 */
export async function getUserSession(): Promise<User | null> {
  // First check Supabase session
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session?.user) {
    // Get user details from users table
    const { data: userData } = await supabase
      .from('users')
      .select('id, nombre, apellido, email, usuario, rol_id, roles:rol_id(name)')
      .eq('id', session.user.id)
      .single() as { data: UserWithRole | null };
      
    if (userData) {
      return {
        id: userData.id,
        email: userData.email,
        name: `${userData.nombre} ${userData.apellido}`,
        role: userData.roles?.name,
        username: userData.usuario
      };
    }
  }
  
  // Fallback to localStorage for backward compatibility
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
 * Save user session (for backward compatibility)
 * @param user User object to save
 */
export function setUserSession(user: User): void {
  // With Supabase, session is managed automatically
  // This is kept for backward compatibility
  localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
}

/**
 * Clear user session (logout)
 */
export async function clearUserSession(): Promise<void> {
  // Sign out from Supabase
  await supabase.auth.signOut();
  
  // Also clear localStorage for backward compatibility
  localStorage.removeItem(USER_SESSION_KEY);
}

/**
 * Check if user is logged in (async version)
 * @returns Promise resolving to boolean indicating if user is logged in
 */
export async function isLoggedIn(): Promise<boolean> {
  const user = await getUserSession();
  return user !== null;
}

/**
 * Check if user is logged in (sync version, uses localStorage)
 * @returns boolean indicating if user is logged in
 */
export function isLoggedInSync(): boolean {
  // Check localStorage for backward compatibility
  const userJson = localStorage.getItem(USER_SESSION_KEY);
  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      return !!user;
    } catch (e) {
      return false;
    }
  }
  
  // Check if Supabase has a session in localStorage
  try {
    const supabaseSession = localStorage.getItem('sb-' + import.meta.env.VITE_SUPABASE_URL.split('//')[1].split('.')[0] + '-auth-token');
    return !!supabaseSession;
  } catch (e) {
    return false;
  }
}

/**
 * Login a user with email/username and password
 * @param emailOrUsername User email or username
 * @param password User password
 * @returns Promise resolving to User object
 */
export async function loginUser(emailOrUsername: string, password: string): Promise<User> {
  // Validate inputs
  if (!emailOrUsername || !password) {
    throw new Error('Usuario/Email y contraseña son requeridos');
  }
  
  try {
    // Try to sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailOrUsername.includes('@') ? emailOrUsername : '',
      password,
    });
    
    if (error) {
      // If direct email login fails, try to find the user by username
      if (!emailOrUsername.includes('@')) {
        // Get the email associated with this username
        const { data: userData } = await supabase
          .from('users')
          .select('email')
          .eq('usuario', emailOrUsername)
          .single();
          
        if (userData?.email) {
          // Try to login with the found email
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: userData.email,
            password,
          });
          
          if (authError) throw new Error('Credenciales inválidas');
          
          if (authData.user) {
            // Get user details
            const { data: userDetails } = await supabase
              .from('users')
              .select('id, nombre, apellido, email, usuario, rol_id, roles:rol_id(name)')
              .eq('id', authData.user.id)
              .single() as { data: UserWithRole | null };
              
            if (userDetails) {
              const user: User = {
                id: userDetails.id,
                email: userDetails.email,
                name: `${userDetails.nombre} ${userDetails.apellido}`,
                role: userDetails.roles?.name,
                username: userDetails.usuario
              };
              
              return user;
            }
          }
        } else {
          throw new Error('Usuario no encontrado');
        }
      } else {
        throw new Error('Credenciales inválidas');
      }
    }
    
    if (data.user) {
      // Get user details
      const { data: userDetails } = await supabase
        .from('users')
        .select('id, nombre, apellido, email, usuario, rol_id, roles:rol_id(name)')
        .eq('id', data.user.id)
        .single() as { data: UserWithRole | null };
        
      if (userDetails) {
        const user: User = {
          id: userDetails.id,
          email: userDetails.email,
          name: `${userDetails.nombre} ${userDetails.apellido}`,
          role: userDetails.roles?.name,
          username: userDetails.usuario
        };
        
        return user;
      }
    }
    
    throw new Error('Error al obtener datos del usuario');
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error en la autenticación');
  }
}
