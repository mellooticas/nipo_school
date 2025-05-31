// hooks/useAulasAvancado.js
// Hooks avançados para funcionalidades futuras do Kanban

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase/supabaseClient'

// Hook para gerenciar materiais de uma aula
export const useAulaMateriais = (aulaId) => {
  const [materiais, setMateriais] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchMateriais = async () => {
    if (!aulaId) return
    
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('aula_materiais')
        .select(`
          *,
          tipo_material:tipos_material(nome, icone)
        `)
        .eq('aula_id', aulaId)
        .order('ordem', { ascending: true })

      if (error) throw error
      setMateriais(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const adicionarMaterial = async (materialData) => {
    try {
      const { data, error } = await supabase
        .from('aula_materiais')
        .insert([{ ...materialData, aula_id: aulaId }])
        .select()
        .single()

      if (error) throw error
      setMateriais(prev => [...prev, data])
      return data
    } catch (err) {
      setError(err.message)
      return null
    }
  }

  const removerMaterial = async (materialId) => {
    try {
      const { error } = await supabase
        .from('aula_materiais')
        .delete()
        .eq('id', materialId)

      if (error) throw error
      setMateriais(prev => prev.filter(m => m.id !== materialId))
      return true
    } catch (err) {
      setError(err.message)
      return false
    }
  }

  useEffect(() => {
    fetchMateriais()
  }, [aulaId])

  return { 
    materiais, 
    loading, 
    error, 
    fetchMateriais, 
    adicionarMaterial, 
    removerMaterial 
  }
}

// Hook para gerenciar responsáveis de uma aula
export const useAulaResponsaveis = (aulaId) => {
  const [responsaveis, setResponsaveis] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchResponsaveis = async () => {
    if (!aulaId) return
    
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('aula_responsaveis')
        .select(`
          *,
          usuario:usuarios(id, nome, email, avatar_url)
        `)
        .eq('aula_id', aulaId)

      if (error) throw error
      setResponsaveis(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const adicionarResponsavel = async (usuarioId, papel = 'professor') => {
    try {
      const { data, error } = await supabase
        .from('aula_responsaveis')
        .insert([{ 
          aula_id: aulaId, 
          usuario_id: usuarioId, 
          papel 
        }])
        .select(`
          *,
          usuario:usuarios(id, nome, email, avatar_url)
        `)
        .single()

      if (error) throw error
      setResponsaveis(prev => [...prev, data])
      return data
    } catch (err) {
      setError(err.message)
      return null
    }
  }

  const removerResponsavel = async (responsavelId) => {
    try {
      const { error } = await supabase
        .from('aula_responsaveis')
        .delete()
        .eq('id', responsavelId)

      if (error) throw error
      setResponsaveis(prev => prev.filter(r => r.id !== responsavelId))
      return true
    } catch (err) {
      setError(err.message)
      return false
    }
  }

  useEffect(() => {
    fetchResponsaveis()
  }, [aulaId])

  return { 
    responsaveis, 
    loading, 
    error, 
    fetchResponsaveis, 
    adicionarResponsavel, 
    removerResponsavel 
  }
}

// Hook para gerenciar checklist de uma aula
export const useAulaChecklist = (aulaId) => {
  const [checklist, setChecklist] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchChecklist = async () => {
    if (!aulaId) return
    
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('aula_checklist')
        .select('*')
        .eq('aula_id', aulaId)
        .order('ordem', { ascending: true })

      if (error) throw error
      setChecklist(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const adicionarItem = async (itemData) => {
    try {
      const { data, error } = await supabase
        .from('aula_checklist')
        .insert([{ ...itemData, aula_id: aulaId }])
        .select()
        .single()

      if (error) throw error
      setChecklist(prev => [...prev, data])
      return data
    } catch (err) {
      setError(err.message)
      return null
    }
  }

  const marcarConcluido = async (itemId, concluido = true) => {
    try {
      const { data, error } = await supabase
        .from('aula_checklist')
        .update({ 
          concluido, 
          concluido_em: concluido ? new Date().toISOString() : null 
        })
        .eq('id', itemId)
        .select()
        .single()

      if (error) throw error
      setChecklist(prev => prev.map(item => 
        item.id === itemId ? data : item
      ))
      return data
    } catch (err) {
      setError(err.message)
      return null
    }
  }

  const removerItem = async (itemId) => {
    try {
      const { error } = await supabase
        .from('aula_checklist')
        .delete()
        .eq('id', itemId)

      if (error) throw error
      setChecklist(prev => prev.filter(item => item.id !== itemId))
      return true
    } catch (err) {
      setError(err.message)
      return false
    }
  }

  useEffect(() => {
    fetchChecklist()
  }, [aulaId])

  return { 
    checklist, 
    loading, 
    error, 
    fetchChecklist, 
    adicionarItem, 
    marcarConcluido, 
    removerItem 
  }
}

// Hook para gerenciar tags de uma aula
export const useAulaTags = (aulaId) => {
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchTags = async () => {
    if (!aulaId) return
    
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('aula_tags')
        .select(`
          *,
          tag:tags(id, nome, cor, categoria)
        `)
        .eq('aula_id', aulaId)

      if (error) throw error
      setTags(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const adicionarTag = async (tagId) => {
    try {
      const { data, error } = await supabase
        .from('aula_tags')
        .insert([{ aula_id: aulaId, tag_id: tagId }])
        .select(`
          *,
          tag:tags(id, nome, cor, categoria)
        `)
        .single()

      if (error) throw error
      setTags(prev => [...prev, data])
      return data
    } catch (err) {
      setError(err.message)
      return null
    }
  }

  const removerTag = async (aulaTagId) => {
    try {
      const { error } = await supabase
        .from('aula_tags')
        .delete()
        .eq('id', aulaTagId)

      if (error) throw error
      setTags(prev => prev.filter(tag => tag.id !== aulaTagId))
      return true
    } catch (err) {
      setError(err.message)
      return false
    }
  }

  useEffect(() => {
    fetchTags()
  }, [aulaId])

  return { 
    tags, 
    loading, 
    error, 
    fetchTags, 
    adicionarTag, 
    removerTag 
  }
}

// Hook para estatísticas do Kanban
export const useKanbanStats = () => {
  const [stats, setStats] = useState({
    totalAulas: 0,
    porStatus: {},
    porModulo: {},
    porNivel: {},
    porFormato: {},
    aulasVencidas: 0,
    aulasProximas: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      
      // Buscar dados básicos
      const { data: aulas, error } = await supabase
        .from('view_aulas_admin')
        .select('*')

      if (error) throw error

      // Calcular estatísticas
      const hoje = new Date()
      const proximosSete = new Date()
      proximosSete.setDate(hoje.getDate() + 7)

      const novasStats = {
        totalAulas: aulas.length,
        porStatus: aulas.reduce((acc, aula) => {
          acc[aula.status] = (acc[aula.status] || 0) + 1
          return acc
        }, {}),
        porModulo: aulas.reduce((acc, aula) => {
          if (aula.nome_modulo) {
            acc[aula.nome_modulo] = (acc[aula.nome_modulo] || 0) + 1
          }
          return acc
        }, {}),
        porNivel: aulas.reduce((acc, aula) => {
          if (aula.nivel) {
            acc[aula.nivel] = (acc[aula.nivel] || 0) + 1
          }
          return acc
        }, {}),
        porFormato: aulas.reduce((acc, aula) => {
          if (aula.formato) {
            acc[aula.formato] = (acc[aula.formato] || 0) + 1
          }
          return acc
        }, {}),
        aulasVencidas: aulas.filter(aula => 
          new Date(aula.data_programada) < hoje && 
          aula.status !== 'Concluída'
        ).length,
        aulasProximas: aulas.filter(aula => 
          new Date(aula.data_programada) >= hoje && 
          new Date(aula.data_programada) <= proximosSete
        ).length
      }

      setStats(novasStats)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return { stats, loading, error, fetchStats }
}

// Hook para drag and drop (funcionalidade futura)
export const useDragAndDrop = () => {
  const [draggedItem, setDraggedItem] = useState(null)
  const [dragOverColumn, setDragOverColumn] = useState(null)

  const handleDragStart = (item) => {
    setDraggedItem(item)
  }

  const handleDragOver = (column) => {
    setDragOverColumn(column)
  }

  const handleDrop = async (targetStatus) => {
    if (!draggedItem || draggedItem.status === targetStatus) {
      setDraggedItem(null)
      setDragOverColumn(null)
      return false
    }

    try {
      const { error } = await supabase
        .from('aulas')
        .update({ 
          status: targetStatus,
          atualizado_em: new Date().toISOString()
        })
        .eq('id', draggedItem.id)

      if (error) throw error

      setDraggedItem(null)
      setDragOverColumn(null)
      return true
    } catch (err) {
      console.error('Erro ao mover aula:', err)
      setDraggedItem(null)
      setDragOverColumn(null)
      return false
    }
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDragOverColumn(null)
  }

  return {
    draggedItem,
    dragOverColumn,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd
  }
} 