package com.highroller.views

import android.content.Context
import android.graphics.*
import android.os.Build
import android.os.SystemClock
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.view.Choreographer
import android.view.MotionEvent
import android.view.View
import com.highroller.models.*
import kotlin.math.abs
import kotlin.math.cos
import kotlin.math.hypot
import kotlin.math.min
import kotlin.math.sin
import kotlin.random.Random

/**
 * Native Canvas battlefield for High Roller.
 * Portrait split-screen, carousel logs, auto-firing casino towers, minion lanes, AI opponent.
 */
class GameView(context: Context) : View(context), Choreographer.FrameCallback {

    private val choreographer = Choreographer.getInstance()
    private var lastFrame = 0L
    private var running = false

    private val bgPaint = Paint(Paint.ANTI_ALIAS_FLAG)
    private val logPaint = Paint(Paint.ANTI_ALIAS_FLAG)
    private val slotPaint = Paint(Paint.ANTI_ALIAS_FLAG)
    private val textPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.WHITE
        textAlign = Paint.Align.CENTER
        typeface = Typeface.create(Typeface.SERIF, Typeface.BOLD)
    }
    private val hpPaint = Paint(Paint.ANTI_ALIAS_FLAG)
    private val lanePaint = Paint(Paint.ANTI_ALIAS_FLAG)

    private val playerLogs = mutableListOf<CarouselLog>()
    private val oppLogs = mutableListOf<CarouselLog>()
    private val minions = mutableListOf<Minion>()
    private val projectiles = mutableListOf<Projectile>()

    private var chipsP = 150
    private var chipsO = 150
    private var timeLeft = 180f
    private var spawnT = 0.8f
    private var countdown = 3f
    private var over = false
    private var win = false
    private var spinCd = 0f
    private var expandPhase = 1
    private var aiT = 0f

    private var lastTapSlot: Pair<CarouselLog, Int>? = null
    private var lastTapAt = 0L
    private var downX = 0f
    private var downY = 0f

    init {
        resetMatch()
        isClickable = true
        isFocusable = true
    }

    fun pause() { running = false; choreographer.removeFrameCallback(this) }
    fun resume() {
        running = true
        lastFrame = 0L
        choreographer.postFrameCallback(this)
    }

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        resume()
    }

    override fun onDetachedFromWindow() {
        pause()
        super.onDetachedFromWindow()
    }

    override fun doFrame(frameTimeNanos: Long) {
        if (!running) return
        val dt = if (lastFrame == 0L) 0.016f
        else min(0.05f, (frameTimeNanos - lastFrame) / 1_000_000_000f)
        lastFrame = frameTimeNanos
        update(dt)
        invalidate()
        choreographer.postFrameCallback(this)
    }

    private fun resetMatch() {
        playerLogs.clear(); oppLogs.clear(); minions.clear(); projectiles.clear()
        chipsP = 150; chipsO = 150; timeLeft = 180f; spawnT = 0.8f
        countdown = 3f; over = false; expandPhase = 1
        playerLogs += makeStarterLog(0)
        oppLogs += makeStarterLog(1)
        layoutLogs()
    }

    private fun makeStarterLog(owner: Int): CarouselLog {
        val log = CarouselLog(owner = owner)
        listOf("slot", "roulette", "cards").forEach {
            log.slots += TowerCatalog.make(it, owner)
            log.reserves += TowerCatalog.make(it, owner)
        }
        log.slotCount = 3
        return log
    }

    private fun layoutLogs() {
        val h = height.toFloat().coerceAtLeast(1f)
        val w = width.toFloat().coerceAtLeast(1f)
        fun place(list: List<CarouselLog>, player: Boolean) {
            val top = if (player) h * 0.55f else h * 0.18f
            val bot = if (player) h * 0.82f else h * 0.45f
            list.forEachIndexed { i, log ->
                val t = if (list.size == 1) 0.5f else i / (list.size - 1).toFloat()
                log.y = top + (bot - top) * if (player) t else (1 - t)
                log.x = w / 2f
                log.w = w * 0.68f
                log.h = h * 0.07f
                val span = log.w * 0.78f
                val start = log.x - span / 2
                val step = if (log.slotCount <= 1) 0f else span / (log.slotCount - 1)
                for (s in 0 until log.slotCount) {
                    while (log.slots.size < log.slotCount) {
                        log.slots += null; log.reserves += null
                    }
                    log.slots[s]?.let { tw ->
                        tw.x = start + s * step
                        tw.y = log.y
                    }
                }
            }
        }
        place(playerLogs, true)
        place(oppLogs, false)
    }

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        layoutLogs()
    }

    private fun update(dt: Float) {
        if (over) return
        if (countdown > 0f) {
            countdown -= dt
            return
        }
        timeLeft = (timeLeft - dt).coerceAtLeast(0f)
        spinCd = (spinCd - dt).coerceAtLeast(0f)
        spawnT -= dt
        if (spawnT <= 0f) {
            spawnT = 3f
            spawnWave()
        }
        val elapsedFrac = 1f - timeLeft / 180f
        if (expandPhase < 2 && elapsedFrac >= 0.33f) expand(2, 4)
        if (expandPhase < 3 && elapsedFrac >= 0.66f) expand(3, 6)

        updateLogs(playerLogs, dt)
        updateLogs(oppLogs, dt)
        updateMinions(dt)
        updateTowers(playerLogs, 0, dt)
        updateTowers(oppLogs, 1, dt)
        updateProjectiles(dt)
        updateAi(dt)

        if (timeLeft <= 0f || living(playerLogs) == 0 || living(oppLogs) == 0) {
            over = true
            win = living(playerLogs) > 0 && (chipsP > chipsO || living(oppLogs) == 0)
        }
    }

    private fun expand(logs: Int, slots: Int) {
        while (playerLogs.size < logs) playerLogs += CarouselLog(0).also { it.slotCount = slots }
        while (oppLogs.size < logs) oppLogs += CarouselLog(1).also { it.slotCount = slots }
        (playerLogs + oppLogs).forEach { it.slotCount = slots }
        expandPhase = logs
        layoutLogs()
    }

    private fun living(logs: List<CarouselLog>) =
        logs.sumOf { l -> l.slots.count { it != null && it.alive } }

    private fun spawnWave() {
        val h = height.toFloat()
        val w = width.toFloat()
        for (owner in 0..1) {
            for (lane in 0..1) {
                minions += Minion(
                    owner = owner,
                    lane = lane,
                    x = if (lane == 0) 48f else w - 48f,
                    y = if (owner == 0) h - 160f else 120f,
                    dir = if (owner == 0) -1f else 1f,
                    speed = 90f,
                )
            }
        }
    }

    private fun updateLogs(logs: List<CarouselLog>, dt: Float) {
        logs.forEach { log ->
            log.invuln = (log.invuln - dt).coerceAtLeast(0f)
            if (log.rotating) {
                log.rotT += dt
                if (log.rotT >= 0.25f && log.rotT - dt < 0.25f) swapReserve(log)
                if (log.rotT >= 0.5f) { log.rotating = false; log.rotT = 0f }
            } else {
                if (log.slots.any { it != null && it.alive && it.hp / it.maxHp < 0.2f }) rotate(log)
            }
        }
        layoutLogs()
    }

    private fun swapReserve(log: CarouselLog) {
        for (i in log.slots.indices) {
            val t = log.slots[i] ?: continue
            if (!t.alive || t.hp / t.maxHp >= 0.55f) continue
            val res = log.reserves[i] ?: continue
            t.hp = (t.hp + t.maxHp * 0.5f).coerceAtMost(t.maxHp)
            log.slots[i] = res.also { it.hp = it.maxHp }
            log.reserves[i] = t
        }
    }

    private fun rotate(log: CarouselLog): Boolean {
        if (log.rotating) return false
        log.rotating = true
        log.rotT = 0f
        log.invuln = 0.5f
        vibrate()
        return true
    }

    private fun updateMinions(dt: Float) {
        val h = height.toFloat()
        val iter = minions.iterator()
        while (iter.hasNext()) {
            val m = iter.next()
            if (m.stun > 0) m.stun -= dt else m.y += m.dir * m.speed * dt
            val enemyLogs = if (m.owner == 0) oppLogs else playerLogs
            enemyLogs.forEach { log ->
                if (log.invuln > 0) return@forEach
                log.slots.forEach { t ->
                    if (t != null && t.alive && abs(m.y - t.y) < 28 && abs(m.x - t.x) < 70) {
                        hurt(t, log, 5f * dt)
                    }
                }
            }
            val scored = (m.owner == 0 && m.y < 110f) || (m.owner == 1 && m.y > h - 140f)
            if (scored) {
                if (m.owner == 0) chipsP += 10 else chipsO += 10
                iter.remove()
            } else if (m.hp <= 0) iter.remove()
        }
    }

    private fun hurt(t: Tower, log: CarouselLog, amt: Float) {
        if (!t.alive || log.invuln > 0) return
        t.hp -= amt
        t.flash = 0.1f
        if (t.hp <= 0) {
            t.hp = 0f
            t.alive = false
            val i = log.slots.indexOf(t)
            if (i >= 0) { log.slots[i] = null; log.reserves[i] = null }
        }
    }

    private fun updateTowers(logs: List<CarouselLog>, owner: Int, dt: Float) {
        logs.forEach { log ->
            log.slots.forEach { t ->
                if (t == null || !t.alive) return@forEach
                t.flash = (t.flash - dt).coerceAtLeast(0f)
                t.cool -= dt
                if (t.cool > 0) return@forEach
                val target = acquire(t, owner) ?: return@forEach
                t.cool = t.cd
                val dx = target.x - t.x
                val dy = target.y - t.y
                val d = hypot(dx, dy).coerceAtLeast(1f)
                val spd = 520f
                val color = TowerCatalog.def(t.type).color
                projectiles += Projectile(t.x, t.y, dx / d * spd, dy / d * spd, t.dmg, color, target = target)
            }
        }
    }

    private fun acquire(t: Tower, owner: Int): Minion? {
        var best: Minion? = null
        var bestD = t.range
        minions.forEach { m ->
            if (m.owner == owner) return@forEach
            val d = hypot(m.x - t.x, m.y - t.y)
            if (d < bestD) { bestD = d; best = m }
        }
        return best
    }

    private fun updateProjectiles(dt: Float) {
        val iter = projectiles.iterator()
        while (iter.hasNext()) {
            val p = iter.next()
            p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt
            val tgt = p.target
            if (tgt != null && hypot(p.x - tgt.x, p.y - tgt.y) < 18f) {
                tgt.hp -= p.dmg
                iter.remove()
            } else if (p.life <= 0f) iter.remove()
        }
    }

    private fun updateAi(dt: Float) {
        aiT -= dt
        if (aiT > 0) return
        aiT = 0.8f
        oppLogs.forEach { log ->
            log.slots.forEachIndexed { i, t ->
                if (t == null && chipsO >= 80) {
                    val id = listOf("slot", "roulette", "cards").random()
                    log.slots[i] = TowerCatalog.make(id, 1)
                    log.reserves[i] = TowerCatalog.make(id, 1)
                    chipsO -= 80
                }
            }
        }
        layoutLogs()
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        val w = width.toFloat(); val h = height.toFloat()
        bgPaint.color = 0xFF12081C.toInt()
        canvas.drawRect(0f, 0f, w, h / 2f, bgPaint)
        bgPaint.color = 0xFF1A0C28.toInt()
        canvas.drawRect(0f, h / 2f, w, h, bgPaint)

        lanePaint.color = 0x332EF0FF
        canvas.drawRect(24f, 110f, 80f, h - 150f, lanePaint)
        canvas.drawRect(w - 80f, 110f, w - 24f, h - 150f, lanePaint)

        bgPaint.color = 0xFFF0C14B.toInt()
        bgPaint.strokeWidth = 4f
        canvas.drawLine(0f, h / 2f, w, h / 2f, bgPaint)

        oppLogs.forEach { drawLog(canvas, it, true) }
        playerLogs.forEach { drawLog(canvas, it, false) }
        minions.forEach { drawMinion(canvas, it) }
        projectiles.forEach {
            bgPaint.color = it.color
            canvas.drawCircle(it.x, it.y, 6f, bgPaint)
        }

        textPaint.textSize = 36f
        textPaint.color = 0xFFF0C14B.toInt()
        val mm = timeLeft.toInt() / 60
        val ss = timeLeft.toInt() % 60
        canvas.drawText("%d:%02d".format(mm, ss), w / 2f, 64f, textPaint)
        textPaint.textSize = 28f
        textPaint.color = Color.WHITE
        canvas.drawText("AI $chipsO", 120f, 64f, textPaint)
        canvas.drawText("YOU $chipsP", w - 140f, h - 36f, textPaint)

        if (countdown > 0f) {
            textPaint.textSize = 160f
            textPaint.color = 0xFFF0C14B.toInt()
            val label = if (countdown > 2) "3" else if (countdown > 1) "2" else if (countdown > 0.2) "1" else "ROLL"
            canvas.drawText(label, w / 2f, h / 2f, textPaint)
        }
        if (over) {
            bgPaint.color = 0xAA000000.toInt()
            canvas.drawRect(0f, 0f, w, h, bgPaint)
            textPaint.textSize = 72f
            textPaint.color = 0xFFF0C14B.toInt()
            canvas.drawText(if (win) "YOU WIN" else "BUST", w / 2f, h / 2f, textPaint)
            textPaint.textSize = 28f
            canvas.drawText("tap to play again", w / 2f, h / 2f + 70f, textPaint)
        }
    }

    private fun drawLog(canvas: Canvas, log: CarouselLog, dark: Boolean) {
        val p = if (log.rotating) log.rotT / 0.5f else 0f
        val squash = 1f - sin(p * Math.PI.toFloat()) * 0.4f
        canvas.save()
        canvas.translate(log.x, log.y)
        canvas.scale(1f, squash)
        logPaint.color = 0xFF6B3A1F.toInt()
        val rect = RectF(-log.w / 2, -log.h / 2, log.w / 2, log.h / 2)
        canvas.drawRoundRect(rect, 24f, 24f, logPaint)
        logPaint.style = Paint.Style.STROKE
        logPaint.color = 0xFFD4A574.toInt()
        logPaint.strokeWidth = 4f
        canvas.drawRoundRect(rect, 24f, 24f, logPaint)
        logPaint.style = Paint.Style.FILL
        canvas.restore()

        val span = log.w * 0.78f
        val start = log.x - span / 2
        val step = if (log.slotCount <= 1) 0f else span / (log.slotCount - 1)
        for (i in 0 until log.slotCount) {
            val x = start + i * step
            slotPaint.color = 0x99000000.toInt()
            canvas.drawCircle(x, log.y, log.h * 0.36f, slotPaint)
            val t = if (i < log.slots.size) log.slots[i] else null
            if (t != null && t.alive) drawTower(canvas, t) else {
                textPaint.textSize = 28f
                textPaint.color = 0x66FFFFFF
                canvas.drawText("+", x, log.y + 10f, textPaint)
            }
        }
        if (dark) {
            logPaint.color = 0x33000000
            canvas.drawRoundRect(RectF(log.x - log.w / 2, log.y - log.h / 2, log.x + log.w / 2, log.y + log.h / 2), 24f, 24f, logPaint)
        }
    }

    private fun drawTower(canvas: Canvas, t: Tower) {
        val def = TowerCatalog.def(t.type)
        val r = 36f
        val p = Paint(Paint.ANTI_ALIAS_FLAG)
        p.color = if (t.flash > 0) Color.WHITE else def.color
        canvas.drawCircle(t.x, t.y, r, p)
        textPaint.textSize = 28f
        textPaint.color = Color.BLACK
        canvas.drawText(def.symbol, t.x, t.y + 10f, textPaint)
        hpPaint.color = 0x99000000.toInt()
        canvas.drawRect(t.x - r, t.y + r + 4, t.x + r, t.y + r + 10, hpPaint)
        val ratio = (t.hp / t.maxHp).coerceIn(0f, 1f)
        hpPaint.color = if (ratio < 0.2f) 0xFFFF4466.toInt() else 0xFF3DFF9A.toInt()
        canvas.drawRect(t.x - r, t.y + r + 4, t.x - r + r * 2 * ratio, t.y + r + 10, hpPaint)
    }

    private fun drawMinion(canvas: Canvas, m: Minion) {
        val p = Paint(Paint.ANTI_ALIAS_FLAG)
        p.color = if (m.owner == 0) 0xFF2EF0FF.toInt() else 0xFFFF2D95.toInt()
        canvas.drawRoundRect(RectF(m.x - 12, m.y - 14, m.x + 12, m.y + 14), 6f, 6f, p)
    }

    override fun onTouchEvent(event: MotionEvent): Boolean {
        when (event.actionMasked) {
            MotionEvent.ACTION_DOWN -> { downX = event.x; downY = event.y }
            MotionEvent.ACTION_UP -> {
                if (over) { resetMatch(); return true }
                val dx = event.x - downX
                if (abs(dx) > 60) {
                    hitLog(downX, downY)?.let {
                        if (chipsP >= 50 && spinCd <= 0) {
                            chipsP -= 50; spinCd = 10f; rotate(it)
                        }
                    }
                    return true
                }
                val hit = hitSlot(event.x, event.y)
                val now = SystemClock.uptimeMillis()
                if (hit != null && lastTapSlot == hit && now - lastTapAt < 320 && hit.second.let { hit.first.slots.getOrNull(it) } == null) {
                    if (chipsP >= 80) {
                        val id = listOf("slot", "roulette", "cards").random()
                        hit.first.slots[hit.second] = TowerCatalog.make(id, 0)
                        hit.first.reserves[hit.second] = TowerCatalog.make(id, 0)
                        chipsP -= 80
                        layoutLogs()
                    }
                    lastTapAt = 0
                    return true
                }
                lastTapAt = now
                lastTapSlot = hit
                if (hit?.let { it.first.slots.getOrNull(it.second) } != null && chipsP >= 200) {
                    val t = hit.first.slots[hit.second]!!
                    t.level += 1
                    t.maxHp *= 1.1f
                    t.hp = t.maxHp
                    t.dmg *= 1.15f
                    chipsP -= 200
                }
            }
        }
        return true
    }

    private fun hitLog(x: Float, y: Float): CarouselLog? =
        playerLogs.firstOrNull { abs(x - it.x) < it.w / 2 && abs(y - it.y) < it.h / 2 + 12 }

    private fun hitSlot(x: Float, y: Float): Pair<CarouselLog, Int>? {
        val log = hitLog(x, y) ?: return null
        val span = log.w * 0.78f
        val start = log.x - span / 2
        val step = if (log.slotCount <= 1) 0f else span / (log.slotCount - 1)
        for (i in 0 until log.slotCount) {
            val sx = start + i * step
            if (hypot(x - sx, y - log.y) < 48) return log to i
        }
        return null
    }

    private fun vibrate() {
        try {
            val v = if (Build.VERSION.SDK_INT >= 31) {
                (context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager).defaultVibrator
            } else {
                @Suppress("DEPRECATION")
                context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
            }
            if (Build.VERSION.SDK_INT >= 26) v.vibrate(VibrationEffect.createOneShot(40, VibrationEffect.DEFAULT_AMPLITUDE))
            else @Suppress("DEPRECATION") v.vibrate(40)
        } catch (_: Exception) {}
    }
}
