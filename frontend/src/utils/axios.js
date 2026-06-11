import axios from 'axios';

const apiInstance = axios.create({
    baseURL: 'https://backend.lipsempirebyarielle.store/api/v1/',
    timeout: 30000,
    headers: {
        Accept: 'application/json',
    }
})

export default apiInstance
