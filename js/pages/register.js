import authApi from '../api/authApi';
import {
  getLocalStorage,
  initCartList,
  initHeader,
  parseJwt,
  setLocalStorage,
} from '../utils/constains';
import { toast } from '../utils/toast';
import { validation } from '../utils/validation';

initCartList();
initRegister();
initHeader();

function initRegister() {
  const accessToken = getLocalStorage('access_token');

  if (accessToken) {
    const decoded = parseJwt(accessToken);
    const now = parseInt(Date.now() / 1000);

    if (now > decoded.exp) {
      setLocalStorage('access_token', null);
    } else {
      window.location.href = '/';
    }
  }
}

$('.btn-register').click(async (e) => {
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

  let message = validation($('.form select')[0]);
  if (message) {
    $('.form select')[0].parentElement.classList.add('select-error');
    isValid = false;
  } else {
    $('.form select')[0].parentElement.classList.remove('select-error');
  }

  if (isValid) {
    try {
      const username = $('#username').val();
      const password = $('#password').val();
      const fullname = $('#fullname').val();
      const birthDate = new Date($('#birth-date').val());
      const gender = $('#gender').val();
      const phone = $('#phone').val();
      const address = $('#address').val();

      await authApi.register({
        ten_dang_nhap: username,
        mat_khau: password,
        ten_khach_hang: fullname,
        ngay_sinh: birthDate.getTime() / 1000,
        gioi_tinh: gender,
        so_dien_thoai: phone,
        dia_chi: address,
        avatar: 'avatar.jpg',
      });

      toast({
        title: 'Đăng ký tài khoản vào hệ thống thành công',
        duration: 3000,
        message: 'Mời bạn đăng nhập vào hệ thống 	&#10084;',
        type: 'success',
      });

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

$('.form select').change((e) => {
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
