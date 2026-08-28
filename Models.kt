package com.highroller.models

data class Tower(
    var type: String,
    var hp: Float,
    var maxHp: Float,
    var dmg: Float,
    var cd: Float,
    var cool: Float = 0f,
    var range: Float,
    var x: Float = 0f,
    var y: Float = 0f,
    var alive: Boolean = true,
    var level: Int = 1,
    var owner: Int = 0,
    var flash: Float = 0f,
)

data class CarouselLog(
    var owner: Int,
    var x: Float = 0f,
    var y: Float = 0f,
    var w: Float = 0f,
    var h: Float = 0f,
    val slots: MutableList<Tower?> = mutableListOf(),
    val reserves: MutableList<Tower?> = mutableListOf(),
    var slotCount: Int = 3,
    var rotating: Boolean = false,
    var rotT: Float = 0f,
    var invuln: Float = 0f,
)

data class Minion(
    var owner: Int,
    var lane: Int,
    var x: Float,
    var y: Float,
    var hp: Float = 50f,
    var maxHp: Float = 50f,
    var speed: Float = 90f,
    var dir: Float,
    var stun: Float = 0f,
)

data class Projectile(
    var x: Float,
    var y: Float,
    var vx: Float,
    var vy: Float,
    var dmg: Float,
    var color: Int,
    var life: Float = 1.2f,
    var target: Minion? = null,
)

object TowerCatalog {
    data class Def(
        val id: String,
        val name: String,
        val symbol: String,
        val hp: Float,
        val dmg: Float,
        val cd: Float,
        val range: Float,
        val color: Int,
    )

    val ALL = listOf(
        Def("slot", "Slot Machine", "S", 110f, 7f, 0.36f, 220f, 0xFFFF4D9A.toInt()),
        Def("roulette", "Roulette", "R", 130f, 22f, 1.45f, 180f, 0xFFFF3B3B.toInt()),
        Def("cards", "Card Dealer", "C", 95f, 38f, 1.15f, 270f, 0xFFE8E8E8.toInt()),
        Def("poker", "Poker Table", "P", 125f, 10f, 1.8f, 160f, 0xFF1F8A5B.toInt()),
        Def("blackjack", "Blackjack", "B", 115f, 14f, 0.95f, 200f, 0xFF2A6B3A.toInt()),
        Def("craps", "Craps", "X", 105f, 18f, 1.25f, 210f, 0xFF3D8B3D.toInt()),
    )

    fun def(id: String) = ALL.first { it.id == id }

    fun make(id: String, owner: Int, level: Int = 1): Tower {
        val d = def(id)
        val hpM = 1f + (level - 1) * 0.15f
        val dmgM = 1f + (level - 1) * 0.18f
        return Tower(
            type = id,
            hp = d.hp * hpM,
            maxHp = d.hp * hpM,
            dmg = d.dmg * dmgM,
            cd = d.cd,
            range = d.range,
            owner = owner,
            level = level,
        )
    }
}
