import initRedux from "./util"

describe('the `performOptimisticUpdate` method', () => {
  const { store, func, slice } = initRedux()

  afterEach(() => {
    store.dispatch(slice.actions.reset())
  })

  it("should not update a non-exitant entity", async () => {
    store.dispatch(func({
      payload: {
        id: "foo",
        changes: {
          n: 1
        }
      }
    }))

    expect(store.getState()).toStrictEqual({
      ids: [],
      entities: {}
    })
  })

  it("should optimistically update and persist the previous change", async () => {
    const entity = {
      id: "1",
      name: "Bob",
      age: 20
    }

    store.dispatch(slice.actions.addEntity(entity))
    store.dispatch(func({
      payload: {
        id: entity.id,
        changes: {
          age: 21
        }
      }
    }))

    expect(store.getState()).toStrictEqual({
      ids: [ entity.id ],
      entities: {
        [entity.id]: {
          id: entity.id,
          name: "Bob",
          age: 21,
          previousChanges: {
            age: 20,
          },
        },
      }
    })

  })

  it("should support multiple values", async () => {
    const entity = {
      id: "2",
      name: "Jim",
      age: 32
    }

    store.dispatch(slice.actions.addEntity(entity))
    store.dispatch(func({
      payload: {
        id: entity.id,
        changes: {
          name: "James",
          age: 33,
        }
      }
    }))

    expect(store.getState()).toStrictEqual({
      ids: [ entity.id ],
      entities: {
        [entity.id]: {
          id: entity.id,
          name: "James",
          age: 33,
          previousChanges: {
            name: "Jim",
            age: 32,
          },
        },
      }
    })

  })

})
