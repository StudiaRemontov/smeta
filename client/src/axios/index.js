import Axios from 'axios'

const baseURL = import.meta.env.VITE_BASE_URL

const axios = Axios.create({
  baseURL,
})

export default axios
