import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://uqvsmdfcydokeaxmzfaw.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// API key → Supabase user_id mapping (set as env var in Vercel)
// Format: {"key1":"user-uuid-1","key2":"user-uuid-2"}
function getApiKeyMap(): Record<string, string> {
  try {
    return JSON.parse(process.env.COACH_API_KEYS || '{}');
  } catch {
    return {};
  }
}

function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

function today(): string {
  return new Date().toISOString().split('T')[0];
}

function cors(res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key, Authorization');
}

export default async function handler(req: any, res: any) {
  cors(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Auth: require API key
  const apiKey = req.headers['x-api-key'] || req.query?.apiKey;
  if (!apiKey) {
    return res.status(401).json({ error: 'Missing X-API-Key header' });
  }

  const keyMap = getApiKeyMap();
  const userId = keyMap[apiKey as string];
  if (!userId) {
    return res.status(403).json({ error: 'Invalid API key' });
  }

  if (!SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Server misconfigured — missing service role key' });
  }

  const supabase = getSupabase();

  // Parse the route: /api/coach/goals, /api/coach/goals/123/complete, etc.
  const routeParts: string[] = req.query.route || [];
  const route = routeParts.join('/');
  const method = req.method;

  try {
    // ============ DASHBOARD ============
    if (route === 'dashboard' && method === 'GET') {
      return await getDashboard(supabase, userId, res);
    }

    // ============ GOALS ============
    if (route === 'goals' && method === 'GET') {
      return await listGoals(supabase, userId, req, res);
    }
    if (route === 'goals' && method === 'POST') {
      return await createGoal(supabase, userId, req, res);
    }
    if (routeParts.length === 3 && routeParts[0] === 'goals' && routeParts[2] === 'complete' && method === 'POST') {
      return await completeGoal(supabase, userId, routeParts[1], res);
    }
    if (routeParts.length === 2 && routeParts[0] === 'goals' && method === 'DELETE') {
      return await deleteGoal(supabase, userId, routeParts[1], res);
    }

    // ============ TINY GOALS ============
    if (route === 'tiny-goals' && method === 'GET') {
      return await listTinyGoals(supabase, userId, res);
    }
    if (route === 'tiny-goals' && method === 'POST') {
      return await createTinyGoal(supabase, userId, req, res);
    }
    if (routeParts.length === 3 && routeParts[0] === 'tiny-goals' && routeParts[2] === 'toggle' && method === 'POST') {
      return await toggleTinyGoal(supabase, userId, routeParts[1], res);
    }

    // ============ FOCUS ============
    if (route === 'focus' && method === 'GET') {
      return await getTodayFocus(supabase, userId, res);
    }
    if (route === 'focus' && method === 'POST') {
      return await setTodayFocus(supabase, userId, req, res);
    }
    if (route === 'focus/complete' && method === 'POST') {
      return await toggleFocusComplete(supabase, userId, res);
    }

    // ============ AGENCIES ============
    if (route === 'agencies' && method === 'GET') {
      return await getAgencyFocus(supabase, userId, res);
    }
    if (route === 'agencies' && method === 'POST') {
      return await addAgency(supabase, userId, req, res);
    }
    if (routeParts.length === 3 && routeParts[0] === 'agencies' && routeParts[2] === 'levers' && method === 'POST') {
      return await addAgencyLever(supabase, userId, routeParts[1], req, res);
    }
    if (routeParts.length === 5 && routeParts[0] === 'agencies' && routeParts[2] === 'levers' && routeParts[4] === 'toggle' && method === 'POST') {
      return await toggleAgencyLever(supabase, userId, routeParts[1], routeParts[3], res);
    }

    // ============ QUARTERLY FOCUS ============
    if (route === 'quarterly' && method === 'GET') {
      return await getQuarterlyFocus(supabase, userId, res);
    }
    if (route === 'quarterly' && method === 'POST') {
      return await addFocusArea(supabase, userId, req, res);
    }
    if (routeParts.length === 3 && routeParts[0] === 'quarterly' && routeParts[2] === 'progress' && method === 'PUT') {
      return await updateFocusProgress(supabase, userId, routeParts[1], req, res);
    }

    return res.status(404).json({ error: `Unknown route: ${method} /api/coach/${route}` });
  } catch (err: any) {
    console.error('Coach API error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

// ===================== DASHBOARD =====================

async function getDashboard(supabase: any, userId: string, res: any) {
  const todayStr = today();

  const [goalsRes, tinyRes, focusRes, agencyRes, quarterlyRes] = await Promise.all([
    supabase.from('goals').select('*').eq('user_id', userId),
    supabase.from('tiny_goals').select('*').eq('user_id', userId),
    supabase.from('daily_tasks').select('*').eq('user_id', userId).eq('date', todayStr).maybeSingle(),
    supabase.from('agency_focus').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('quarterly_focus').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
  ]);

  const goals = goalsRes.data || [];
  const tinyGoals = tinyRes.data || [];
  const focus = focusRes.data;
  const agencies = agencyRes.data?.agencies || [];
  const quarterly = quarterlyRes.data?.areas || [];

  const personalGoals = goals.filter((g: any) => g.category === 'personal');
  const professionalGoals = goals.filter((g: any) => g.category === 'professional');
  const activePersonal = personalGoals.filter((g: any) => !g.completed_at).length;
  const activeProfessional = professionalGoals.filter((g: any) => !g.completed_at).length;
  const activeTiny = tinyGoals.filter((g: any) => !g.completed_at).length;
  const doneTiny = tinyGoals.filter((g: any) => g.completed_at).length;
  const totalLevers = agencies.reduce((s: number, a: any) => s + (a.levers?.length || 0), 0);
  const doneLevers = agencies.reduce((s: number, a: any) => s + (a.levers?.filter((l: any) => l.completed)?.length || 0), 0);

  return res.status(200).json({
    todayFocus: focus ? { text: focus.text, completed: focus.completed, completedAt: focus.completed_at } : null,
    goals: {
      personal: { active: activePersonal, completed: personalGoals.length - activePersonal, total: personalGoals.length },
      professional: { active: activeProfessional, completed: professionalGoals.length - activeProfessional, total: professionalGoals.length },
    },
    tinyGoals: { active: activeTiny, completed: doneTiny, total: tinyGoals.length },
    agencyFocus: { totalAgencies: agencies.length, leversCompleted: doneLevers, leversTotal: totalLevers },
    quarterlyFocus: quarterly.map((a: any) => ({ title: a.title, progress: a.progress })),
  });
}

// ===================== GOALS =====================

async function listGoals(supabase: any, userId: string, req: any, res: any) {
  let query = supabase.from('goals').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (req.query?.category) {
    query = query.eq('category', req.query.category);
  }
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(data);
}

async function createGoal(supabase: any, userId: string, req: any, res: any) {
  const { text, category } = req.body;
  if (!text || !category) return res.status(400).json({ error: 'text and category are required' });
  const { data, error } = await supabase.from('goals').insert({ user_id: userId, text, category, progress: 0 }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json({ message: `✅ Goal created (${category}): "${text}"`, goal: data });
}

async function completeGoal(supabase: any, userId: string, goalId: string, res: any) {
  const { data, error } = await supabase.from('goals')
    .update({ progress: 100, completed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', goalId).eq('user_id', userId).select().single();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Goal not found' });
  return res.status(200).json({ message: `🎉 Goal completed: "${data.text}"`, goal: data });
}

async function deleteGoal(supabase: any, userId: string, goalId: string, res: any) {
  const { data, error } = await supabase.from('goals').delete().eq('id', goalId).eq('user_id', userId).select().single();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Goal not found' });
  return res.status(200).json({ message: `🗑️ Goal deleted: "${data.text}"` });
}

// ===================== TINY GOALS =====================

async function listTinyGoals(supabase: any, userId: string, res: any) {
  const { data, error } = await supabase.from('tiny_goals').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(data);
}

async function createTinyGoal(supabase: any, userId: string, req: any, res: any) {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'text is required' });
  const { data, error } = await supabase.from('tiny_goals').insert({ user_id: userId, text }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json({ message: `✅ Tiny goal added: "${text}"`, tinyGoal: data });
}

async function toggleTinyGoal(supabase: any, userId: string, goalId: string, res: any) {
  const { data: existing } = await supabase.from('tiny_goals').select('*').eq('id', goalId).eq('user_id', userId).single();
  if (!existing) return res.status(404).json({ error: 'Tiny goal not found' });
  const newCompleted = existing.completed_at ? null : new Date().toISOString();
  const { data, error } = await supabase.from('tiny_goals')
    .update({ completed_at: newCompleted, updated_at: new Date().toISOString() })
    .eq('id', goalId).eq('user_id', userId).select().single();
  if (error) return res.status(500).json({ error: error.message });
  const status = data.completed_at ? '✅ completed' : '⬜ uncompleted';
  return res.status(200).json({ message: `Tiny goal ${status}: "${data.text}"`, tinyGoal: data });
}

// ===================== FOCUS =====================

async function getTodayFocus(supabase: any, userId: string, res: any) {
  const { data } = await supabase.from('daily_tasks').select('*').eq('user_id', userId).eq('date', today()).maybeSingle();
  if (!data) return res.status(200).json({ message: '📋 No focus set for today.', focus: null });
  return res.status(200).json({ focus: { text: data.text, completed: data.completed, completedAt: data.completed_at, date: data.date } });
}

async function setTodayFocus(supabase: any, userId: string, req: any, res: any) {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'text is required' });
  const todayStr = today();

  // Upsert: update if exists, insert if not
  const { data: existing } = await supabase.from('daily_tasks').select('id').eq('user_id', userId).eq('date', todayStr).maybeSingle();
  if (existing) {
    const { data, error } = await supabase.from('daily_tasks')
      .update({ text, completed: false, completed_at: null, updated_at: new Date().toISOString() })
      .eq('id', existing.id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ message: `🎯 Today's focus updated: "${text}"`, focus: data });
  } else {
    const { data, error } = await supabase.from('daily_tasks')
      .insert({ user_id: userId, date: todayStr, text, completed: false }).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ message: `🎯 Today's focus set: "${text}"`, focus: data });
  }
}

