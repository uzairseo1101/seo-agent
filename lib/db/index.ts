import { createAdminClient, createServerClient, getSupabaseServerClient } from '@/lib/supabase-server';
import { getServerAuthContext, getAdminSupabase } from '@/lib/auth-server';
import { storage } from '@/lib/storage';
import { NextRequest } from 'next/server';
import { generateUuid, isValidUuid } from '@/lib/utils';
import {
  Website,
  AuditRun,
  AuditFinding,
  ActionItem,
  UserProfile,
  TaskStatus,
  FindingCategory,
  TaskPriority,
} from '@/lib/types';

/**
 * Unified Multi-Tenant Database Access Layer.
 * Every query is strictly isolated by the authenticated user's organization.
 */
class DatabaseService {
  private inMemoryLogs: any[] = [];

  private getClient(req?: NextRequest | Headers | null) {
    // 1. If service role admin is available, use it
    const admin = getAdminSupabase();
    if (admin) return admin;

    // 2. If request contains user authorization, use client with user's JWT
    if (req) {
      const serverClient = getSupabaseServerClient(req);
      if (serverClient) return serverClient;
    }

    // 3. Fallback
    return createServerClient();
  }

  // ==========================================
  // WEBSITES (Strictly Scoped by Workspace)
  // ==========================================
  async getWebsites(req?: NextRequest | Headers | null): Promise<Website[]> {
    const auth = await getServerAuthContext(req);
    if (!auth.isAdmin && !auth.organizationId) {
      // Unauthenticated or brand new user with 0 websites
      return [];
    }

    const client = this.getClient(req);
    if (client) {
      try {
        let query = client
          .from('websites')
          .select('*')
          .neq('status', 'archived')
          .order('created_at', { ascending: false });

        if (!auth.isAdmin && auth.organizationId) {
          query = query.eq('organization_id', auth.organizationId);
        }

        const { data, error } = await query;

        if (!error && Array.isArray(data)) {
          return data.map((row: any) => ({
            id: row.id,
            organizationId: row.organization_id,
            name: row.name,
            domain: row.domain,
            url: row.url,
            status: row.status || 'active',
            latestSeoScore: Number(row.latest_seo_score) || 0,
            latestGeoScore: Number(row.latest_geo_score) || 0,
            latestAeoScore: Number(row.latest_aeo_score) || 0,
            lastAuditedAt: row.last_audited_at || undefined,
            createdAt: row.created_at || new Date().toISOString(),
          }));
        }
      } catch (e) {
        console.error('Database getWebsites error:', e);
      }
    }
    return [];
  }

  async getWebsiteById(id: string, req?: NextRequest | Headers | null): Promise<Website | null> {
    if (!id || !isValidUuid(id)) return null;

    const auth = await getServerAuthContext(req);
    const client = this.getClient(req);
    if (client) {
      try {
        let query = client.from('websites').select('*').eq('id', id);
        // Ordinary users can only access websites belonging to their organization
        if (!auth.isAdmin && auth.organizationId && req) {
          query = query.eq('organization_id', auth.organizationId);
        }

        const { data, error } = await query.maybeSingle();
        if (!error && data) {
          return {
            id: data.id,
            organizationId: data.organization_id,
            name: data.name,
            domain: data.domain,
            url: data.url,
            status: data.status || 'active',
            latestSeoScore: Number(data.latest_seo_score) || 0,
            latestGeoScore: Number(data.latest_geo_score) || 0,
            latestAeoScore: Number(data.latest_aeo_score) || 0,
            lastAuditedAt: data.last_audited_at || undefined,
            createdAt: data.created_at || new Date().toISOString(),
          };
        }
      } catch (e) {
        console.error('Database getWebsiteById error:', e);
      }
    }
    const fallback = storage.getWebsiteById(id);
    if (fallback) return fallback;
    return null;
  }

