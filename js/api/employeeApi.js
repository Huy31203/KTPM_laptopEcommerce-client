import axiosClient from './axiosClient';

const employeeApi = {
  getAll(params) {
    const url = '/employees';
    return axiosClient.get(url, { params });
  },
  getById(id) {
    const url = `/employees/${id}`;
    return axiosClient.get(url);
  },
  add(data) {
    const url = '/employees';
    return axiosClient.post(url, data);
  },
  update(data) {
    const url = `/employees/${data['ma_nhan_vien']}`;
    return axiosClient.patch(url, data);
  },
  remove(id) {
    const url = `/employees/${id}`;
    return axiosClient.delete(url);
  },
};

export default employeeApi;
