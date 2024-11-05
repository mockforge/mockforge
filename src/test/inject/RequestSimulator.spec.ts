import { beforeEach, describe, expect, it } from 'vitest';
import { RequestSimulator } from '../../inject/RequestSimulator';
import { IMockForgeState, MockAPI } from '../../sdk/common/types';
import { createMockForgeServer } from '../../server/node/server';
import { TestBrowserMockForgeEventListener } from '../server/browser/test';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { nanoid } from 'nanoid';
import { afterEach } from 'node:test';

describe('RequestSimulator', () => {
  let requestSimulator: RequestSimulator;

  const mockApiList: MockAPI[] = [
    {
      type: 'http',
      name: 'bookmark',
      pathname: '/api/v1/bookmark/[id]',
      method: 'GET',
      mockResponses: [
        {
          name: 'one',
          $schema: 'http_response_v1',
          schema: 'http_response_v1',
          requestMatcher: {
            type: 'basic-match',
            content: {
              params: { id: '1' },
            },
          },
          responseData: {
            type: 'json',
            content: {
              title: '1',
            },
          },
        },
      ],
    },
    {
      type: 'http',
      name: 'post bookmark',
      pathname: '/api/v1/bookmark',
      method: 'POST',
      mockResponses: [
        {
          name: 'one',
          $schema: 'http_response_v1',
          schema: 'http_response_v1',
          requestMatcher: {
            type: 'basic-match',
            content: {
              body: { id: ['1'] },
            },
          },
          responseData: {
            type: 'json',
            content: {
              title: '1',
            },
          },
        },
      ],
    },
    {
      type: 'http',
      name: 'post form',
      pathname: '/api/v1/form',
      method: 'POST',
      mockResponses: [
        {
          name: 'one',
          $schema: 'http_response_v1',
          schema: 'http_response_v1',
          requestMatcher: {
            type: 'basic-match',
            content: {
              body: { form: 'true' },
            },
          },
          responseData: {
            type: 'json',
            content: {
              title: '1',
            },
          },
        },
      ],
    },
    {
      type: 'http',
      name: 'login',
      pathname: '/api/v1/login',
      method: 'POST',
      mockResponses: [
        {
          name: 'one',
          $schema: 'http_response_v1',
          schema: 'http_response_v1',
          requestMatcher: null,
          responseData: {
            type: 'json',
            content: {},
          },
        },
      ],
    },
  ];

  const mockState: IMockForgeState = {
    http: [
      {
        method: 'GET',
        pathname: '/api/v1/bookmark/[id]',
        activeMockResponses: ['one'],
      },
      {
        method: 'POST',
        pathname: '/api/v1/bookmark',
        activeMockResponses: ['one'],
      },
      {
        method: 'POST',
        pathname: '/api/v1/login',
        activeMockResponses: ['one'],
      },
      {
        method: 'POST',
        pathname: '/api/v1/form',
        activeMockResponses: ['one'],
      },
    ],
  };

  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'mock-forge-sdk-test-'));
    const port = await createMockForgeServer({
      baseDir: tempDir,
    });
    const serverURL = 'http://localhost:' + port;
    const service = new TestBrowserMockForgeEventListener('http://localhost:' + port, nanoid());
    await service.connect();
    requestSimulator = new RequestSimulator('http://localhost', serverURL, service);
    requestSimulator.setApiList(mockApiList);
    requestSimulator.setState(mockState);
  });
  afterEach(async () => {
    if (tempDir.includes('mock-forge-sdk-test-')) {
      await fs.rm(tempDir, { recursive: true });
    }
  });

  it('should handle GET request with params correctly', async () => {
    const response = await requestSimulator.handleSimulatedRequest({
      method: 'GET',
      url: 'api/v1/bookmark/1',
    });
    expect(response).toEqual({ status: 200, body: '{"title":"1"}' });
  });

  it('should handle GET request with params correctly', async () => {
    const response = await requestSimulator.handleSimulatedRequest({
      method: 'GET',
      url: 'api/v1/bookmark/2',
    });
    expect(response).toEqual(null);
  });

  it('should handle POST request correctly', async () => {
    const response = await requestSimulator.handleSimulatedRequest({
      method: 'POST',
      url: '/api/v1/login',
    });

    expect(response).toEqual({ status: 200, body: '{}' });
  });

  it('should return null for non-matching URL', async () => {
    const response = await requestSimulator.handleSimulatedRequest({
      method: 'GET',
      url: '/api/v1/non-existent',
    });

    expect(response).toBeNull();
  });

  it('should return null for non-matching method', async () => {
    const response = await requestSimulator.handleSimulatedRequest({
      method: 'PUT',
      url: '/api/v1/bookmark/1',
    });

    expect(response).toBeNull();
  });

  it('should return null for non-matching params', async () => {
    const response = await requestSimulator.handleSimulatedRequest({
      method: 'GET',
      url: '/api/v1/bookmark/2',
    });

    expect(response).toBeNull();
  });

  it('should handle request with headers', async () => {
    const response = await requestSimulator.handleSimulatedRequest({
      method: 'GET',
      url: '/api/v1/bookmark/1',
      headers: { 'Content-Type': 'application/json' },
    });

    expect(response).toEqual({ status: 200, body: '{"title":"1"}' });
  });

  it('should handle request with body', async () => {
    const response = await requestSimulator.handleSimulatedRequest({
      method: 'POST',
      url: '/api/v1/login',
      body: JSON.stringify({ username: 'test', password: 'password' }),
    });

    expect(response).toEqual({ status: 200, body: '{}' });
  });

  it('should return null when no URL is provided', async () => {
    const response = await requestSimulator.handleSimulatedRequest({
      method: 'GET',
    });
    expect(response).toBeNull();
  });

  it('should return null when body match', async () => {
    const response = await requestSimulator.handleSimulatedRequest({
      method: 'POST',
      url: '/api/v1/bookmark',
      body: JSON.stringify({ id: ['1'] }),
    });
    expect(response).not.toBeNull();
  });

  it('should return null when body match', async () => {
    const fd = new FormData();
    fd.set('form', true);
    const response = await requestSimulator.handleSimulatedRequest({
      method: 'POST',
      url: '/api/v1/form',
      body: fd,
    });
    expect(response).not.toBeNull();
  });
});
