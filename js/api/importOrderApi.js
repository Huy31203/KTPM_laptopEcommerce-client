import axiosClient from './axiosClient';

const importOrderApi = {
  getAll(params) {
    const url = '/import-orders';
    return axiosClient.get(url, { params });
  },
  getById(id) {
    const url = `/import-orders/${id}`;
    return axiosClient.get(url);
  },
  add(data) {
    const url = '/import-orders';
    return axiosClient.post(url, data);
  },
  update(data) {
    const url = `/import-orders/${data['ma_phieu_nhap']}`;
    return axiosClient.patch(url, data);
  },
  remove(id) {
    const url = `/import-orders/${id}`;
    return axiosClient.delete(url);
  },
};

export default importOrderApi;
