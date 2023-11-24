import moment from 'moment';
import accountApi from '../api/accountApi';
import customerApi from '../api/customerApi';
import {
  getLocalStorage,
  initCartList,
  initHeader,
  parseJwt,
  setLocalStorage,
  urlServer,
} from '../utils/constains';
import { validation } from '../utils/validation';
import { toast } from '../utils/toast';

initCartList();
initChangePassword();
initHeader();

async function initChangePassword() {
  const accessToken = getLocalStorage('access_token');

  if (accessToken) {
    const user = parseJwt(accessToken);
    const now = parseInt(Date.now() / 1000);

    if (now > user.exp) {
      setLocalStorage('access_token', null);
      window.location.href = '/';
      return;
    }

    return;
  }
}

$('.btn-update').click(async (e) => {
  e.preventDefault();
  let isValid = true;

  const inputList = [...Array.from($('.form input'))];

  inputList.forEach((input) => {
    let message = validation(input);
    if (message) {
      input.parentElement.classList.add('input-error');
      isValid = false;
    } else {
      input.parentElement.classList.remove('input-error');
    }
  });

  if (isValid) {
    try {
      const oldPassword = $('#old-password').val();
      const newPassword = $('#password').val();
      const { userId } = getLocalStorage('user');

      await accountApi.update({
        ten_dang_nhap: userId,
        mat_khau_moi: newPassword,
        mat_khau_cu: oldPassword,
      });

      toast({
        title: 'Thay đổi mật khẩu thành công',
        duration: 3000,
        message: 'Mời bạn đăng nhập lại hệ thống!!!',
        type: 'success',
      });

      setLocalStorage('access_token', null);
      setLocalStorage('user', null);

      setTimeout(() => {
        window.location.href = '/login.html';
      }, 2000);
    } catch (error) {
      toast({
        title: 'Error Server',
        duration: 3000,
        message: error.response.data.message,
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
    $('#old-password').attr('type', 'text');
  } else {
    $(`.icon-password i[data-value='eye-slash']`).removeClass('hidden');
    $(`.icon-password i[data-value='eye']`).addClass('hidden');
    $('#old-password').attr('type', 'password');
  }
});

$('.icon-new-password').click(() => {
  const icon = $('.icon-new-password .hidden').attr('data-value');

  if (icon === 'eye') {
    $(`.icon-new-password i[data-value='eye-slash']`).addClass('hidden');
    $(`.icon-new-password i[data-value='eye']`).removeClass('hidden');
    $('#password').attr('type', 'text');
  } else {
    $(`.icon-new-password i[data-value='eye-slash']`).removeClass('hidden');
    $(`.icon-new-password i[data-value='eye']`).addClass('hidden');
    $('#password').attr('type', 'password');
  }
});

$('.icon-confirm-password').click(() => {
  const icon = $('.icon-confirm-password .hidden').attr('data-value');

  if (icon === 'eye') {
    $(`.icon-confirm-password i[data-value='eye-slash']`).addClass('hidden');
    $(`.icon-confirm-password i[data-value='eye']`).removeClass('hidden');
    $('#comfirm-password').attr('type', 'text');
  } else {
    $(`.icon-confirm-password i[data-value='eye-slash']`).removeClass('hidden');
    $(`.icon-confirm-password i[data-value='eye']`).addClass('hidden');
    $('#comfirm-password').attr('type', 'password');
  }
});
