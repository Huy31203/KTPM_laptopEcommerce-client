import customerApi from '../api/customerApi';
import { handleSearching, handleSorting } from './manager';
import { isAccessAction, renderLoadingManager, urlServer } from '../utils/constains';
import { validation } from '../utils/validation';
import authApi from '../api/authApi';
import { toast } from '../utils/toast';

async function renderCustomer(params = '') {
  try {
    const { data } = await customerApi.getAll(params);

    if (data.length <= 0) {
      $('.customer-content').html(`
        <tr>
          <td colspan="7">
            <h1 class="text-center my-5 w-100">Không có khách hàng nào cả!!!</h1>  
          </td>
        </tr>
      `);
      return;
    }

    const dataHTML = data
      .map((customer) => {
        return `
            <tr align="center">
              <td>
                ${customer['ma_khach_hang']}
              </td>
              <td>
                ${customer['ten_khach_hang']}
              </td>
              <td>
                ${moment(customer['ngay_sinh']).format('L')}
              </td>
              <td>
                ${customer['so_dien_thoai']}
              </td>
              <td>
                ${customer['dia_chi']}
              </td>
              <td>
                ${customer['gioi_tinh'] ? 'Nam' : 'Nữ'}
              </td>
              <td>
                <div class="d-flex justify-content-center align-items-center gap-3">
                  <i class="fa-solid fa-circle-info admin-action viewmore text-primary" data-id="${
                    customer['ma_khach_hang']
                  }"></i>
                  <i class="fa-solid fa-trash admin-action remove text-danger" data-id="${
                    customer['ma_khach_hang']
                  }"></i>
                </div>
              </td>
            </tr>
        `;
      })
      .join('');

    $('.customer-content').html(dataHTML);

    $('.customer .admin-action.remove').click((e) => {
      if (!isAccessAction('customers', 'DELETE')) return;
      $('#deleteCustomerModal').modal('show');
      $('#deleteCustomerModal').attr('data-id', e.target.dataset.id);
    });

    $('.customer .admin-action.viewmore').click(async (e) => {
      $('#viewmoreCustomerModal').modal('show');

      const id = e.target.dataset.id;

      const customer = await customerApi.getById(id);

      const date = moment(customer['ngay_sinh']).format('L').split('/');

      $('#username-customer-view').val(id);
      $('#fullname-customer-view').val(customer['ten_khach_hang']);
      $('#birth-date-customer-view').val(date[2] + '-' + date[0] + '-' + date[1]);
      $('#gender-customer-view').val(customer['gioi_tinh'] ? '1' : '0');
      $('#phone-customer-view').val(customer['so_dien_thoai']);
      $('#address-customer-view').val(customer['dia_chi']);
      $('.image_img img').attr('src', `${urlServer + '/images/' + customer['avatar']}`);
    });
  } catch (error) {
    console.log(error.message);
  }
}

