import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://supabase-supabase-7c4fe6-72-61-123-73.sslip.io';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjIxMDY3MTU4MjksImlhdCI6MTc5MTM1NTgyOSwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlzcyI6InN1cGFiYXNlIn0.V3vdSFKXr9uLlYG0QLUYnjtug8AKKoLt6NL_vZCPRxk';

let supabaseClient = null;

export function getSupabase() {
  if (!supabaseClient && SUPABASE_URL && SUPABASE_KEY) {
    try {
      supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      });
      console.log(`[Supabase] Đã kết nối Supabase tại: ${SUPABASE_URL}`);
    } catch (err) {
      console.warn('[Supabase] Không thể khởi tạo Supabase client:', err.message);
    }
  }
  return supabaseClient;
}

export function isSupabaseConnected() {
  return !!getSupabase();
}

// ----------------- VIOLATIONS -----------------
export async function fetchViolationsFromSupabase() {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data, error } = await sb
      .from('violations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase] fetchViolations error:', error.message);
      return null;
    }

    return (data || []).map(row => ({
      id: row.id,
      timestamp: row.timestamp,
      date: row.date,
      platform: row.platform,
      author: row.author,
      authorHandle: row.author_handle,
      followers: row.followers,
      avatar: row.avatar,
      content: row.content,
      postType: row.post_type,
      postUrl: row.post_url,
      mediaUrl: row.media_url,
      mediaGallery: row.media_gallery || [],
      videoDuration: row.video_duration,
      engagement: row.engagement || {},
      category: row.category,
      status: row.status,
      severity: row.severity,
      violationDetails: row.violation_details || [],
      legalBasis: row.legal_basis || [],
      recommendations: row.recommendations || [],
      notes: row.notes,
      sha256Hash: row.sha256_hash
    }));
  } catch (err) {
    console.warn('[Supabase] fetchViolations exception:', err.message);
    return null;
  }
}

export async function upsertViolationToSupabase(item) {
  const sb = getSupabase();
  if (!sb) return false;
  try {
    const row = {
      id: item.id,
      timestamp: item.timestamp,
      date: item.date || new Date().toISOString(),
      platform: item.platform,
      author: item.author,
      author_handle: item.authorHandle,
      followers: item.followers,
      avatar: item.avatar,
      content: item.content,
      post_type: item.postType,
      post_url: item.postUrl,
      media_url: item.mediaUrl,
      media_gallery: item.mediaGallery || [],
      video_duration: item.videoDuration,
      engagement: item.engagement || {},
      category: item.category,
      status: item.status || 'Chờ xử lý',
      severity: item.severity || 'Trung bình',
      violation_details: item.violationDetails || [],
      legal_basis: item.legalBasis || [],
      recommendations: item.recommendations || [],
      notes: item.notes || '',
      sha256_hash: item.sha256Hash || '',
      updated_at: new Date().toISOString()
    };

    const { error } = await sb
      .from('violations')
      .upsert(row, { onConflict: 'id' });

    if (error) {
      console.warn('[Supabase] upsertViolation error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] upsertViolation exception:', err.message);
    return false;
  }
}

export async function deleteViolationFromSupabase(id) {
  const sb = getSupabase();
  if (!sb) return false;
  try {
    const { error } = await sb.from('violations').delete().eq('id', id);
    if (error) {
      console.warn('[Supabase] deleteViolation error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
}

export async function clearViolationsFromSupabase() {
  const sb = getSupabase();
  if (!sb) return false;
  try {
    const { error } = await sb.from('violations').delete().neq('id', '___non_existent___');
    if (error) console.warn('[Supabase] clearViolations error:', error.message);
    return !error;
  } catch (err) {
    return false;
  }
}

// ----------------- KEYWORDS -----------------
export async function fetchKeywordsFromSupabase() {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data, error } = await sb
      .from('keywords')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('[Supabase] fetchKeywords error:', error.message);
      return null;
    }

    return (data || []).map(r => ({
      id: r.id,
      category: r.category,
      keyword: r.keyword,
      severity: r.severity,
      isActive: r.is_active
    }));
  } catch (err) {
    return null;
  }
}

export async function syncKeywordsToSupabase(keywordsList) {
  const sb = getSupabase();
  if (!sb) return false;
  try {
    const rows = keywordsList.map((k, idx) => ({
      id: k.id || `kw-${idx + 1}`,
      category: k.category,
      keyword: k.keyword,
      severity: k.severity || 'Trung bình',
      is_active: k.isActive !== undefined ? k.isActive : true
    }));

    const { error } = await sb
      .from('keywords')
      .upsert(rows, { onConflict: 'keyword' });

    if (error) console.warn('[Supabase] syncKeywords error:', error.message);
    return !error;
  } catch (err) {
    return false;
  }
}

// ----------------- LICENSED FACILITIES -----------------
export async function fetchFacilitiesFromSupabase() {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data, error } = await sb
      .from('licensed_facilities')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.warn('[Supabase] fetchFacilities error:', error.message);
      return null;
    }

    return (data || []).map(f => ({
      id: f.id,
      name: f.name,
      licenseNumber: f.license_number,
      issuedBy: f.issued_by,
      issuedDate: f.issued_date,
      address: f.address,
      scope: f.scope,
      representative: f.representative,
      status: f.status
    }));
  } catch (err) {
    return null;
  }
}

export async function upsertFacilityToSupabase(item) {
  const sb = getSupabase();
  if (!sb) return false;
  try {
    const row = {
      id: item.id,
      name: item.name,
      license_number: item.licenseNumber,
      issued_by: item.issuedBy,
      issued_date: item.issuedDate,
      address: item.address,
      scope: item.scope,
      representative: item.representative,
      status: item.status || 'Đang hoạt động'
    };
    const { error } = await sb.from('licensed_facilities').upsert(row, { onConflict: 'id' });
    return !error;
  } catch (err) {
    return false;
  }
}

export async function deleteFacilityFromSupabase(id) {
  const sb = getSupabase();
  if (!sb) return false;
  try {
    const { error } = await sb.from('licensed_facilities').delete().eq('id', id);
    return !error;
  } catch (err) {
    return false;
  }
}

// ----------------- STATS & SCHEDULER -----------------
export async function fetchStatsFromSupabase() {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data, error } = await sb
      .from('scan_stats')
      .select('*')
      .eq('id', 'global_stats')
      .single();

    if (error || !data) return null;
    return { totalScanned: data.total_scanned || 0 };
  } catch (err) {
    return null;
  }
}

export async function updateStatsInSupabase(totalScanned) {
  const sb = getSupabase();
  if (!sb) return false;
  try {
    const { error } = await sb
      .from('scan_stats')
      .upsert({ id: 'global_stats', total_scanned: totalScanned, updated_at: new Date().toISOString() });
    return !error;
  } catch (err) {
    return false;
  }
}

export async function fetchSchedulerConfigFromSupabase() {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data, error } = await sb
      .from('scheduler_config')
      .select('*')
      .eq('id', 'default_scheduler')
      .single();

    if (error || !data) return null;
    return data.config;
  } catch (err) {
    return null;
  }
}

export async function updateSchedulerConfigInSupabase(config) {
  const sb = getSupabase();
  if (!sb) return false;
  try {
    const { error } = await sb
      .from('scheduler_config')
      .upsert({ id: 'default_scheduler', config, updated_at: new Date().toISOString() });
    return !error;
  } catch (err) {
    return false;
  }
}