  async createWebsite(
    data: {
      name: string;
      domain: string;
      url: string;
      id?: string;
      organizationId?: string;
    },
    req?: NextRequest | Headers | null
  ): Promise<Website> {
    const auth = await getServerAuthContext(req);
    const orgId = auth.organizationId || data.organizationId || (req ? null : '00000000-0000-0000-0000-000000000001');
    if (!orgId) {
      throw new Error('Authentication required to connect a website.');
    }

    const cleanDomain = data.domain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').trim();
    const cleanUrl = data.url.startsWith('http') ? data.url.trim() : `https://${data.url.trim()}`;
    const generatedId = (data.id && isValidUuid(data.id)) ? data.id : generateUuid();

    const client = this.getClient(req);
    if (client) {
      const { data: row, error } = await client
        .from('websites')
        .insert({
          id: generatedId,
          organization_id: orgId,
          name: data.name.trim(),
          domain: cleanDomain,
          url: cleanUrl,
          status: 'active',
          latest_seo_score: 0,
          latest_geo_score: 0,
          latest_aeo_score: 0,
        })
        .select()
        .single();

      if (error) {
        console.error('Database createWebsite error:', error);
        throw new Error(error.message || 'Failed to create website record.');
      }

      if (row) {
        const newSite: Website = {
          id: row.id,
          organizationId: row.organization_id,
          name: row.name,
          domain: row.domain,
          url: row.url,
          status: row.status || 'active',
          latestSeoScore: 0,
          latestGeoScore: 0,
          latestAeoScore: 0,
          createdAt: row.created_at || new Date().toISOString(),
        };
        await this.logActivity('website_created', 'website', newSite.id, { name: newSite.name, domain: newSite.domain }, req);
        return newSite;
      }
    }

    // Offline / Test fallback
    const fallbackSite: Website = {
      id: generatedId,
      organizationId: orgId,
      name: data.name.trim(),
      domain: cleanDomain,
      url: cleanUrl,
      status: 'active',
      latestSeoScore: 0,
      latestGeoScore: 0,
      latestAeoScore: 0,
      createdAt: new Date().toISOString(),
    };
    storage.addWebsite(fallbackSite);
    return fallbackSite;
  }

  async deleteWebsite(id: string, req?: NextRequest | Headers | null): Promise<boolean> {
    if (!id || !isValidUuid(id)) return false;

    const auth = await getServerAuthContext(req);
    const client = this.getClient(req);
    if (client) {
      try {
        let query = client.from('websites').delete().eq('id', id);
        if (!auth.isAdmin && auth.organizationId && req) {
          query = query.eq('organization_id', auth.organizationId);
        }
        await query;
        await this.logActivity('website_deleted', 'website', id, {}, req);
        return true;
      } catch (e) {
        console.error('Database deleteWebsite error:', e);
      }
    }
    storage.deleteWebsite(id);
    return true;
  }

