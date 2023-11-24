import axiosClient from './axiosClient';

const guaranteeApi = {
  getAll(params) {
    const url = '/guarantee';
    return axiosClient.get(url, { params });
  },
  getById(id) {
    const url = `/guarantee/${id}`;
    return axiosClient.get(url);
  },
  add(data) {
    const url = '/guarantee';
    return axiosClient.post(url, data);
  },
  update(data) {
    const url = `/guarantee/${data['ma_bao_hanh']}`;
    return axiosClient.patch(url, data);
  },
  remove(id) {
    const url = `/guarantee/${id}`;
    return axiosClient.delete(url);
  },
};

export default guaranteeApi;
