import { setLocalStorage } from './constains';

$('.logout').click((e) => {
  e.preventDefault();

  setLocalStorage('access_token', null);

  setLocalStorage('user', null);

  window.location.href = '/';
});
