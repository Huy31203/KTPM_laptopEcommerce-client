import axiosClient from './axiosClient';

const authGroupApi = {
  getAll(params) {
    const url = `/auth-group`;
    return axiosClient.get(url, { params });
  },
  getById(authGroupId) {
    const url = `/auth-group/${authGroupId}`;
    return axiosClient.get(url);
  },
  add(data) {
    const url = '/auth-group';
    return axiosClient.post(url, data);
  },
  update(data) {
    const url = `/auth-group/${data['ma_nhom_quyen']}`;
    return axiosClient.patch(url, data);
  },
  remove(authGroupId) {
    const url = `/auth-group/${authGroupId}`;
    return axiosClient.delete(url);
  },
};

export default authGroupApi;
