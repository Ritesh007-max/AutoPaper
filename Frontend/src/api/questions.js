import axios from 'axios'

const api = axios.create({
  baseURL: '/api/teacher',
})

export const getQuestions = (params) => api.get('/questions', { params })

export const getQuestionFilters = () => api.get('/questions/filters')

export const createQuestion = (payload) => api.post('/questions', payload)

export const createQuestionsBulk = (payload) => api.post('/questions/bulk', payload)

export const updateQuestion = (id, payload) => api.put(`/questions/${id}`, payload)

export const patchQuestion = (id, payload) => api.patch(`/questions/${id}`, payload)

export const deleteQuestion = (id) => api.delete(`/questions/${id}`)
