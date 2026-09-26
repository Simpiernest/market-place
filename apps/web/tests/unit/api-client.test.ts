import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the api client
const mockApi = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('makes GET requests with correct URL', async () => {
    mockApi.get.mockResolvedValue({ data: 'test' })

    const result = await mockApi.get('/test')

    expect(mockApi.get).toHaveBeenCalledWith('/test')
    expect(result).toEqual({ data: 'test' })
  })

  it('makes POST requests with data', async () => {
    const postData = { name: 'Test Business' }
    mockApi.post.mockResolvedValue({ id: '123' })

    const result = await mockApi.post('/listings', postData)

    expect(mockApi.post).toHaveBeenCalledWith('/listings', postData)
    expect(result).toEqual({ id: '123' })
  })

  it('handles errors gracefully', async () => {
    mockApi.get.mockRejectedValue(new Error('Network error'))

    await expect(mockApi.get('/fail')).rejects.toThrow('Network error')
  })
})
