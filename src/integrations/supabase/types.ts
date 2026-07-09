export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          content: string
          created_at: string
          created_by_user_id: string
          id: string
          is_published: boolean
          published_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by_user_id: string
          id?: string
          is_published?: boolean
          published_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by_user_id?: string
          id?: string
          is_published?: boolean
          published_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      applications: {
        Row: {
          application_type: string
          created_at: string
          desired_position: string | null
          email: string
          id: string
          message: string
          name: string
          organization_school: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          application_type: string
          created_at?: string
          desired_position?: string | null
          email: string
          id?: string
          message: string
          name: string
          organization_school: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          application_type?: string
          created_at?: string
          desired_position?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          organization_school?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      check_in_sessions: {
        Row: {
          created_at: string
          created_by_user_id: string
          ended_at: string | null
          id: string
          is_active: boolean
          started_at: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by_user_id: string
          ended_at?: string | null
          id?: string
          is_active?: boolean
          started_at?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by_user_id?: string
          ended_at?: string | null
          id?: string
          is_active?: boolean
          started_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      check_ins: {
        Row: {
          checked_in_at: string
          created_at: string
          id: string
          participant_email: string
          participant_name: string
          participant_type: string
          session_id: string
        }
        Insert: {
          checked_in_at?: string
          created_at?: string
          id?: string
          participant_email: string
          participant_name: string
          participant_type: string
          session_id: string
        }
        Update: {
          checked_in_at?: string
          created_at?: string
          id?: string
          participant_email?: string
          participant_name?: string
          participant_type?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "check_ins_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "check_in_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      debate_lessons: {
        Row: {
          created_at: string
          created_by_user_id: string
          description: string | null
          id: string
          is_published: boolean
          text_path: string | null
          title: string
          updated_at: string
          video_path: string | null
          youtube_url: string | null
        }
        Insert: {
          created_at?: string
          created_by_user_id: string
          description?: string | null
          id?: string
          is_published?: boolean
          text_path?: string | null
          title: string
          updated_at?: string
          video_path?: string | null
          youtube_url?: string | null
        }
        Update: {
          created_at?: string
          created_by_user_id?: string
          description?: string | null
          id?: string
          is_published?: boolean
          text_path?: string | null
          title?: string
          updated_at?: string
          video_path?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          audio_url: string | null
          comments_count: number | null
          content: string
          created_at: string
          id: string
          likes_count: number | null
          post_type: string
          quoted_post_id: string | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
          video_url: string | null
        }
        Insert: {
          audio_url?: string | null
          comments_count?: number | null
          content: string
          created_at?: string
          id?: string
          likes_count?: number | null
          post_type: string
          quoted_post_id?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
          video_url?: string | null
        }
        Update: {
          audio_url?: string | null
          comments_count?: number | null
          content?: string
          created_at?: string
          id?: string
          likes_count?: number | null
          post_type?: string
          quoted_post_id?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_quoted_post_id_fkey"
            columns: ["quoted_post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_matches: {
        Row: {
          created_at: string
          creator_user_id: string
          difficulty: string
          end_time: string | null
          id: string
          opp_speakers: string[] | null
          opponent_user_id: string | null
          prop_speakers: string[] | null
          recording_url: string | null
          result: string | null
          start_time: string | null
          status: string
          timer_duration_seconds: number | null
          timer_is_running: boolean | null
          timer_remaining_seconds: number | null
          timer_updated_at: string | null
          topic_id: string | null
          topic_title: string
          updated_at: string
          winner_user_id: string | null
        }
        Insert: {
          created_at?: string
          creator_user_id: string
          difficulty?: string
          end_time?: string | null
          id?: string
          opp_speakers?: string[] | null
          opponent_user_id?: string | null
          prop_speakers?: string[] | null
          recording_url?: string | null
          result?: string | null
          start_time?: string | null
          status?: string
          timer_duration_seconds?: number | null
          timer_is_running?: boolean | null
          timer_remaining_seconds?: number | null
          timer_updated_at?: string | null
          topic_id?: string | null
          topic_title: string
          updated_at?: string
          winner_user_id?: string | null
        }
        Update: {
          created_at?: string
          creator_user_id?: string
          difficulty?: string
          end_time?: string | null
          id?: string
          opp_speakers?: string[] | null
          opponent_user_id?: string | null
          prop_speakers?: string[] | null
          recording_url?: string | null
          result?: string | null
          start_time?: string | null
          status?: string
          timer_duration_seconds?: number | null
          timer_is_running?: boolean | null
          timer_remaining_seconds?: number | null
          timer_updated_at?: string | null
          topic_id?: string | null
          topic_title?: string
          updated_at?: string
          winner_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "practice_matches_creator_user_id_fkey"
            columns: ["creator_user_id"]
            isOneToOne: false
            referencedRelation: "global_rankings"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "practice_matches_creator_user_id_fkey"
            columns: ["creator_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "practice_matches_opponent_user_id_fkey"
            columns: ["opponent_user_id"]
            isOneToOne: false
            referencedRelation: "global_rankings"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "practice_matches_opponent_user_id_fkey"
            columns: ["opponent_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "practice_matches_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practice_matches_winner_user_id_fkey"
            columns: ["winner_user_id"]
            isOneToOne: false
            referencedRelation: "global_rankings"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "practice_matches_winner_user_id_fkey"
            columns: ["winner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      practice_sessions: {
        Row: {
          completed: boolean | null
          created_at: string
          duration_seconds: number
          feedback: string | null
          format: string
          id: string
          score: number | null
          session_type: string | null
          topic: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string
          duration_seconds: number
          feedback?: string | null
          format: string
          id?: string
          score?: number | null
          session_type?: string | null
          topic: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string
          duration_seconds?: number
          feedback?: string | null
          format?: string
          id?: string
          score?: number | null
          session_type?: string | null
          topic?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          current_streak: number
          display_name: string | null
          id: string
          last_practice_date: string | null
          longest_streak: number
          losses: number | null
          rating: number | null
          skill_level: string | null
          total_practice_time: number | null
          total_sessions: number | null
          updated_at: string
          user_id: string
          username: string | null
          wins: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          current_streak?: number
          display_name?: string | null
          id?: string
          last_practice_date?: string | null
          longest_streak?: number
          losses?: number | null
          rating?: number | null
          skill_level?: string | null
          total_practice_time?: number | null
          total_sessions?: number | null
          updated_at?: string
          user_id: string
          username?: string | null
          wins?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          current_streak?: number
          display_name?: string | null
          id?: string
          last_practice_date?: string | null
          longest_streak?: number
          losses?: number | null
          rating?: number | null
          skill_level?: string | null
          total_practice_time?: number | null
          total_sessions?: number | null
          updated_at?: string
          user_id?: string
          username?: string | null
          wins?: number | null
        }
        Relationships: []
      }
      topics: {
        Row: {
          category: string
          created_at: string
          created_by_user_id: string | null
          description: string
          difficulty: string
          id: string
          is_custom: boolean
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by_user_id?: string | null
          description: string
          difficulty?: string
          id?: string
          is_custom?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by_user_id?: string | null
          description?: string
          difficulty?: string
          id?: string
          is_custom?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      tournament_announcements: {
        Row: {
          content: string
          created_at: string
          created_by_user_id: string
          file_attachments: Json | null
          id: string
          target_individual_email: string | null
          target_team_name: string | null
          target_type: string
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by_user_id: string
          file_attachments?: Json | null
          id?: string
          target_individual_email?: string | null
          target_team_name?: string | null
          target_type: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by_user_id?: string
          file_attachments?: Json | null
          id?: string
          target_individual_email?: string | null
          target_team_name?: string | null
          target_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      tournament_debaters: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          partner_email: string
          partner_name: string
          privacy_accepted: boolean
          school: string
          team_name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          partner_email: string
          partner_name: string
          privacy_accepted?: boolean
          school: string
          team_name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          partner_email?: string
          partner_name?: string
          privacy_accepted?: boolean
          school?: string
          team_name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      tournament_judges: {
        Row: {
          created_at: string
          debate_experience: string
          email: string
          id: string
          judge_experience: string
          name: string
          privacy_accepted: boolean
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          debate_experience: string
          email: string
          id?: string
          judge_experience: string
          name: string
          privacy_accepted?: boolean
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          debate_experience?: string
          email?: string
          id?: string
          judge_experience?: string
          name?: string
          privacy_accepted?: boolean
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      tournament_matches: {
        Row: {
          created_at: string
          id: string
          opp_team_name: string
          prop_team_name: string
          round_id: string
          updated_at: string
          winner_team: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          opp_team_name: string
          prop_team_name: string
          round_id: string
          updated_at?: string
          winner_team?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          opp_team_name?: string
          prop_team_name?: string
          round_id?: string
          updated_at?: string
          winner_team?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tournament_matches_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "tournament_rounds"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_rounds: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          round_name: string
          round_number: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          round_name: string
          round_number: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          round_name?: string
          round_number?: number
          updated_at?: string
        }
        Relationships: []
      }
      tournament_settings: {
        Row: {
          created_at: string
          id: string
          registration_open: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          registration_open?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          registration_open?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      tournament_speaker_scores: {
        Row: {
          created_at: string
          id: string
          match_id: string
          speaker_name: string
          speaker_score: number
          team_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_id: string
          speaker_name: string
          speaker_score?: number
          team_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          match_id?: string
          speaker_name?: string
          speaker_score?: number
          team_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_speaker_scores_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "tournament_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      global_rankings: {
        Row: {
          avatar_url: string | null
          display_name: string | null
          id: string | null
          losses: number | null
          rank: number | null
          rating: number | null
          total_practice_time: number | null
          total_sessions: number | null
          user_id: string | null
          username: string | null
          win_rate: number | null
          wins: number | null
        }
        Relationships: []
      }
      tournament_individual_leaderboard: {
        Row: {
          avg_score: number | null
          individual_rank: number | null
          rounds_spoken: number | null
          speaker_name: string | null
          team_name: string | null
        }
        Relationships: []
      }
      tournament_team_leaderboard: {
        Row: {
          avg_team_score: number | null
          captain_name: string | null
          losses: number | null
          partner_name: string | null
          team_name: string | null
          team_rank: number | null
          wins: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_total_sessions_for_participants: {
        Args: { participant_user_ids: string[] }
        Returns: undefined
      }
      increment_user_losses: { Args: { user_id: string }; Returns: undefined }
      increment_user_wins: { Args: { user_id: string }; Returns: undefined }
      record_practice_and_streak: {
        Args: {
          p_completed?: boolean
          p_duration_seconds: number
          p_format: string
          p_practice_date: string
          p_score?: number | null
          p_session_type?: string
          p_topic: string
        }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "tournament_admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user", "tournament_admin"],
    },
  },
} as const
