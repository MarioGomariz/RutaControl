-- Esquema de base de datos para RutaControl en Supabase

-- Tabla de roles
CREATE TABLE roles (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL UNIQUE
);

-- Insertar roles básicos
INSERT INTO roles (name) VALUES ('administrador'), ('chofer');

-- Tabla de usuarios
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  usuario TEXT NOT NULL UNIQUE,
  -- La contraseña no se almacena aquí, se maneja con la autenticación de Supabase
  rol_id BIGINT NOT NULL REFERENCES roles(id),
  estado TEXT NOT NULL CHECK (estado IN ('Activo', 'Inactivo', 'Suspendido')),
  ultima_conexion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  observaciones TEXT,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para usuarios
CREATE POLICY "Los usuarios pueden ver sus propios datos" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Los administradores pueden ver todos los usuarios" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.rol_id = (SELECT id FROM roles WHERE name = 'administrador')
    )
  );

CREATE POLICY "Los administradores pueden editar usuarios" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.rol_id = (SELECT id FROM roles WHERE name = 'administrador')
    )
  );

CREATE POLICY "Los administradores pueden crear usuarios" ON users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.rol_id = (SELECT id FROM roles WHERE name = 'administrador')
    )
  );

-- Tabla de choferes
CREATE TABLE choferes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  dni TEXT NOT NULL UNIQUE,
  telefono TEXT,
  email TEXT UNIQUE,
  licencia TEXT,
  fecha_vencimiento_licencia DATE,
  activo BOOLEAN DEFAULT TRUE,
  user_id UUID REFERENCES users(id),
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE choferes ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para choferes
CREATE POLICY "Los usuarios pueden ver todos los choferes" ON choferes
  FOR SELECT USING (true);

CREATE POLICY "Los administradores pueden editar choferes" ON choferes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.rol_id = (SELECT id FROM roles WHERE name = 'administrador')
    )
  );

CREATE POLICY "Los choferes pueden ver sus propios datos" ON choferes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.id = choferes.user_id
    )
  );

-- Tabla de semirremolques
CREATE TABLE semirremolques (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  dominio TEXT NOT NULL UNIQUE,
  año INTEGER,
  estado TEXT NOT NULL,
  tipo_servicio TEXT,
  alcance_servicio BOOLEAN DEFAULT FALSE,
  vencimiento_rto DATE,
  vencimiento_visual_ext DATE,
  vencimiento_visual_int DATE,
  vencimiento_espesores DATE,
  vencimiento_prueba_hidraulica DATE,
  vencimiento_mangueras DATE,
  vencimiento_valvula_five DATE,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE semirremolques ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para semirremolques
CREATE POLICY "Los usuarios pueden ver todos los semirremolques" ON semirremolques
  FOR SELECT USING (true);

CREATE POLICY "Los administradores pueden editar semirremolques" ON semirremolques
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.rol_id = (SELECT id FROM roles WHERE name = 'administrador')
    )
  );

-- Tabla de tractores
CREATE TABLE tractores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  marca TEXT NOT NULL,
  modelo TEXT NOT NULL,
  dominio TEXT NOT NULL UNIQUE,
  año INTEGER,
  vencimiento_rto DATE,
  estado TEXT NOT NULL,
  tipo_servicio TEXT,
  alcance_servicio BOOLEAN DEFAULT FALSE,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE tractores ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para tractores
CREATE POLICY "Los usuarios pueden ver todos los tractores" ON tractores
  FOR SELECT USING (true);

CREATE POLICY "Los administradores pueden editar tractores" ON tractores
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.rol_id = (SELECT id FROM roles WHERE name = 'administrador')
    )
  );

-- Tabla de servicios
CREATE TABLE servicios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  requiere_prueba_hidraulica BOOLEAN DEFAULT FALSE,
  requiere_visuales BOOLEAN DEFAULT FALSE,
  requiere_valvula_y_mangueras BOOLEAN DEFAULT FALSE,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE servicios ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para servicios
CREATE POLICY "Los usuarios pueden ver todos los servicios" ON servicios
  FOR SELECT USING (true);

CREATE POLICY "Los administradores pueden editar servicios" ON servicios
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.rol_id = (SELECT id FROM roles WHERE name = 'administrador')
    )
  );

-- Función para actualizar la fecha de actualización automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fecha_actualizacion = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar fecha_actualizacion
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_choferes_updated_at
  BEFORE UPDATE ON choferes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_semirremolques_updated_at
  BEFORE UPDATE ON semirremolques
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tractores_updated_at
  BEFORE UPDATE ON tractores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_servicios_updated_at
  BEFORE UPDATE ON servicios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
