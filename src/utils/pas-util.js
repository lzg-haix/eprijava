import axios from 'axios'
export const PAS = axios.create({
  baseURL: 'http://localhost:3002',
  headers: {
    'Content-Type': 'application/json',
  },
})

export const oepas_dev2 = axios.create({
  baseURL: 'http://192.168.61.101:8069/WApp_eVisitor/web/pdo/WApp_eVisitorService',
  headers: {
    'Content-Type': 'application/json',
  },
})
