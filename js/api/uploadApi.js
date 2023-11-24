import axiosClient from './axiosClient';

const uploadApi = {
  getAll(params) {
    const url = '/images';
    return axiosClient.get(url, { params });
  },
  getById(id) {
    const url = `/images/${id}`;
    return axiosClient.get(url);
  },
  add(data) {
    const url = '/images';
    return axiosClient.post(url, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  update(data) {
    const url = `/images/${data['ma_don_hang']}`;
    return axiosClient.patch(url, data);
  },
  remove(id) {
    const url = `/images/${id}`;
    return axiosClient.delete(url);
  },
};

export default uploadApi;
