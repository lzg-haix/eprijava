import axios from 'axios'

// json-server
// export const PAS = axios.create({
//   baseURL: 'http://localhost:3002',
//   headers: {
//     'Content-Type': 'application/json',
//   },
// })

// oepas_dev2 - dev-inpos
// export const PAS = axios.create({
//   baseURL: 'http://192.168.61.101:8080/ePrijava/web/pdo/ePrijavaService',
//   headers: {
//     'Content-Type': 'application/json',
//   },
// })

// oepas_test - dev-inpos
export const PAS = axios.create({
  baseURL: 'http://192.168.61.101:8081/ePrijava/web/pdo/ePrijavaService',
  headers: {
    'Content-Type': 'application/json',
  },
})