async function toggleFocusComplete(supabase: any, userId: string, res: any) {
  const { data: existing } = await supabase.from('daily_tasks').select('*').eq('user_id', userId).eq('date', today()).maybeSingle();
  if (!existing) return res.status(404).json({ error: 'No focus set for today' });
  const newCompleted = !existing.completed;
  const { data, error } = await supabase.from('daily_tasks')
    .update({ completed: newCompleted, completed_at: newCompleted ? new Date().toISOString() : null, updated_at: new Date().toISOString() })
    .eq('id', existing.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  const status = data.completed ? '🎉 completed' : '⬜ marked incomplete';
  return res.status(200).json({ message: `Today's focus ${status}: "${data.text}"`, focus: data });
}

// ===================== AGENCIES =====================

async function getAgencyFocus(supabase: any, userId: string, res: any) {
  const { data } = await supabase.from('agency_focus').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (!data) return res.status(200).json({ message: 'No agency focus data yet.', agencies: [], quarter: '' });
  const agencies = data.agencies || [];
  const buckets: any = { core: [], expansion: [], maintain: [] };
  agencies.forEach((a: any) => { if (buckets[a.bucket]) buckets[a.bucket].push(a); });
  return res.status(200).json({ quarter: data.quarter, buckets, totalAgencies: agencies.length });
}

async function addAgency(supabase: any, userId: string, req: any, res: any) {
  const { name, bucket, detail } = req.body;
  if (!name || !bucket) return res.status(400).json({ error: 'name and bucket are required' });

  const { data: existing } = await supabase.from('agency_focus').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle();
  const agencies = existing?.agencies || [];
  const maxId = agencies.reduce((m: number, a: any) => Math.max(m, a.id || 0), 0);
  const newAgency = { id: maxId + 1, name, bucket, detail: detail || '', levers: [] };
  agencies.push(newAgency);

  if (existing) {
    await supabase.from('agency_focus').update({ agencies, updated_at: new Date().toISOString() }).eq('id', existing.id);
  } else {
    const now = new Date();
    const q = Math.ceil((now.getMonth() + 1) / 3);
    await supabase.from('agency_focus').insert({ user_id: userId, quarter: `Q${q} ${now.getFullYear()}`, agencies });
  }

  return res.status(201).json({ message: `✅ Agency added to ${bucket}: "${name}"`, agency: newAgency });
}

async function addAgencyLever(supabase: any, userId: string, agencyIdStr: string, req: any, res: any) {
  const agencyId = parseInt(agencyIdStr);
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'text is required' });

  const { data: existing } = await supabase.from('agency_focus').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (!existing) return res.status(404).json({ error: 'No agency focus data found' });

  const agencies = existing.agencies || [];
  const agency = agencies.find((a: any) => a.id === agencyId);
  if (!agency) return res.status(404).json({ error: `Agency not found: ${agencyId}` });

  const maxLeverId = (agency.levers || []).reduce((m: number, l: any) => Math.max(m, l.id || 0), 0);
  const newLever = { id: maxLeverId + 1, text, completed: false };
  agency.levers = agency.levers || [];
  agency.levers.push(newLever);

  await supabase.from('agency_focus').update({ agencies, updated_at: new Date().toISOString() }).eq('id', existing.id);
  return res.status(201).json({ message: `✅ Lever added to ${agency.name}: "${text}"`, lever: newLever });
}