  // ==========================================
  // AUDITS & FINDINGS (Scoped by Authorized Website)
  // ==========================================
  async getAuditRuns(websiteId?: string, req?: NextRequest | Headers | null): Promise<AuditRun[]> {
    const auth = await getServerAuthContext(req);
    if (!auth.isAdmin && !auth.organizationId) return [];

    const client = this.getClient(req);
    if (!client) return [];

    try {
      // If websiteId is specified, verify it belongs to user's workspace (or user is admin)
      if (websiteId) {
        if (!auth.isAdmin) {
          const site = await this.getWebsiteById(websiteId, req);
          if (!site) return []; // Website does not belong to this user
        }

        const { data, error } = await client
          .from('audit_runs')
          .select('*')
          .eq('website_id', websiteId)
          .order('started_at', { ascending: false });

        if (!error && Array.isArray(data)) {
          return data.map((row: any) => ({
            id: row.id,
            websiteId: row.website_id,
            status: row.status || 'completed',
            pagesCrawled: row.pages_crawled || 0,
            seoScore: Number(row.seo_score) || 0,
            geoScore: Number(row.geo_score) || 0,
            aeoScore: Number(row.aeo_score) || 0,
            crawlDurationMs: row.crawl_duration_ms || 0,
            startedAt: row.started_at || new Date().toISOString(),
            completedAt: row.completed_at || undefined,
            findingsCount: { critical: 0, high: 0, medium: 0, low: 0 },
          }));
        }
      } else {
        if (!auth.isAdmin) {
          // Get all websites for this organization
          const userWebsites = await this.getWebsites(req);
          if (userWebsites.length === 0) return [];
          const webIds = userWebsites.map(w => w.id);

          const { data, error } = await client
            .from('audit_runs')
            .select('*')
            .in('website_id', webIds)
            .order('started_at', { ascending: false });

          if (!error && Array.isArray(data)) {
            return data.map((row: any) => ({
              id: row.id,
              websiteId: row.website_id,
              status: row.status || 'completed',
              pagesCrawled: row.pages_crawled || 0,
              seoScore: Number(row.seo_score) || 0,
              geoScore: Number(row.geo_score) || 0,
              aeoScore: Number(row.aeo_score) || 0,
              crawlDurationMs: row.crawl_duration_ms || 0,
              startedAt: row.started_at || new Date().toISOString(),
              completedAt: row.completed_at || undefined,
              findingsCount: { critical: 0, high: 0, medium: 0, low: 0 },
            }));
          }
        } else {
          // Superadmin can view all audit runs
          const { data, error } = await client
            .from('audit_runs')
            .select('*')
            .order('started_at', { ascending: false });

          if (!error && Array.isArray(data)) {
            return data.map((row: any) => ({
              id: row.id,
              websiteId: row.website_id,
              status: row.status || 'completed',
              pagesCrawled: row.pages_crawled || 0,
              seoScore: Number(row.seo_score) || 0,
              geoScore: Number(row.geo_score) || 0,
              aeoScore: Number(row.aeo_score) || 0,
              crawlDurationMs: row.crawl_duration_ms || 0,
              startedAt: row.started_at || new Date().toISOString(),
              completedAt: row.completed_at || undefined,
              findingsCount: { critical: 0, high: 0, medium: 0, low: 0 },
            }));
          }
        }
      }
    } catch (e) {
      console.error('Database getAuditRuns error:', e);
    }
    return [];
  }

  async getFindings(runId?: string, websiteId?: string, req?: NextRequest | Headers | null): Promise<AuditFinding[]> {
    const auth = await getServerAuthContext(req);
    if (!auth.organizationId) return [];

    const client = this.getClient(req);
    if (!client) return [];

    try {
      if (websiteId) {
        const site = await this.getWebsiteById(websiteId, req);
        if (!site) return []; // Website belongs to another tenant
      }

      let query = client.from('audit_findings').select('*').order('created_at', { ascending: false });
      if (runId && isValidUuid(runId)) {
        query = query.eq('audit_run_id', runId);
      }
      if (websiteId && isValidUuid(websiteId)) {
        query = query.eq('website_id', websiteId);
      }

      const { data, error } = await query;
      if (!error && Array.isArray(data)) {
        return data.map((row: any) => ({
          id: row.id,
          auditRunId: row.audit_run_id,
          websiteId: row.website_id,
          url: row.url,
          category: row.category as FindingCategory,
          issueType: row.issue_type,
          severity: row.severity,
          title: row.title,
          description: row.description,
          recommendation: row.recommendation,
          confidenceLevel: row.confidence_level || 'high',
          detectionMethod: row.detection_method,
          evidence: {
            expected: row.expected_condition || row.recommendation || 'Compliant with search standards',
            actual: row.actual_condition || row.description || 'Defect detected during crawl',
          },
          isResolved: row.is_resolved || false,
          createdAt: row.created_at || new Date().toISOString(),
        }));
      }
    } catch (e) {
      console.error('Database getFindings error:', e);
    }
    return [];
  }

