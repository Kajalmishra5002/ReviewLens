import { useEffect, useState } from 'react'
import api from '../api/axios'
import ProductCard from './ProductCard'

export default function Recommendations() {
  const [recs, setRecs] = useState([])

  useEffect(() => {
    const userId = localStorage.getItem('userId')
    if (!userId) return
    api.get(`/recommendations/${userId}`)
      .then(res => setRecs(res.data.recommendations || []))
      .catch(() => {})
  }, [])

  if (!recs.length) return null
  return (
    <div className="mb-10">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Recommended for You</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {recs.slice(0, 4).map(p => <ProductCard key={p._id} product={p} />)}
      </div>
    </div>
  )
}