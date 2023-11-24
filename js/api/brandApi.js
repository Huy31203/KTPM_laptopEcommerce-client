import axiosClient from './axiosClient';

const brandApi = {
  getAll(params) {
    const url = '/brands';
    return axiosClient.get(url, { params });
  },
  getById(id) {
    const url = `/brands/${id}`;
    return axiosClient.get(url);
  },
  add(data) {
    const url = '/brands';
    return axiosClient.post(url, data);
  },
  update(data) {
    const url = `/brands/${data['ma_thuong_hieu']}`;
    return axiosClient.patch(url, data);
  },
  remove(id) {
    const url = `/brands/${id}`;
    return axiosClient.delete(url);
  },
};

export default brandApi;