async function toggleAgencyLever(supabase: any, userId: string, agencyIdStr: string, leverIdStr: string, res: any) {
  const agencyId = parseInt(agencyIdStr);
  const leverId = parseInt(leverIdStr);

  const { data: existing } = await supabase.from('agency_focus').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (!existing) return res.status(404).json({ error: 'No agency focus data found' });

  const agencies = existing.agencies || [];
  const agency = agencies.find((a: any) => a.id === agencyId);
  if (!agency) return res.status(404).json({ error: `Agency not found: ${agencyId}` });

  const lever = (agency.levers || []).find((l: any) => l.id === leverId);
  if (!lever) return res.status(404).json({ error: `Lever not found: ${leverId}` });

  lever.completed = !lever.completed;
  lever.completedAt = lever.completed ? new Date().toISOString() : undefined;

  await supabase.from('agency_focus').update({ agencies, updated_at: new Date().toISOString() }).eq('id', existing.id);
  const status = lever.completed ? '✅ completed' : '⬜ uncompleted';
  return res.status(200).json({ message: `Lever ${status} for ${agency.name}: "${lever.text}"` });
}

// ===================== QUARTERLY FOCUS =====================

async function getQuarterlyFocus(supabase: any, userId: string, res: any) {
  const { data } = await supabase.from('quarterly_focus').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (!data) return res.status(200).json({ message: 'No quarterly focus areas yet.', areas: [], quarter: '' });
  return res.status(200).json({ quarter: data.quarter, dateRange: data.date_range, areas: data.areas || [] });
}

