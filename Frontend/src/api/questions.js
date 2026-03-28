import axios from 'axios'

const api = axios.create({
  baseURL: '/teacher',
})

export const getQuestions = (params) => api.get('/questions', { params })

export const createQuestion = (payload) => api.post('/addQuestion', payload)

export const updateQuestion = (id, payload) => api.put(`/updateQuestion/${id}`, payload)

export const deleteQuestion = (id) => api.delete(`/deleteQuestion/${id}`)
