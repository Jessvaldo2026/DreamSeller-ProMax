// Business domain management system
import { supabase } from './supabase';

export interface Domain {
  id: string;
  user_id: string;
  domain_name: string;
  business_id: string;
  status: 'pending' | 'active' | 'expired' | 'failed';
  registrar: string;
  expires_at: Date;
  auto_renew: boolean;
  ssl_enabled: boolean;
  dns_records: DNSRecord[];
  created_at: Date;
}

export interface DNSRecord {
  type: 'A' | 'CNAME' | 'MX' | 'TXT';
  name: string;
  value: string;
  ttl: number;
}

export class DomainManager {
  async searchAvailableDomains(businessName: string): Promise<string[]> {
    const cleanName = businessName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const extensions = ['.com', '.org', '.net', '.io', '.co'];
    const suggestions = [];

    suggestions.push(cleanName);
    suggestions.push(`${cleanName}pro`);
    suggestions.push(`${cleanName}hub`);
    suggestions.push(`get${cleanName}`);
    suggestions.push(`${cleanName}app`);

    const domains = [];
    for (const suggestion of suggestions) {
      for (const ext of extensions) {
        domains.push(`${suggestion}${ext}`);
      }
    }

    const availableDomains: string[] = [];
    for (const domain of domains.slice(0, 20)) {
      try {
        const response = await fetch('/api/domains/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ domain })
        });

        const result = await response.json();
        if (result.available) {
          availableDomains.push(domain);
        }
      } catch (error) {
        console.error(`Failed to check domain ${domain}:`, error);
      }
    }

    return availableDomains;
  }

  async registerDomain(domainName: string, businessId: string, userId: string): Promise<Domain> {
    const response = await fetch('/api/domains/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        domain: domainName,
        registrant: {
          name: 'DreamSeller Pro User',
          email: 'admin@dreamsellers.org',
          organization: 'DreamSeller Pro'
        }
      })
    });

    if (!response.ok) {
      throw new Error('Domain registration failed');
    }

    await response.json(); // previously: const registrationResult = await response.json();

    const domain: Domain = {
      id: crypto.randomUUID(),
      user_id: userId,
      domain_name: domainName,
      business_id: businessId,
      status: 'pending',
      registrar: 'Namecheap',
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      auto_renew: true,
      ssl_enabled: false,
      dns_records: [
        {
          type: 'A',
          name: '@',
          value: '192.168.1.1',
          ttl: 3600
        },
        {
          type: 'CNAME',
          name: 'www',
          value: domainName,
          ttl: 3600
        }
      ],
      created_at: new Date()
    };

    const { error } = await supabase.from('domains').insert(domain);
    if (error) throw error;

    await this.setupSSL(domain);
    return domain;
  }

  async setupSSL(domain: Domain): Promise<void> {
    try {
      const response = await fetch('/api/ssl/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain.domain_name })
      });

      if (response.ok) {
        await supabase
          .from('domains')
          .update({ ssl_enabled: true })
          .eq('id', domain.id);
      }
    } catch (error) {
      console.error('SSL setup failed:', error);
    }
  }

  async updateDNSRecords(domainId: string, records: DNSRecord[]): Promise<void> {
    const response = await fetch('/api/dns/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domainId, records })
    });

    if (!response.ok) {
      throw new Error('DNS update failed');
    }

    await supabase
      .from('domains')
      .update({ dns_records: records })
      .eq('id', domainId);
  }

  async getUserDomains(userId: string): Promise<Domain[]> {
    const { data, error } = await supabase
      .from('domains')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async renewDomain(domainId: string): Promise<void> {
    const { data: domain, error } = await supabase
      .from('domains')
      .select('*')
      .eq('id', domainId)
      .single();

    if (error) throw error;

    const response = await fetch('/api/domains/renew', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain: domain.domain_name })
    });

    if (!response.ok) {
      throw new Error('Domain renewal failed');
    }

    const newExpiryDate = new Date(domain.expires_at);
    newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1);

    await supabase
      .from('domains')
      .update({ expires_at: newExpiryDate.toISOString() })
      .eq('id', domainId);
  }
}

export const domainManager = new DomainManager();
