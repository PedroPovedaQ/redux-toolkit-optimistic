/**
 * @param {*} state The current state of the given slice
 * @param {*} adapter The entity adapter for the slice
 * @param {{ id: string, changes: object}} update The update object
 */
export function performOptimisticUpdate(state, adapter, update) {
    const incorrectUpdateArgError = new Error("Incorrect `update` arg sent to `performOptimisticUpdate`. Expected: { id: <string>, changes: <object> }")
    if (!update || typeof update !== "object") {
        throw incorrectUpdateArgError
    }

    const { id, changes } = update
    if (typeof id !== "string" || typeof changes !== "object") {
        throw incorrectUpdateArgError
    }

    // Store the previous data to handle rejection of optimistic update
    state.entities[id].previousChanges = Object.keys(changes).reduce((acc, key) => {
      acc[key] = state.entities[id][key]
      return acc
    }, {})

    adapter.updateOne(state, update);
}

/**
 * @param {*} state The current state of the given slice
 * @param {*} adapter The entity adapter for the slice
 * @param {{ id: string, changes: object}[]} update The update object
 */
export function performManyOptimisticUpdates(state, adapter, update) {
    const incorrectUpdateArgError = new Error("Incorrect `update` arg sent to `performManyOptimisticUpdates`. Expected: [{ id: <string>, changes: <object> }, ...]")
    if (!update || !Array.isArray(update)) {
        throw incorrectUpdateArgError
    }

    // Store the previous data to handle rejection of optimistic updates
    for (const entity of update) {
        if (typeof entity !== "object" || typeof entity.id !== "string" || typeof entity.changes !== "object") {
            throw incorrectUpdateArgError
        }

        const { id, changes } = entity
        state.entities[id].previousChanges = Object.keys(changes).reduce((acc, key) => {
        acc[key] = state.entities[id][key]
        return acc
        }, {})
    }

    adapter.updateMany(state, update)
}

/**
 * @param {*} state The current state of the given slice
 * @param {*} adapter The entity adapter for the slice
 * @param {string} id The ID of the entity to revert to its prior state
 */
export function revertOptimisticUpdate(state, adapter, id) {
    if (typeof id !== "string") {
        throw new Error("Incorrect `id` arg sent to `revertOptimisticUpdate`. Expected: <string>")
    }

    const previousChanges = state?.entities[id]?.previousChanges
    if (!previousChanges) return

    adapter.updateOne(state, {
        id,
        changes: previousChanges
    });
}

/**
 * Redux toolkit helper function that reverts multiple optimistic updates
 * @param {*} state The current state of the given slice
 * @param {*} adapter The entity adapter for the slice
 * @param {string[]} ids The list of IDs to revert to prior state
 */
export function revertManyOptimisticUpdates(state, adapter, ids) {
    if (!Array.isArray(ids)) {
        throw new Error("Incorrect `ids` arg sent to `revertManyOptimisticUpdates`. Expected: [<string>]")
    }

    const update = ids.map(id => {
        const changes = state?.entities[id]?.previousChanges
        if (!changes) return null
        return { id, changes }
    }).filter(Boolean)

    if (!update.length) return

    adapter.updateMany(state, update);
}
