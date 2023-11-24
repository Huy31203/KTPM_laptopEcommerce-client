import axiosClient from './axiosClient';

const historyApi = {
  getAllByUserId(userId) {
    const url = `/histories/${userId}`;
    return axiosClient.get(url);
  },
  getById(id) {
    const url = `/histories/${id}`;
    return axiosClient.get(url);
  },
  add(data) {
    const url = '/histories';
    return axiosClient.post(url, data);
  },
  update(data) {
    const url = `/histories/${data.id}`;
    return axiosClient.patch(url, data);
  },
  remove(id) {
    const url = `/histories/${id}`;
    return axiosClient.delete(url);
  },
};

export default historyApi;
