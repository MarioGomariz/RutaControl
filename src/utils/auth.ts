import { api } from "./api";
import { authStore } from '@/stores/authStore';

// Ajustá este tipo a tu modelo real:
export type User = {
  id: number;
  email: string;
  role: string;
  username: string;
};

export function setUserSession(user: User) {
  // Cambiado a localStorage para persistencia entre sesiones
  localStorage.setItem("user", JSON.stringify(user));
}

export function clearUserSession() {
  localStorage.removeItem("user");
}

export async function loginUser(emailOrUsername: string, password: string): Promise<User> {
  if (!emailOrUsername || !password) {
    throw new Error("Usuario/Email y contraseña son requeridos");
  }

  try {
    // 1) Loguea y guarda token
    const loginRes = await api.post("/auth/login", {
      usuario: emailOrUsername,
      password,
    });
    const token = loginRes.data?.token;
    if (!token) throw new Error("No se recibió token");
    localStorage.setItem("authToken", token);

    // 2) Pide /auth/me para obtener el usuario
    const meRes = await api.get("/auth/me");
    const userData = meRes.data;

    // Determinar el rol basado en rol_id
    let role = "user";
    if (userData.rol_id === 1) {
      role = "administrador";
    } else if (userData.rol_id === 2) {
      role = "chofer";
    } else if (userData.rol_id === 3) {
      role = "analista";
    } else if (userData.rol_id === 4) {
      role = "logistico";
    }
    
    const user: User = {
      id: userData.id,
      // Fallback si el backend no trae email
      email: userData.email ?? userData.usuario ?? '',
      role: role,
      username: userData.usuario,
    };

    setUserSession(user);
    return user;
  } catch (error: any) {
    // En fallo de login, aseguramos no dejar token/usuario inconsistentes
    try {
      localStorage.removeItem("authToken");
      clearUserSession();
      authStore.setState({ user: null, isAuthenticated: false });
    } catch {}
    // Tu backend devuelve { error: "..."} (no { message })
    const msg = error?.response?.data?.error || error?.response?.data?.message;
    if (msg) throw new Error(msg);
    if (error instanceof Error) throw error;
    throw new Error("Error en la autenticación");
  }
}

export async function getCurrentUser(): Promise<User> {
  try {
    const res = await api.get("/auth/me");
    const u = res.data;
    // Determinar el rol basado en rol_id
    let role = "user";
    if (u.rol_id === 1) {
      role = "administrador";
    } else if (u.rol_id === 2) {
      role = "chofer";
    } else if (u.rol_id === 3) {
      role = "analista";
    } else if (u.rol_id === 4) {
      role = "logistico";
    }
    
    const user: User = {
      id: u.id,
      email: u.email ?? u.usuario ?? '',
      role: role,
      username: u.usuario,
    };
    setUserSession(user);
    return user;
  } catch (error: any) {
    const msg = error?.response?.data?.error || "No se pudo obtener el usuario";
    throw new Error(msg);
  }
}

export function logout() {
  localStorage.removeItem("authToken");
  clearUserSession();
  
  // Actualizar el estado en el store de autenticación directamente
  authStore.setState({ user: null, isAuthenticated: false });
}
