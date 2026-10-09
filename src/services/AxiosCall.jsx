import axios from "axios"
import { baseUrl } from "./baseUrl"


export async function AxiosCall(method, endpoint, requestBody, requestHeader, isFormdata) {
    try {
        const requestConfig = {
            method,
            url: `${baseUrl}${endpoint}`,
            data: requestBody
        }
        if (requestHeader) {
            requestConfig.headers = { 'Content-Type': isFormdata ? "multipart/form-data" : "application/json" }
        }

        const response = await axios(requestConfig)
        return response
    } catch (error) {
        return error
    }
}