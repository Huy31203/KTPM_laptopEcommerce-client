import axiosClient from './axiosClient';

const productApi = {
  getAll(params = '') {
    const url = '/products';
    return axiosClient.get(url, { params });
  },
  getAllWithParams(params) {
    const url = '/products';
    return axiosClient.get(url, { params });
  },
  getById(id) {
    const url = `/products/${id}`;
    return axiosClient.get(url);
  },
  add(data) {
    const url = '/products';
    return axiosClient.post(url, data);
  },
  update(data) {
    const url = `/products/${data['ma_san_pham']}`;
    return axiosClient.patch(url, data);
  },
  remove(id) {
    const url = `/products/${id}`;
    return axiosClient.delete(url);
  },
};

export default productApi;
