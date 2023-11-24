import axiosClient from './axiosClient';

const detailProductApi = {
  getAll(params) {
    const url = `/detail-products`;
    return axiosClient.get(url, { params });
  },
  getById(detailProductId) {
    const url = `/detail-products/${detailProductId}`;
    return axiosClient.get(url);
  },
  add(data) {
    const url = '/detail-products';
    return axiosClient.post(url, data);
  },
  update(data) {
    const url = `/detail-products/${data['ma_chi_tiet_san_pham']}`;
    return axiosClient.patch(url, data);
  },
  remove(detailProductId) {
    const url = `/detail-products/${detailProductId}`;
    return axiosClient.delete(url);
  },
};

export default detailProductApi;
