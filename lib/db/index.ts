import { createAdminClient, createServerClient, getSupabaseServerClient, isServerSupabaseConfigured } from '@/lib/supabase-server';
import { storage } from '@/lib/storage';
import { NextRequest } from 'next/server';
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

function isValidUuid(id?: string): boolean {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

/**
 * Unified Database Access Layer.
 * Interacts directly with Supabase PostgreSQL if credentials exist,
 * otherwise falls back gracefully to in-memory/localStorage storage.
 */
class DatabaseService {
  private getClient(req?: NextRequest | Headers | null) {
    return getSupabaseServerClient(req) || createAdminClient() || createServerClient();
  }

  /**
   * Resolves a valid UUID organization for website creation:
   * 1. Checks if client is an authenticated user belonging to an organization in memberships.
   * 2. Checks public.organizations for any existing organization UUID.
   * 3. Inserts a default organization with a valid UUID if none exists.
   */
  private async getOrCreateDefaultOrganization(client: any): Promise<string> {
    try {
      // 1. Authenticated user organization resolution
      try {
        const { data: authData } = await client.auth.getUser();
        if (authData?.user?.id) {
          const { data: member } = await client
            .from('memberships')
            .select('organization_id')
            .eq('user_id', authData.user.id)
            .limit(1)
            .maybeSingle();
          if (member?.organization_id && isValidUuid(member.organization_id)) {
            return member.organization_id;
          }
        }
      } catch {
        // Silently continue
      }

      // 2. Query public.organizations
      const { data: org } = await client
        .from('organizations')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (org?.id && isValidUuid(org.id)) {
        return org.id;
      }

      // 3. Create a default organization with valid UUID
      const newOrgId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : '00000000-0000-0000-0000-000000000001';
      const { data: created } = await client
        .from('organizations')
        .insert({
          id: newOrgId,
          name: 'Apex Growth Marketing',
          slug: `agency-${Date.now()}`,
          plan: 'agency',
        })
        .select('id')
        .maybeSingle();

      if (created?.id && isValidUuid(created.id)) {
        return created.id;
      }
      return newOrgId;
    } catch (e) {
      console.warn('Error resolving organization UUID:', e);
      return '00000000-0000-0000-0000-000000000001';
    }
  }

  // ==========================================
  // WEBSITES
  // ==========================================
  async getWebsites(req?: NextRequest | Headers | null): Promise<Website[]> {
    const client = this.getClient(req);
    if (client) {
      try {
        const { data, error } = await client
          .from('websites')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          const mapped: Website[] = data.map((row: any) => ({
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

          // Sync into memory cache
          mapped.forEach((w) => {
            storage.addWebsite(w);
          });

          return mapped;
        } else if (error) {
          console.error('Database getWebsites error:', error);
        }
      } catch (e) {
        console.error('Database getWebsites fallback:', e);
      }
    }
    return storage.getWebsites();
  }

  async getWebsiteById(id: string, req?: NextRequest | Headers | null): Promise<Website | null> {
    const client = this.getClient(req);
    if (client) {
      try {
        const { data, error } = await client
          .from('websites')
          .select('*')
          .eq('id', id)
          .single();

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
        // Fallback to storage
      }
    }
    return storage.getWebsiteById(id) || null;
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
    const cleanDomain = data.domain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').trim();
    const cleanUrl = data.url.startsWith('http') ? data.url.trim() : `https://${data.url.trim()}`;
    const generatedId = (data.id && isValidUuid(data.id))
      ? data.id
      : (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : '00000000-0000-0000-0000-000000000001');

    const client = this.getClient(req);
    if (client) {
      try {
        const orgId = (data.organizationId && isValidUuid(data.organizationId))
          ? data.organizationId
          : await this.getOrCreateDefaultOrganization(client);

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
        } else if (row) {
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
          storage.addWebsite(newSite);
          await this.logActivity('website_created', 'website', newSite.id, { name: newSite.name, domain: newSite.domain }, req);
          return newSite;
        }
      } catch (e) {
        console.error('Database createWebsite fallback:', e);
      }
    }

    const created = storage.addWebsite({
      id: generatedId,
      name: data.name,
      domain: cleanDomain,
      url: cleanUrl,
    });
    await this.logActivity('website_created', 'website', created.id, { name: created.name, domain: created.domain }, req);
    return created;
  }

  async deleteWebsite(id: string, req?: NextRequest | Headers | null): Promise<boolean> {
    const client = this.getClient(req);
    if (client) {
      try {
        await client.from('websites').delete().eq('id', id);
      } catch (e) {
        console.error('Database deleteWebsite fallback:', e);
      }
    }
    await this.logActivity('website_deleted', 'website', id, {}, req);
    return storage.deleteWebsite(id);
  }

  // ==========================================
  // AUDITS & FINDINGS
  // ==========================================
  async getAuditRuns(websiteId?: string): Promise<AuditRun[]> {
    const client = this.getClient();
    if (client) {
      try {
        let query = client.from('audit_runs').select('*').order('started_at', { ascending: false });
        if (websiteId) {
          query = query.eq('website_id', websiteId);
        }
        const { data, error } = await query;
        if (!error && data) {
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
            findingsCount: {
              critical: 0,
              high: 0,
              medium: 0,
              low: 0,
            },
          }));
        }
      } catch (e) {
        console.error('Database getAuditRuns fallback:', e);
      }
    }
    return storage.getAuditRuns(websiteId);
  }

  async saveAuditRun(run: AuditRun, findings: AuditFinding[]): Promise<void> {
    storage.saveAuditRun(run, findings);

    const client = this.getClient();
    if (client) {
      try {
        await client.from('audit_runs').insert({
          id: run.id,
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
            id: f.id,
            audit_run_id: run.id,
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
    }

    await this.logActivity('audit_executed', 'audit_run', run.id, {
      websiteId: run.websiteId,
      seoScore: run.seoScore,
      findingsCount: findings.length,
    });
  }

  // ==========================================
  // ACTION ITEMS / TASKS
  // ==========================================
  async getActionItems(websiteId?: string): Promise<ActionItem[]> {
    const client = this.getClient();
    if (client) {
      try {
        let query = client.from('action_items').select('*').order('created_at', { ascending: false });
        if (websiteId) {
          query = query.eq('website_id', websiteId);
        }
        const { data, error } = await query;
        if (!error && data) {
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
        console.error('Database getActionItems fallback:', e);
      }
    }
    return storage.getActionItems(websiteId);
  }

  async updateActionItemStatus(id: string, status: TaskStatus, notes?: string): Promise<ActionItem | null> {
    const client = this.getClient();
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
        await client.from('action_items').update(updates).eq('id', id);
      } catch (e) {
        console.error('Database updateActionItemStatus fallback:', e);
      }
    }
    const updated = storage.updateActionItemStatus(id, status);
    if (updated && notes !== undefined) {
      updated.userNotes = notes;
    }
    await this.logActivity('task_status_updated', 'action_item', id, { status });
    return updated || null;
  }

  // ==========================================
  // USERS & PROFILES (ADMIN)
  // ==========================================
  async getProfiles(): Promise<UserProfile[]> {
    const client = this.getClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data.map((row: any) => ({
            id: row.id,
            email: row.email,
            fullName: row.full_name || row.email.split('@')[0],
            avatarUrl: row.avatar_url || undefined,
            role: row.role || 'user',
            createdAt: row.created_at || new Date().toISOString(),
          }));
        }
      } catch (e) {
        console.error('Database getProfiles fallback:', e);
      }
    }

    // Default mock user
    const defaultUser = storage.getUser();
    return [
      defaultUser,
      {
        id: 'usr-admin-1',
        email: 'founder@rankpilot.ai',
        fullName: 'Uzair (Founder)',
        role: 'superadmin',
        createdAt: '2026-10-01T08:00:00Z',
      },
      {
        id: 'usr-demo-2',
        email: 'client@saasflow.io',
        fullName: 'Agency Partner Demo',
        role: 'user',
        createdAt: '2026-10-15T12:30:00Z',
      },
    ];
  }

  async updateProfileRole(id: string, role: 'user' | 'admin' | 'superadmin'): Promise<boolean> {
    const client = this.getClient();
    if (client) {
      try {
        const { error } = await client.from('profiles').update({ role, updated_at: new Date().toISOString() }).eq('id', id);
        if (!error) {
          await this.logActivity('user_role_changed', 'profile', id, { newRole: role });
          return true;
        }
      } catch (e) {
        console.error('Database updateProfileRole error:', e);
      }
    }
    await this.logActivity('user_role_changed', 'profile', id, { newRole: role });
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
    const client = this.getClient(req);
    if (client) {
      try {
        const orgId = await this.getOrCreateDefaultOrganization(client);
        await client.from('activity_logs').insert({
          organization_id: orgId,
          action,
          entity_type: entityType,
          entity_id: entityId || null,
          metadata: metadata || null,
          created_at: new Date().toISOString(),
        });
      } catch (e) {
        // Log silently
      }
    }
  }

  async getActivityLogs(limit = 50): Promise<any[]> {
    const client = this.getClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('activity_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (e) {
        // Fallback
      }
    }

    // Default fixture activity logs
    return [
      {
        id: 'log-1',
        action: 'audit_completed',
        entity_type: 'website',
        entity_id: 'web-1',
        metadata: { domain: 'saasflow.io', seoScore: 78 },
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'log-2',
        action: 'user_sign_in',
        entity_type: 'profile',
        entity_id: 'usr-1',
        metadata: { email: 'founder@rankpilot.ai' },
        created_at: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: 'log-3',
        action: 'website_created',
        entity_type: 'website',
        entity_id: 'web-1',
        metadata: { name: 'SaasFlow App', domain: 'saasflow.io' },
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ];
  }
}

export const db = new DatabaseService();
