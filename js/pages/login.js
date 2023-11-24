import {
  getLocalStorage,
  initCartList,
  initHeader,
  parseJwt,
  setLocalStorage,
} from '../utils/constains';
import { validation } from '../utils/validation';
import { toast } from '../utils/toast';
import authApi from '../api/authApi';

initCartList();
initLogin();
initHeader();

async function initLogin() {
  const accessToken = getLocalStorage('access_token');

  if (accessToken) {
    const user = parseJwt(accessToken);
    const now = parseInt(Date.now() / 1000);

    if (now > user.exp) {
      setLocalStorage('access_token', null);
    } else {
      window.location.href = '/';
    }
  }
}

$('.btn-login').click(async (e) => {
  e.preventDefault();

  let isValid = true;

  $('.form input').map((idx) => {
    let message = validation($('.form input')[idx]);
    if (message) {
      $('.form input')[idx].parentElement.classList.add('input-error');
      isValid = false;
    } else {
      $('.form input')[idx].parentElement.classList.remove('input-error');
    }
  });

  if (isValid) {
    try {
      const username = $('#username').val();
      const password = $('#password').val();

      const data = await authApi.login({
        ten_dang_nhap: username,
        mat_khau: password,
      });

      toast({
        title: 'Đăng nhập thành công',
        duration: 3000,
        message: 'Chào mừng bạn đã quay trở lại',
        type: 'success',
      });

      setLocalStorage('access_token', data['access_token']);

      const { data: user } = parseJwt(data['access_token']);

      setLocalStorage('user', user);

      if (user.role['ma_nhom_quyen'] === 0) {
        window.location.href = '/';
      } else {
        window.location.href = '/manager.html';
      }
    } catch (error) {
      toast({
        title: 'Error Server',
        duration: 3000,
        message: error?.response?.data?.message,
        type: 'error',
      });
    }
  }
});

$('.form input').keyup((e) => {
  let message = validation(e.target);
  if (message) {
    e.target.parentElement.classList.add('input-error');
  } else {
    e.target.parentElement.classList.remove('input-error');
  }
});

$('.form input').blur((e) => {
  let message = validation(e.target);
  if (message) {
    e.target.parentElement.classList.add('input-error');
  } else {
    e.target.parentElement.classList.remove('input-error');
  }
});

$('.icon-password').click(() => {
  const icon = $('.icon-password .hidden').attr('data-value');

  if (icon === 'eye') {
    $(`.icon-password i[data-value='eye-slash']`).addClass('hidden');
    $(`.icon-password i[data-value='eye']`).removeClass('hidden');
    $('#password').attr('type', 'text');
  } else {
    $(`.icon-password i[data-value='eye-slash']`).removeClass('hidden');
    $(`.icon-password i[data-value='eye']`).addClass('hidden');
    $('#password').attr('type', 'password');
  }
});
