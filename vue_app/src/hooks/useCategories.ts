import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export function useGetCategories() {
    return useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/categories`)
            if (!res.ok) throw new Error('Network response was not ok')
            return res.json()
        }
    })
}

export function useCreateCategory() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (newCategory: { name: string, slug: string }) => {
            const res = await fetch(`${API_URL}/categories`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newCategory)
            })
            if (!res.ok) throw new Error('Failed to create category')
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] })
        }
    })
}
