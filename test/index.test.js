import initRedux from './util';
import { entities } from './data';
import { performOptimisticUpdate, performManyOptimisticUpdates } from '../src';

describe('the `performOptimisticUpdate` method', () => {
  const { store, slice, adapter, thunks } = initRedux();

  afterEach(() => {
    store.dispatch(slice.actions.reset());
  });

  it('should not update a non-exitant entity', async () => {
    store.dispatch(
      thunks.func({
        id: 'foo',
        changes: {
          n: 1,
        },
      }),
    );

    expect(store.getState()).toStrictEqual({
      ids: [],
      entities: {},
    });
  });

  it('should optimistically update and persist the previous change', async () => {
    const bob = entities.bob;
    store.dispatch(slice.actions.addEntity(bob));
    store.dispatch(
      thunks.func({
        id: bob.id,
        changes: {
          age: 21,
        },
      }),
    );

    expect(store.getState()).toStrictEqual({
      ids: [bob.id],
      entities: {
        [bob.id]: {
          ...bob,
          age: 21,
          previousChanges: {
            age: bob.age,
          },
        },
      },
    });
  });

  it('should update the entity with new fields', async () => {
    const bob = entities.bob;

    store.dispatch(slice.actions.addEntity(bob));
    store.dispatch(
      thunks.func({
        id: bob.id,
        changes: {
          eyes: 'brown',
        },
      }),
    );

    expect(store.getState()).toStrictEqual({
      ids: [bob.id],
      entities: {
        [bob.id]: {
          ...bob,
          eyes: 'brown',
          previousChanges: {
            eyes: undefined,
          },
        },
      },
    });
  });

  it('should support multiple values', async () => {
    const doug = entities.doug;

    store.dispatch(slice.actions.addEntity(doug));
    store.dispatch(
      thunks.func({
        id: doug.id,
        changes: {
          name: 'James',
          age: 33,
        },
      }),
    );

    expect(store.getState()).toStrictEqual({
      ids: [doug.id],
      entities: {
        [doug.id]: {
          ...doug,
          name: 'James',
          age: 33,
          previousChanges: {
            name: doug.name,
            age: doug.age,
          },
        },
      },
    });
  });

  it('should throw an error if update is not an object', async () => {
    const alice = entities.alice;

    store.dispatch(slice.actions.addEntity(alice));

    let error;
    try {
      performOptimisticUpdate(store.getState(), adapter);
    } catch (e) {
      error = e;
    }

    expect(error).toBeTruthy();
    expect(error.message).toBe(
      'Incorrect `update` arg sent to `performOptimisticUpdate`. Expected: { id: <string>, changes: <object> }',
    );

    expect(store.getState()).toStrictEqual({
      ids: [alice.id],
      entities: {
        [alice.id]: {
          ...alice,
        },
      },
    });
  });

  it('should throw an error if ID is not a string', async () => {
    const alice = entities.alice;

    store.dispatch(slice.actions.addEntity(alice));

    let error;
    try {
      performOptimisticUpdate(store.getState(), adapter, {
        id: 1,
        changes: { foo: 'bar' },
      });
    } catch (e) {
      error = e;
    }

    expect(error).toBeTruthy();
    expect(error.message).toBe(
      'Incorrect `update` arg sent to `performOptimisticUpdate`. Expected: { id: <string>, changes: <object> }',
    );

    expect(store.getState()).toStrictEqual({
      ids: [alice.id],
      entities: {
        [alice.id]: {
          ...alice,
        },
      },
    });
  });
});

describe('the `revertOptimisticUpdate` method', () => {
  const { store, thunks, slice } = initRedux();

  afterEach(() => {
    store.dispatch(slice.actions.reset());
  });

  it('should revert an entity to its prior state', async () => {
    const bob = entities.bob;

    store.dispatch(slice.actions.addEntity(bob));
    await store.dispatch(
      thunks.func({
        error: true,
        id: bob.id,
        changes: {
          age: 21,
        },
      }),
    );

    expect(store.getState()).toStrictEqual({
      ids: [bob.id],
      entities: {
        [bob.id]: {
          ...bob,
          previousChanges: {
            age: bob.age,
          },
        },
      },
    });
  });

  it('should throw an error if ID is not a string', async () => {
    const bob = entities.bob;

    store.dispatch(slice.actions.addEntity(bob));

    let error;
    try {
      await store.dispatch(
        thunks.func({
          changes: {
            age: 21,
          },
        }),
      );
    } catch (e) {
      error = e;
    }

    expect(error).toBeTruthy();
    expect(error.message).toBe(
      'Incorrect `id` arg sent to `revertOptimisticUpdate`. Expected: <string>',
    );

    expect(store.getState()).toStrictEqual({
      ids: [bob.id],
      entities: {
        [bob.id]: {
          ...bob,
        },
      },
    });
  });
});

