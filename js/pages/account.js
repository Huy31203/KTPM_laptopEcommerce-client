import authGroupApi from '../api/authGroupApi';
import accountApi from '../api/accountApi';
import { isAccessAction, renderLoadingManager } from '../utils/constains';
import { toast } from '../utils/toast';
import { validation } from '../utils/validation';
import employeeApi from '../api/employeeApi';
import moment from 'moment';
import { handleSearching, handleSorting } from './manager';

async function renderAccount(params) {
  try {
    const data = await accountApi.getAll(params);

    if (data.length <= 0) {
      $('.account-content').html(`
        <tr>
          <td colspan="4">
            <h1 class="text-center my-5 w-100">Không có tài khoản nào cả!!!</h1>  
          </td>
        </tr>
      `);
      return;
    }

    const dataHTML = data
      .map((acc) => {
        return `
          <tr align="center">
            <td>
              ${acc['ten_dang_nhap']}
            </td>
            <td>
              <span
                class="account-role"
                data-id="${acc['ten_dang_nhap']}"
                data-role-id="${acc['ma_nhom_quyen']}"
              >
                ${acc['ten_nhom_quyen']}
              </span>
            </td>
            <td>
              ${moment(acc['created_at']).format('L')}
            </td>
            <td>
              <div class="d-flex justify-content-center align-items-center gap-3">
                ${
                  acc['ma_nhom_quyen'] === 0
                    ? ''
                    : `
                      <i class="fa-solid fa-pen-to-square admin-action edit" data-id="${acc['ten_dang_nhap']}"></i>
                    `
                }
                <i class="fa-solid fa-trash admin-action remove text-danger" data-id="${
                  acc['ten_dang_nhap']
                }"></i>
              </div>
            </td>
          </tr>
        `;
      })
      .join('');

    $('.account-content').html(dataHTML);

    $('.account .account-role').click((e) => {
      if (!isAccessAction('accounts', 'UPDATE')) return;

      const id = e.target.dataset.id;
      const roleId = e.target.dataset.roleId;
      if (roleId === '0') return;
      $('#roleAccountModal').attr('data-id', id);
      $('#roleAccountModal').modal('show');
    });

    $('.admin-action.remove').click((e) => {
      if (!isAccessAction('accounts', 'DELETE')) return;
      const id = e.target.dataset.id;
      $('#deleteAccountModal').attr('data-id', id);
      $('#deleteAccountModal').modal('show');
    });
    $('.admin-action.edit').click((e) => {
      if (!isAccessAction('accounts', 'UPDATE')) return;
      const id = e.target.dataset.id;
      $('#updateAccountModal').attr('data-id', id);
      $('#updateAccountModal').modal('show');
    });
  } catch (error) {
    console.log(error.message);
  }
}

async function renderRoleSelect() {
  try {
    const { data } = await authGroupApi.getAll();

    const dataFilter = data.filter(
      (group) => group['trang_thai'] === true && group['ma_nhom_quyen'] !== 0
    );

    const dataSelect = [
      {
        ma_nhom_quyen: '',
        ten_nhom_quyen: 'Chọn vai trò',
      },
      ...dataFilter,
    ];

    const dataHTML1 = dataSelect
      .map((group) => {
        if (group['ma_nhom_quyen'] === '') {
          return `
            <option value="${group['ma_nhom_quyen']}" hidden selected>${group['ten_nhom_quyen']}</option>
          `;
        }

        return `
            <option value="${group['ma_nhom_quyen']}">${group['ten_nhom_quyen']}</option>
          `;
      })
      .join('');

    const dataHTML2 = dataFilter
      .map(
        (group) => `
          <span class="account-role" data-value="${group['ma_nhom_quyen']}">${group['ten_nhom_quyen']}</span>
        `
      )
      .join('');

    $('#createAccountModal #role-account-create').html(dataHTML1);
    $('#roleAccountModal .modal-role').html(dataHTML2);

    $('#roleAccountModal .account-role').click(async (e) => {
      if (!isAccessAction('accounts', 'UPDATE')) return;

      try {
        const id = $('#roleAccountModal').attr('data-id');
        const roleId = e.target.dataset.value;

        await accountApi.update({
          ten_dang_nhap: id,
          ma_nhom_quyen: roleId,
        });

        toast({
          title: 'Thay đổi nhóm quyền thành công',
          type: 'success',
          duration: 2000,
        });

        renderAccount();
      } catch (error) {
        toast({
          title: 'Thay đổi nhóm quyền thất bại',
          type: 'error',
          duration: 2000,
        });
      } finally {
        $('#roleAccountModal').modal('hide');
      }
    });
  } catch (error) {
    console.log(error.message);
  }
}

