export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          dob: string | null
          instrument: string | null
          voted_logo: string | null
          has_voted: boolean | null
          avatar_url: string | null
          church_name: string | null
          user_level: string | null
          total_points: number | null
          bio: string | null
          phone: string | null
          city: string | null
          state: string | null
          joined_at: string | null
          last_active: string | null
          current_streak: number | null
          best_streak: number | null
          lessons_completed: number | null
          modules_completed: number | null
          theme_preference: string | null
          notification_enabled: boolean | null
          sound_enabled: boolean | null
          tipo_usuario: string | null
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          dob?: string | null
          instrument?: string | null
          voted_logo?: string | null
          has_voted?: boolean | null
          avatar_url?: string | null
          church_name?: string | null
          user_level?: string | null
          total_points?: number | null
          bio?: string | null
          phone?: string | null
          city?: string | null
          state?: string | null
          joined_at?: string | null
          last_active?: string | null
          current_streak?: number | null
          best_streak?: number | null
          lessons_completed?: number | null
          modules_completed?: number | null
          theme_preference?: string | null
          notification_enabled?: boolean | null
          sound_enabled?: boolean | null
          tipo_usuario?: string | null
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          dob?: string | null
          instrument?: string | null
          voted_logo?: string | null
          has_voted?: boolean | null
          avatar_url?: string | null
          church_name?: string | null
          user_level?: string | null
          total_points?: number | null
          bio?: string | null
          phone?: string | null
          city?: string | null
          state?: string | null
          joined_at?: string | null
          last_active?: string | null
          current_streak?: number | null
          best_streak?: number | null
          lessons_completed?: number | null
          modules_completed?: number | null
          theme_preference?: string | null
          notification_enabled?: boolean | null
          sound_enabled?: boolean | null
          tipo_usuario?: string | null
        }
      }
      alunos: {
        Row: {
          id: string
          user_id: string | null
          full_name: string | null
          email: string | null
          phone: string | null
          whatsapp: string | null
          data_nascimento: string | null
          instrumento_interesse: string | null
          nivel_experiencia: string | null
          disponibilidade: string | null
          objetivos: string | null
          como_conheceu: string | null
          observacoes: string | null
          status: string | null
          data_cadastro: string | null
          data_atualizacao: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          full_name?: string | null
          email?: string | null
          phone?: string | null
          whatsapp?: string | null
          data_nascimento?: string | null
          instrumento_interesse?: string | null
          nivel_experiencia?: string | null
          disponibilidade?: string | null
          objetivos?: string | null
          como_conheceu?: string | null
          observacoes?: string | null
          status?: string | null
          data_cadastro?: string | null
          data_atualizacao?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          full_name?: string | null
          email?: string | null
          phone?: string | null
          whatsapp?: string | null
          data_nascimento?: string | null
          instrumento_interesse?: string | null
          nivel_experiencia?: string | null
          disponibilidade?: string | null
          objetivos?: string | null
          como_conheceu?: string | null
          observacoes?: string | null
          status?: string | null
          data_cadastro?: string | null
          data_atualizacao?: string | null
        }
      }
      professores: {
        Row: {
          id: string
          user_id: string | null
          nome_completo: string | null
          email: string | null
          telefone: string | null
          whatsapp: string | null
          data_nascimento: string | null
          experiencia_anos: number | null
          instrumentos: string[] | null
          especializacoes: string[] | null
          biografia: string | null
          formacao_musical: string | null
          certificacoes: string[] | null
          disponibilidade: Json | null
          preco_hora_aula: number | null
          aceita_iniciantes: boolean | null
          ensina_online: boolean | null
          ensina_presencial: boolean | null
          local_aulas: string | null
          portfolio_url: string | null
          video_apresentacao: string | null
          status: string | null
          avaliacao_media: number | null
          total_avaliacoes: number | null
          total_alunos: number | null
          data_cadastro: string | null
          data_atualizacao: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          nome_completo?: string | null
          email?: string | null
          telefone?: string | null
          whatsapp?: string | null
          data_nascimento?: string | null
          experiencia_anos?: number | null
          instrumentos?: string[] | null
          especializacoes?: string[] | null
          biografia?: string | null
          formacao_musical?: string | null
          certificacoes?: string[] | null
          disponibilidade?: Json | null
          preco_hora_aula?: number | null
          aceita_iniciantes?: boolean | null
          ensina_online?: boolean | null
          ensina_presencial?: boolean | null
          local_aulas?: string | null
          portfolio_url?: string | null
          video_apresentacao?: string | null
          status?: string | null
          avaliacao_media?: number | null
          total_avaliacoes?: number | null
          total_alunos?: number | null
          data_cadastro?: string | null
          data_atualizacao?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          nome_completo?: string | null
          email?: string | null
          telefone?: string | null
          whatsapp?: string | null
          data_nascimento?: string | null
          experiencia_anos?: number | null
          instrumentos?: string[] | null
          especializacoes?: string[] | null
          biografia?: string | null
          formacao_musical?: string | null
          certificacoes?: string[] | null
          disponibilidade?: Json | null
          preco_hora_aula?: number | null
          aceita_iniciantes?: boolean | null
          ensina_online?: boolean | null
          ensina_presencial?: boolean | null
          local_aulas?: string | null
          portfolio_url?: string | null
          video_apresentacao?: string | null
          status?: string | null
          avaliacao_media?: number | null
          total_avaliacoes?: number | null
          total_alunos?: number | null
          data_cadastro?: string | null
          data_atualizacao?: string | null
        }
      }
      professores_conteudos: {
        Row: {
          id: string
          professor_id: string | null
          titulo: string
          descricao: string | null
          tipo_conteudo: string | null
          instrumento: string | null
          nivel: string | null
          duracao_estimada: number | null
          arquivo_url: string | null
          thumbnail_url: string | null
          tags: string[] | null
          eh_gratuito: boolean | null
          preco: number | null
          total_downloads: number | null
          total_visualizacoes: number | null
          avaliacao_media: number | null
          total_avaliacoes: number | null
          status: string | null
          data_criacao: string | null
          data_atualizacao: string | null
        }
        Insert: {
          id?: string
          professor_id?: string | null
          titulo: string
          descricao?: string | null
          tipo_conteudo?: string | null
          instrumento?: string | null
          nivel?: string | null
          duracao_estimada?: number | null
          arquivo_url?: string | null
          thumbnail_url?: string | null
          tags?: string[] | null
          eh_gratuito?: boolean | null
          preco?: number | null
          total_downloads?: number | null
          total_visualizacoes?: number | null
          avaliacao_media?: number | null
          total_avaliacoes?: number | null
          status?: string | null
          data_criacao?: string | null
          data_atualizacao?: string | null
        }
        Update: {
          id?: string
          professor_id?: string | null
          titulo?: string
          descricao?: string | null
          tipo_conteudo?: string | null
          instrumento?: string | null
          nivel?: string | null
          duracao_estimada?: number | null
          arquivo_url?: string | null
          thumbnail_url?: string | null
          tags?: string[] | null
          eh_gratuito?: boolean | null
          preco?: number | null
          total_downloads?: number | null
          total_visualizacoes?: number | null
          avaliacao_media?: number | null
          total_avaliacoes?: number | null
          status?: string | null
          data_criacao?: string | null
          data_atualizacao?: string | null
        }
      }
      modules: {
        Row: {
          id: string
          title: string
          description: string | null
          slug: string | null
          thumbnail_url: string | null
          level_required: string | null
          instrument_category: string | null
          duration_hours: number | null
          lessons_count: number | null
          order_index: number | null
          is_active: boolean | null
          is_premium: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          slug?: string | null
          thumbnail_url?: string | null
          level_required?: string | null
          instrument_category?: string | null
          duration_hours?: number | null
          lessons_count?: number | null
          order_index?: number | null
          is_active?: boolean | null
          is_premium?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          slug?: string | null
          thumbnail_url?: string | null
          level_required?: string | null
          instrument_category?: string | null
          duration_hours?: number | null
          lessons_count?: number | null
          order_index?: number | null
          is_active?: boolean | null
          is_premium?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      lessons: {
        Row: {
          id: string
          module_id: string | null
          title: string
          description: string | null
          slug: string | null
          video_url: string | null
          video_duration_seconds: number | null
          thumbnail_url: string | null
          order_index: number | null
          is_free: boolean | null
          has_exercise: boolean | null
          pdf_materials: Json | null
          audio_files: Json | null
          tags: string[] | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          module_id?: string | null
          title: string
          description?: string | null
          slug?: string | null
          video_url?: string | null
          video_duration_seconds?: number | null
          thumbnail_url?: string | null
          order_index?: number | null
          is_free?: boolean | null
          has_exercise?: boolean | null
          pdf_materials?: Json | null
          audio_files?: Json | null
          tags?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          module_id?: string | null
          title?: string
          description?: string | null
          slug?: string | null
          video_url?: string | null
          video_duration_seconds?: number | null
          thumbnail_url?: string | null
          order_index?: number | null
          is_free?: boolean | null
          has_exercise?: boolean | null
          pdf_materials?: Json | null
          audio_files?: Json | null
          tags?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      user_progress: {
        Row: {
          id: string
          user_id: string | null
          lesson_id: string | null
          started_at: string | null
          completed_at: string | null
          watch_time_seconds: number | null
          is_completed: boolean | null
          notes: string | null
          rating: number | null
          last_position_seconds: number | null
          attempts_count: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          lesson_id?: string | null
          started_at?: string | null
          completed_at?: string | null
          watch_time_seconds?: number | null
          is_completed?: boolean | null
          notes?: string | null
          rating?: number | null
          last_position_seconds?: number | null
          attempts_count?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          lesson_id?: string | null
          started_at?: string | null
          completed_at?: string | null
          watch_time_seconds?: number | null
          is_completed?: boolean | null
          notes?: string | null
          rating?: number | null
          last_position_seconds?: number | null
          attempts_count?: number | null
          created_at?: string | null
        }
      }
      achievements: {
        Row: {
          id: string
          name: string
          description: string | null
          badge_icon: string | null
          badge_color: string | null
          points_reward: number | null
          category: string | null
          requirement_type: string | null
          requirement_value: number | null
          is_active: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          badge_icon?: string | null
          badge_color?: string | null
          points_reward?: number | null
          category?: string | null
          requirement_type?: string | null
          requirement_value?: number | null
          is_active?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          badge_icon?: string | null
          badge_color?: string | null
          points_reward?: number | null
          category?: string | null
          requirement_type?: string | null
          requirement_value?: number | null
          is_active?: boolean | null
          created_at?: string | null
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string | null
          achievement_id: string | null
          earned_at: string | null
          points_earned: number | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          achievement_id?: string | null
          earned_at?: string | null
          points_earned?: number | null
        }
        Update: {
          id?: string
          user_id?: string | null
          achievement_id?: string | null
          earned_at?: string | null
          points_earned?: number | null
        }
      }
      devotional_content: {
        Row: {
          id: string
          title: string
          content: string
          bible_verse: string | null
          bible_reference: string | null
          author: string | null
          category: string | null
          featured_image_url: string | null
          published_date: string | null
          is_published: boolean | null
          view_count: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          title: string
          content: string
          bible_verse?: string | null
          bible_reference?: string | null
          author?: string | null
          category?: string | null
          featured_image_url?: string | null
          published_date?: string | null
          is_published?: boolean | null
          view_count?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          content?: string
          bible_verse?: string | null
          bible_reference?: string | null
          author?: string | null
          category?: string | null
          featured_image_url?: string | null
          published_date?: string | null
          is_published?: boolean | null
          view_count?: number | null
          created_at?: string | null
        }
      }
      user_devotional_progress: {
        Row: {
          id: string
          user_id: string | null
          devotional_id: string | null
          read_at: string | null
          is_favorite: boolean | null
          personal_notes: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          devotional_id?: string | null
          read_at?: string | null
          is_favorite?: boolean | null
          personal_notes?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          devotional_id?: string | null
          read_at?: string | null
          is_favorite?: boolean | null
          personal_notes?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types para facilitar o uso
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Types específicos para usar nos components
export type Profile = Tables<'profiles'>
export type Aluno = Tables<'alunos'>
export type Professor = Tables<'professores'>
export type ProfessorConteudo = Tables<'professores_conteudos'>
export type Module = Tables<'modules'>
export type Lesson = Tables<'lessons'>
export type UserProgress = Tables<'user_progress'>
export type Achievement = Tables<'achievements'> 
export type UserAchievement = Tables<'user_achievements'>
export type DevotionalContent = Tables<'devotional_content'>
export type UserDevotionalProgress = Tables<'user_devotional_progress'> 