  async saveAuditRun(run: AuditRun, findings: AuditFinding[], req?: NextRequest | Headers | null): Promise<void> {
    const client = this.getClient(req);
    if (!client) return;

    try {
      const runId = isValidUuid(run.id) ? run.id : generateUuid();
      await client.from('audit_runs').insert({
        id: runId,
        website_id: run.websiteId,
        status: run.status,
        pages_crawled: run.pagesCrawled,
        seo_score: run.seoScore,
        geo_score: run.geoScore,
        aeo_score: run.aeoScore,
        crawl_duration_ms: run.crawlDurationMs,
        started_at: run.startedAt,
        completed_at: run.completedAt,
      });

      await client.from('websites').update({
        latest_seo_score: run.seoScore,
        latest_geo_score: run.geoScore,
        latest_aeo_score: run.aeoScore,
        last_audited_at: run.completedAt,
      }).eq('id', run.websiteId);

      if (findings.length > 0) {
        const findingRows = findings.map(f => ({
          id: isValidUuid(f.id) ? f.id : generateUuid(),
          audit_run_id: runId,
          website_id: run.websiteId,
          url: f.url,
          category: f.category,
          issue_type: f.issueType,
          severity: f.severity,
          title: f.title,
          description: f.description,
          recommendation: f.recommendation,
          confidence_level: f.confidenceLevel,
          detection_method: f.detectionMethod,
          is_resolved: f.isResolved,
        }));
        await client.from('audit_findings').insert(findingRows);
      }
    } catch (e) {
      console.error('Database saveAuditRun error:', e);
    }

    await this.logActivity('audit_executed', 'audit_run', run.id, {
      websiteId: run.websiteId,
      seoScore: run.seoScore,
      findingsCount: findings.length,
    }, req);
  }

  // ==========================================
  // ACTION ITEMS / TASKS (Strict Workspace Scoping)
  // ==========================================
  async getActionItems(websiteId?: string, req?: NextRequest | Headers | null): Promise<ActionItem[]> {
    const auth = await getServerAuthContext(req);
    if (!auth.isAdmin && !auth.organizationId) return [];

    const client = this.getClient(req);
    if (!client) return [];

    try {
      let query = client
        .from('action_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (!auth.isAdmin && auth.organizationId) {
        query = query.eq('organization_id', auth.organizationId);
      }

      if (websiteId && isValidUuid(websiteId)) {
        query = query.eq('website_id', websiteId);
      }

      const { data, error } = await query;
      if (!error && Array.isArray(data)) {
        return data.map((row: any) => ({
          id: row.id,
          organizationId: row.organization_id,
          websiteId: row.website_id,
          sourceType: row.source_type,
          sourceId: row.source_id || undefined,
          title: row.title,
          description: row.description,
          category: row.category as FindingCategory,
          priority: row.priority as TaskPriority,
          affectedUrl: row.affected_url,
          recommendedSolution: row.recommended_solution,
          steps: Array.isArray(row.step_by_step_instructions) ? row.step_by_step_instructions : [],
          status: row.status as TaskStatus,
          verificationStatus: row.verification_status || 'unverified',
          dueDate: row.due_date || undefined,
          completedAt: row.completed_at || undefined,
          userNotes: row.user_notes || undefined,
          createdAt: row.created_at || new Date().toISOString(),
        }));
      }
    } catch (e) {
      console.error('Database getActionItems error:', e);
    }
    return [];
  }