describe('the `performManyOptimisticUpdates` method', () => {
  const { store, thunks, slice, adapter } = initRedux();

  afterEach(() => {
    store.dispatch(slice.actions.reset());
  });

  it('should not update non-exitant entities', async () => {
    const payload = [
      { id: '1', changes: { foo: 'bar' } },
      { id: '2', changes: { foo: 'bar' } },
    ];

    store.dispatch(thunks.multiFunc({ payload }));
    expect(store.getState()).toStrictEqual({
      ids: [],
      entities: {},
    });
  });

  it('should optimistically update and persist the previous changes', async () => {
    const bob = entities.bob;
    const alice = entities.alice;

    const payload = [
      { id: bob.id, changes: { age: 40 } },
      { id: alice.id, changes: { age: 50 } },
    ];

    store.dispatch(slice.actions.addEntity(bob));
    store.dispatch(slice.actions.addEntity(alice));
    store.dispatch(thunks.multiFunc({ payload }));

    expect(store.getState()).toStrictEqual({
      ids: [bob.id, alice.id],
      entities: {
        [bob.id]: {
          ...bob,
          age: 40,
          previousChanges: {
            age: bob.age,
          },
        },
        [alice.id]: {
          ...alice,
          age: 50,
          previousChanges: {
            age: alice.age,
          },
        },
      },
    });
  });

  it('should update the entities with new fields', async () => {
    const bob = entities.bob;
    const alice = entities.alice;

    const payload = [
      { id: bob.id, changes: { eyes: 'brown' } },
      { id: alice.id, changes: { eyes: 'blue' } },
    ];

    store.dispatch(slice.actions.addEntity(bob));
    store.dispatch(slice.actions.addEntity(alice));
    store.dispatch(thunks.multiFunc({ payload }));

    expect(store.getState()).toStrictEqual({
      ids: [bob.id, alice.id],
      entities: {
        [bob.id]: {
          ...bob,
          eyes: 'brown',
          previousChanges: {
            eyes: undefined,
          },
        },
        [alice.id]: {
          ...alice,
          eyes: 'blue',
          previousChanges: {
            eyes: undefined,
          },
        },
      },
    });
  });

  it('should throw an error if update is not an array of objects', async () => {
    const bob = entities.bob;
    const alice = entities.alice;

    store.dispatch(slice.actions.addEntity(bob));
    store.dispatch(slice.actions.addEntity(alice));

    let error;
    try {
      performManyOptimisticUpdates(store.getState(), adapter);
      await store.dispatch(thunks.multiFunc());
    } catch (e) {
      error = e;
    }

    expect(error).toBeTruthy();
    expect(error.message).toBe(
      'Incorrect `update` arg sent to `performManyOptimisticUpdates`. Expected: [{ id: <string>, changes: <object> }, ...]',
    );

    expect(store.getState()).toStrictEqual({
      ids: [bob.id, alice.id],
      entities: {
        [bob.id]: {
          ...bob,
        },
        [alice.id]: {
          ...alice,
        },
      },
    });
  });
});

describe('the `revertManyOptimisticUpdates` method', () => {
  const { store, thunks, slice } = initRedux();

  afterEach(() => {
    store.dispatch(slice.actions.reset());
  });

  it('should revert an entity to its prior state', async () => {
    const bob = entities.bob;
    const alice = entities.alice;

    const payload = [
      { id: bob.id, changes: { age: 40 } },
      { id: alice.id, changes: { age: 50 } },
    ];

    store.dispatch(slice.actions.addEntity(bob));
    store.dispatch(slice.actions.addEntity(alice));
    await store.dispatch(thunks.multiFunc({ payload, error: true }));

    expect(store.getState()).toStrictEqual({
      ids: [bob.id, alice.id],
      entities: {
        [bob.id]: {
          ...bob,
          previousChanges: {
            age: bob.age,
          },
        },
        [alice.id]: {
          ...alice,
          previousChanges: {
            age: alice.age,
          },
        },
      },
    });
  });

  it('should throw an error if IDs are not an array of string', async () => {
    const bob = entities.bob;
    const payload = null;

    store.dispatch(slice.actions.addEntity(bob));

    let error;
    try {
      await store.dispatch(thunks.multiFunc({ payload, error: true }));
    } catch (e) {
      error = e;
    }

    expect(error).toBeTruthy();
    expect(error.message).toBe(
      'Incorrect `ids` arg sent to `revertManyOptimisticUpdates`. Expected: [<string>]',
    );

    expect(store.getState()).toStrictEqual({
      ids: [bob.id],
      entities: {
        [bob.id]: {
          ...bob,
        },
      },
    });
  });
});
