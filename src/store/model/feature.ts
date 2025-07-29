import { type Action, type Thunk, action, thunk } from 'easy-peasy';
import axios from '../../api/axiosInstance';
import type { FeatureDTO } from '../../types/dto';

export interface FeatureModel {
  features: FeatureDTO[];
  loading: boolean;
  setFeatures: Action<FeatureModel, FeatureDTO[]>;
  setLoading: Action<FeatureModel, boolean>;
  fetchFeatures: Thunk<FeatureModel>;
  getFeatureNameById: (state: FeatureModel) => (id: number) => string;
}

const featureModel: FeatureModel = {
  features: [],
  loading: false,
  setFeatures: action((state, payload) => {
    state.features = payload;
  }),
  setLoading: action((state, payload) => {
    state.loading = payload;
  }),
  fetchFeatures: thunk(async (actions) => {
    actions.setLoading(true);
    try {
      const res = await axios.get('/features');
      actions.setFeatures(res.data || []);
    } catch (err) {
      console.error('Failed to fetch features:', err);
      actions.setFeatures([]);
    } finally {
      actions.setLoading(false);
    }
  }),
  getFeatureNameById: (state) => (id: number) => {
    return state.features.find(f => f.id === id)?.name || 'Unknown';
  }
};

export default featureModel;