$('#createAccountModal .btn-add').click(async () => {
  if (!isAccessAction('accounts', 'CREATE')) return;

  const inputList = Array.from($('#createAccountModal input'));
  const select = Array.from($('#createAccountModal select'));
  const validateList = [...inputList, ...select];

  let isValid = true;

  validateList.forEach((input) => {
    if (validation(input)) {
      isValid = false;
      return;
    }
  });

  if (isValid) {
    try {
      await accountApi.add({
        ten_dang_nhap: $('#employee-account-create').val(),
        mat_khau: $('#createAccountModal #password').val(),
        ma_nhom_quyen: $('#createAccountModal #role-account-create').val(),
        created_at: Date.now(),
      });

      toast({
        title: 'Tạo tài khoản thành công!!',
        type: 'success',
        duration: 2000,
      });

      $('#employee-account-create').val('');
      $('#createAccountModal #password').val('');
      $('#createAccountModal #cofirm-password').val('');
      $('#role-account-create').val('');

      renderAccount();
    } catch (error) {
      toast({
        title: 'Create account failure!!',
        type: 'error',
        message: error.message,
        duration: 2000,
      });
    } finally {
      $('#createAccountModal').modal('hide');
    }
  }
});

$('#updateAccountModal .btn-add').click(async () => {
  if (!isAccessAction('accounts', 'UPDATE')) return;

  const inputList = Array.from($('#updateAccountModal input'));
  const validateList = [...inputList];

  let isValid = true;

  const id = $('#updateAccountModal').attr('data-id');

  validateList.forEach((input) => {
    if (validation(input)) {
      isValid = false;
      return;
    }
  });

  if (isValid) {
    try {
      await accountApi.update({
        ten_dang_nhap: id,
        mat_khau_moi: $('#updateAccountModal #password').val(),
        mat_khau_cu: $('#updateAccountModal #old-password').val(),
      });

      toast({
        title: 'Chỉnh sửa mật khẩu thành công',
        type: 'success',
        duration: 2000,
      });

      $('#updateAccountModal #password').val('');
      $('#updateAccountModal #old-password').val('');
      $('#updateAccountModal #comfirm-password').val('');

      renderAccount();
    } catch (error) {
      toast({
        title: 'Chỉnh sửa mật khẩu không thành công',
        type: 'error',
        message: error.message,
        duration: 2000,
      });
    } finally {
      $('#updateAccountModal').modal('hide');
    }
  }
});

$('#createAccountModal input').keyup((e) => {
  let message = validation(e.target);
  if (message) {
    e.target.parentElement.classList.add('input-error');
  } else {
    e.target.parentElement.classList.remove('input-error');
  }
});

$('#updateAccountModal input').keyup((e) => {
  let message = validation(e.target);
  if (message) {
    e.target.parentElement.classList.add('input-error');
  } else {
    e.target.parentElement.classList.remove('input-error');
  }
});

$('#createAccountModal select').change((e) => {
  let message = validation(e.target);
  if (message) {
    e.target.parentElement.classList.add('select-error');
  } else {
    e.target.parentElement.classList.remove('select-error');
  }
});

$('#createAccountModal input').blur((e) => {
  let message = validation(e.target);
  if (message) {
    e.target.parentElement.classList.add('input-error');
  } else {
    e.target.parentElement.classList.remove('input-error');
  }
});

