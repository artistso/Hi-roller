package com.highroller.network

/**
 * Thin wrapper around gotrue-kt / postgrest-kt.
 * Fill SUPABASE_URL and SUPABASE_ANON_KEY from your project, then uncomment the
 * Gradle dependencies in app/build.gradle.
 */
object SupabaseClient {
    const val URL = "https://YOUR_PROJECT.supabase.co"
    const val ANON_KEY = "YOUR_ANON_KEY"

    var userId: String? = null
    var accessToken: String? = null

    suspend fun signInEmail(email: String, password: String): Boolean {
        // Plug gotrue-kt here.
        return false
    }

    suspend fun fetchProfile(): Map<String, Any?> = emptyMap()

    suspend fun uploadMatch(payload: Map<String, Any?>) {
        // POST /rest/v1/match_history
    }

    suspend fun matchmake(): Pair<String, String>? {
        // Edge Function /matchmake → (colyseusUrl, roomToken)
        return null
    }
}
