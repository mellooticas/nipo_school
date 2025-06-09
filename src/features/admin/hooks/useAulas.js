// hooks/useAulas.js
import { useState, useEffect } from 'react'
import { supabase } from '../../../shared/lib/supabase/supabaseClient'

export const useAulas = () => {
  const [aulas, setAulas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAulas = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('view_aulas_admin')
        .select('*')
        .order('numero', { ascending: true })

      if (error) throw error
      setAulas(data || [])
    } catch (err) {
      setError(err.message)
      console.error('Erro ao buscar aulas:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateAulaStatus = async (aulaId, novoStatus) => {
    try {
      const { error } = await supabase
        .from('aulas')
        .update({ status: novoStatus })
        .eq('id', aulaId)

      if (error) throw error
      
      // Atualiza o estado local
      setAulas(prev => prev.map(aula => 
        aula.id === aulaId ? { ...aula, status: novoStatus } : aula
      ))
      
      return true
    } catch (err) {
      setError(err.message)
      return false
    }
  }

  useEffect(() => {
    fetchAulas()
  }, [])

  return { aulas, loading, error, fetchAulas, updateAulaStatus }
} 