-- Crea (o actualiza) el usuario administrador de la cooperativa, sin pasar por la app.
-- Corrélo en el editor de SQL de Supabase DESPUÉS de correr pendientes-sql-editor.sql.
-- Cambiá el usuario y, sobre todo, la contraseña en las dos primeras líneas de abajo.
do $$
declare
  v_usuario text := 'admin';
  v_clave text := 'CambiaEstaClave2026';
  v_correo text := v_usuario || '@cuentas.anden.app';
  v_id uuid;
begin
  select id into v_id from auth.users where email = v_correo;

  if v_id is null then
    v_id := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', v_correo,
      extensions.crypt(v_clave, extensions.gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('nombre', 'Administración', 'usuario', v_usuario),
      now(), now(), '', '', '', ''
    );
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (
      gen_random_uuid(), v_id,
      jsonb_build_object('sub', v_id::text, 'email', v_correo, 'email_verified', true),
      'email', v_id::text, now(), now(), now()
    );
  else
    -- ya existía: solo se actualiza la contraseña
    update auth.users
    set encrypted_password = extensions.crypt(v_clave, extensions.gen_salt('bf')), updated_at = now()
    where id = v_id;
  end if;

  -- el perfil lo crea un disparador al insertar el usuario; acá se le da el rol de cooperativa
  update public.perfiles set rol = 'cooperativa'::public.rol, nombre = 'Administración'
  where id = v_id;
end $$;

-- comprobá que quedó:
select usuario, nombre, rol from public.perfiles where usuario = 'admin';
