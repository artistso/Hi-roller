import { serve } from 'https://deno.land/std@0.192.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: { 'access-control-allow-origin': '*' } });
  const auth = req.headers.get('authorization') || '';
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: auth } } },
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 });

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data: open } = await admin
    .from('tournaments')
    .select('*')
    .eq('status', 'open')
    .order('start_time', { ascending: true })
    .limit(1)
    .maybeSingle();

  let tourney = open;
  if (!tourney) {
    const start = nextFridayNoonUtc();
    const { data: created, error } = await admin.from('tournaments').insert({
      start_time: start.toISOString(),
      end_time: new Date(start.getTime() + 48 * 3600 * 1000).toISOString(),
      max_players: 64,
      status: 'open',
    }).select().single();
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    tourney = created;
  }

  const { count } = await admin
    .from('tournament_brackets')
    .select('*', { count: 'exact', head: true })
    .eq('tournament_id', tourney.id)
    .eq('round', 1);

  if ((count || 0) >= tourney.max_players) {
    return new Response(JSON.stringify({ error: 'full' }), { status: 409 });
  }

  await admin.from('tournament_brackets').insert({
    tournament_id: tourney.id,
    round: 1,
    player1_id: user.id,
  });

  return new Response(JSON.stringify({ ok: true, tournamentId: tourney.id }), {
    headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' },
  });
});

function nextFridayNoonUtc() {
  const d = new Date();
  const day = d.getUTCDay();
  const add = (5 - day + 7) % 7;
  d.setUTCDate(d.getUTCDate() + add);
  d.setUTCHours(12, 0, 0, 0);
  if (d.getTime() < Date.now()) d.setUTCDate(d.getUTCDate() + 7);
  return d;
}
