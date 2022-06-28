import axios from 'axios'

export const downloadFile = async (filename, downloadName) => {
  try {
    const apiUrl = import.meta.env.VITE_BASE_URL
    const urlParts = apiUrl.split('/')
    urlParts.pop()
    const serverDomain = urlParts.join('/')
    const response = await axios.get(`${serverDomain}/pdf/${filename}.pdf`, {
      responseType: 'blob',
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${downloadName}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    return Promise.resolve()
  } catch (error) {
    return Promise.reject(error)
  }
}
