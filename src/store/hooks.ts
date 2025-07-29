import { createTypedHooks } from 'easy-peasy';
import type { StoreModel } from './index';

const { useStoreActions, useStoreState, useStoreDispatch } = createTypedHooks<StoreModel>();

export { useStoreActions, useStoreState, useStoreDispatch };
