import axiosClient from './axiosClient';

const supplierApi = {
  getAll(params = '') {
    const url = '/suppliers';
    return axiosClient.get(url, { params });
  },
  getById(id) {
    const url = `/suppliers/${id}`;
    return axiosClient.get(url);
  },
  add(data) {
    const url = '/suppliers';
    return axiosClient.post(url, data);
  },
  update(data) {
    const url = `/suppliers/${data['ma_nha_cung_cap']}`;
    return axiosClient.patch(url, data);
  },
  remove(id) {
    const url = `/suppliers/${id}`;
    return axiosClient.delete(url);
  },
};

export default supplierApi;
