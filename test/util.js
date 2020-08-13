import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
} from '@reduxjs/toolkit';
import {
  performOptimisticUpdate,
  revertOptimisticUpdate,
  performManyOptimisticUpdates,
  revertManyOptimisticUpdates,
} from '../src/index';

module.exports = () => {
  const func = createAsyncThunk('func', async ({ error }) => {
    if (error) throw new Error(error);
    return null;
  });

  const multiFunc = createAsyncThunk('multifunc', async ({ error }) => {
    if (error) throw new Error(error);
    return null;
  });

  const adapter = createEntityAdapter();
  const slice = createSlice({
    name: 'mySlice',
    initialState: adapter.getInitialState(),
    reducers: {
      reset: (state) => {
        state.ids = [];
        state.entities = {};
      },
      addEntity: adapter.addOne,
    },
    extraReducers: {
      [func.pending]: (state, action) =>
        performOptimisticUpdate(state, adapter, action.meta.arg),
      [func.rejected]: (state, action) =>
        revertOptimisticUpdate(state, adapter, action.meta.arg?.id),
      [multiFunc.pending]: (state, action) =>
        performManyOptimisticUpdates(state, adapter, action.meta.arg?.payload),
      [multiFunc.rejected]: (state, action) =>
        revertManyOptimisticUpdates(
          state,
          adapter,
          action.meta.arg?.payload?.map((el) => el.id),
        ),
    },
  });

  const middleware = [...getDefaultMiddleware()];
  const store = configureStore({
    reducer: slice.reducer,
    middleware,
  });

  return {
    adapter,
    thunks: { func, multiFunc },
    slice,
    store,
  };
};