async function addFocusArea(supabase: any, userId: string, req: any, res: any) {
  const { title, description, color } = req.body;
  if (!title) return res.status(400).json({ error: 'title is required' });

  const { data: existing } = await supabase.from('quarterly_focus').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle();
  const areas = existing?.areas || [];
  const maxId = areas.reduce((m: number, a: any) => Math.max(m, a.id || 0), 0);
  const newArea = { id: maxId + 1, title, description: description || '', progress: 0, color: color || 'blue' };
  areas.push(newArea);

  if (existing) {
    await supabase.from('quarterly_focus').update({ areas, updated_at: new Date().toISOString() }).eq('id', existing.id);
  } else {
    const now = new Date();
    const q = Math.ceil((now.getMonth() + 1) / 3);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const qStart = (q - 1) * 3;
    await supabase.from('quarterly_focus').insert({
      user_id: userId,
      quarter: `Q${q}`,
      date_range: `${monthNames[qStart]} – ${monthNames[qStart + 2]} ${now.getFullYear()}`,
      areas,
    });
  }

  return res.status(201).json({ message: `✅ Focus area added: "${title}"`, area: newArea });
}

async function updateFocusProgress(supabase: any, userId: string, areaIdStr: string, req: any, res: any) {
  const areaId = parseInt(areaIdStr);
  const { progress } = req.body;
  if (progress === undefined) return res.status(400).json({ error: 'progress is required' });

  const { data: existing } = await supabase.from('quarterly_focus').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (!existing) return res.status(404).json({ error: 'No quarterly focus data found' });

  const areas = existing.areas || [];
  const area = areas.find((a: any) => a.id === areaId);
  if (!area) return res.status(404).json({ error: `Focus area not found: ${areaId}` });

  area.progress = Math.max(0, Math.min(100, progress));
  await supabase.from('quarterly_focus').update({ areas, updated_at: new Date().toISOString() }).eq('id', existing.id);
  return res.status(200).json({ message: `📈 "${area.title}" progress updated to ${area.progress}%`, area });
}
