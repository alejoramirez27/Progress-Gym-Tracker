-- Tabla de suscripciones push
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  id_usuario  uuid NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
  endpoint    text NOT NULL,
  p256dh      text NOT NULL,
  auth        text NOT NULL,
  created_at  timestamptz DEFAULT now(),
  UNIQUE (id_usuario, endpoint)
);

-- Función: usuarios con racha >= 3 que NO entrenaron hoy
CREATE OR REPLACE FUNCTION usuarios_racha_en_riesgo(p_fecha date)
RETURNS TABLE (id_usuario uuid, racha int) AS $$
BEGIN
  RETURN QUERY
  WITH dias_entreno AS (
    SELECT DISTINCT s.id_usuario, s.fecha::date AS dia
    FROM sesion s
  ),
  rachas AS (
    SELECT
      u.id_usuario,
      COUNT(DISTINCT de.dia)::int AS racha
    FROM usuario u
    LEFT JOIN dias_entreno de ON de.id_usuario = u.id_usuario
      AND de.dia <= p_fecha
      AND de.dia > p_fecha - INTERVAL '90 days'
    GROUP BY u.id_usuario
  )
  SELECT r.id_usuario, r.racha
  FROM rachas r
  WHERE r.racha >= 3
    AND NOT EXISTS (
      SELECT 1 FROM dias_entreno de
      WHERE de.id_usuario = r.id_usuario AND de.dia = p_fecha
    );
END;
$$ LANGUAGE plpgsql;
