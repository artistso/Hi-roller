package com.highroller.controllers

import android.content.Context

/** Local fallback store (Room can replace SharedPreferences later). */
class PlayerStore(ctx: Context) {
    private val prefs = ctx.getSharedPreferences("highroller", Context.MODE_PRIVATE)

    var username: String
        get() = prefs.getString("username", "Guest") ?: "Guest"
        set(v) { prefs.edit().putString("username", v).apply() }

    var chips: Int
        get() = prefs.getInt("chips", 900)
        set(v) { prefs.edit().putInt("chips", v).apply() }

    var level: Int
        get() = prefs.getInt("level", 1)
        set(v) { prefs.edit().putInt("level", v).apply() }

    var xp: Int
        get() = prefs.getInt("xp", 0)
        set(v) { prefs.edit().putInt("xp", v).apply() }

    var rank: Int
        get() = prefs.getInt("rank", 0)
        set(v) { prefs.edit().putInt("rank", v).apply() }

    var wins: Int
        get() = prefs.getInt("wins", 0)
        set(v) { prefs.edit().putInt("wins", v).apply() }

    var losses: Int
        get() = prefs.getInt("losses", 0)
        set(v) { prefs.edit().putInt("losses", v).apply() }

    fun record(win: Boolean, chipsEarned: Int, xpGained: Int, rankDelta: Int) {
        if (win) wins += 1 else losses += 1
        chips += chipsEarned
        xp += xpGained
        rank = (rank + rankDelta).coerceAtLeast(0)
        while (level < 100 && xp >= 80 + level * 20) {
            xp -= 80 + level * 20
            level += 1
        }
    }
}
