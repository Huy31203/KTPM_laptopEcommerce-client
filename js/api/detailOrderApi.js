import axiosClient from './axiosClient';

const detailOrderApi = {
  getAll(params) {
    const url = `/detail-orders`;
    return axiosClient.get(url, { params });
  },
  getById(orderId, productId) {
    const url = `/detail-orders/${orderId}/${productId}`;
    return axiosClient.get(url);
  },
  add(data) {
    const url = '/detail-orders';
    return axiosClient.post(url, data);
  },
  update(data) {
    const url = `/detail-orders/${data['ma_chi_tiet_san_pham']}`;
    return axiosClient.patch(url, data);
  },
  remove(detailorderId) {
    const url = `/detail-orders/${detailorderId}`;
    return axiosClient.delete(url);
  },
};

export default detailOrderApi;
