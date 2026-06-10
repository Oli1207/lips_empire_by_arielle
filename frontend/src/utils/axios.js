import axios from 'axios';

const apiInstance = axios.create({
    baseURL: 'https://backend.lipsempirebyarielle.store/api/v1/',
    timeout:30000,

    headers: {
        'Content-Type':'multipart/form-data',
        Accept: 'application/json',
    }
})

export default apiInstance
