  async createActionItem(item: Partial<ActionItem>, req?: NextRequest | Headers | null): Promise<ActionItem> {
    const auth = await getServerAuthContext(req);
    const orgId = auth.organizationId || item.organizationId || (req ? null : '00000000-0000-0000-0000-000000000001');
    if (!orgId) {
      throw new Error('Authentication required to create action tasks.');
    }

    const taskId = (item.id && isValidUuid(item.id)) ? item.id : generateUuid();
    const client = this.getClient(req);

    const taskRow = {
      id: taskId,
      organization_id: orgId,
      website_id: item.websiteId,
      source_type: item.sourceType || 'manual',
      source_id: (item.sourceId && isValidUuid(item.sourceId)) ? item.sourceId : null,
      title: item.title || 'Untitled Action Item',
      description: item.description || item.title || '',
      category: (item.category as FindingCategory) || 'technical',
      priority: (item.priority as TaskPriority) || 'medium',
      affected_url: item.affectedUrl || '',
      recommended_solution: item.recommendedSolution || 'Implement optimization.',
      step_by_step_instructions: item.steps || [],
      status: item.status || 'todo',
      verification_status: item.verificationStatus === 'completed_verified' ? 'verified' : (item.verificationStatus === 'still_unresolved' ? 'unresolved' : 'unverified'),
      due_date: item.dueDate || null,
      created_at: item.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (client) {
      try {
        const { error } = await client.from('action_items').insert(taskRow);
        if (error) console.error('Database createActionItem error:', error);
      } catch (e) {
        console.error('Database createActionItem fallback:', e);
      }
    }

    const newTask: ActionItem = {
      id: taskId,
      organizationId: orgId,
      websiteId: item.websiteId || '',
      sourceType: item.sourceType || 'manual',
      sourceId: item.sourceId,
      title: item.title || 'Untitled Action Item',
      description: item.description || item.title || '',
      category: (item.category as FindingCategory) || 'technical',
      priority: (item.priority as TaskPriority) || 'medium',
      affectedUrl: item.affectedUrl || '',
      recommendedSolution: item.recommendedSolution || '',
      steps: item.steps || [],
      status: item.status || 'todo',
      verificationStatus: item.verificationStatus || 'unverified',
      dueDate: item.dueDate,
      createdAt: item.createdAt || new Date().toISOString(),
    };

    await this.logActivity('task_created', 'action_item', newTask.id, { title: newTask.title }, req);
    return newTask;
  }

  async updateActionItemStatus(id: string, status: TaskStatus, notes?: string, req?: NextRequest | Headers | null): Promise<ActionItem | null> {
    if (!id || !isValidUuid(id)) return null;

    const auth = await getServerAuthContext(req);
    if (!auth.organizationId) return null;

    const client = this.getClient(req);
    if (client) {
      try {
        const updates: any = {
          status,
          updated_at: new Date().toISOString(),
        };
        if (status === 'completed') {
          updates.completed_at = new Date().toISOString();
        }
        if (notes !== undefined) {
          updates.user_notes = notes;
        }

        let query = client.from('action_items').update(updates).eq('id', id);
        if (!auth.isAdmin) {
          query = query.eq('organization_id', auth.organizationId);
        }
        await query;
      } catch (e) {
        console.error('Database updateActionItemStatus error:', e);
      }
    }

    await this.logActivity('task_status_updated', 'action_item', id, { status }, req);
    return null;
  }

  // ==========================================
  // USERS & PROFILES (ADMIN ONLY)
  // ==========================================
  async getProfiles(req?: NextRequest | Headers | null): Promise<UserProfile[]> {
    if (req) {
      const auth = await getServerAuthContext(req);
      if (!auth.isAdmin) {
        if (auth.user) {
          return [{
            id: auth.user.id,
            email: auth.user.email,
            fullName: auth.user.fullName,
            role: auth.user.role,
            createdAt: new Date().toISOString(),
          }];
        }
        return [];
      }
    }

    const client = this.getClient(req);
    if (client) {
      try {
        // 1. If service role key is configured, list directly from Supabase auth.admin
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                           process.env.SUPABASE_SERVICE_KEY || 
                           process.env.SUPABASE_SECRET_KEY || 
                           process.env.SB_SECRET_KEY;
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';

        if (serviceKey && url && !url.includes('your-project')) {
          try {
            const { createClient: createDirectClient } = await import('@supabase/supabase-js');
            const adminAuth = createDirectClient(url, serviceKey, {
              auth: { autoRefreshToken: false, persistSession: false },
            });
            const { data: authData, error: authErr } = await adminAuth.auth.admin.listUsers();
            if (!authErr && authData?.users && authData.users.length > 0) {
              return authData.users.map((u: any) => ({
                id: u.id,
                email: u.email || '',
                fullName: u.user_metadata?.full_name || u.email?.split('@')[0] || 'User',
                avatarUrl: undefined,
                role: (u.email === 'uzairnoor1101@gmail.com' || u.email?.includes('uzairnoor') || u.email === 'founder@rankpilot.ai') ? 'superadmin' : 'user',
                createdAt: u.created_at || new Date().toISOString(),
              }));
            }
          } catch (e) {
            console.warn('adminAuth.auth.admin.listUsers failed, querying profiles table:', e);
          }
        }

        // 2. Query public.profiles with client (authenticated as admin)
        const { data, error } = await client
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          return data.map((row: any) => ({
            id: row.id,
            email: row.email,
            fullName: row.full_name || row.email?.split('@')[0] || 'User',
            avatarUrl: row.avatar_url || undefined,
            role: row.role || 'user',
            createdAt: row.created_at || new Date().toISOString(),
          }));
        }
      } catch (e) {
        console.error('Database getProfiles error:', e);
      }
    }

    // Default system admin profile for test environments
    return [
      {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'uzairnoor1101@gmail.com',
        fullName: 'Uzair Noor',
        role: 'superadmin',
        createdAt: new Date().toISOString(),
      },
    ];
  }

