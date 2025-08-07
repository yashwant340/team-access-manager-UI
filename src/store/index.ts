import { createStore } from 'easy-peasy';
import { featureModel, type FeatureModel } from './model/feature';

export interface StoreModel {
  featureModel: FeatureModel;
}

const store = createStore<StoreModel>({
  featureModel,
});

export default store;
