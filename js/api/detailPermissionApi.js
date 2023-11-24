import axiosClient from './axiosClient';

const detailPermissionApi = {
  getAll(params) {
    const url = `/decentralization`;
    return axiosClient.get(url, { params });
  },
  getById(detailPermissionId) {
    const url = `/decentralization/${detailPermissionId}`;
    return axiosClient.get(url);
  },
  add(data) {
    const url = '/decentralization';
    return axiosClient.post(url, data);
  },
  update(data) {
    const url = `/decentralization/${data['ma_nhom_quyen']}/${data['ma_quyen_hang']}/${data['ma_chuc_nang']}`;
    return axiosClient.patch(url, data);
  },
  remove(roleId, perId, actionId) {
    const url = `/decentralization/${roleId}/${perId}/${actionId}`;
    return axiosClient.delete(url);
  },
};

export default detailPermissionApi;
