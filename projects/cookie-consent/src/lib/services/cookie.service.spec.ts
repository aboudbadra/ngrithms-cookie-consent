import { describe, expect, it, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { CookieService } from './cookie.service';

/**
 * Minimal `document.cookie`-compatible stub. `document.cookie` semantics are
 * append-on-write (assigning a single "name=value" updates that one cookie),
 * so we model the underlying store as a Map.
 */
function makeFakeDocument(protocol: 'http:' | 'https:' = 'http:') {
  const jar = new Map<string, string>();
  const doc = {
    get cookie(): string {
      return Array.from(jar.entries()).map(([k, v]) => `${k}=${v}`).join('; ');
    },
    set cookie(raw: string) {
      const [pair] = raw.split(';');
      const idx = pair.indexOf('=');
      if (idx === -1) return;
      const name = pair.slice(0, idx).trim();
      const value = pair.slice(idx + 1).trim();
      const isExpired = /expires=Thu, 01 Jan 1970/.test(raw);
      if (isExpired || value === '') {
        jar.delete(name);
      } else {
        jar.set(name, value);
      }
    },
    location: { protocol },
  };
  return { doc, jar };
}

function makeService(platform: 'browser' | 'server' = 'browser', protocol: 'http:' | 'https:' = 'http:') {
  const { doc, jar } = makeFakeDocument(protocol);
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      { provide: DOCUMENT, useValue: doc },
      { provide: PLATFORM_ID, useValue: platform },
    ],
  });
  const service = TestBed.inject(CookieService);
  return { service, doc, jar };
}

describe('CookieService', () => {
  describe('browser platform', () => {
    let service: CookieService;
    let jar: Map<string, string>;

    beforeEach(() => {
      ({ service, jar } = makeService('browser'));
    });

    it('round-trips a simple string', () => {
      service.set('foo', 'bar', 1);
      expect(service.get('foo')).toBe('bar');
    });

    it('URL-encodes values on write and decodes on read', () => {
      service.set('foo', 'a b=c;d', 1);
      expect(jar.get('foo')).toBe('a%20b%3Dc%3Bd');
      expect(service.get('foo')).toBe('a b=c;d');
    });

    it('returns undefined for missing keys', () => {
      expect(service.get('does-not-exist')).toBeUndefined();
    });

    it('delete() removes the cookie', () => {
      service.set('foo', 'bar', 1);
      service.delete('foo');
      expect(service.get('foo')).toBeUndefined();
    });

    it('round-trips JSON via setJSON/getJSON', () => {
      const payload = { granted: { a: true }, timestamp: 12345, version: 2 };
      service.setJSON('state', payload, 1);
      expect(service.getJSON('state')).toEqual(payload);
    });

    it('getJSON returns undefined for malformed JSON', () => {
      service.set('bad', 'not-json', 1);
      expect(service.getJSON('bad')).toBeUndefined();
    });

    it('getJSON returns undefined for missing keys', () => {
      expect(service.getJSON('missing')).toBeUndefined();
    });

    it('does not confuse keys with regex metachars in the name', () => {
      service.set('a.b', '1', 1);
      service.set('a*b', '2', 1);
      expect(service.get('a.b')).toBe('1');
      expect(service.get('a*b')).toBe('2');
    });
  });

  describe('server platform (SSR)', () => {
    it('get returns undefined and write/delete are no-ops', () => {
      const { service, jar } = makeService('server');
      service.set('foo', 'bar', 1);
      service.delete('baz');
      expect(jar.size).toBe(0);
      expect(service.get('foo')).toBeUndefined();
    });
  });

  describe('Secure flag', () => {
    function captureWrite(protocol: 'http:' | 'https:') {
      const writes: string[] = [];
      const doc = {
        cookie: '',
        location: { protocol },
      };
      Object.defineProperty(doc, 'cookie', {
        get: () => '',
        set: (value: string) => writes.push(value),
      });
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          { provide: DOCUMENT, useValue: doc },
          { provide: PLATFORM_ID, useValue: 'browser' },
        ],
      });
      TestBed.inject(CookieService).set('foo', 'bar', 1);
      return writes[0];
    }

    it('adds Secure when served over HTTPS', () => {
      expect(captureWrite('https:')).toMatch(/SameSite=Lax; Secure/);
    });

    it('omits Secure on plain HTTP (avoids the localhost trap)', () => {
      const write = captureWrite('http:');
      expect(write).toMatch(/SameSite=Lax(;|$)/);
      expect(write).not.toMatch(/Secure/);
    });
  });
});
