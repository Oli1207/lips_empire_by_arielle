import { useState, useEffect } from "react";

const GEO_CACHE_KEY = 'le_geo'
const GEO_TTL = 24 * 60 * 60 * 1000 // 24h

function GetCurrentAddress() {
    const [add, SetAdd] = useState('')

    useEffect(() => {
        try {
            const cached = localStorage.getItem(GEO_CACHE_KEY)
            if (cached) {
                const { data, ts } = JSON.parse(cached)
                if (Date.now() - ts < GEO_TTL) {
                    SetAdd(data)
                    return
                }
            }
        } catch {}

        fetch('https://ipapi.co/json/')
            .then(res => res.json())
            .then(data => {
                const result = {
                    country_code: data.country_code,
                    country: data.country_name,
                    city: data.city,
                }
                try {
                    localStorage.setItem(GEO_CACHE_KEY, JSON.stringify({ data: result, ts: Date.now() }))
                } catch {}
                SetAdd(result)
            })
            .catch(() => {})
    }, [])

    return add
}















export default GetCurrentAddress