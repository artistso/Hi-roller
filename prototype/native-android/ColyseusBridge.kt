package com.highroller.network

/**
 * Colyseus client bridge. Wire `com.github.colyseus:colyseus-client-android`
 * once the room is deployed on Render.
 */
class ColyseusBridge {
    var connected = false

    fun connect(endpoint: String, room: String = "highroller_room") {
        connected = false
    }

    fun send(event: String, data: Map<String, Any>) {}

    fun disconnect() { connected = false }
}
