import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useTagStore } from '../tag-store'

const mockInvoke = vi.fn()

vi.mock('@/lib/api', () => ({
  apiInvoke: (...args: unknown[]) => mockInvoke(...args),
}))

describe('useTagStore', () => {
  beforeEach(() => {
    useTagStore.setState({
      tags: [],
      isLoading: false,
      error: null,
    })
    vi.clearAllMocks()
  })

  it('dedupes input IDs in fetchForSubscriptions before invoking batch API', async () => {
    mockInvoke.mockResolvedValue([
      { subscription_id: 'sub-1', tag_id: 'tag-1' },
      { subscription_id: 'sub-2', tag_id: 'tag-2' },
    ])

    const result = await useTagStore.getState().fetchForSubscriptions(['sub-1', 'sub-2', 'sub-1'])

    expect(mockInvoke).toHaveBeenCalledWith('list_subscription_tags_batch', {
      subscriptionIds: ['sub-1', 'sub-2'],
    })
    expect(result).toEqual({
      'sub-1': ['tag-1'],
      'sub-2': ['tag-2'],
    })
  })
})
