# Redux Toolkit Optimistic

[https://www.npmjs.com/package/redux-toolkit-optimistic](https://www.npmjs.com/package/redux-toolkit-optimistic)

Simple helper library for use with
[Redux Toolkit](https://redux-toolkit.js.org/). MUST be used in conjunction with
[createEntityAdapter](https://redux-toolkit.js.org/api/createEntityAdapter) as
well as [createSlice](https://redux-toolkit.js.org/api/createSlice) OR
[createReducer](https://redux-toolkit.js.org/api/createReducer).

- Allows for updateOne or updateMany optimistic updates.
- Works especially well the pending and rejected states of
  [createAsyncThunk](https://redux-toolkit.js.org/api/createAsyncThunk).

## Installation

`npm install -S redux-toolkit-optimistic`

`yarn add redux-toolkit-optimistic`

## Usage

Example Redux code:

```js
import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
} from '@reduxjs/toolkit';
import {
  performOptimisticUpdate,
  revertOptimisticUpdate,
} from 'redux-toolkit-optimistic';

export const myFunction = createAsyncThunk(
  'mySlice/myFunction',
  async ({ id, changes }) => {
    await persistChangesToDb(id, changes);
  },
);

const myAdapter = createEntityAdapter();
const mySlice = createSlice({
  name: 'mySlice',
  initialState: myAdapter.getInitialState(),
  reducers: {},
  extraReducers: {
    [myFunction.pending]: (state, action) =>
      performOptimisticUpdate(state, myAdapter, action.meta.arg),
    [myFunction.rejected]: (state, action) =>
      revertOptimisticUpdate(state, myAdapter, action.meta.arg.id),
  },
});

const reducer = spreadsSlice.reducer;
export default reducer;
```

And usage in React:

```js
import { myFunction } from '../path/to/state';

dispatch(
  myFunction({
    id: 'someId',
    changes: { someKey: 'new value' },
  }),
);
```

## License

MIT
