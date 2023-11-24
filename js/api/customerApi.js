import axiosClient from './axiosClient';

const customerApi = {
  getAll(params) {
    const url = `/customers`;
    return axiosClient.get(url, { params });
  },
  getById(customerId) {
    const url = `/customers/${customerId}`;
    return axiosClient.get(url);
  },
  add(data) {
    const url = '/customers';
    return axiosClient.post(url, data);
  },
  update(data) {
    const url = `/customers/${data['ma_khach_hang']}`;
    return axiosClient.patch(url, data);
  },
  remove(customerId) {
    const url = `/customers/${customerId}`;
    return axiosClient.delete(url);
  },
};

export default customerApi;
