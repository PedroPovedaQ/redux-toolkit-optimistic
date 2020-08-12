# Redux Toolkit Optimistic


Simple helper library for use with [Redux Toolkit](https://redux-toolkit.js.org/). MUST be used in conjunction with [createEntityAdapter](https://redux-toolkit.js.org/api/createEntityAdapter) as well as [createSlice](https://redux-toolkit.js.org/api/createSlice) OR [createReducer](https://redux-toolkit.js.org/api/createReducer).

* Allows for updateOne or updateMany optimistic updates.
* Works especially well the pending and rejected states of [createAsyncThunk](https://redux-toolkit.js.org/api/createAsyncThunk).


Example Redux code:
```js
import { createAsyncThunk, createEntityAdapter, createSelectorm createSlice } from '@reduxjs/toolkit'
import { performOptimisticUpdate, revertOptimisticUpdate } from 'redux-toolkit-optimistic'

export const myFunction = createAsyncThunk('mySlice/myFunction', async ({ id, changes }) => {
    return await someApiCall(id, changes)
})

const myAdapter = createEntityAdapter()
const mySlice = createSlice({
  name: 'mySlice',
  initialState: myAdapter.getInitialState(),
  reducers: {},
  extraReducers: {
    [myFunction.pending]: (state, action) => performOptimisticUpdate(state, myAdapter, action.meta.arg.payload),
    [myFunction.rejected]: (state, action) => revertOptimisticUpdate(state, myAdapter, action.meta.arg.payload.id),
  }
})

const reducer = spreadsSlice.reducer
export default reducer
```

And usage in React:
```js
import { myFunction } from "../path/to/state"

dispatch(myFunction({
    payload: {
        id: "someId",
        changes: { someKey: "new value" },
    }
}))
```

## License

MIT

