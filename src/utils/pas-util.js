import axios from 'axios'
export const PAS = axios.create({
  baseURL: 'http://172.17.2.216:3002',
  headers: {
    'Content-Type': 'application/json',
  },
})