$('#updateAccountModal input').blur((e) => {
  let message = validation(e.target);
  if (message) {
    e.target.parentElement.classList.add('input-error');
  } else {
    e.target.parentElement.classList.remove('input-error');
  }
});

$('#createAccountModal select').blur((e) => {
  let message = validation(e.target);
  if (message) {
    e.target.parentElement.classList.add('select-error');
  } else {
    e.target.parentElement.classList.remove('select-error');
  }
});

$('#deleteAccountModal .btn-yes').click(async () => {
  if (!isAccessAction('accounts', 'DELETE')) return;

  const id = $('#deleteAccountModal').attr('data-id');
  try {
    await accountApi.remove(id);

    toast({
      title: 'Xóa tài khoản thành công',
      type: 'success',
      duration: 2000,
    });

    renderAccount();
  } catch (error) {
    toast({
      title: 'Xóa tài khoản không thành công',
      type: 'error',
      duration: 2000,
    });
  } finally {
    $('#deleteAccountModal').modal('hide');
  }
});

async function renderEmployeeSelect() {
  try {
    const { data } = await employeeApi.getAll({ account: 0 });

    const dataSelect = [
      {
        ma_nhan_vien: '',
        ten_nhan_vien: 'Chọn nhân viên',
      },
      ...data,
    ];

    const dataHTML = dataSelect
      .map((employee) => {
        if (!employee['ma_nhan_vien']) {
          return `
              <option value="${employee['ma_nhan_vien']}" hidden selected>${employee['ten_nhan_vien']}</option>
            `;
        }
        return `
            <option value="${employee['ma_nhan_vien']}">${employee['ten_nhan_vien']}</option>
          `;
      })
      .join('');

    $('#employee-account-create').html(dataHTML);
  } catch (error) {}
}

export function renderAccountPage() {
  const loadingHTML = renderLoadingManager(18, 4);

  $('.admin-content').html(`
    <div class="account">
      <div class="account-header">
        <h1>Tài khoản</h1>
        <div>
          <i class="fa-solid fa-circle-plus"></i> cấp tài khoản
        </div>
      </div>
      <div class="search-container">
        <div class="search-box">
          <input type="text" class="header-input" placeholder="Tìm kiếm theo tên đăng nhập, tên nhóm quyền, ngày cấp tài khoản" />
          <button type="button" class="btn primary btn-header">
            <i class="fa-solid fa-magnifying-glass"></i>
          </button>
        </div>
      </div>
      <div class="account-table-container">
        <table class="account-table">
          <thead>
            <tr align="center">
              <th>
                <div class="d-flex align-items-center justify-content-center gap-3 ">
                  Tên đăng nhập
                  <div class="icon-sort active before" data-value="ten_dang_nhap" data-sort="desc"></div>
                </div>
              </th>
              <th>
                <div class="d-flex align-items-center justify-content-center gap-3 ">
                  Nhóm quyền
                  <div class="icon-sort" data-value="ten_nhom_quyen" data-sort="desc"></div>
                </div>
              </th>
              <th>
                <div class="d-flex align-items-center justify-content-center gap-3 ">
                  Ngày cấp
                  <div class="icon-sort" data-value="ngap_cap" data-sort="desc"></div>
                </div>
              </th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody class="account-content">
            ${loadingHTML}
          </tbody>
        </table>
      </div>
    </div>
  `);

  renderRoleSelect();
  renderEmployeeSelect();

  const url = new URL(window.location);
  const searchingVal = url.searchParams.get('searching') ?? '';
  const sortNameVal = url.searchParams.get('sort-name') ?? '';
  const sortActionVal = url.searchParams.get('sort-action') ?? '';

  renderAccount({
    sortAction: sortActionVal,
    sortName: sortNameVal,
    searching: searchingVal,
  });

  $('.header-input').keypress(async (e) => {
    if (e.keyCode !== 13) return;
    handleSearching(e.target.value, renderAccount);
  });

  $('.btn-header').click(() => {
    handleSearching($('.header-input').val(), renderAccount);
  });

  $('.account-header div').click(() => {
    if (!isAccessAction('accounts', 'CREATE')) return;
    $('#createAccountModal').modal('show');
  });

  $('.icon-sort').click((e) => {
    handleSorting(e, renderAccount);
  });
}

