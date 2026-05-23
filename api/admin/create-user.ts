import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://uqvsmdfcydokeaxmzfaw.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

export default async function handler(req: any, res: any) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify the requesting user is an admin
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized — no token provided' });
  }

  const token = authHeader.replace('Bearer ', '');

  // Create a client with the anon key to verify the user's JWT
  const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: { user: requestingUser }, error: authError } = await anonClient.auth.getUser(token);

  if (authError || !requestingUser) {
    return res.status(401).json({ error: 'Unauthorized — invalid token' });
  }

  // Check if the requesting user is an admin
  if (!requestingUser.user_metadata?.is_admin) {
    return res.status(403).json({ error: 'Forbidden — admin access required' });
  }

  // Parse request body
  const { email, password, fullName } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  // Create the user with admin privileges (service role key)
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Server configuration error — missing service role key' });
  }

  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName || '',
    },
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json({
    success: true,
    user: {
      id: data.user.id,
      email: data.user.email,
      fullName: data.user.user_metadata?.full_name || '',
      createdAt: data.user.created_at,
    },
  });
}