export function renderCustomerPage() {
  const loadingHTML = renderLoadingManager(18, 7);

  $('.admin-content').html(`
    <div class="customer">
      <div class="customer-header">
        <h1>Khách hàng</h1>
        <div>
          <i class="fa-solid fa-circle-plus"></i> thêm khách hàng
        </div>
      </div>
      <div class="search-container">
        <div class="search-box">
          <input type="text" class="header-input" placeholder="Tìm kiếm theo mã, tên, ngày sinh, số điện thoại, địa chỉ, giới tính khách hàng" />
          <button type="button" class="btn primary btn-header">
            <i class="fa-solid fa-magnifying-glass"></i>
          </button>
        </div>
      </div>
      <div class="customer-table-container">
        <table class="customer-table">
          <thead>
            <tr align="center">
              <th>
                <div class="d-flex align-items-center justify-content-center gap-3 ">
                  Mã khách hàng
                  <div class="icon-sort active before" data-value="ma_khach_hang" data-sort="desc"></div>
                </div>
              </th>
              <th>
                <div class="d-flex align-items-center justify-content-center gap-3 ">
                  Tên khách hàng
                  <div class="icon-sort" data-value="ten_khach_hang" data-sort="desc"></div>
                </div>
              </th>
              <th>
                <div class="d-flex align-items-center justify-content-center gap-3 ">
                  Ngày sinh
                  <div class="icon-sort" data-value="ngay_sinh" data-sort="desc"></div>
                </div>
              </th>
              <th>
                <div class="d-flex align-items-center justify-content-center gap-3 ">
                  Số điện thoại
                  <div class="icon-sort" data-value="so_dien_thoai" data-sort="desc"></div>
                </div>
              </th>
              <th>
                <div class="d-flex align-items-center justify-content-center gap-3 ">
                  Địa chỉ
                  <div class="icon-sort" data-value="dia_chi" data-sort="desc"></div>
                </div>
              </th>
              <th>
                <div class="d-flex align-items-center justify-content-center gap-3 ">
                  Giới tính
                  <div class="icon-sort" data-value="gioi_tinh" data-sort="desc"></div>
                </div>
              </th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody class="customer-content">
            ${loadingHTML}
          </tbody>
        </table>
      </div>
    </div>
  `);

  const url = new URL(window.location);
  const searchingVal = url.searchParams.get('searching') ?? '';
  const sortNameVal = url.searchParams.get('sort-name') ?? '';
  const sortActionVal = url.searchParams.get('sort-action') ?? '';

  renderCustomer({
    sortAction: sortActionVal,
    sortName: sortNameVal,
    searching: searchingVal,
  });

  $('.header-input').keypress(async (e) => {
    if (e.keyCode !== 13) return;
    handleSearching(e.target.value, renderCustomer);
  });

  $('.btn-header').click(() => {
    handleSearching($('.header-input').val(), renderCustomer);
  });

  $('.customer-header div').click(() => {
    if (!isAccessAction('customers', 'CREATE')) return;
    $('#createCustomerModal').modal('show');
  });

  $('.icon-sort').click((e) => {
    handleSorting(e, renderCustomer);
  });
}

$('#createCustomerModal .btn-add').click(async () => {
  if (!isAccessAction('customers', 'CREATE')) return;
  let isValid = true;

  const inputList = [...Array.from($('#createCustomerModal input'))];

  inputList.forEach((input) => {
    let message = validation(input);
    if (message) {
      input.parentElement.classList.add('input-error');
      isValid = false;
    } else {
      input.parentElement.classList.remove('input-error');
    }
  });

  let message = validation($('#createCustomerModal select')[0]);
  if (message) {
    $('#createCustomerModal select')[0].parentElement.classList.add('select-error');
    isValid = false;
  } else {
    $('#createCustomerModal select')[0].parentElement.classList.remove('select-error');
  }

  if (isValid) {
    try {
      const username = $('#username-customer-create').val();
      const password = $('#password-customer').val();
      const fullname = $('#fullname-customer-create').val();
      const birthDate = new Date($('#birth-date-customer-create').val());
      const gender = $('#gender-customer-create').val();
      const phone = $('#phone-customer-create').val();
      const address = $('#address-customer-create').val();

      await authApi.register({
        ten_dang_nhap: username,
        mat_khau: password,
        ten_khach_hang: fullname,
        ngay_sinh: birthDate.getTime() / 1000,
        gioi_tinh: gender,
        so_dien_thoai: phone,
        dia_chi: address,
        avatar: 'avartar.jpg',
      });

      toast({
        title: 'Tạo khách hàng thành công',
        duration: 3000,
        type: 'success',
      });

      renderCustomer();
    } catch (error) {
      toast({
        title: 'Error Server',
        duration: 3000,
        message: error.response.data.message,
        type: 'error',
      });
    } finally {
      $('#createCustomerModal').modal('hide');
    }
  }
});

$('#deleteCustomerModal .btn-yes').click(async () => {
  try {
    const id = $('#deleteCustomerModal').attr('data-id');

    await customerApi.remove(id);

    toast({
      title: 'Xóa khách hàng thành công',
      duration: 3000,
      type: 'success',
    });

    renderCustomer();
  } catch (error) {
    toast({
      title: 'Error Server',
      duration: 3000,
      message: error.response.data.message,
      type: 'error',
    });
  } finally {
    $('#deleteCustomerModal').modal('hide');
  }
});
