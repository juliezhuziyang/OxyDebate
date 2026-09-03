-- Grant admin role to the specified user
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = '202860112@stu.scls-sh.org'
ON CONFLICT (user_id, role) DO NOTHING;
