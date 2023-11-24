import axiosClient from './axiosClient';

const accountApi = {
  getAll(params) {
    const url = `/accounts`;
    return axiosClient.get(url, { params });
  },
  getById(accountId) {
    const url = `/accounts/${accountId}`;
    return axiosClient.get(url);
  },
  add(data) {
    const url = '/accounts';
    return axiosClient.post(url, data);
  },
  update(data) {
    const url = `/accounts/${data['ten_dang_nhap']}`;
    return axiosClient.patch(url, data);
  },
  remove(accountId) {
    const url = `/accounts/${accountId}`;
    return axiosClient.delete(url);
  },
};

export default accountApi;
