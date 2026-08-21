import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'

const rawApiUrl = import.meta.env.VITE_API_URL || '';
const API_URL = rawApiUrl
    ? (rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl.replace(/\/$/, '')}/api`)
    : (import.meta.env.DEV ? 'http://localhost:4000/api' : '/api');

export function useGetPosts(categoryId?: string) {
    return useQuery({
        queryKey: ['posts', { categoryId }],
        queryFn: async () => {
            const url = categoryId ? `${API_URL}/posts?category=${categoryId}` : `${API_URL}/posts`
            const res = await fetch(url, { credentials: 'include' })
            if (!res.ok) throw new Error('Network response was not ok')
            return res.json()
        }
    })
}

export function useGetPost(slug: string) {
    return useQuery({
        queryKey: ['post', slug],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/posts/${slug}`, { credentials: 'include' })
            if (!res.ok) throw new Error('Network response was not ok')
            return res.json()
        },
        enabled: !!slug
    })
}

export function useCreatePost() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (newPost: { title: string, slug: string, content: string, categoryId: number, imageUrl?: string, createdAt?: string }) => {
            const res = await fetch(`${API_URL}/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(newPost)
            })
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}))
                throw new Error(errData.error || 'Failed to create post')
            }
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] })
        }
    })
}

export function useUpdatePost() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, post }: { id: number, post: { title: string, slug: string, content: string, categoryId: number, imageUrl?: string, createdAt?: string } }) => {
            const res = await fetch(`${API_URL}/posts/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(post)
            })
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}))
                throw new Error(errData.error || 'Failed to update post')
            }
            return res.json()
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['posts'] })
            queryClient.invalidateQueries({ queryKey: ['post', data.slug] })
        }
    })
}

export function useDeletePost() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch(`${API_URL}/posts/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            })
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}))
                throw new Error(errData.error || 'Failed to delete post')
            }
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] })
        }
    })
}