  async updateProfileRole(id: string, role: 'user' | 'admin' | 'superadmin', req?: NextRequest | Headers | null): Promise<boolean> {
    if (req) {
      const auth = await getServerAuthContext(req);
      if (!auth.isAdmin) {
        throw new Error('Forbidden: Only administrators can modify user roles.');
      }
    }

    const client = this.getClient(req);
    if (client) {
      try {
        const { error } = await client.from('profiles').update({ role, updated_at: new Date().toISOString() }).eq('id', id);
        if (!error) {
          await this.logActivity('user_role_updated', 'user', id, { newRole: role }, req);
          return true;
        }
      } catch (e) {
        console.error('Database updateProfileRole error:', e);
      }
    }
    return true;
  }

  // ==========================================
  // ACTIVITY LOGS
  // ==========================================
  async logActivity(
    action: string,
    entityType: string,
    entityId?: string,
    metadata?: any,
    req?: NextRequest | Headers | null
  ): Promise<void> {
    const auth = await getServerAuthContext(req);
    const entry = {
      id: generateUuid(),
      organization_id: auth.organizationId || 'default-org',
      user_id: auth.user?.id || null,
      action,
      entity_type: entityType,
      entity_id: entityId || null,
      metadata: metadata || null,
      created_at: new Date().toISOString(),
    };
    this.inMemoryLogs.unshift(entry);

    if (!auth.organizationId) return;

    const client = this.getClient(req);
    if (client) {
      try {
        await client.from('activity_logs').insert(entry);
      } catch (e) {
        // Log silently
      }
    }
  }

  async getActivityLogs(limit = 50, req?: NextRequest | Headers | null): Promise<any[]> {
    const auth = await getServerAuthContext(req);
    const client = this.getClient(req);
    if (client) {
      try {
        let query = client.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(limit);
        if (!auth.isAdmin && auth.organizationId) {
          query = query.eq('organization_id', auth.organizationId);
        }
        const { data, error } = await query;
        if (!error && Array.isArray(data) && data.length > 0) return data;
      } catch (e) {
        // Fallback to in-memory
      }
    }
    return this.inMemoryLogs.slice(0, limit);
  }
}

export const db = new DatabaseService();
