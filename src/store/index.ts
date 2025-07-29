import { createStore } from 'easy-peasy';
import feature, { type FeatureModel } from './model/feature';

export interface StoreModel {
  feature: FeatureModel;
}

const store = createStore<StoreModel>({
  feature,
});

export default store;
