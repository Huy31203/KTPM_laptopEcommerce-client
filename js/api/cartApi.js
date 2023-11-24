import axiosClient from './axiosClient';

const cartApi = {
  getAll(userId) {
    const url = `/carts/${userId}`;
    return axiosClient.get(url);
  },
  getById(id) {
    const url = `/carts/${id}`;
    return axiosClient.get(url);
  },
  add(data) {
    const url = '/carts';
    return axiosClient.post(url, data);
  },
  update(userId, data) {
    const url = `/carts/${userId}/${data['ma_san_pham']}`;
    return axiosClient.patch(url, data);
  },
  remove(userId, productId) {
    const url = `/carts/${userId}/${productId}`;
    return axiosClient.delete(url);
  },
};

export default cartApi;
