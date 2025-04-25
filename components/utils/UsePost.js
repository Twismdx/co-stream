import { useState, useEffect } from 'react'

const usePost = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [response, setResponse] = useState(null)

    const postData = async (url, payload) => {
        try {
            setIsLoading(true)
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })

            if (!response.ok) {
                throw new Error('Failed to post data')
            }

            const responseData = await response.json()
            setData(responseData)
        } catch (err) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    return { isLoading, error, response, postData }
}

export default usePost