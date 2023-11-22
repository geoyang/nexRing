import { configureStore } from '@reduxjs/toolkit';
import variablesReducer from './variablesSlice';

const store = configureStore({
    reducer: {
      variables: variablesReducer,
    },
  });

export default store;