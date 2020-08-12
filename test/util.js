import {
  configureStore,
  getDefaultMiddleware
} from '@reduxjs/toolkit'
import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice
} from '@reduxjs/toolkit'
import {
  performOptimisticUpdate,
  revertOptimisticUpdate
} from '../src/index'

module.exports = () => {
  const func = createAsyncThunk('func', async ({
    error
  }) => {
    if (error) throw new Error(error)
    return null
  })

  const adapter = createEntityAdapter()
  const slice = createSlice({
    name: 'mySlice',
    initialState: adapter.getInitialState(),
    reducers: {
      "reset": state => {
        state.ids = []
          state.entities = {}
      },
      addEntity: adapter.addOne,
    },
    extraReducers: {
      [func.pending]: (state, action) => performOptimisticUpdate(state, adapter, action.meta.arg.payload),
      [func.rejected]: (state, action) => revertOptimisticUpdate(state, adapter, action.meta.arg.payload.id),
    }
  })

  const middleware = [...getDefaultMiddleware()]
  const store = configureStore({
    reducer: slice.reducer,
    middleware,
  })

  return {
    func,
    slice,
    store
  }
}