$('#createAccountModal .icon-password').click(() => {
  const icon = $('#createAccountModal .icon-password .hidden').attr('data-value');

  if (icon === 'eye') {
    $(`#createAccountModal .icon-password i[data-value='eye-slash']`).addClass('hidden');
    $(`#createAccountModal .icon-password i[data-value='eye']`).removeClass('hidden');
    $('#createAccountModal #password').attr('type', 'text');
  } else {
    $(`#createAccountModal .icon-password i[data-value='eye-slash']`).removeClass('hidden');
    $(`#createAccountModal .icon-password i[data-value='eye']`).addClass('hidden');
    $('#createAccountModal #password').attr('type', 'password');
  }
});

$('#updateAccountModal .icon-password').click(() => {
  const icon = $('#updateAccountModal .icon-password .hidden').attr('data-value');

  if (icon === 'eye') {
    $(`#updateAccountModal .icon-password i[data-value='eye-slash']`).addClass('hidden');
    $(`#updateAccountModal .icon-password i[data-value='eye']`).removeClass('hidden');
    $('#updateAccountModal #password').attr('type', 'text');
  } else {
    $(`#updateAccountModal .icon-password i[data-value='eye-slash']`).removeClass('hidden');
    $(`#updateAccountModal .icon-password i[data-value='eye']`).addClass('hidden');
    $('#updateAccountModal #password').attr('type', 'password');
  }
});

$('#createAccountModal .icon-confirm-password').click(() => {
  const icon = $('#createAccountModal .icon-confirm-password .hidden').attr('data-value');

  if (icon === 'eye') {
    $(`#createAccountModal .icon-confirm-password i[data-value='eye-slash']`).addClass('hidden');
    $(`#createAccountModal .icon-confirm-password i[data-value='eye']`).removeClass('hidden');
    $('#createAccountModal #comfirm-password').attr('type', 'text');
  } else {
    $(`#createAccountModal .icon-confirm-password i[data-value='eye-slash']`).removeClass('hidden');
    $(`#createAccountModal .icon-confirm-password i[data-value='eye']`).addClass('hidden');
    $('#createAccountModal #comfirm-password').attr('type', 'password');
  }
});

$('#updateAccountModal .icon-confirm-password').click(() => {
  const icon = $('#updateAccountModal .icon-confirm-password .hidden').attr('data-value');

  if (icon === 'eye') {
    $(`#updateAccountModal .icon-confirm-password i[data-value='eye-slash']`).addClass('hidden');
    $(`#updateAccountModal .icon-confirm-password i[data-value='eye']`).removeClass('hidden');
    $('#updateAccountModal #comfirm-password').attr('type', 'text');
  } else {
    $(`#updateAccountModal .icon-confirm-password i[data-value='eye-slash']`).removeClass('hidden');
    $(`#updateAccountModal .icon-confirm-password i[data-value='eye']`).addClass('hidden');
    $('#updateAccountModal #comfirm-password').attr('type', 'password');
  }
});

$('#updateAccountModal .icon-old-password').click(() => {
  const icon = $('#updateAccountModal .icon-old-password .hidden').attr('data-value');

  if (icon === 'eye') {
    $(`#updateAccountModal .icon-old-password i[data-value='eye-slash']`).addClass('hidden');
    $(`#updateAccountModal .icon-old-password i[data-value='eye']`).removeClass('hidden');
    $('#updateAccountModal #old-password').attr('type', 'text');
  } else {
    $(`#updateAccountModal .icon-old-password i[data-value='eye-slash']`).removeClass('hidden');
    $(`#updateAccountModal .icon-old-password i[data-value='eye']`).addClass('hidden');
    $('#updateAccountModal #old-password').attr('type', 'password');
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
