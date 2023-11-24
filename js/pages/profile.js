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
import customerApi from '../api/customerApi';
import sign from 'jwt-encode';
import moment from 'moment';
import uploadApi from '../api/uploadApi';

initCartList();
initProfile();
initHeader();

async function initProfile() {
  const accessToken = getLocalStorage('access_token');

  if (accessToken) {
    const user = parseJwt(accessToken);
    const now = parseInt(Date.now() / 1000);

    if (now > user.exp) {
      setLocalStorage('access_token', null);
      window.location.href = '/';
      return;
    }

    try {
      const { userId } = getLocalStorage('user');

      if (!userId) {
        window.location.href = '/';
        return;
      }

      const data = await customerApi.getById(userId);

      const date = moment(data['ngay_sinh']).format('L').split('/');

      $('#fullname').val(data['ten_khach_hang']);
      $('#birth-date').val(date[2] + '-' + date[0] + '-' + date[1]);
      $('#gender').val(data['gioi_tinh'] ? '1' : '0');
      $('#phone').val(data['so_dien_thoai']);
      $('#address').val(data['dia_chi']);

      if (data['avatar'] !== 'avatar.jpg') {
        $('.avatar img').attr('src', `${urlServer}/images/${data['avatar']}`);
      } else {
        $('.avatar img').attr('src', `${urlServer}/images/avatar.jpg`);
      }
    } catch (error) {
      console.log(error.message);
    }

    return;
  }

  window.location.href = '/';
}

$('.btn-update').click(async (e) => {
  e.preventDefault();

  let isValid = true;

  const inputList = Array.from($('.form input:not([type="file"])'));
  const selectList = Array.from($('.form select'));

  inputList.forEach((input) => {
    let message = validation(input);
    if (message) {
      input.parentElement.classList.add('input-error');
      isValid = false;
    } else {
      input.parentElement.classList.remove('input-error');
    }
  });

  selectList.forEach((select) => {
    let message = validation(select);
    if (message) {
      select.parentElement.classList.add('select-error');
      isValid = false;
    } else {
      select.parentElement.classList.remove('select-error');
    }
  });

  if (isValid) {
    try {
      const fullname = $('#fullname').val();
      const birthDate = new Date($('#birth-date').val());
      const gender = $('#gender').val();
      const phone = $('#phone').val();
      const address = $('#address').val();
      const { userId } = getLocalStorage('user');
      const user = await customerApi.getById(userId);
      let avatar = user.avatar;

      if ($('#avatar')[0].files.length > 0) {
        const [file] = $('#avatar')[0].files;

        avatar = file.name;
        const formData = new FormData();

        formData.append('uploadfile', file);

        await uploadApi.add(formData);
      }

      await customerApi.update({
        ma_khach_hang: userId,
        ten_dang_nhap: userId,
        ten_khach_hang: fullname,
        ngay_sinh: birthDate.getTime() / 1000,
        gioi_tinh: gender,
        so_dien_thoai: phone,
        dia_chi: address,
        avatar,
      });

      toast({
        title: 'Thay đổi thông tin thành công',
        duration: 3000,
        type: 'success',
      });

      const access_token = getLocalStorage('access_token');

      const token = parseJwt(access_token);

      token.data.infor = {
        ten_khach_hang: fullname,
        ngay_sinh: birthDate.getTime() / 1000,
        gioi_tinh: gender,
        so_dien_thoai: phone,
        dia_chi: address,
        avatar,
      };

      const secret = 'laptop ecommerce';

      const jwt = sign(token, secret);

      setLocalStorage('access_token', jwt);
      setLocalStorage('user', token.data);
      $('.action-logged img').attr('src', `${urlServer}/images/${avatar}`);
      $('.action-logged p').html(fullname);
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

$('.form select').change((e) => {
  let message = validation(e.target);
  if (message) {
    e.target.parentElement.classList.add('select-error');
  } else {
    e.target.parentElement.classList.remove('select-error');
  }
});

$('.form select').blur((e) => {
  let message = validation(e.target);
  if (message) {
    e.target.parentElement.classList.add('select-error');
  } else {
    e.target.parentElement.classList.remove('select-error');
  }
});

$('.form #avatar').change((e) => {
  const [file] = e.target.files;
  if (file) {
    $(`.avatar img`).attr('src', URL.createObjectURL(file));
  }
});

$('.form .avatar').mouseenter(() => {
  if ($('#avatar')[0].files.length <= 0) return;

  $('.avatar .fa-trash').addClass('active');
});

$('.form .avatar').mouseleave(() => {
  $('.avatar .fa-trash').removeClass('active');
});

$('.avatar .fa-trash').click(() => {
  $('#avatar').val('');
  $(`.avatar img`).attr('src', `${urlServer}/images/avatar.jpg`);
});
